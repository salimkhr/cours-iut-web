/** Domaine des comptes génériques partagés de l'intranet. */
export const GENERIC_ACCOUNT_DOMAIN = "@salimkhraimeche.dev";

/** Vrai si l'utilisateur est le compte générique (e-mail du domaine dédié, casse ignorée). */
export function isGenericAccount(user: { email?: string | null }): boolean {
    return user.email?.toLowerCase().endsWith(GENERIC_ACCOUNT_DOMAIN) ?? false;
}
