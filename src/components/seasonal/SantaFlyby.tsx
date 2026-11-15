'use client';

import {type CSSProperties, useEffect, useRef, useState} from "react";

type Pass = {
    id: number;
    /** Hauteur de départ, en % de la hauteur du hero. */
    top: number;
    /** Hauteur de départ en px, quand un plafond (`ceiling`) l'impose. */
    topPx?: number;
    /**
     * Trajectoire ondulée (avec un plafond) : vague douce sur toute la
     * traversée, plus une descente sur la partie droite, libre de texte, à
     * partir de la fraction `descendAt` (le traîneau a dépassé la colonne de
     * texte). En sens inverse, il remonte avant le texte.
     */
    wave?: {amp: number; freq: number; phase: number};
    descendAt?: number;
    descent?: number;
    /** Montée (négatif) ou descente sur la traversée, en px. */
    rise: number;
    duration: number;
    direction: "ltr" | "rtl";
};

const between = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Couloirs de vol, en % de la hauteur du conteneur.
 * - `full` : hero de l'accueil.
 * - `compact` : heros des pages module, section, contenu (bandeau bas).
 * - `top` : pages d'authentification, où le formulaire occupe le centre : le
 *   traîneau reste dans le haut de l'écran, au-dessus du formulaire.
 */
export type FlightLane = "full" | "compact" | "top";

const LANES: Record<FlightLane, {top: [number, number]; rise: [number, number]; duration: [number, number]}> = {
    full: {top: [6, 58], rise: [-70, 50], duration: [7, 12]},
    compact: {top: [8, 48], rise: [-30, 20], duration: [6, 9]},
    top: {top: [4, 9], rise: [-10, 25], duration: [8, 12]},
};

function randomPass(id: number, lane: FlightLane): Pass {
    const {top, rise, duration} = LANES[lane];
    return {
        id,
        top: between(...top),
        rise: between(...rise),
        duration: between(...duration),
        direction: Math.random() < 0.5 ? "ltr" : "rtl",
    };
}

/**
 * Hauteur du traîneau, d'après sa largeur CSS (`.noel-santa`,
 * clamp(150px, 15vw, 220px)) et le rapport de son viewBox (330 × 136).
 */
function sleighHeight(): number {
    const width = Math.min(220, Math.max(150, window.innerWidth * 0.15));
    return width * 136 / 330;
}

/**
 * Garde le traîneau au-dessus d'un élément du conteneur (le titre du hero),
 * sur une trajectoire ondulée de faible amplitude. La ligne médiane est tirée
 * entre le haut du conteneur et le haut de l'élément, moins la hauteur du
 * traîneau et l'amplitude de la vague, pour que le creux ne touche jamais le titre.
 */
function keepAbove(pass: Pass, container: Element, ceiling: Element): Pass | null {
    const box = container.getBoundingClientRect();
    const height = sleighHeight();
    const amp = between(6, 12);
    const wave = {amp, freq: between(1, 1.5), phase: between(0, Math.PI * 2)};
    // Le plafond est le plus haut des deux : le titre, ou un texte placé
    // au-dessus de lui (surtitre « PHP • Quiz » de la projection).
    const text = textBounds(container);
    const roofTop = Math.min(ceiling.getBoundingClientRect().top, text.top);
    const room = roofTop - box.top - height - 10 - amp;
    const minTop = amp + 2;

    // Pas de place au-dessus du titre (titre en haut de l'écran, comme sur le
    // téléphone du quiz) : le traîneau vole sous tout le texte, sinon il saute
    // ce passage. Il ne passe jamais devant du texte.
    if (room < minTop) {
        const floor = text.bottom - box.top + amp + 10;
        const lowest = box.height - height - amp - 10;
        if (lowest < floor) return null;
        return {...pass, topPx: between(floor, lowest), rise: 0, wave, descendAt: 1, descent: 0};
    }
    const topPx = between(minTop, room);

    // La colonne de texte (parent du titre) s'arrête ici ; au-delà, le
    // traîneau peut descendre. La piste va de -280 px à la largeur du
    // conteneur (`noel-santa-fly`) : fraction où son bord gauche dépasse la colonne.
    const columnRight = (ceiling.parentElement ?? ceiling).getBoundingClientRect().right - box.left;
    const descendAt = (columnRight + 20 + 280) / (box.width + 280);
    const free = box.height - topPx - amp - height - 40;
    const canDescend = descendAt < 0.9 && free > 20;
    // Descente modeste : au plus 70 px et 35 % de la place libre.
    const descent = canDescend ? Math.min(between(0.15, 0.35) * free, 70) : 0;

    return {
        ...pass,
        topPx,
        rise: 0,
        wave,
        descendAt: canDescend ? descendAt : 1,
        descent,
    };
}

