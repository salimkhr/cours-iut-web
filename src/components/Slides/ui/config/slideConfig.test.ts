/// <reference types="bun-types" />
import {expect, test} from "bun:test";
import {slideTextSizes} from "@/components/Slides/ui/config/slideConfig";

test("aligne le texte courant des slides sur la taille projetee du code", () => {
    expect(slideTextSizes.heading[1]).toContain("lg:text-5xl");
    expect(slideTextSizes.text.default).toContain("text-2xl");
    expect(slideTextSizes.text.default).toContain("md:text-[1.75rem]");
    expect(slideTextSizes.text.default).toContain("lg:text-[2rem]");
});
