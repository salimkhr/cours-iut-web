import React from "react";
import {SlideNote} from "../ui/SlideNote";
import dedent from "ts-dedent";

type ElementWithChildren = React.ReactElement<{ children?: React.ReactNode }>;

export function extractSlideNotes(slide: React.ReactNode): string | null {
    if (!React.isValidElement(slide)) return null;

    const element = slide as ElementWithChildren;

    const isSlideNote = (child: React.ReactNode): child is ElementWithChildren => {
        if (!React.isValidElement(child)) return false;

        const type: any = child.type;
        return (
            type === SlideNote ||
            type?.displayName === "SlideNote" ||
            type?.name === "SlideNote"
        );
    };

    const extractText = (content: React.ReactNode): string => {
        if (content == null) return "";
        if (typeof content === "string" || typeof content === "number") {
            return String(content);
        }
        if (Array.isArray(content)) {
            return content.map(extractText).join("");
        }
        if (React.isValidElement(content)) {
            const el = content as ElementWithChildren;
            return extractText(el.props.children);
        }
        return "";
    };

    let found: string | null = null;

    React.Children.forEach(element.props.children, child => {
        if (isSlideNote(child)) {
            found = extractText(child.props.children);
        }
    });

    return found ? dedent(found) : null;
}