/** Haut et bas du contenu lisible du conteneur, décors (`aria-hidden`) exclus, en px écran. */
function textBounds(container: Element): {top: number; bottom: number} {
    const box = container.getBoundingClientRect();
    let top = box.bottom;
    let bottom = box.top;
    container.querySelectorAll("h1, h2, h3, p, li, a, button, input, img, canvas, span, [role='status']").forEach((el) => {
        if (el.closest("[aria-hidden='true']")) return;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        top = Math.min(top, rect.top);
        bottom = Math.max(bottom, rect.bottom);
    });
    return {top, bottom};
}

/** Attente avant un passage : court au premier, plus long ensuite. */
const firstDelay = () => between(2_000, 7_000);
const nextDelay = () => between(10_000, 25_000);

/** Cadeau lâché par le traîneau, en px dans le repère du conteneur. */
type Gift = {
    id: number;
    x: number;
    y: number;
    /** Distance jusqu'au bas du conteneur, là où se pose la neige. */
    fall: number;
    spin: number;
    color: "red" | "green" | "gold";
    /** Aller-retour du lutin venu de la gauche, en s. */
    elfDuration: number;
};

const GIFT_COLORS: Gift["color"][] = ["red", "green", "gold"];
const MAX_GIFTS = 6;

/** Chute du cadeau, puis le lutin part de la gauche (voir `.noel-elf`). */
const GIFT_FALL_S = 1.4;
const ELF_START_S = 1.6;
/** Vitesse de marche du lutin, en px/s ; il marche 90 % du trajet. */
const ELF_SPEED = 170;
const ELF_OFFSCREEN = 40;

/** Un clic sur ces éléments garde son rôle : il ne lâche pas de cadeau. */
const INTERACTIVE = "a, button, input, textarea, select, label, summary, [role='button'], [contenteditable]";

