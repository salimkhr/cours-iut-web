import {useEffect, useState} from "react";
import {extractSlideNotes} from "../utils/extractSlideNotes";

export function useSlideNotes(slides: React.ReactNode[], currentSlide: number) {
    const [notes, setNotes] = useState<string | null>(null);

    useEffect(() => {
        setNotes(extractSlideNotes(slides[currentSlide]));
    }, [slides, currentSlide]);

    return notes;
}
