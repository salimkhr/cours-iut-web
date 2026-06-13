# Chat History Persistence — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persister les conversations du chat IA builder par utilisateur × contenu dans MongoDB, les restaurer au montage et permettre un effacement manuel.

**Architecture:** Nouvelle collection `ai_chat_conversations` (document unique par `userId × moduleSlug × sectionSlug × contentType`). Route dédiée `ai-chat-history` (GET/POST/DELETE) protégée par `withAdmin`. Hook `useChatSession` étendu : chargement au montage, append après chaque échange complet, `clearHistory`. Les deux panels reçoivent un skeleton loader et un bouton Vider à double confirmation.

**Tech Stack:** MongoDB driver v7 (`mongodb@^7.1.0`), Next.js 16 App Router Route Handlers, `better-auth` (`getServerSession`), `withAdmin` HOC, React hooks, Lucide (Trash2 déjà importé).

> **Note tests :** Le projet n'a pas encore d'infrastructure de tests (Vitest/Jest absents — cf. CLAUDE.md §8). Les étapes de vérification utilisent `tsc --noEmit` + `eslint` + tests manuels en navigateur.

---

## File Map

| Fichier | Action |
|---------|--------|
| `src/app/api/admin/content/ai-chat-history/route.ts` | **Créer** — GET / POST / DELETE |
| `src/lib/hooks/useChatSession.ts` | Modifier — `isError`, chargement, persistance, clear |
| `src/components/builder/AiAssistantPanel.tsx` | Modifier — skeleton, bouton Vider |
| `src/components/builder/StandaloneChatPanel.tsx` | Modifier — skeleton, bouton Vider |

---

### Task 1 — Ajouter le flag `isError` à `ChatMessage` et marquer toutes les erreurs

**Files:**
- Modify: `src/lib/hooks/useChatSession.ts`

- [ ] **Step 1 — Ajouter `isError?: boolean` au type `ChatMessage`**

Remplacer le bloc `export type ChatMessage` (lignes ~7-13) :

```typescript
export type ChatMessage = {
    role: "user" | "assistant";
    content: string;
    thinking?: string;
    timestamp: Date;
    toolActions?: { name: string; count: number }[];
    isError?: boolean;
};
```

- [ ] **Step 2 — Marquer les 4 créations de messages d'erreur avec `isError: true`**

**a) Erreur HTTP** (bloc `if (!res.ok || !res.body)`) :
```typescript
setMessages((prev) => [...prev, {
    role: "assistant",
    content: `Erreur : ${detail}`,
    timestamp: new Date(),
    isError: true,
}]);
```

**b) Événement SSE `error`** (bloc `else if (event.type === "error")`) :
```typescript
setMessages((prev) => [...prev, {
    role: "assistant",
    content: event.message,
    timestamp: new Date(),
    isError: true,
}]);
```

**c) "Pas de réponse."** (bloc `if (firstChunk)` après la boucle while) :
```typescript
setMessages((prev) => [...prev, {
    role: "assistant",
    content: "Pas de réponse.",
    timestamp: new Date(),
    isError: true,
    ...(pendingThinking ? { thinking: pendingThinking } : {}),
    ...(pendingToolActions ? { toolActions: pendingToolActions } : {}),
}]);
```

**d) Erreur réseau** (bloc `catch (err)`) :
```typescript
setMessages((prev) => [...prev, {
    role: "assistant",
    content: `Erreur réseau : ${msg}`,
    timestamp: new Date(),
    isError: true,
}]);
```

- [ ] **Step 3 — Vérifier**

```powershell
bunx tsc --noEmit
bunx eslint src/lib/hooks/useChatSession.ts
```

Attendu : aucune sortie (zéro erreur).

- [ ] **Step 4 — Commit**

```powershell
git add src/lib/hooks/useChatSession.ts
git commit -m "feat(chat): ajouter isError flag à ChatMessage + marquer les erreurs"
```

---

### Task 2 — Créer la route `ai-chat-history` (GET / POST / DELETE)

