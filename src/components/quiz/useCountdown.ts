"use client";

import {useEffect, useState} from "react";

/**
 * Secondes restantes avant l'échéance fixée par le serveur. L'écart entre
 * l'horloge serveur (`serverNow`, reçu avec l'état) et l'horloge locale est
 * mesuré une fois à la réception : un téléphone mal réglé reste cohérent.
 */
export function useCountdown(deadline: number | null, serverNow: number): number | null {
    const [offset, setOffset] = useState(0);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const local = Date.now();
        // reason: l'écart est lié à la réception d'un nouvel état ; il se recale à chaque `serverNow`
        const raf = requestAnimationFrame(() => {
            setOffset(serverNow - local);
            setNow(local);
        });
        return () => cancelAnimationFrame(raf);
    }, [serverNow]);

    useEffect(() => {
        if (deadline === null) return;
        const timer = setInterval(() => setNow(Date.now()), 250);
        return () => clearInterval(timer);
    }, [deadline]);

    if (deadline === null) return null;
    return Math.max(0, Math.ceil((deadline - (now + offset)) / 1000));
}
