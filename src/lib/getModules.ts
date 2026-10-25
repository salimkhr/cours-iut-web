import {cache} from "react";
import {connectToDB} from "@/lib/mongodb";
import Module from "@/types/Module";
import {WithId} from "mongodb";
import {sortModules} from "@/lib/moduleOrder";

/**
 * Tous les modules, triés par ordre d'affichage (`order`, puis ordre de création — cf.
 * `compareModules`). Toutes les surfaces (accueil, navbar, footer, admin) doivent recevoir
 * le même ordre : sans tri, MongoDB ne le garantit pas entre deux requêtes.
 *
 * Non mémoïsée, pour rester testable hors rendu RSC ; les pages passent par `getModules`.
 */
export async function fetchModules(): Promise<(Module & { _id: string })[]> {
    const db = await connectToDB();
    // Le tri `{_id: 1}` reste côté base (ordre stable pour les modules sans `order`) ; le tri
    // final se fait en mémoire, car Mongo place les `null`/absents AVANT les nombres en ordre
    // croissant, à l'inverse de ce qu'on veut.
    const modules: WithId<Module>[] = sortModules(
        await db
            .collection<Module>("modules")
            .find()
            .sort({_id: 1})
            .toArray(),
    );

    return modules.map(mod => ({
        ...mod,
        _id: mod._id.toString(),
        updatedAt: mod.updatedAt ? new Date(mod.updatedAt as unknown as Date).toISOString() : undefined,
        sections: mod.sections?.map(({...rest}) => ({
            ...rest,
            _id: mod._id.toString(),
        })) ?? []
    }));
}

// `cache` déduplique les appels au sein d'un même rendu RSC : le layout, la NavBar,
// le footer et la page peuvent appeler getModules() sans multiplier les requêtes DB.
const getModules = cache(fetchModules);

export type ModuleTheme = { path: string; colorLight?: string };

/**
 * Variante projetée de getModules() pour le layout racine : celui-ci s'exécute à
 * chaque rendu de page mais n'a besoin que de `path` et `colorLight` pour
 * générer les variables CSS de thème. Charger les sections complètes de tous les
 * modules à cet endroit est du transfert pur.
 *
 * Séparée de `getModulesTheme` (non mémoïsée) pour rester testable hors rendu RSC :
 * le `cache()` de React n'a de sens qu'à l'intérieur d'un rendu.
 */
export async function fetchModulesTheme(): Promise<ModuleTheme[]> {
    const db = await connectToDB();
    const docs = await db
        .collection<Module>("modules")
        .find({}, {projection: {_id: 0, path: 1, colorLight: 1}})
        .toArray();

    // reason: le driver MongoDB type find() d'après le type générique de la collection
    // (Module), sans tenir compte de la projection passée en option — WithId<Module>
    // ne reflète donc pas la forme réelle des documents retournés ({path, colorLight}).
    return docs as unknown as ModuleTheme[];
}

export const getModulesTheme = cache(fetchModulesTheme);

export default getModules;
