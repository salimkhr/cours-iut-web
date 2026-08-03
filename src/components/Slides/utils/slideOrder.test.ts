/// <reference types="bun-types" />
import {expect, test} from "bun:test";
import {computeSlideOrders} from "@/components/Slides/utils/slideOrder";

test("garde le meme rang sur des slides consecutives qui partagent un titre", () => {
    // Une section developpee sur trois ecrans reste la section 2.
    expect(computeSlideOrders(["Intro", "Boucles", "Boucles", "Boucles", "Fin"]))
        .toEqual([1, 2, 2, 2, 3]);
});

test("incremente a chaque changement de titre", () => {
    expect(computeSlideOrders(["A", "B", "C"])).toEqual([1, 2, 3]);
});

test("ne fusionne pas deux blocs de meme titre separes par un autre", () => {
    // Le regroupement est positionnel : un retour au meme titre plus loin dans
    // le deck ouvre une nouvelle section, il ne rouvre pas la precedente.
    expect(computeSlideOrders(["A", "B", "A"])).toEqual([1, 2, 3]);
});

test("traite les titres vides comme un groupe a part entiere", () => {
    expect(computeSlideOrders(["", "", "A"])).toEqual([1, 1, 2]);
});

test("renvoie une liste vide pour un deck vide", () => {
    expect(computeSlideOrders([])).toEqual([]);
});