**Files:**
- Create: `src/app/api/admin/content/ai-chat-history/route.ts`

- [ ] **Step 1 — Créer le dossier**

```powershell
mkdir src/app/api/admin/content/ai-chat-history
```

- [ ] **Step 2 — Écrire le fichier complet**

Contenu de `src/app/api/admin/content/ai-chat-history/route.ts` :

```typescript
import { withAdmin } from "@/lib/withAdmin";
import { connectToDB } from "@/lib/mongodb";
import { getServerSession } from "@/lib/auth";

interface StoredMessage {
    role: "user" | "assistant";
    content: string;
    thinking?: string;
    toolActions?: { name: string; count: number }[];
    timestamp: Date;
}

// Index créé une seule fois par processus Node (createIndex est idempotent)
let indexEnsured = false;
async function ensureIndex() {
    if (indexEnsured) return;
    const db = await connectToDB();
    await db.collection("ai_chat_conversations").createIndex(
        { userId: 1, moduleSlug: 1, sectionSlug: 1, contentType: 1 },
        { unique: true },
    );
    indexEnsured = true;
}

export const GET = withAdmin(async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const moduleSlug = searchParams.get("module");
    const sectionSlug = searchParams.get("section");
    const contentType = searchParams.get("type");

    if (!moduleSlug || !sectionSlug || !contentType) {
        return Response.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    await ensureIndex();
    const session = await getServerSession();
    const userId = session!.user.id;
    const db = await connectToDB();

    const doc = await db.collection("ai_chat_conversations").findOne(
        { userId, moduleSlug, sectionSlug, contentType },
        { projection: { messages: 1, _id: 0 } },
    );

    return Response.json({ messages: doc?.messages ?? [] });
});

export const POST = withAdmin(async (req: Request) => {
    const body = await req.json() as {
        moduleSlug: string;
        sectionSlug: string;
        contentType: string;
        messages: StoredMessage[];
    };

    const { moduleSlug, sectionSlug, contentType, messages } = body;
    if (!moduleSlug || !sectionSlug || !contentType || !Array.isArray(messages) || messages.length === 0) {
        return Response.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    await ensureIndex();
    const session = await getServerSession();
    const userId = session!.user.id;
    const db = await connectToDB();

    await db.collection("ai_chat_conversations").updateOne(
        { userId, moduleSlug, sectionSlug, contentType },
        {
            $push: { messages: { $each: messages } } as Record<string, unknown>,
            $set: { updatedAt: new Date() },
            $setOnInsert: { userId, moduleSlug, sectionSlug, contentType, createdAt: new Date() },
        },
        { upsert: true },
    );

    return Response.json({ ok: true });
});

export const DELETE = withAdmin(async (req: Request) => {
    const body = await req.json() as {
        moduleSlug: string;
        sectionSlug: string;
        contentType: string;
    };

    const { moduleSlug, sectionSlug, contentType } = body;
    if (!moduleSlug || !sectionSlug || !contentType) {
        return Response.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const session = await getServerSession();
    const userId = session!.user.id;
    const db = await connectToDB();

    await db.collection("ai_chat_conversations").deleteOne(
        { userId, moduleSlug, sectionSlug, contentType },
    );

    return Response.json({ ok: true });
});
```

- [ ] **Step 3 — Vérifier**

```powershell
bunx tsc --noEmit
bunx eslint src/app/api/admin/content/ai-chat-history/route.ts
```

- [ ] **Step 4 — Test manuel : vérifier la route GET**

Serveur de dev en cours (`bun dev`). Dans la console DevTools du navigateur (connecté en admin) :

```javascript
fetch("/api/admin/content/ai-chat-history?module=html-css&section=intro&type=cours")
  .then(r => r.json()).then(console.log)
```

