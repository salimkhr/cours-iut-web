import {describe, expect, test} from "bun:test";
import {ObjectId} from "bson";
import {compareModules, nextModuleOrder, sortModules} from "@/lib/moduleOrder";

// _id hexadécimaux croissants = ordre de création croissant.
const ID_A = "650000000000000000000001";
const ID_B = "650000000000000000000002";
const ID_C = "650000000000000000000003";
const ID_D = "650000000000000000000004";

describe("sortModules", () => {
    test("sans aucun ordre, conserve l'ordre de création (_id)", () => {
        const sorted = sortModules([
            {_id: ID_C, path: "c"},
            {_id: ID_A, path: "a"},
            {_id: ID_B, path: "b"},
        ]);
        expect(sorted.map((m) => m.path)).toEqual(["a", "b", "c"]);
    });

    test("trie par order croissant", () => {
        const sorted = sortModules([
            {_id: ID_A, path: "a", order: 3},
            {_id: ID_B, path: "b", order: 1},
            {_id: ID_C, path: "c", order: 2},
        ]);
        expect(sorted.map((m) => m.path)).toEqual(["b", "c", "a"]);
    });

    test("un module sans order passe après ceux qui en ont un", () => {
        const sorted = sortModules([
            {_id: ID_A, path: "a"},
            {_id: ID_B, path: "b", order: 5},
            {_id: ID_C, path: "c", order: null},
            {_id: ID_D, path: "d", order: 1},
        ]);
        expect(sorted.map((m) => m.path)).toEqual(["d", "b", "a", "c"]);
    });

    test("à égalité d'order, départage par _id", () => {
        const sorted = sortModules([
            {_id: ID_C, path: "c", order: 1},
            {_id: ID_A, path: "a", order: 1},
        ]);
        expect(sorted.map((m) => m.path)).toEqual(["a", "c"]);
    });

    test("accepte des _id ObjectId et ne modifie pas le tableau d'entrée", () => {
        const input = [
            {_id: new ObjectId(ID_B), path: "b"},
            {_id: new ObjectId(ID_A), path: "a"},
        ];
        const sorted = sortModules(input);
        expect(sorted.map((m) => m.path)).toEqual(["a", "b"]);
        expect(input.map((m) => m.path)).toEqual(["b", "a"]);
    });

    test("compareModules est utilisable directement avec Array.sort", () => {
        const list = [{_id: ID_B, order: 2}, {_id: ID_A, order: 1}];
        list.sort(compareModules);
        expect(list[0]._id).toBe(ID_A);
    });
});

describe("nextModuleOrder", () => {
    test("renvoie max(order) + 1 quand au moins un module a un ordre", () => {
        expect(nextModuleOrder([{order: 2}, {order: 7}, {}, {order: null}])).toBe(8);
    });

    test("renvoie undefined quand aucun module n'a d'ordre (affichage par création inchangé)", () => {
        // Poser order = 1 ici ferait passer le nouveau module devant tous les modules
        // historiques sans ordre : l'affichage changerait sans que personne ne l'ait voulu.
        expect(nextModuleOrder([{}, {order: null}])).toBeUndefined();
        expect(nextModuleOrder([])).toBeUndefined();
    });
});
