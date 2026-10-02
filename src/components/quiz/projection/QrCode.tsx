"use client";

import {useEffect, useState} from "react";
import QRCode from "qrcode";

/** QR à fort contraste : modules sombres sur fond clair, entouré d'une zone calme (4 modules). */
export default function QrCode({value, label}: {value: string; label: string}) {
    const [svg, setSvg] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        void QRCode.toString(value, {type: "svg", margin: 4, errorCorrectionLevel: "M", color: {dark: "#000000", light: "#ffffff"}})
            .then((markup) => {
                if (!cancelled) setSvg(markup);
            });
        return () => {
            cancelled = true;
        };
    }, [value]);

    return (
        <div
            role="img"
            aria-label={label}
            className="aspect-square w-full max-w-[min(70vh,28rem)] overflow-hidden rounded-lg bg-white [&>svg]:h-full [&>svg]:w-full"
            // Le SVG est produit localement par la bibliothèque à partir de notre propre URL.
            dangerouslySetInnerHTML={svg ? {__html: svg} : undefined}
        />
    );
}
