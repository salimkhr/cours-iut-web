// Comptes de la répétition générale du quiz live (src/scripts/quiz-rehearsal.ts).
// Base LOCALE uniquement : le seed refuse toute autre base. Mot de passe généré, valeur de test.

export const QUIZ_REHEARSAL_PASSWORD = "91iayM4rgGIVr0HK";

export interface RehearsalAccount {
    email: string;
    name: string;
    username: string;
    group: string;
    role: "admin" | "user";
}

export const QUIZ_REHEARSAL_ADMIN: RehearsalAccount = {
    email: "prof.repetition@rehearsal.quiz.test",
    name: "Prof Répétition",
    username: "rehearsal.prof",
    group: "",
    role: "admin",
};

export function rehearsalStudent(i: number): RehearsalAccount {
    const n = String(i + 1).padStart(2, "0");
    return {
        email: `etudiant${n}@rehearsal.quiz.test`,
        name: `Etudiant${n} REPETITION`,
        username: `rehearsal.e${n}`,
        group: i < 20 ? "G1" : "G2",
        role: "user",
    };
}