Attendu : `{ messages: [] }` (aucune conversation pour l'instant).

- [ ] **Step 5 — Commit**

```powershell
git add src/app/api/admin/content/ai-chat-history/route.ts
git commit -m "feat(chat): route GET/POST/DELETE ai-chat-history"
```

---

### Task 3 — Charger l'historique au montage dans `useChatSession`

**Files:**
- Modify: `src/lib/hooks/useChatSession.ts`

- [ ] **Step 1 — Ajouter les helpers de (dé)sérialisation au niveau module**

Juste avant `interface UseChatSessionProps`, ajouter :

```typescript
// timestamp arrive comme string depuis JSON.parse — on le rehydrate en Date
type SerializedMessage = Omit<ChatMessage, "timestamp"> & { timestamp: string };

function deserializeMessage(m: SerializedMessage): ChatMessage {
    return { ...m, timestamp: new Date(m.timestamp) };
}

function toStoredMessage(msg: ChatMessage): Omit<ChatMessage, "isError"> {
    const { isError: _isError, ...rest } = msg;
    return rest;
}
```

- [ ] **Step 2 — Ajouter l'état `historyLoading`**

Dans le hook, après `const [refreshKey, setRefreshKey] = useState(0);`, ajouter :

```typescript
const [historyLoading, setHistoryLoading] = useState(false);
```

- [ ] **Step 3 — Ajouter l'effet de chargement**

Après l'effet Ollama status (le `useEffect(() => { ... }, [enabled, refreshKey]);`), ajouter :

```typescript
useEffect(() => {
    if (!enabled) return;
    // setTimeout(0) : interdit d'appeler setState synchronement dans le corps d'un effet (ESLint react-hooks/set-state-in-effect)
    const setLoading = setTimeout(() => setHistoryLoading(true), 0);
    fetch(
        `/api/admin/content/ai-chat-history?module=${encodeURIComponent(moduleSlug)}&section=${encodeURIComponent(sectionSlug)}&type=${encodeURIComponent(contentType)}`,
    )
        .then((r) => r.json() as Promise<{ messages: SerializedMessage[] }>)
        .then((data) => { setMessages(data.messages.map(deserializeMessage)); })
        .catch(() => { /* démarrer vide si erreur réseau */ })
        .finally(() => {
            clearTimeout(setLoading);
            setHistoryLoading(false);
        });
    return () => { clearTimeout(setLoading); };
}, [enabled, moduleSlug, sectionSlug, contentType]);
```

- [ ] **Step 4 — Bloquer `handleSend` pendant le chargement**

Dans `handleSend`, remplacer la garde :

```typescript
if (!text || loading || historyLoading || !selectedModel) return;
```

- [ ] **Step 5 — Exporter `historyLoading` depuis le hook**

Mettre à jour la valeur de retour :

```typescript
return {
    status, ollamaVersion, models, selectedModel, setSelectedModel,
    messages, input, setInput, loading, handleSend, retry,
    historyLoading,
};
```

- [ ] **Step 6 — Vérifier**

```powershell
bunx tsc --noEmit
bunx eslint src/lib/hooks/useChatSession.ts
```

- [ ] **Step 7 — Test manuel**

1. Ouvrir le builder sur n'importe quel contenu.
2. Ouvrir le chat (mode float ou docked).
3. Vérifier dans la console : aucune erreur réseau, `historyLoading` passe vite à `false`.
4. Si des messages avaient été persistés lors d'une étape précédente, ils doivent réapparaître.

- [ ] **Step 8 — Commit**

```powershell
git add src/lib/hooks/useChatSession.ts
git commit -m "feat(chat): charger l'historique depuis MongoDB au montage"
```

---

### Task 4 — Persister chaque échange complet

**Files:**
- Modify: `src/lib/hooks/useChatSession.ts`

- [ ] **Step 1 — Ajouter `persistExchange` dans le hook (après `retry`)**

```typescript
function persistExchange(userMsg: ChatMessage, assistantMsg: ChatMessage) {
    fetch("/api/admin/content/ai-chat-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            moduleSlug,
            sectionSlug,
            contentType,
            messages: [toStoredMessage(userMsg), toStoredMessage(assistantMsg)],
        }),
    }).catch(() => { /* best-effort — silencieux en cas d'échec réseau */ });
}
```

- [ ] **Step 2 — Réécrire `handleSend` pour capturer et persister l'échange**

Remplacer l'intégralité de `handleSend` par :

```typescript
async function handleSend() {
    const text = input.trim();
    if (!text || loading || historyLoading || !selectedModel) return;

    const userMsg: ChatMessage = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Variables pour la persistance — renseignées au fil du stream
    let assistantMsg: ChatMessage | null = null;
    let assistantContent = "";
    let receivedDone = false;

    try {
        const res = await fetch("/api/admin/content/ai-assist-local", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: text,
                model: selectedModel,
                history: messages,
                currentBlocks,
                moduleSlug,
                sectionSlug,
                contentType,
            }),
        });

        if (!res.ok || !res.body) {
            let detail = `HTTP ${res.status}`;
            try { const j = await res.json() as { error?: string }; if (j.error) detail = j.error; } catch { /* ignore */ }
            setMessages((prev) => [...prev, { role: "assistant", content: `Erreur : ${detail}`, timestamp: new Date(), isError: true }]);
            return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let lineBuffer = "";
        let firstChunk = true;
        let pendingThinking = "";
        let pendingToolActions: { name: string; count: number }[] | undefined;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            lineBuffer += decoder.decode(value, { stream: true });
            const lines = lineBuffer.split("\n");
            lineBuffer = lines.pop() ?? "";

            for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                let event: SseEvent;
                try { event = JSON.parse(line.slice(6)) as SseEvent; } catch { continue; }

                if (event.type === "thinking") {
                    pendingThinking += event.content;
                } else if (event.type === "action_summary") {
                    pendingToolActions = event.tools;
                } else if (event.type === "chunk") {
                    if (firstChunk) {
                        firstChunk = false;
                        setLoading(false);
                        assistantMsg = {
                            role: "assistant",
                            content: event.content,
                            timestamp: new Date(),
                            ...(pendingThinking ? { thinking: pendingThinking } : {}),
                            ...(pendingToolActions ? { toolActions: pendingToolActions } : {}),
                        };
                        assistantContent = event.content;
                        setMessages((prev) => [...prev, assistantMsg!]);
                        pendingThinking = "";
                        pendingToolActions = undefined;
                    } else {
                        assistantContent += event.content;
                        setMessages((prev) => {
                            const last = prev[prev.length - 1];
                            return [...prev.slice(0, -1), { ...last, content: last.content + event.content }];
                        });
                    }
                } else if (event.type === "done") {
                    if (event.blocks) onBlocksUpdate(event.blocks);
                    receivedDone = true;
                } else if (event.type === "error") {
                    if (firstChunk) {
                        setLoading(false);
                        setMessages((prev) => [...prev, { role: "assistant", content: event.message, timestamp: new Date(), isError: true }]);
                    }
                }
            }
        }

        if (firstChunk) {
            setMessages((prev) => [...prev, {
                role: "assistant",
                content: "Pas de réponse.",
                timestamp: new Date(),
                isError: true,
                ...(pendingThinking ? { thinking: pendingThinking } : {}),
                ...(pendingToolActions ? { toolActions: pendingToolActions } : {}),
            }]);
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setMessages((prev) => [...prev, { role: "assistant", content: `Erreur réseau : ${msg}`, timestamp: new Date(), isError: true }]);
    } finally {
        setLoading(false);
    }

    // Persister uniquement les échanges complets (done reçu) sans erreur
    if (assistantMsg && receivedDone) {
        persistExchange(userMsg, { ...assistantMsg, content: assistantContent });
    }
}
```

- [ ] **Step 3 — Vérifier**

```powershell
bunx tsc --noEmit
bunx eslint src/lib/hooks/useChatSession.ts
```

- [ ] **Step 4 — Test manuel : vérifier la persistance**

1. Dans le builder chat, envoyer un message et attendre la réponse complète.
2. Dans MongoDB Compass (ou `mongosh cours-iut-web`) :
```javascript
db.ai_chat_conversations.findOne({})
```
Attendu : document avec `userId`, `moduleSlug`, `sectionSlug`, `contentType`, `messages` contenant 2 entrées (user + assistant), sans champ `isError`.

3. Recharger la page, rouvrir le chat — les messages doivent réapparaître.

- [ ] **Step 5 — Commit**

```powershell
git add src/lib/hooks/useChatSession.ts
git commit -m "feat(chat): persister chaque échange complet dans MongoDB"
```

---

### Task 5 — Ajouter `clearHistory` + `confirmClear`

**Files:**
- Modify: `src/lib/hooks/useChatSession.ts`

- [ ] **Step 1 — Ajouter l'état `confirmClear`**

Après `const [historyLoading, setHistoryLoading] = useState(false);`, ajouter :

```typescript
const [confirmClear, setConfirmClear] = useState(false);
```

- [ ] **Step 2 — Ajouter `clearHistory` dans le hook (après `persistExchange`)**

```typescript
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

- [ ] **Step 3 — Exporter les nouvelles valeurs**

Remplacer le `return` du hook :

```typescript
return {
    status, ollamaVersion, models, selectedModel, setSelectedModel,
    messages, input, setInput, loading, handleSend, retry,
    historyLoading, confirmClear, setConfirmClear, clearHistory,
};
```

- [ ] **Step 4 — Vérifier**

```powershell
bunx tsc --noEmit
bunx eslint src/lib/hooks/useChatSession.ts
```

- [ ] **Step 5 — Commit**

```powershell
git add src/lib/hooks/useChatSession.ts
git commit -m "feat(chat): clearHistory + confirmClear dans useChatSession"
```

---

### Task 6 — Mettre à jour `AiAssistantPanel` (skeleton + bouton Vider)

**Files:**
- Modify: `src/components/builder/AiAssistantPanel.tsx`

- [ ] **Step 1 — Ajouter `confirmTimeoutRef` dans le composant**

Après les `useRef` existants (après `const textareaRef = useRef...`), ajouter :

```typescript
const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

- [ ] **Step 2 — Ajouter `handleClearClick` après `handlePopOut`**

```typescript
function handleClearClick() {
    if (chat.confirmClear) {
        if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
        void chat.clearHistory();
    } else {
        chat.setConfirmClear(true);
        if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
        confirmTimeoutRef.current = setTimeout(() => chat.setConfirmClear(false), 2500);
    }
}
```

- [ ] **Step 3 — Ajouter le bouton Vider dans le header mode docked**

Dans le header docked (le `<div className="flex items-center gap-2 px-4 py-3 border-b ...">` du mode docked), ajouter juste avant le bouton `ExternalLink` :

```tsx
{chat.messages.length > 0 && !chat.historyLoading && (
    <button
        aria-label={chat.confirmClear ? "Confirmer la suppression" : "Vider la conversation"}
        title={chat.confirmClear ? "Cliquez pour confirmer" : "Vider la conversation"}
        onClick={handleClearClick}
        className={cn(
            "flex-shrink-0 transition-colors duration-200 cursor-pointer",
            chat.confirmClear
                ? "text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                : "text-bridge-500 dark:text-bridge-400 hover:text-bridge-700 dark:hover:text-bridge-200",
        )}
    >
        <Trash2 className="w-3.5 h-3.5" />
    </button>
)}
```

- [ ] **Step 4 — Ajouter le bouton Vider dans le header mode float**

Même JSX dans le header float (l'autre `<div className="flex items-center gap-2 px-4 py-3 border-b ...">` du panel flottant), juste avant le bouton `PanelRightOpen` (Ancrer) :

```tsx
{chat.messages.length > 0 && !chat.historyLoading && (
    <button
        aria-label={chat.confirmClear ? "Confirmer la suppression" : "Vider la conversation"}
        title={chat.confirmClear ? "Cliquez pour confirmer" : "Vider la conversation"}
        onClick={handleClearClick}
        className={cn(
            "flex-shrink-0 transition-colors duration-200 cursor-pointer",
            chat.confirmClear
                ? "text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                : "text-bridge-500 dark:text-bridge-400 hover:text-bridge-700 dark:hover:text-bridge-200",
        )}
    >
        <Trash2 className="w-3.5 h-3.5" />
    </button>
)}
```

- [ ] **Step 5 — Remplacer l'état vide par un skeleton pendant `historyLoading`**

Dans la zone messages (à l'intérieur de `{chat.status === "connected" && chat.models.length > 0 && (...)}`, section `<div className="flex-1 overflow-y-auto...">`), remplacer :

```tsx
{chat.messages.length === 0 && (
    <div className="flex flex-col items-center justify-center gap-2 text-center py-8 flex-1">
        <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brand-primary" />
        </div>
        <p className="text-xs text-bridge-500 dark:text-bridge-400 max-w-[220px] leading-relaxed">
            Décrivez ce que vous souhaitez créer ou modifier dans le cours.
        </p>
    </div>
)}
```

par :

```tsx
{chat.historyLoading ? (
    <div className="flex flex-col gap-3 px-1 py-2 w-full">
        <div className="self-end h-7 rounded-xl bg-bridge-200 dark:bg-bridge-700 animate-pulse rounded-br-sm" style={{ width: "65%" }} />
        <div className="self-start h-10 rounded-xl bg-bridge-200 dark:bg-bridge-700 animate-pulse rounded-bl-sm" style={{ width: "78%" }} />
        <div className="self-end h-7 rounded-xl bg-bridge-200 dark:bg-bridge-700 animate-pulse rounded-br-sm" style={{ width: "52%" }} />
    </div>
) : chat.messages.length === 0 ? (
    <div className="flex flex-col items-center justify-center gap-2 text-center py-8 flex-1">
        <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brand-primary" />
        </div>
        <p className="text-xs text-bridge-500 dark:text-bridge-400 max-w-[220px] leading-relaxed">
            Décrivez ce que vous souhaitez créer ou modifier dans le cours.
        </p>
    </div>
) : null}
```

- [ ] **Step 6 — Désactiver le bouton d'envoi pendant `historyLoading`**

Dans le `<Button>` d'envoi, mettre à jour `disabled` :

```tsx
disabled={chat.loading || chat.historyLoading || !chat.input.trim() || !chat.selectedModel}
```

- [ ] **Step 7 — Vérifier**

```powershell
bunx tsc --noEmit
bunx eslint src/components/builder/AiAssistantPanel.tsx
```

- [ ] **Step 8 — Test manuel**

1. Ouvrir le builder chat → vérifier le skeleton (bref), puis messages ou état vide.
2. Envoyer un message, attendre la réponse.
3. Cliquer l'icône Trash2 → bouton passe en rouge.
4. Cliquer à nouveau dans les 2,5 s → conversation effacée dans l'UI + dans MongoDB (`db.ai_chat_conversations.findOne({})` retourne `null`).
5. Attendre 2,5 s sans second clic → bouton redevient gris, rien n'est effacé.

- [ ] **Step 9 — Commit**

```powershell
git add src/components/builder/AiAssistantPanel.tsx
git commit -m "feat(chat): skeleton + bouton Vider dans AiAssistantPanel"
```

---

### Task 7 — Mettre à jour `StandaloneChatPanel` (skeleton + bouton Vider)

**Files:**
- Modify: `src/components/builder/StandaloneChatPanel.tsx`

- [ ] **Step 1 — Ajouter `confirmTimeoutRef`**

Après les `useRef` existants (après `const broadcastRef = useRef...`), ajouter :

```typescript
const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

- [ ] **Step 2 — Ajouter `handleClearClick` après `handleCopy`**

```typescript
function handleClearClick() {
    if (chat.confirmClear) {
        if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
        void chat.clearHistory();
    } else {
        chat.setConfirmClear(true);
        if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
        confirmTimeoutRef.current = setTimeout(() => chat.setConfirmClear(false), 2500);
    }
}
```

- [ ] **Step 3 — Ajouter le bouton Vider dans le `<header>`**

Dans le `<header>`, juste avant le `<div>` de l'indicateur Ollama (le `<div className="flex items-center gap-1.5 flex-shrink-0">`), ajouter :

```tsx
{chat.messages.length > 0 && !chat.historyLoading && (
    <button
        aria-label={chat.confirmClear ? "Confirmer la suppression" : "Vider la conversation"}
        title={chat.confirmClear ? "Cliquez pour confirmer" : "Vider la conversation"}
        onClick={handleClearClick}
        className={cn(
            "flex-shrink-0 transition-colors duration-200 cursor-pointer",
            chat.confirmClear
                ? "text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                : "text-bridge-500 dark:text-bridge-400 hover:text-bridge-700 dark:hover:text-bridge-200",
        )}
    >
        <Trash2 className="w-4 h-4" />
    </button>
)}
```

- [ ] **Step 4 — Remplacer l'état vide par un skeleton pendant `historyLoading`**

Dans la zone messages (`{chat.status === "connected" && chat.models.length > 0 && (...)}`, `<div className="flex-1 overflow-y-auto...">`), remplacer :

```tsx
{chat.messages.length === 0 && (
    <div className="flex flex-col items-center justify-center gap-3 text-center py-12 flex-1">
        <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-brand-primary" />
        </div>
        <p className="text-sm text-bridge-500 dark:text-bridge-400 max-w-[260px] leading-relaxed">
            Décrivez ce que vous souhaitez créer ou modifier dans le cours.
        </p>
    </div>
)}
```

par :

```tsx
{chat.historyLoading ? (
    <div className="flex flex-col gap-3 px-1 py-2 w-full">
        <div className="self-end h-9 rounded-xl bg-bridge-200 dark:bg-bridge-700 animate-pulse rounded-br-sm" style={{ width: "60%" }} />
        <div className="self-start h-14 rounded-xl bg-bridge-200 dark:bg-bridge-700 animate-pulse rounded-bl-sm" style={{ width: "80%" }} />
        <div className="self-end h-9 rounded-xl bg-bridge-200 dark:bg-bridge-700 animate-pulse rounded-br-sm" style={{ width: "55%" }} />
    </div>
) : chat.messages.length === 0 ? (
    <div className="flex flex-col items-center justify-center gap-3 text-center py-12 flex-1">
        <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-brand-primary" />
        </div>
        <p className="text-sm text-bridge-500 dark:text-bridge-400 max-w-[260px] leading-relaxed">
            Décrivez ce que vous souhaitez créer ou modifier dans le cours.
        </p>
    </div>
) : null}
```

- [ ] **Step 5 — Désactiver le bouton d'envoi pendant `historyLoading`**

```tsx
disabled={chat.loading || chat.historyLoading || !chat.input.trim() || !chat.selectedModel}
```

- [ ] **Step 6 — Vérifier**

```powershell
bunx tsc --noEmit
bunx eslint src/components/builder/StandaloneChatPanel.tsx
```

- [ ] **Step 7 — Commit**

```powershell
git add src/components/builder/StandaloneChatPanel.tsx
git commit -m "feat(chat): skeleton + bouton Vider dans StandaloneChatPanel"
```

---

## Checklist post-implémentation

- [ ] Ouvrir le builder sur un contenu → historique restauré après un refresh
- [ ] Envoyer un message → document visible dans `db.ai_chat_conversations`
- [ ] Ouvrir le standalone chat (popup) → même historique visible
- [ ] Vider via le bouton → document supprimé en base, UI vide
- [ ] Simuler une erreur réseau Ollama → message d'erreur affiché mais **non persisté** (`messages.length` en base reste inchangé)
- [ ] Vérifier que le bouton Vider est absent quand `messages.length === 0`
