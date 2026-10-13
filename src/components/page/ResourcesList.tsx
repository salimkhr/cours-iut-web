"use client";

import {useRef, useState, type ElementType, type KeyboardEvent} from "react";
import {ArrowUpRight, BookOpen, ChevronDown, ChevronUp, FlaskConical, Play, PlayCircle, Wrench, type LucideIcon} from "lucide-react";
import {getYouTubeId, youtubeThumbnailUrl} from "@/lib/youtube";
import {RESOURCE_KIND_LABELS, type ResourceKind} from "@/lib/schemas/resource.schema";
import {cn} from "@/lib/utils";
import CardBridgeBackground from "@/components/Cards/CardBridgeBackground";
import type {Resource} from "@/types/Resource";

/** Lignes du sommaire visibles avant « Voir plus » : la section garde une hauteur stable. */
const TOC_INITIAL_COUNT = 6;

const KIND_ICONS: Record<ResourceKind, LucideIcon> = {
    article: BookOpen,
    video: PlayCircle,
    recherche: FlaskConical,
    outil: Wrench,
};

/** Verbe d'action propre au type : on sait avant de cliquer ce qui nous attend. */
const KIND_ACTIONS: Record<ResourceKind, string> = {
    article: "Lire l'article",
    video: "Regarder la vidéo",
    recherche: "Lire la recherche",
    outil: "Essayer l'outil",
};

