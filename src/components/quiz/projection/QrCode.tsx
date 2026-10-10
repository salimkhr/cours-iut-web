"use client";

import {useEffect, useState} from "react";
import QRCode from "qrcode";

/**
 * QR à fort contraste : modules sombres (brand-dark) entourés d'une zone calme de 4 modules.
 * Le fond est transparent : en mode clair, la surface crème de la slide fait office de fond
 * (≈ 14:1). En mode sombre, une tuile claire (bridge-50) garde des modules sombres sur fond clair,
 * seule polarité lue par tous les lecteurs.
 */
export default function QrCode({value, label}: {value: string; label: string}) {
    const [svg, setSvg] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        void QRCode.toString(value, {type: "svg", margin: 4, errorCorrectionLevel: "M", color: {dark: "#221e18", light: "#0000"}})
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
            className="aspect-square w-full max-w-[min(70vh,28rem)] overflow-hidden rounded-xl dark:bg-bridge-50 [&>svg]:h-full [&>svg]:w-full"
            // Le SVG est produit localement par la bibliothèque à partir de notre propre URL.
            dangerouslySetInnerHTML={svg ? {__html: svg} : undefined}
        />
    );
}
