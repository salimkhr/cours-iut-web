// Messages d'erreur better-auth en français, affichés dans les formulaires de compte.
// better-auth renvoie un `code` stable et un `message` en anglais : on traduit par le code.

const MESSAGES: Record<string, string> = {
    INVALID_USERNAME_OR_PASSWORD: "Identifiant ou mot de passe incorrect.",
    INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe incorrect.",
    EMAIL_NOT_VERIFIED: "Votre adresse email n’est pas encore confirmée. Vérifiez votre boîte de réception.",
    BANNED_USER: "Ce compte est suspendu.",
    USER_ALREADY_EXISTS: "Un compte existe déjà avec cette adresse email.",
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Un compte existe déjà avec cette adresse email.",
    USERNAME_IS_ALREADY_TAKEN: "Cet identifiant est déjà utilisé.",
    USERNAME_TOO_SHORT: "Cet identifiant est trop court.",
    INVALID_USERNAME: "Cet identifiant n’est pas valide.",
    PASSWORD_TOO_SHORT: "Le mot de passe est trop court.",
    PASSWORD_TOO_LONG: "Le mot de passe est trop long.",
    INVALID_PASSWORD: "Mot de passe incorrect.",
    INVALID_TOKEN: "Lien invalide ou expiré.",
    MISSING_RESPONSE: "La vérification anti-robot n’est pas terminée. Réessayez dans un instant.",
    VERIFICATION_FAILED: "La vérification anti-robot a échoué. Réessayez.",
};

/** Message français pour une erreur better-auth, ou `fallback` si le code est inconnu. */
export function authErrorMessage(error: {code?: string; status?: number} | null | undefined, fallback: string): string {
    if (error?.status === 429) return "Trop de tentatives. Patientez quelques instants avant de réessayer.";
    return (error?.code && MESSAGES[error.code]) || fallback;
}
