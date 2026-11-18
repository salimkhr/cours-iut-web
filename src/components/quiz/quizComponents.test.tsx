import {describe, expect, mock, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import OptionResult from "@/components/quiz/OptionResult";
import {QuestionStatement} from "@/components/quiz/admin/QuizPanel";
import type {Block} from "@/types/CourseContent";

describe("QuestionStatement", () => {
    test("affiche les blocs de code de l'énoncé, pas seulement le texte", () => {
        const blocks = [
            {id: "c", type: "code", props: {language: "php", code: "echo $titre;"}},
            {id: "q", type: "text", props: {content: "Que s'affiche-t-il ?"}},
        ] as Block[];
        const html = renderToStaticMarkup(<QuestionStatement blocks={blocks}/>);
        expect(html).toContain("titre");
        expect(html).toContain("Que s&#x27;affiche-t-il ?");
    });
});

describe("OptionResult", () => {
    test("bonne réponse : libellé explicite, pas seulement la couleur", () => {
        const html = renderToStaticMarkup(<ul><OptionResult text="Oui" correct selected/></ul>);
        expect(html).toContain("Bonne réponse");
        expect(html).toContain("Votre choix");
    });

    test("mauvaise réponse choisie", () => {
        const html = renderToStaticMarkup(<ul><OptionResult text="Non" correct={false} selected/></ul>);
        expect(html).toContain("Mauvaise réponse");
        expect(html).toContain("Votre choix");
    });

    test("projection : aucun « Votre choix »", () => {
        const html = renderToStaticMarkup(<ul><OptionResult text="Non" correct={false}/></ul>);
        expect(html).not.toContain("Votre choix");
    });
});

describe("JoinCodeForm", () => {
    test("champ étiqueté, aide visible, bouton désactivé tant que rien n'est saisi", async () => {
        mock.module("next/navigation", () => ({useRouter: () => ({push: () => {}})}));
        const {default: JoinCodeForm} = await import("@/components/quiz/play/JoinCodeForm");
        const html = renderToStaticMarkup(<JoinCodeForm/>);
        expect(html).toContain('for="quiz-code"');
        expect(html).toContain('id="quiz-code"');
        expect(html).toContain('aria-describedby="quiz-code-help"');
        expect(html).toContain("Saisissez le code du quiz.");
        expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled/);
    });
});

describe("JoinQuizButton", () => {
    test("lien vers la saisie du code, aux couleurs du module", async () => {
        const {default: JoinQuizButton} = await import("@/components/quiz/JoinQuizButton");
        const html = renderToStaticMarkup(<JoinQuizButton accentColor="#123456" accentColorDark="#abcdef"/>);
        expect(html).toMatch(/<a[^>]*href="\/quiz"/);
        expect(html).toContain("Rejoindre le quiz");
        expect(html).toContain("--module-color:#123456");
    });
});

describe("Statement (énoncé sur ordinateur)", () => {
    test("rend le texte et le code, toujours visible, sans bouton Copier actif", async () => {
        const {Statement} = await import("@/components/quiz/play/PlayScreen");
        const blocks = [
            {id: "c", type: "code", props: {language: "php", code: "echo $titre;"}},
            {id: "q", type: "text", props: {content: "Que s'affiche-t-il ?"}},
        ] as Block[];
        const html = renderToStaticMarkup(<Statement blocks={blocks}/>);
        expect(html).toContain("titre");
        expect(html).toContain("Que s&#x27;affiche-t-il ?");
        expect(html).toMatch(/^<div class="flex flex-col/);
        expect(html).toContain("[&amp;_button]:hidden");
    });
});
