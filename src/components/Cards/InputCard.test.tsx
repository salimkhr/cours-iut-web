import { expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import InputCard from "@/components/Cards/InputCard";

function renderCard(language: string, code: string) {
    return renderToStaticMarkup(
        <InputCard title="Champ" description="Exemple" language={language} code={code} />,
    );
}

test("input-card HTML affiche le code et un aperçu sandboxé", () => {
    const html = renderCard("html", '<input type="text" name="title">');
    expect(html).toContain('name=&quot;title&quot;');
    expect(html).toContain('sandbox=""');
    expect(html).toContain("Aperçu HTML de Champ");
    expect(html).toContain("viewport");
});

test("input-card HTML signale un champ hidden sans inventer de contrôle", () => {
    const html = renderCard("html", '<input type="hidden" name="token" value="abc">');
    expect(html).toContain("Ce champ n’a pas de rendu visible.");
    expect(html).not.toContain('type="hidden"');
});

test("input-card conserve le rendu historique pour les autres langages", () => {
    const html = renderCard("php", "<?php echo 'Bonjour'; ?>");
    expect(html).toContain("Bonjour");
    expect(html).not.toContain("Aperçu HTML");
    expect(html).not.toContain("sandbox");
});