function isNoelActive(): boolean {
    return document.documentElement.classList.contains("theme-noel")
        && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Le traîneau du père Noël traverse le hero de temps en temps, à une hauteur,
 * une vitesse et dans un sens tirés au hasard. Rien n'est rendu côté serveur :
 * le hasard ne vit que dans le navigateur, sans écart d'hydratation.
 *
 * Clin d'œil : un clic sur le traîneau en fait tomber un cadeau. Le traîneau
 * vole devant le texte mais laisse passer les clics (`pointer-events: none`,
 * pour ne jamais masquer un lien) : on écoute donc les clics de la page
 * pendant un passage et on regarde s'ils tombent dans sa zone, en laissant aux
 * liens et boutons leur rôle.
 */
export default function SantaFlyby({lane = "full", ceiling}: {
    lane?: FlightLane;
    /** Sélecteur d'un élément du conteneur que le traîneau survole sans le toucher. */
    ceiling?: string;
}) {
    const [pass, setPass] = useState<Pass | null>(null);
    const [count, setCount] = useState(0);
    const [gifts, setGifts] = useState<Gift[]>([]);
    const trackRef = useRef<HTMLDivElement>(null);
    // Repère sans taille, présent en permanence : donne le conteneur
    // (offsetParent) avant même le premier passage.
    const anchorRef = useRef<HTMLSpanElement>(null);
    const compact = lane === "compact";

    useEffect(() => {
        if (pass || !isNoelActive()) return;
        const timer = window.setTimeout(() => {
            let next: Pass | null = randomPass(count, lane);
            const container = anchorRef.current?.offsetParent;
            const roof = ceiling ? container?.querySelector(ceiling) : null;
            if (container && roof) next = keepAbove(next, container, roof);
            // Aucune place libre de texte : on saute ce passage, le suivant
            // retentera (la mise en page a pu changer).
            if (next) setPass(next);
            else setCount((n) => n + 1);
        }, count === 0 ? firstDelay() : nextDelay());
        return () => window.clearTimeout(timer);
    }, [pass, count, lane, ceiling]);

    // Trajectoire ondulée : une courbe calculée par passage, que des keyframes
    // CSS ne savent pas exprimer. L'animation de script prend le pas sur
    // `noel-santa-rise` (même propriété `translate`). En sens inverse, elle se
    // joue à l'envers : le traîneau arrive par la droite et remonte avant le texte.
    useEffect(() => {
        const track = trackRef.current;
        const sleigh = track?.querySelector("svg");
        const container = track?.offsetParent;
        if (!pass?.wave || !track || !sleigh || !container) return;
        const {amp, freq, phase} = pass.wave;
        const at = pass.descendAt ?? 1;
        const descent = pass.descent ?? 0;
        const timing: KeyframeAnimationOptions = {
            duration: pass.duration * 1000,
            easing: "linear",
            fill: "forwards",
            direction: pass.direction === "rtl" ? "reverse" : "normal",
        };

        // y(t) = vague douce sur toute la traversée + descente en S
        // (1 − cos πu) / 2 sur la partie libre (u de 0 à 1 après `at`) : pas
        // de segment droit, pas de cassure. L'angle suit la pente dy/dx en
        // chaque point : nez vers le bas en descendant, nez levé en montant
        // (le dessin retourné garde le même signe en sens inverse).
        const span = container.getBoundingClientRect().width + 280;
        const steps = 40;
        const fallFrames: Keyframe[] = [];
        const tiltFrames: Keyframe[] = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const theta = 2 * Math.PI * freq * t + phase;
            let y = amp * Math.sin(theta);
            let dy = amp * 2 * Math.PI * freq * Math.cos(theta);
            if (t > at) {
                const u = (t - at) / (1 - at);
                y += descent * (1 - Math.cos(Math.PI * u)) / 2;
                dy += descent * (Math.PI / 2) * Math.sin(Math.PI * u) / (1 - at);
            }
            const angle = Math.atan(dy / span) * 180 / Math.PI;
            fallFrames.push({translate: `0 ${y.toFixed(1)}px`, offset: t});
            tiltFrames.push({rotate: `${angle.toFixed(1)}deg`, offset: t});
        }
        const fall = track.animate(fallFrames, timing);
        const tilt = sleigh.animate(tiltFrames, timing);
        return () => {
            fall.cancel();
            tilt.cancel();
        };
    }, [pass]);

    useEffect(() => {
        if (!pass) return;
        const onClick = (event: MouseEvent) => {
            if (event.target instanceof Element && event.target.closest(INTERACTIVE)) return;
            const track = trackRef.current;
            const sleigh = track?.querySelector("svg")?.getBoundingClientRect();
            const container = track?.offsetParent?.getBoundingClientRect();
            if (!sleigh || !container) return;
            const {clientX: cx, clientY: cy} = event;
            if (cx < sleigh.left || cx > sleigh.right || cy < sleigh.top || cy > sleigh.bottom) return;
            const y = sleigh.top + sleigh.height * 0.45 - container.top;
            const x = cx - container.left;
            const walk = (x + ELF_OFFSCREEN) / ELF_SPEED;
            setGifts((list) => [
                ...list.slice(-(MAX_GIFTS - 1)),
                {
                    id: Date.now() + Math.random(),
                    x,
                    y,
                    // Centre du cadeau à 14 px du bas : il se pose sur le sol du
                    // décor sans que ses coins, une fois tourné, dépassent du bord.
                    fall: Math.max(0, container.height - y - 14),
                    spin: between(-160, 160),
                    color: GIFT_COLORS[Math.floor(Math.random() * GIFT_COLORS.length)],
                    elfDuration: Math.max(2, (2 * walk) / 0.9),
                },
            ]);
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, [pass]);

    // Chaque cadeau tombe, se pose, puis un lutin venu de la gauche le ramasse
    // à mi-parcours et repart avec : une seule ligne de temps, réglée en CSS
    // par les variables ci-dessous. Le cadeau est retiré quand le lutin sort.
    const giftLayer = gifts.map((gift) => {
        const pickupAt = ELF_START_S + gift.elfDuration / 2;
        const timing = {
            "--gift-fall": `${gift.fall}px`,
            "--gift-spin": `${gift.spin}deg`,
            "--gift-fall-duration": `${GIFT_FALL_S}s`,
            "--pickup-at": `${pickupAt.toFixed(2)}s`,
            "--elf-start": `${ELF_START_S}s`,
            "--elf-duration": `${gift.elfDuration.toFixed(2)}s`,
            "--elf-x": `${gift.x.toFixed(1)}px`,
            "--elf-offscreen": `${-ELF_OFFSCREEN}px`,
        } as CSSProperties & Record<`--${string}`, string>;
        return (
            <span key={gift.id} aria-hidden="true" className="contents">
                <span
                    className="noel-gift"
                    data-color={gift.color}
                    data-compact={compact || undefined}
                    style={{...timing, left: `${gift.x}px`, top: `${gift.y}px`}}
                >
                    <GiftBox/>
                </span>
                <span
                    className="noel-elf"
                    data-color={gift.color}
                    data-compact={compact || undefined}
                    style={{...timing, top: `${gift.y + gift.fall}px`}}
                    onAnimationEnd={(event) => {
                        if (event.animationName !== "noel-elf-trip") return;
                        setGifts((list) => list.filter((g) => g.id !== gift.id));
                    }}
                >
                    <Elf/>
                </span>
            </span>
        );
    });

    // Structure fixe (cadeaux puis traîneau éventuel) : si elle changeait entre
    // deux passages, React remonterait les cadeaux et relancerait leur chute.
    return (
        <>
        <span ref={anchorRef} aria-hidden="true" className="absolute"/>
        {giftLayer}
        {pass && <div
            key={pass.id}
            ref={trackRef}
            aria-hidden="true"
            className="noel-santa-track"
            data-direction={pass.direction}
            data-compact={compact || undefined}
            style={{
                top: pass.topPx === undefined ? `${pass.top}%` : `${pass.topPx}px`,
                "--santa-duration": `${pass.duration}s`,
                "--santa-rise": `${pass.rise}px`,
                // Le traîneau se cabre quand il monte, pique du nez quand il descend.
                "--santa-tilt": `${(pass.rise * 0.06).toFixed(2)}deg`,
            } as CSSProperties & Record<`--${string}`, string>}
            onAnimationEnd={(event) => {
                if (event.animationName !== "noel-santa-fly") return;
                setPass(null);
                setCount((n) => n + 1);
            }}
        >
            <SantaSleigh/>
        </div>}
        </>
    );
}

/**
 * Lutin vu de profil, tourné vers la droite (le CSS le retourne au retour).
 * Le cadeau qu'il porte (`.noel-elf-carry`) n'apparaît qu'après le ramassage.
 */
function Elf() {
    return (
        <svg viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
            {/* Jambes, qui alternent pendant la marche */}
            <g className="noel-elf-leg-a">
                <path d="M11 28 L10 35" className="noel-elf-legs"/>
                <path d="M8.5 35.5 h4" className="noel-elf-shoe"/>
            </g>
            <g className="noel-elf-leg-b">
                <path d="M15 28 L16 35" className="noel-elf-legs"/>
                <path d="M14.5 35.5 h4.5" className="noel-elf-shoe"/>
            </g>
            {/* Tunique à col dentelé et ceinture */}
            <path d="M7 29 Q7 17 13 15.5 Q19 17 19.5 29 Z" className="noel-elf-tunic"/>
            <path d="M8 18 l2 2.5 l2 -2.5 l2 2.5 l2 -2.5 l2 2.5" className="noel-elf-collar"/>
            <path d="M7.2 25 H19.3" className="noel-elf-belt"/>
            <rect x="12" y="23.8" width="2.6" height="2.4" rx="0.4" className="noel-elf-buckle"/>
            {/* Tête, oreille pointue, nez, œil */}
            <path d="M18 9 L22 6.5 L19.5 11 Z" className="noel-elf-skin"/>
            <circle cx="14" cy="10.5" r="5.2" className="noel-elf-skin"/>
            <circle cx="19" cy="11.5" r="1.1" className="noel-elf-cheek"/>
            <circle cx="16.4" cy="9.6" r="0.75" className="noel-elf-eye"/>
            {/* Bonnet pointu rabattu vers l'arrière, avec pompon */}
            <path d="M8.5 8 Q10 0.5 17 4 Q19.5 5.5 19.2 8 Z" className="noel-elf-hat"/>
            <path d="M10 3.5 Q5 1 2.5 5.5" className="noel-elf-hat-tip"/>
            <circle cx="2.5" cy="6" r="1.8" className="noel-elf-pompom"/>
            <path d="M8.3 8 H19.4" className="noel-elf-hat-band"/>
            {/* Bras ; au retour, le cadeau dans les mains */}
            <path d="M16 19 Q20 21 22 18.5" className="noel-elf-arm"/>
            {/* Même taille que le cadeau posé : la moitié de la largeur du lutin */}
            <g className="noel-elf-carry">
                <rect x="16" y="11" width="13.5" height="12" rx="1.4" className="noel-gift-box"/>
                <rect x="21.5" y="11" width="2.5" height="12" className="noel-gift-ribbon"/>
                <path d="M22.75 11 C20 6.5 16.5 8 19 11 Z M22.75 11 C25.5 6.5 29 8 26.5 11 Z" className="noel-gift-ribbon"/>
            </g>
        </svg>
    );
}

/** Paquet cadeau : boîte, ruban et nœud. */
function GiftBox() {
    return (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="9" width="18" height="13" rx="1.5" className="noel-gift-box"/>
            <rect x="2" y="6.5" width="20" height="4" rx="1" className="noel-gift-lid"/>
            <rect x="10.5" y="6.5" width="3" height="15.5" className="noel-gift-ribbon"/>
            <path d="M12 6.5 C9 1.5 4.5 3.5 7.5 6.5 Z M12 6.5 C15 1.5 19.5 3.5 16.5 6.5 Z" className="noel-gift-ribbon"/>
        </svg>
    );
}

const deerStroke = {
    stroke: "var(--santa-deer)",
    strokeWidth: 3.2,
    strokeLinecap: "round",
    fill: "none",
} as const;

/**
 * Un renne au galop, dessiné vers la droite autour de (0, 0). Les deux paires
 * de pattes sont des groupes séparés pour que le CSS les fasse battre.
 */
function Reindeer({x, y, delay = 0}: {x: number; y: number; delay?: number}) {
    const legDelay = {animationDelay: `${delay}s`};
    return (
        <g transform={`translate(${x} ${y})`}>
            {/* Pattes arrière, tendues vers l'arrière */}
            <g className="noel-gallop-back" style={legDelay}>
                <path d="M8 4 Q-2 10 -12 9" {...deerStroke}/>
                <path d="M12 6 Q4 15 -5 18" {...deerStroke}/>
            </g>
            {/* Pattes avant, lancées vers l'avant */}
            <g className="noel-gallop-front" style={legDelay}>
                <path d="M38 5 Q48 9 57 5" {...deerStroke}/>
                <path d="M34 6 Q42 15 51 16" {...deerStroke}/>
            </g>
            {/* Queue */}
            <path d="M1 -3 Q-5 -7 -7 -3 Q-4 -2 1 0 Z" fill="var(--santa-deer)"/>
            {/* Corps et ventre plus clair */}
            <path
                d="M0 0 Q3 -10 20 -10 Q38 -11 45 -5 Q50 3 41 8 Q22 12 6 8 Q-2 6 0 0 Z"
                fill="var(--santa-deer)"
            />
            <path d="M10 7 Q24 10 38 6 Q24 4 10 7 Z" fill="var(--santa-deer-light)"/>
            {/* Cou et tête */}
            <path
                d="M36 -8 Q44 -22 53 -27 Q60 -30 65 -25 L67 -21 Q61 -19 57 -18 Q50 -12 46 -3 Z"
                fill="var(--santa-deer)"
            />
            <circle cx="66.5" cy="-21.5" r="1.6" fill="var(--santa-ink)"/>
            <circle cx="58" cy="-24" r="1" fill="var(--santa-ink)"/>
            {/* Oreille */}
            <path d="M53 -27 L46 -30 L51 -24 Z" fill="var(--santa-deer)"/>
            {/* Bois */}
            <path
                d="M54 -28 Q52 -40 43 -45 M48 -39 Q44 -39 42 -36 M51 -34 Q47 -33 45 -30 M56 -28 Q61 -39 68 -41 M60 -35 Q64 -35 66 -32"
                stroke="var(--santa-antler)" strokeWidth="1.8" strokeLinecap="round" fill="none"
            />
            {/* Collier et grelot */}
            <path d="M43 -12 Q48 -6 53 -15" stroke="var(--santa-red)" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <circle cx="48" cy="-8" r="2.4" fill="var(--noel-gold)"/>
        </g>
    );
}

function SantaSleigh() {
    return (
        <svg className="noel-santa" viewBox="-40 -52 330 136" xmlns="http://www.w3.org/2000/svg">
            {/* Traînée scintillante derrière le traîneau */}
            <g className="noel-trail" fill="var(--noel-gold)">
                <circle cx="12" cy="58" r="2.4"/>
                <circle cx="-2" cy="52" r="1.8" opacity="0.8"/>
                <circle cx="-14" cy="60" r="1.5" opacity="0.65"/>
                <circle cx="-24" cy="50" r="1.2" opacity="0.5"/>
                <circle cx="-34" cy="57" r="1" opacity="0.35"/>
                <path d="M4 66 l1.5 -4 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 Z" opacity="0.9"/>
                <path d="M-20 44 l1 -3 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1 Z" opacity="0.6"/>
            </g>

            {/* Rênes, de la moufle aux colliers */}
            <path
                d="M113 22 Q150 14 214 26 M184 28 Q220 14 278 19"
                stroke="var(--santa-ink)" strokeWidth="1.1" fill="none" opacity="0.7"
            />
            <Reindeer x={170} y={36}/>
            <Reindeer x={232} y={29} delay={0.18}/>

            {/* Hotte remplie de cadeaux */}
            <g transform="rotate(-12 44 3)">
                <rect x="38" y="-2" width="12" height="11" rx="1.5" fill="var(--noel-green)"/>
                <path d="M44 -2 L44 9 M38 3 L50 3" stroke="var(--santa-red)" strokeWidth="1.6"/>
            </g>
            <g transform="rotate(10 54 -1)">
                <rect x="50" y="-6" width="9" height="10" rx="1.5" fill="var(--santa-red)"/>
                <path d="M54.5 -6 L54.5 4" stroke="var(--noel-gold)" strokeWidth="1.4"/>
            </g>
            <path d="M34 34 Q30 10 42 5 Q52 2 62 7 Q68 14 64 34 Z" fill="var(--santa-sack)"/>
            <path d="M38 9 Q50 14 62 9" stroke="var(--santa-ink)" strokeWidth="1.2" fill="none" opacity="0.4"/>

            {/* Père Noël : manteau, ceinture, boucle */}
            <path d="M64 44 Q60 20 76 15 Q92 13 97 32 L98 44 Z" fill="var(--santa-red)"/>
            <path d="M65 33 L97 31" stroke="var(--santa-ink)" strokeWidth="3"/>
            <rect x="77" y="29.5" width="6" height="5" rx="1" fill="none" stroke="var(--noel-gold)" strokeWidth="1.4"/>
            {/* Bras tendu vers les rênes, poignet en fourrure, moufle */}
            <path d="M88 23 Q100 26 110 21" stroke="var(--santa-red)" strokeWidth="6.5" strokeLinecap="round" fill="none"/>
            <path d="M104 24 L106 18.5" stroke="var(--santa-fur)" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="112" cy="21" r="3.6" fill="var(--noel-green)"/>
            {/* Visage, barbe, moustache, œil, joue */}
            <circle cx="84" cy="6" r="7.5" fill="var(--santa-skin)"/>
            <path d="M76 7 Q75 24 85 25 Q94 23 93 7 Q89 12 84 11 Q79 12 76 7 Z" fill="var(--santa-fur)"/>
            <path d="M80 11 Q84 8 88 11 Q84 13 80 11 Z" fill="var(--santa-fur)"/>
            <circle cx="87.5" cy="4.5" r="1" fill="var(--santa-ink)"/>
            <circle cx="91" cy="8" r="1.6" fill="var(--santa-cheek)"/>
            {/* Bonnet, pointe rejetée en arrière par le vent */}
            <path d="M75 1 Q76 -12 88 -11 Q96 -9 94 1 Z" fill="var(--santa-red)"/>
            <path d="M79 -8 Q70 -16 61 -9" stroke="var(--santa-red)" strokeWidth="5" strokeLinecap="round" fill="none"/>
            <circle cx="60" cy="-8" r="3.2" fill="var(--santa-fur)"/>
            <path d="M74 1.5 Q84 -2 95 1.5" stroke="var(--santa-fur)" strokeWidth="4" strokeLinecap="round" fill="none"/>

            {/* Caisse du traîneau, liseré et volute dorés */}
            <path
                d="M24 42 Q21 30 32 28 L56 28 Q62 44 94 44 L124 42 Q134 41 135 50 L133 62 Q90 68 42 66 Q26 64 24 42 Z"
                fill="var(--santa-red)"
            />
            <path d="M30 54 Q80 60 130 53" stroke="var(--noel-gold)" strokeWidth="2.2" fill="none"/>
            <path
                d="M124 42 Q140 36 142 26 Q143 17 135 18 Q128 20 133 27"
                stroke="var(--noel-gold)" strokeWidth="3" strokeLinecap="round" fill="none"
            />
            {/* Montants et patin recourbé */}
            <path d="M46 66 L46 76 M114 63 L114 76" stroke="var(--santa-ink)" strokeWidth="2.6"/>
            <path
                d="M18 76 L134 76 Q152 76 154 64 Q155 56 147 57"
                stroke="var(--santa-ink)" strokeWidth="3.4" strokeLinecap="round" fill="none"
            />
        </svg>
    );
}
