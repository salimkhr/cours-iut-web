"use client";

import {useEffect, useRef} from "react";
import {BotIcon} from "@/components/icons/bot";
import type {BotIconHandle} from "@/components/icons/bot";

const BLINK_INTERVAL_MS = 1600;

/**
 * Robot qui cligne des yeux en boucle.
 *
 * L'animation de `BotIcon` est un clignement unique, déclenché au survol : on la
 * relance à intervalle régulier pour en faire un témoin d'attente.
 */
export function BlinkingBot({size = 16, className}: {size?: number; className?: string}) {
    const botRef = useRef<BotIconHandle>(null);

    useEffect(() => {
        const blink = () => botRef.current?.startAnimation();
        blink();
        const id = setInterval(blink, BLINK_INTERVAL_MS);
        return () => clearInterval(id);
    }, []);

    return <BotIcon ref={botRef} size={size} className={className}/>;
}

/**
 * Attente de la vérification anti-robot, sous le bouton d'envoi.
 *
 * Celui-ci restait grisé sur « Validation du captcha… » sans autre indication :
 * l'attente est nommée ici, le libellé de l'action ne bouge plus.
 */
export default function CaptchaPending() {
    // `div` et non `p` : BotIcon enveloppe son SVG dans un `div`, que HTML
    // interdit à l'intérieur d'un paragraphe — le navigateur refermait le `p`
    // et l'arbre reconstruit ne correspondait plus au rendu serveur.
    return (
        <div
            role="status"
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
            <BlinkingBot className="shrink-0"/>
            Vérification anti-robot en cours…
        </div>
    );
}
