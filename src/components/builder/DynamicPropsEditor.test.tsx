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
