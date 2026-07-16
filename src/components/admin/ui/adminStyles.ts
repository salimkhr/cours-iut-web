/**
 * Recettes de surfaces admin, alignées sur DESIGN.md :
 * palette bridge, ombre ambiante chaude en light / noire en dark (« toujours levé »),
 * radius unique rounded-xl pour toute surface de niveau card.
 */
export const ADMIN_CARD =
    "rounded-xl border border-bridge-500/35 bg-bridge-50 dark:bg-bridge-800 " +
    "shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)] dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]";

/** Variante discrète pour les sous-cards imbriquées dans une surface déjà levée. */
export const ADMIN_SUBCARD =
    "rounded-xl border border-bridge-500/30 bg-bridge-50 dark:bg-bridge-800 " +
    "shadow-[0_2px_10px_-6px_rgba(147,97,58,0.3)] dark:shadow-[0_2px_10px_-6px_rgba(0,0,0,0.5)]";
