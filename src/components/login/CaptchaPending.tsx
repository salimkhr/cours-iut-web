"use client";

import {useEffect, useRef} from "react";
import {BotIcon} from "@/components/icons/bot";
import type {BotIconHandle} from "@/components/icons/bot";

const BLINK_INTERVAL_MS = 1600;

/**
 * Attente de la vérification anti-robot.
 *
 * Le bouton d'envoi restait grisé sur « Validation du captcha… » sans rien
 * indiquer d'autre : on nomme l'attente à côté du bouton, et le robot cligne
 * des yeux tant qu'elle dure — le libellé de l'action ne bouge plus.
 */
export default function CaptchaPending() {
    const botRef = useRef<BotIconHandle>(null);

    useEffect(() => {
        const blink = () => botRef.current?.startAnimation();
        blink();
        const id = setInterval(blink, BLINK_INTERVAL_MS);
        return () => clearInterval(id);
    }, []);

    // `div` et non `p` : BotIcon enveloppe son SVG dans un `div`, que HTML
    // interdit à l'intérieur d'un paragraphe — le navigateur refermait le `p`
    // et l'arbre reconstruit ne correspondait plus au rendu serveur.
    return (
        <div
            role="status"
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
            <BotIcon ref={botRef} size={16} className="shrink-0"/>
            Vérification anti-robot en cours…
        </div>
    );
}
