import {describe, expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import OptionResult from "@/components/quiz/OptionResult";
import Podium from "@/components/quiz/projection/Podium";
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

describe("Podium", () => {
    test("affiche rang, nom public et points", () => {
        const html = renderToStaticMarkup(<Podium entries={[{rank: 1, name: "Ana M.", score: 2.5}]}/>);
        expect(html).toContain("Ana M.");
        expect(html).toContain("2,5");
    });

    test("sans entrée : marches vides et message explicite", () => {
        const html = renderToStaticMarkup(<Podium entries={[]}/>);
        expect(html).toContain("le classement est vide");
        expect(html).not.toContain("Ana M.");
    });
});
