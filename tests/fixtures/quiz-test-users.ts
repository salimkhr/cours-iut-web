// Comptes étudiants de test pour le quiz live (base locale uniquement).
// Créés par src/scripts/seed-quiz-test-users.ts ; réutilisables par le parcours Playwright (tâche 15).
// Mots de passe générés : ce sont des valeurs de test, jamais des comptes réels.

export interface QuizTestUser {
    name: string;
    email: string;
    username: string;
    password: string;
    group: "F1" | "F2" | "G1" | "G2";
}

export const QUIZ_TEST_USERS: QuizTestUser[] = [
    {
        name: "Alice Martin",
        email: "alice.martin@etu.quiz.test",
        username: "test.alice",
        password: "wMOSqdX66Xldw8",
        group: "G1",
    },
    {
        name: "Bruno Durand",
        email: "bruno.durand@etu.quiz.test",
        username: "test.bruno",
        password: "DN5FB9CkcFYzD0",
        group: "G2",
    },
];
