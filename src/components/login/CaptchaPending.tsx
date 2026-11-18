"use client";

import {useEffect, useRef, useState} from "react";
import {AlertCircle} from "lucide-react";
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

// Au-delà, on considère que challenges.cloudflare.com est injoignable (réseau filtré).
const TURNSTILE_LOAD_TIMEOUT_MS = 15_000;

/**
 * Détecte un script Turnstile qui ne se charge pas : erreur réseau signalée par
 * `<Script onError>`, ou `window.turnstile` toujours absent après le délai.
 * Sans cela, le bouton restait grisé sur « Vérification anti-robot en cours… » sans fin.
 */
export function useTurnstileLoadFailure(sitekey: string | undefined) {
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!sitekey) return;
        const id = setTimeout(() => {
            if (!window.turnstile) setFailed(true);
        }, TURNSTILE_LOAD_TIMEOUT_MS);
        return () => clearTimeout(id);
    }, [sitekey]);

    return {failed, onScriptError: () => setFailed(true)};
}

/** La vérification anti-robot ne peut pas se charger : on le dit, au lieu d'attendre sans fin. */
export function CaptchaUnavailable() {
    return (
        <div
            role="alert"
            className="flex items-start justify-center gap-2 text-xs text-red-700 dark:text-red-300"
        >
            <AlertCircle className="h-4 w-4 shrink-0"/>
            La vérification anti-robot ne se charge pas : le réseau bloque sans doute Cloudflare.
            Rechargez la page, ou prévenez votre enseignant si vous êtes en salle à l&apos;IUT.
        </div>
    );
}