// Fuseau fixé : le rendu serveur et le rendu client doivent produire la même date.
const DATE_LONG = new Intl.DateTimeFormat("fr-FR", {day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris"});
const DATE_SHORT = new Intl.DateTimeFormat("fr-FR", {day: "numeric", month: "short", timeZone: "Europe/Paris"});

function hostnameOf(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}

/** 5 → « 5 min », 43 → « 43 min », 75 → « 1 h 15 », 120 → « 2 h ». */
function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, "0")}`;
}

/** « 43 min · 13 oct. » : la durée quand elle existe, toujours la date. */
function shortMeta(resource: Resource): string {
    return [
        resource.durationMin ? formatDuration(resource.durationMin) : null,
        DATE_SHORT.format(new Date(resource.createdAt)),
    ]
        .filter(Boolean)
        .join(" · ");
}

/**
 * Vignette d'une vidéo YouTube (décorative : le lien est ailleurs). Chargée depuis i.ytimg.com sans
 * en-tête Referer ; <img> brut car next/image exigerait d'ajouter l'hôte à next.config.ts.
 */
function VideoThumb({videoId, durationMin, href, label}: {videoId: string; durationMin?: number; href?: string; label?: string}) {
    // Avec `href`, la vignette est elle-même le lien vers la vidéo (mobile) ; sans, elle est décorative
    // (sur grand écran, c'est la surface de la carte qui est cliquable).
    const Wrapper: ElementType = href ? "a" : "span";
    const wrapperProps = href
        ? {href, target: "_blank", rel: "noopener noreferrer", "aria-label": label}
        : {"aria-hidden": true};

    return (
        <Wrapper
            {...wrapperProps}
            className="relative mx-auto block aspect-video w-full max-w-[18rem] shrink-0 overflow-hidden rounded-xl border border-bridge-500/30 bg-bridge-100 shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
            {/* eslint-disable-next-line @next/next/no-img-element -- vignette tierce, volontairement non optimisée */}
            <img
                src={youtubeThumbnailUrl(videoId)}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="size-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
            />
            <span className="absolute inset-0 grid place-items-center bg-brand-dark/10">
                <span className="grid size-10 place-items-center rounded-full bg-brand-primary/55 text-white shadow-md backdrop-blur-sm dark:text-brand-dark">
                    <Play className="ml-0.5 size-4 fill-current"/>
                </span>
            </span>
            {durationMin && (
                <span className="absolute bottom-1.5 right-1.5 rounded bg-brand-dark/80 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-bridge-50">
                    {formatDuration(durationMin)}
                </span>
            )}
        </Wrapper>
    );
}

function NoteBlock({note}: {note: string}) {
    return (
        <figure className="rounded-xl bg-brand-primary/10 p-4 dark:bg-brand-primary/15">
            <figcaption className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-primary">
                Le mot du prof
            </figcaption>
            <blockquote className="mt-1.5 text-base italic font-medium leading-relaxed text-brand-dark dark:text-brand-light">
                {note}
            </blockquote>
        </figure>
    );
}

/** Aperçu d'une ressource, à gauche du sommaire (écrans larges). */
function DetailCard({resource}: {resource: Resource}) {
    const Icon = KIND_ICONS[resource.kind];
    const videoId = resource.kind === "video" ? getYouTubeId(resource.url) : null;

    return (
        // Même direction artistique que ModuleCard : surface bridge, ombre chaude « toujours levée »,
        // pont en filigrane (CardBridgeBackground), pastille icône, titre en couleur, bouton sombre en pied.
        <article
            className={cn(
                "group relative flex flex-col overflow-hidden rounded-2xl p-7 lg:min-h-[28rem] lg:p-8",
                "border border-bridge-500/30 bg-bridge-50 dark:border-bridge-500/35 dark:bg-bridge-800",
                "shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)] dark:shadow-[0_2px_14px_-10px_rgba(0,0,0,0.6)]",
                "transition-[transform,box-shadow,border-color] duration-300 ease-out motion-safe:hover:-translate-y-1",
                "hover:border-bridge-500/55 hover:shadow-[0_22px_44px_-14px_rgba(147,97,58,0.55)]",
                "dark:hover:border-bridge-400/50 dark:hover:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.75)]",
            )}
        >
            <CardBridgeBackground/>

            {/* Surface cliquable (comme ModuleCard) : le vrai lien focusable est le titre. */}
            <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-hidden="true"
                tabIndex={-1}
                className="absolute inset-0 z-10 rounded-2xl"
            />

            <div className="pointer-events-none relative z-20 flex h-full flex-1 flex-col gap-6">
                <header className="flex items-start gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg dark:text-brand-dark">
                        <Icon size={22} aria-hidden="true"/>
                    </span>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-xl lg:text-2xl font-bold leading-snug text-brand-primary">
                            <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pointer-events-auto rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                            >
                                {resource.title}
                                <span className="sr-only"> ({RESOURCE_KIND_LABELS[resource.kind]}, s&apos;ouvre dans un nouvel onglet)</span>
                            </a>
                        </h3>
                        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[11px] font-black uppercase tracking-[0.18em] text-brand-dark dark:text-bridge-100">
                            {resource.durationMin && (
                                <>
                                    <span className="tabular-nums">{formatDuration(resource.durationMin)}</span>
                                    <span aria-hidden="true">·</span>
                                </>
                            )}
                            <time dateTime={resource.createdAt}>{DATE_LONG.format(new Date(resource.createdAt))}</time>
                            <span aria-hidden="true">·</span>
                            <span className="normal-case tracking-normal font-semibold">{hostnameOf(resource.url)}</span>
                        </p>
                    </div>
                </header>

                {videoId && <VideoThumb videoId={videoId} durationMin={resource.durationMin}/>}

                <p className="flex-1 text-base font-medium leading-relaxed text-brand-dark/85 dark:text-bridge-100/90">
                    {resource.description}
                </p>

                {resource.note && <NoteBlock note={resource.note}/>}

                <footer className="flex justify-end">
                    <span
                        aria-hidden="true"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-bridge-800 px-5 py-2.5 text-sm font-bold text-bridge-50 transition-colors duration-200 group-hover:bg-bridge-900 dark:bg-bridge-100 dark:text-bridge-900 dark:group-hover:bg-bridge-50 sm:w-fit"
                    >
                        {KIND_ACTIONS[resource.kind]} <ArrowUpRight className="size-4"/>
                    </span>
                </footer>
            </div>
        </article>
    );
}

/**
 * Mobile / tactile : pas de survol, donc pas d'aperçu. Une ligne = un accordéon : un appui déplie
 * la description, la vignette et le mot du prof, avec un bouton d'action explicite.
 */
function MobileRow({resource, open, onToggle}: {resource: Resource; open: boolean; onToggle: () => void}) {
    const Icon = KIND_ICONS[resource.kind];
    const videoId = resource.kind === "video" ? getYouTubeId(resource.url) : null;
    const panelId = `veille-panel-${resource._id}`;

    return (
        <div className="lg:hidden">
            <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={onToggle}
                className="flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-lg px-1 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-primary"
            >
                <span
                    className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                        open
                            ? "bg-brand-primary text-white shadow-md dark:text-brand-dark"
                            : "bg-bridge-500/15 text-brand-dark/70 dark:bg-bridge-100/10 dark:text-bridge-100/80",
                    )}
                >
                    <Icon size={20} aria-hidden="true"/>
                </span>
                <span className="min-w-0 flex-1">
                    <span
                        className={cn(
                            "block text-base font-semibold leading-snug",
                            open ? "text-brand-primary" : "text-brand-dark dark:text-brand-light",
                        )}
                    >
                        {resource.title}
                    </span>
                    <span className="mt-0.5 block text-xs tabular-nums text-brand-dark/70 dark:text-bridge-200/75">
                        {shortMeta(resource)}
                    </span>
                </span>
                <ChevronDown
                    aria-hidden="true"
                    className={cn("size-5 shrink-0 text-brand-dark/60 transition-transform duration-200 dark:text-bridge-200/70", open && "rotate-180")}
                />
            </button>

            {open && (
                <div id={panelId} className="flex flex-col gap-4 pb-5">
                    {videoId && (
                        <VideoThumb
                            videoId={videoId}
                            durationMin={resource.durationMin}
                            href={resource.url}
                            label={`${KIND_ACTIONS.video} : ${resource.title} (s'ouvre dans un nouvel onglet)`}
                        />
                    )}
                    <p className="text-base font-medium leading-relaxed text-brand-dark/85 dark:text-bridge-100/90">
                        {resource.description}
                    </p>
                    {resource.note && <NoteBlock note={resource.note}/>}
                    <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-bridge-800 px-5 py-2.5 text-sm font-bold text-bridge-50 transition-colors duration-200 hover:bg-bridge-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary dark:bg-bridge-100 dark:text-bridge-900 dark:hover:bg-bridge-50"
                    >
                        {KIND_ACTIONS[resource.kind]} <ArrowUpRight className="size-4" aria-hidden="true"/>
                        <span className="sr-only">({RESOURCE_KIND_LABELS[resource.kind]}, s&apos;ouvre dans un nouvel onglet)</span>
                    </a>
                </div>
            )}
        </div>
    );
}

