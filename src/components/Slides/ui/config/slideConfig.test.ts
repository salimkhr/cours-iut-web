/// <reference types="bun-types" />
import {expect, test} from "bun:test";
import {slideTextSizes} from "@/components/Slides/ui/config/slideConfig";

test("aligne le texte courant des slides sur la taille projetee du code", () => {
    expect(slideTextSizes.heading[1]).toContain("lg:text-[2.1rem]");
    expect(slideTextSizes.text.default).toContain("text-[1.05rem]");
    expect(slideTextSizes.text.default).toContain("md:text-[1.2rem]");
    expect(slideTextSizes.text.default).toContain("lg:text-[1.4rem]");
});
