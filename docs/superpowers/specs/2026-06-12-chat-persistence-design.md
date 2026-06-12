# Spec : Persistance des conversations du chat IA builder

**Date :** 2026-06-12  
**Périmètre :** Sauvegarder et restaurer les conversations du chat IA local (Ollama) dans MongoDB, par utilisateur et par contenu.

---

## 1. Contexte

Le chat IA du builder (`AiAssistantPanel`, `StandaloneChatPanel`) utilise `useChatSession` pour gérer les messages en state React. Ces messages sont perdus à chaque refresh de page. L'objectif est de persister chaque échange en base et de le restaurer au prochain montage, tout en permettant à l'admin de vider manuellement l'historique.

---

## 2. Comportement attendu

| Situation | Comportement |
|-----------|--------------|
| Ouverture du chat | Les messages de la session précédente (pour ce user × contenu) sont chargés depuis MongoDB |
| Envoi d'un message | Après réception complète de la réponse IA, les 2 derniers messages (user + assistant) sont appendés en base |
| Clic sur "Vider" | Confirmation inline (bouton rouge pendant 2 s), puis DELETE en base + reset du state |
| Erreur réseau IA | Le message d'erreur N'est PAS persisté en base |

---

## 3. Schéma MongoDB

**Collection :** `ai_chat_conversations`

```ts
interface AiChatConversation {
    _id?: ObjectId;
    userId: string;          // session.user.id (better-auth)
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    messages: StoredMessage[];
    updatedAt: Date;
}

interface StoredMessage {
    role: "user" | "assistant";
    content: string;
    thinking?: string;
    toolActions?: { name: string; count: number }[];
    timestamp: Date;
    isError?: boolean;    // true pour les messages d'erreur — non persistés en base
}
```

**Index unique :**
```ts
{ userId: 1, moduleSlug: 1, sectionSlug: 1, contentType: 1 }
```
Garantit l'unicité du document par contexte et accélère GET/POST/DELETE.

**Limite de taille :** illimitée en nombre de messages (suppression manuelle uniquement). À 10 000 messages de 500 caractères chacun ≈ 5 MB, bien en dessous du plafond MongoDB de 16 MB pour un outil admin à faible volume.

---

## 4. API — Route `/api/admin/content/ai-chat-history`

Fichier : `src/app/api/admin/content/ai-chat-history/route.ts`  
Protégée par `withAdmin`. Le `userId` est toujours lu depuis `getServerSession()` côté serveur.

### GET `?module=…&section=…&type=…`

Retourne les messages de la conversation pour le user + contexte courant.

```ts
// Réponse 200
{ messages: StoredMessage[] }

// Réponse 200 si aucune conversation
{ messages: [] }
```

### POST

Ajoute les nouveaux messages à la fin de la conversation (upsert atomique).

```ts
// Body
{
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    messages: StoredMessage[];   // les messages à appender (en pratique : [userMsg, assistantMsg])
}

// Réponse 200
{ ok: true }
```

Opération MongoDB :
```ts
db.collection("ai_chat_conversations").updateOne(
    { userId, moduleSlug, sectionSlug, contentType },
    {
        $push: { messages: { $each: messages } },
        $set: { updatedAt: new Date() },
        $setOnInsert: { userId, moduleSlug, sectionSlug, contentType },
    },
    { upsert: true }
)
```

### DELETE

Supprime tous les messages (vide le document ou le supprime).

```ts
// Body
{
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
}

// Réponse 200
{ ok: true }
```

Opération MongoDB :
```ts
db.collection("ai_chat_conversations").deleteOne(
    { userId, moduleSlug, sectionSlug, contentType }
)
```

---

## 5. Hook `useChatSession` — modifications

### Nouveaux états

```ts
const [historyLoading, setHistoryLoading] = useState(true);
const [confirmClear, setConfirmClear] = useState(false);
```

### Chargement au montage

Déclenché quand `enabled` passe à `true`. Appel GET sur `/api/admin/content/ai-chat-history`.

```ts
useEffect(() => {
    if (!enabled) return;
    setHistoryLoading(true);
    fetch(`/api/admin/content/ai-chat-history?module=${moduleSlug}&section=${sectionSlug}&type=${contentType}`)
        .then(r => r.json())
        .then(data => setMessages(data.messages.map(deserializeMessage)))
        .catch(() => {/* silencieux — on démarre simplement vide */})
        .finally(() => setHistoryLoading(false));
}, [enabled, moduleSlug, sectionSlug, contentType]);
```

`deserializeMessage` : convertit `timestamp` string → `Date` (JSON ne sérialise pas les dates).

### Sauvegarde après chaque échange

Après que `firstChunk` est reçu et que l'événement `done` est traité, appel POST avec les 2 derniers messages. Les messages d'erreur réseau (`Erreur :`, `Erreur réseau :`) ne sont pas persistés.

```ts
async function persistExchange(userMsg: ChatMessage, assistantMsg: ChatMessage) {
    // Ne pas persister les messages d'erreur (flag isError sur ChatMessage)
    if (assistantMsg.isError) return;
    await fetch("/api/admin/content/ai-chat-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            moduleSlug, sectionSlug, contentType,
            messages: [toStoredMessage(userMsg), toStoredMessage(assistantMsg)],
        }),
    });
}
```

`toStoredMessage` : retire les champs non-stockés éventuels, conserve `role`, `content`, `thinking`, `toolActions`, `timestamp`.

### Vider l'historique

```ts
async function clearHistory() {
    await fetch("/api/admin/content/ai-chat-history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleSlug, sectionSlug, contentType }),
    });
    setMessages([]);
    setConfirmClear(false);
}
```

### Retour du hook

```ts
return {
    // existant
    status, ollamaVersion, models, selectedModel, setSelectedModel,
    messages, input, setInput, loading, handleSend, retry,
    // nouveau
    historyLoading, confirmClear, setConfirmClear, clearHistory,
};
```

---

## 6. UI — Modifications

### Bouton "Vider" dans le header

Ajouté dans le header de `AiAssistantPanel` (modes float et docked) et `StandaloneChatPanel`. Visible uniquement si `messages.length > 0 && !historyLoading`.

**Comportement double-confirmation inline :**

```
État normal    : icône Trash2 grisée
1er clic       : setConfirmClear(true) + timeout 2500 ms → remet à false
Pendant 2,5 s : bouton devient rouge, texte "Confirmer ?"
2e clic        : clearHistory()
Timeout        : annulation silencieuse
```

### Squelette de chargement initial

Pendant `historyLoading`, à la place du message vide "Décrivez ce que vous souhaitez…", afficher 3 lignes skeleton (`animate-pulse`) imitant des bulles de messages.

---

## 7. Fichiers impactés

| Fichier | Modification |
|---------|-------------|
| `src/app/api/admin/content/ai-chat-history/route.ts` | **Nouveau** — GET / POST / DELETE |
| `src/lib/hooks/useChatSession.ts` | Chargement, persistance, clearHistory, historyLoading, confirmClear |
| `src/components/builder/AiAssistantPanel.tsx` | Bouton Vider, skeleton, confirmClear |
| `src/components/builder/StandaloneChatPanel.tsx` | Idem |

---

## 8. Hors périmètre

- Pagination de l'historique (la liste complète est chargée d'un coup)
- Interface de consultation de l'historique des autres admins
- Export CSV / JSON de la conversation
- Partage de conversation entre admins
