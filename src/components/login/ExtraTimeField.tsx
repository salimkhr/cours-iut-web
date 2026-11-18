"use client";

import {Checkbox} from "@/components/ui/checkbox";
import {Field, FieldDescription, FieldLabel} from "@/components/ui/field";

interface Props {
    id: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

/** Case « tiers-temps », partagée par l'inscription et Mon compte. */
export default function ExtraTimeField({id, checked, onChange}: Props) {
    return (
        <Field orientation="horizontal" className="items-start gap-3">
            <Checkbox id={id} checked={checked} onCheckedChange={(value) => onChange(value === true)} className="mt-0.5"/>
            <div className="flex flex-col gap-1">
                <FieldLabel htmlFor={id}>J&apos;ai droit à un tiers-temps</FieldLabel>
                <FieldDescription>
                    Aux quiz, chaque question vous laisse un tiers de temps en plus. Seuls les enseignants le voient.
                </FieldDescription>
            </div>
        </Field>
    );
}
