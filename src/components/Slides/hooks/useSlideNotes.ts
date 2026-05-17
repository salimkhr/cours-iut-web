import {useMemo} from "react";
import {extractSlideNotes} from "../utils/extractSlideNotes";

export function useSlideNotes(slides: React.ReactNode[], currentSlide: number) {
    return useMemo(
        () => extractSlideNotes(slides[currentSlide]),
        [slides, currentSlide]
    );
}
