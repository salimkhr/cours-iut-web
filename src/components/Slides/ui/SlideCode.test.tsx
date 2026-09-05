/// <reference types="bun-types" />
import {expect, test} from "bun:test";
import {slideCodeTextMetrics} from "@/components/Slides/ui/SlideCode";

test("expose la taille de code utilisee comme etalon de projection", () => {
    expect(slideCodeTextMetrics.xl.fontSize).toBe("1.6rem");
});
