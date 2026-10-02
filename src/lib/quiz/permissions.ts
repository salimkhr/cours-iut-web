interface SessionLike {
    user: {role?: string | null};
}

/**
 * Qui peut éditer un quiz ou piloter une session. Aujourd'hui seul `admin`
 * existe ; élargir ici suffira quand un rôle enseignant sera créé.
 */
export function canManageQuiz(session: SessionLike | null | undefined): boolean {
    return session?.user.role === "admin";
}