/**
 * Deux UX selon la taille d'écran.
 * - Écrans larges (lg+) : sommaire à droite, aperçu de la ressource à gauche (la dernière ajoutée au
 *   départ) ; le survol ou le focus d'une ligne change l'aperçu, un clic ouvre la ressource.
 * - Mobile / tactile : accordéon (voir MobileRow), sans carte séparée.
 */
export default function ResourcesList({resources}: {resources: Resource[]}) {
    const [selected, setSelected] = useState(0);
    const [openMobile, setOpenMobile] = useState<number | null>(0);
    const [expanded, setExpanded] = useState(false);
    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    if (resources.length === 0) return null;

    const current = Math.min(selected, resources.length - 1);
    const hiddenCount = Math.max(0, resources.length - TOC_INITIAL_COUNT);
    const visible = expanded ? resources : resources.slice(0, TOC_INITIAL_COUNT);

    function onKeyDown(event: KeyboardEvent<HTMLOListElement>) {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        // Le focus est sur un lien du bureau : sur mobile les lignes sont des boutons, on laisse faire.
        if (!(event.target instanceof HTMLAnchorElement)) return;
        event.preventDefault();
        const next = Math.max(0, Math.min(visible.length - 1, current + (event.key === "ArrowDown" ? 1 : -1)));
        // Le focus déclenche onFocus, donc la sélection.
        itemRefs.current[next]?.focus();
    }

    function toggleExpanded() {
        // Replier ne doit pas laisser l'aperçu ou l'accordéon sur une ligne devenue invisible.
        if (expanded) {
            if (current >= TOC_INITIAL_COUNT) setSelected(0);
            if (openMobile !== null && openMobile >= TOC_INITIAL_COUNT) setOpenMobile(0);
        }
        setExpanded((open) => !open);
    }

    // Une seule ressource : la carte suffit, sur tous les écrans.
    if (resources.length === 1) return <DetailCard resource={resources[0]}/>;

    return (
        <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
            <div className="hidden lg:block">
                <DetailCard resource={resources[current]}/>
            </div>

            <nav aria-label="Sommaire des ressources" className="flex flex-col">
                <ol id="veille-toc" className="flex flex-col" onKeyDown={onKeyDown}>
                    {visible.map((resource, index) => {
                        const isCurrent = index === current;
                        const RowIcon = KIND_ICONS[resource.kind];
                        return (
                            <li key={resource._id} className="border-b border-bridge-500/25 first:border-t">
                                <MobileRow
                                    resource={resource}
                                    open={openMobile === index}
                                    onToggle={() => setOpenMobile(openMobile === index ? null : index)}
                                />

                                <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    ref={(node) => {
                                        itemRefs.current[index] = node;
                                    }}
                                    aria-current={isCurrent ? "true" : undefined}
                                    onMouseEnter={() => setSelected(index)}
                                    onFocus={() => setSelected(index)}
                                    className="hidden w-full items-center gap-3 rounded-lg px-3 py-4 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-primary lg:flex"
                                >
                                    {/* Icône du type. Ligne active : pastille pleine (comme la carte) + titre en couleur + flèche.
                                        Pas de fond de ligne teinté, pour ne pas rivaliser avec la carte (même valeur de beige). */}
                                    <span
                                        className={cn(
                                            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                                            isCurrent
                                                ? "bg-brand-primary text-white shadow-md dark:text-brand-dark"
                                                : "bg-bridge-500/15 text-brand-dark/70 dark:bg-bridge-100/10 dark:text-bridge-100/80",
                                        )}
                                    >
                                        <RowIcon size={18} aria-hidden="true"/>
                                    </span>
                                    <span
                                        className={cn(
                                            "min-w-0 flex-1 text-base lg:text-lg font-semibold leading-snug transition-colors duration-200",
                                            isCurrent ? "text-brand-primary" : "text-brand-dark dark:text-brand-light",
                                        )}
                                    >
                                        {resource.title}
                                        <span className="sr-only"> ({RESOURCE_KIND_LABELS[resource.kind]}, s&apos;ouvre dans un nouvel onglet)</span>
                                    </span>
                                    {/* /70 : ≈ 5,6 : 1 sur le fond de page, au-dessus du seuil AA de 4,5 : 1. */}
                                    <span className="shrink-0 pl-2 text-sm tabular-nums text-brand-dark/70 dark:text-bridge-200/75">
                                        {shortMeta(resource)}
                                    </span>
                                    <ArrowUpRight
                                        aria-hidden="true"
                                        className={cn(
                                            "size-4 shrink-0 transition-all duration-200",
                                            isCurrent ? "translate-x-0 text-brand-primary opacity-100" : "-translate-x-1 opacity-0",
                                        )}
                                    />
                                </a>
                            </li>
                        );
                    })}
                </ol>

                {hiddenCount > 0 && (
                    <div className="mt-2 flex justify-center">
                        <button
                            type="button"
                            aria-expanded={expanded}
                            aria-controls="veille-toc"
                            onClick={toggleExpanded}
                            className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md px-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary transition-colors hover:text-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary dark:hover:text-bridge-100"
                        >
                            {expanded ? (
                                <>
                                    <ChevronUp className="size-3.5" aria-hidden="true"/> Voir moins
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="size-3.5" aria-hidden="true"/> Voir plus ({hiddenCount})
                                </>
                            )}
                        </button>
                    </div>
                )}
            </nav>
        </div>
    );
}
