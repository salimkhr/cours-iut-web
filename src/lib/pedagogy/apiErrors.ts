/** Lit le message d'erreur d'une réponse API non-ok (`{error: string}` attendu), avec repli sur
 *  un message par défaut si le corps est absent, non-JSON, ou que `error` n'est pas une chaîne
 *  (ex. `parsed.error.flatten()` d'un 400 Zod). Anciennement dupliquée à l'identique dans
 *  ProjetStep, ReglagesStep, ReferenceStep, et réécrite inline dans CadrageStep/NotionsStep
 *  (revue finale du workflow module — Finding 5). */
export async function readErrorMessage(res: Response, fallback: string): Promise<string> {
    const json = await res.json().catch(() => ({})) as {error?: unknown};
    return typeof json.error === "string" ? json.error : fallback;
}
