import React from "react";
import {test, expect} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {DynamicPropsEditor} from "@/components/builder/DynamicPropsEditor";
import type {FieldDef} from "@/lib/blockRegistry";

test("applique le nombre de lignes demande aux champs textarea", () => {
    const fields: FieldDef[] = [
        {key: "code", label: "Code", type: "textarea", rows: 15},
    ];

    const html = renderToStaticMarkup(
        <DynamicPropsEditor
            fields={fields}
            props={{code: "ligne 1\nligne 2"}}
            onChange={() => {}}
        />
    );

    expect(html).toContain('rows="15"');
});

test("route les champs de type code vers l'éditeur coloré", () => {
    const fields: FieldDef[] = [
        {key: "code", label: "Code", type: "code", languageFrom: "language", rows: 15},
    ];

    const html = renderToStaticMarkup(
        <DynamicPropsEditor
            fields={fields}
            props={{language: "css", code: ".intro { color: red }"}}
            onChange={() => {}}
        />
    );

    expect(html).toContain("data-code-field");
    expect(html).toContain('data-language="css"');
});

test("transmet le placeholder du champ à l'éditeur coloré", () => {
    // Le passage de `textarea` à `code` avait perdu le placeholder en route :
    // le champ le déclarait, plus rien ne le rendait. Monaco le gère
    // nativement (option `placeholder`) ; `data-placeholder` est la trace que
    // le rendu statique peut vérifier, Monaco n'étant monté que côté client.
    const fields: FieldDef[] = [
        {key: "preview", label: "Gabarit de l'aperçu", type: "code", language: "html", rows: 10, placeholder: "<!-- @edit:html -->"},
    ];

    const html = renderToStaticMarkup(
        <DynamicPropsEditor fields={fields} props={{preview: ""}} onChange={() => {}}/>
    );

    expect(html).toContain('data-placeholder="&lt;!-- @edit:html --&gt;"');
});
