/**
 * Contournement d'authentification réservé aux tests de bout en bout.
 *
 * `proxy.ts` laisse passer sans session toute requête portant un cookie
 * `e2e-bypass` égal à `E2E_BYPASS_SECRET`, et jamais en production. Comme
 * l'interface affiche alors « Connexion » — il n'y a effectivement aucune
 * session — naviguer ainsi est indiscernable d'une faille d'authentification.
 * Le proxy pose donc cet en-tête, que la barre de navigation restitue.
 */
export const E2E_BYPASS_HEADER = "x-e2e-bypass";

/**
 * Le rendu courant a-t-il traversé le proxy via le contournement e2e ?
 *
 * Double garde : l'en-tête n'est posé qu'en dehors de la production, et il est
 * systématiquement réécrit par le proxy pour qu'un client ne puisse pas le
 * forger. On revérifie l'environnement ici afin qu'aucun chemin de rendu ne
 * puisse afficher l'avertissement sur un site en production.
 */
export function isE2EBypass(headers: Headers): boolean {
    if (process.env.NODE_ENV === "production") return false;
    return headers.get(E2E_BYPASS_HEADER) === "1";
}

export const E2E_BYPASS_COOKIE = "e2e-bypass";

/**
 * Lève le contournement, côté serveur.
 *
 * Aucun code du projet ne pose ce cookie : il est déposé à la main ou par un
 * harnais de test externe, qui devrait le marquer `httpOnly` — un cookie qui
 * ouvre le proxy sans session n'a pas à être manipulable en JavaScript. On
 * passe donc par une route plutôt que par `document.cookie`, afin que la
 * suppression fonctionne dans les deux cas.
 */
export async function clearE2EBypassCookie(): Promise<void> {
    await fetch("/api/e2e-bypass", {method: "DELETE"});
}
