import {FIXED_COMPETENCES, type ModuleFormValues} from "@/lib/schemas/module.schema";
import type Module from "@/types/Module";

/** Reconstruit un ModuleFormValues complet à partir du module courant : le PUT de
 *  /api/admin/modules/[moduleId] remplace le document entier (moduleFormSchema n'a pas de
 *  variante partielle), donc chaque étape du workflow module doit renvoyer tous les champs
 *  existants et ne patcher que ceux qu'elle édite — sous peine d'écraser
 *  coefficients/instructors/couleurs. Anciennement dupliquée à l'identique dans CadrageStep,
 *  NotionsStep, ProjetStep et ReglagesStep (revue finale du workflow module — Finding 5) :
 *  centralisée ici pour qu'un nouveau champ de `moduleFormSchema` n'ait qu'un seul endroit
 *  à mettre à jour. */
export function moduleToFormValues(module: Module): ModuleFormValues {
    return {
        title: module.title,
        path: module.path,
        iconName: module.iconName,
        description: module.description ?? "",
        associatedSae: module.associatedSae ?? [],
        coefficients: FIXED_COMPETENCES.map((c) => ({
            competenceName: c,
            value: module.coefficients?.find((k) => k.competenceName === c)?.value ?? 0,
        })),
        manager: module.manager ?? {firstName: "", lastName: "", email: ""},
        instructors: module.instructors?.length
            ? module.instructors
            : [{firstName: "", lastName: "", email: ""}],
        isExtra: module.isExtra ?? false,
        sessionDurationMinutes: module.sessionDurationMinutes,
        colorLight: module.colorLight ?? "#C2410C",
        colorDark: module.colorDark ?? "#FB923C",
        universe: module.universe,
        projectIcon: module.projectIcon ?? "",
        plannedNotions: module.plannedNotions ?? [],
        projectSpec: module.projectSpec,
        exampleDomain: module.exampleDomain,
    };
}
