/// <reference types="bun-types" />
import {expect, test} from "bun:test";
import {computeStepMarkers} from "@/components/Slides/utils/stepMarkers";

test("aucune etape : aucun marqueur", () => {
    expect(computeStepMarkers(0)).toEqual([]);
});

test("une seule etape : un point", () => {
    expect(computeStepMarkers(1)).toEqual([{kind: "dot", stepIndex: 0}]);
});

test("deux etapes : deux points, pas de pastille", () => {
    expect(computeStepMarkers(2)).toEqual([
        {kind: "dot", stepIndex: 0},
        {kind: "dot", stepIndex: 1},
    ]);
});

test("trois etapes : premier point, une pastille d'un seul cran, dernier point", () => {
    expect(computeStepMarkers(3)).toEqual([
        {kind: "dot", stepIndex: 0},
        {kind: "pill", from: 1, to: 1},
        {kind: "dot", stepIndex: 2},
    ]);
});

test("cinq etapes : la pastille absorbe tous les crans du milieu", () => {
    // Toujours trois marqueurs, quel que soit le nombre d'etapes au-dela de deux.
    expect(computeStepMarkers(5)).toEqual([
        {kind: "dot", stepIndex: 0},
        {kind: "pill", from: 1, to: 3},
        {kind: "dot", stepIndex: 4},
    ]);
});
