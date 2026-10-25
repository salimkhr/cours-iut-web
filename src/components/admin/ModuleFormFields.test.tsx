import React from "react";
import {describe, expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {useForm} from "react-hook-form";
import ModuleFormFields, {parseOptionalOrder} from "@/components/admin/ModuleFormFields";
import {moduleFormSchema, type ModuleFormValues} from "@/lib/schemas/module.schema";
import {moduleToFormValues} from "@/lib/pedagogy/moduleFormValues";

function Harness({order}: {order?: number}) {
    const {register, control, watch, setValue, formState: {errors}} = useForm<ModuleFormValues>({
        defaultValues: moduleToFormValues({
            _id: "1", title: "Rust", path: "rust", iconName: "Code", associatedSae: [], sections: [], order,
        }),
    });
    return <ModuleFormFields register={register} control={control} errors={errors} watch={watch} setValue={setValue}/>;
}

describe("ModuleFormFields — ordre d'affichage", () => {
    // `register` (champ non contrôlé) n'écrit la valeur par défaut qu'au montage, via la ref :
    // le rendu statique ne la montre pas. Le préremplissage repose sur moduleToFormValues
    // (testé dans moduleFormValues.test.ts).
    test("affiche un champ numérique entier ≥ 1, lié à son label et à son aide", () => {
        const html = renderToStaticMarkup(<Harness order={3}/>);
        expect(html).toContain("Ordre d&#x27;affichage");
        expect(html).toContain('for="mf-order"');
        const input = html.match(/<input[^>]*id="mf-order"[^>]*>/)?.[0] ?? "";
        expect(input).toContain('type="number"');
        expect(input).toContain('min="1"');
        expect(input).toContain('step="1"');
        expect(input).toContain('name="order"');
        expect(input).toContain('aria-describedby="mf-order-hint"');
        expect(html).toContain('id="mf-order-hint"');
    });
});

describe("parseOptionalOrder", () => {
    test("un champ vide donne undefined (et non NaN, que le schéma rejetterait)", () => {
        expect(parseOptionalOrder("")).toBeUndefined();
        expect(parseOptionalOrder("   ")).toBeUndefined();
        expect(parseOptionalOrder(null)).toBeUndefined();
        expect(parseOptionalOrder(undefined)).toBeUndefined();
    });

    test("convertit la saisie en nombre", () => {
        expect(parseOptionalOrder("4")).toBe(4);
        expect(parseOptionalOrder(4)).toBe(4);
    });

    test("un formulaire avec ordre vide reste valide pour le schéma", () => {
        const values = {
            ...moduleToFormValues({_id: "1", title: "Rust", path: "rust", iconName: "Code", associatedSae: [], sections: []}),
            order: parseOptionalOrder(""),
        };
        expect(moduleFormSchema.safeParse(values).success).toBe(true);
    });
});
