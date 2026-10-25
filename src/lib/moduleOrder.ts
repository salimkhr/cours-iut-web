import type {ObjectId} from "bson";

/** Forme minimale nécessaire au tri : `_id` (ObjectId ou sa forme hexadécimale) et l'ordre
 *  d'affichage. Mongo renvoie `null` pour un champ écrit à `undefined`, d'où `null` accepté. */
export interface OrderableModule {
    _id: string | ObjectId;
    order?: number | null;
}

function hasOrder(order: number | null | undefined): order is number {
    return typeof order === "number" && Number.isFinite(order);
}

/** `order` croissant ; un module sans `order` passe après ceux qui en ont un ; à égalité ou
 *  sans ordre, départage par `_id` (ordre de création). Tant qu'aucun ordre n'est posé,
 *  l'ordre obtenu est donc exactement l'ancien tri `{_id: 1}`. */
export function compareModules(a: OrderableModule, b: OrderableModule): number {
    const aHas = hasOrder(a.order);
    const bHas = hasOrder(b.order);
    if (aHas && bHas && a.order !== b.order) return (a.order as number) - (b.order as number);
    if (aHas !== bHas) return aHas ? -1 : 1;
    // Un ObjectId en hexadécimal (24 caractères, timestamp en tête) se compare
    // lexicographiquement dans le même ordre que le tri Mongo sur `_id`.
    const aId = String(a._id);
    const bId = String(b._id);
    return aId < bId ? -1 : aId > bId ? 1 : 0;
}

/** Copie triée de `modules` (l'entrée n'est pas modifiée). */
export function sortModules<T extends OrderableModule>(modules: readonly T[]): T[] {
    return [...modules].sort(compareModules);
}

/** Ordre par défaut d'un module créé : `max(order) + 1`. Si aucun module n'a encore d'ordre,
 *  renvoie `undefined` : poser 1 ferait passer le nouveau module devant tous les modules
 *  historiques (sans ordre), alors que l'affichage doit rester celui de la création. */
export function nextModuleOrder(modules: readonly {order?: number | null}[]): number | undefined {
    const orders = modules.map((m) => m.order).filter(hasOrder);
    return orders.length > 0 ? Math.max(...orders) + 1 : undefined;
}
