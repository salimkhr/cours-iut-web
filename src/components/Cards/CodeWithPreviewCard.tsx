'use client'
import {useEffect, useMemo, useState} from 'react';
import dynamic from "next/dynamic";
import type {BeforeMount, OnMount} from "@monaco-editor/react";
import BaseCard from "@/components/Cards/BaseCard";
import {Check, Code2, Eye, RotateCcw} from "lucide-react";
import {CopyIcon} from "@/components/icons/copy";
import {FilePenLineIcon} from "@/components/icons/file-pen-line";
import {SyntaxHighlighter, normalizeLanguage, courseCodeDark, courseCodeLight} from '@/lib/syntaxHighlighter';
import {buildPreviewDocument, type PreviewSources} from "@/lib/previewDocument";
import {
    MONACO_THEME_LIGHT,
    MONACO_THEME_DARK,
    courseMonacoLight,
    courseMonacoDark,
} from "@/lib/monacoTheme";
import {useIsDark} from "@/hook/useIsDark";
import {cn} from "@/lib/utils";
import type Module from "@/types/Module";

export interface CodePanelData {
    language: string;
    code: string;
}

interface CodeWithPreviewCardProps {
    panels: CodePanelData[];
    /** Absent → carte sans aperçu : uniquement les panneaux de code, pas d'iframe. */
    sources?: PreviewSources;
    className?: string;
    currentModule?: Module;
}

type MobileTab = 'code' | 'preview';

/** Clé de champ dans `PreviewSources` — jamais un index dans `panels` (Task 6 le filtre). */
type EditableField = "code" | "secondaryCode";

// Monaco n'est pas SSR-safe → import client only, chargé seulement quand un
// panneau passe en édition (voir `openFields`). Même pattern que CodeField.tsx.
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {ssr: false});

const handleMonacoBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme(MONACO_THEME_LIGHT, courseMonacoLight);
    monaco.editor.defineTheme(MONACO_THEME_DARK, courseMonacoDark);
};

// Monaco garde une <textarea> cachée hors-écran pour capter la saisie clavier ;
// les navigateurs y appliquent leur correcteur orthographique. On le désactive
// au montage, comme dans CodeField.tsx.
const handleMonacoMount: OnMount = (editor) => {
    editor.getDomNode()?.querySelector("textarea")?.setAttribute("spellcheck", "false");
};

const EDITABLE_FIELDS: EditableField[] = ["code", "secondaryCode"];

export default function CodeWithPreviewCard({panels, sources, className, currentModule}: CodeWithPreviewCardProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [mobileTab, setMobileTab] = useState<MobileTab>('code');
    const isDark = useIsDark();

    // État d'édition indexé par clé de champ (`code` / `secondaryCode`), jamais par
    // position dans `panels` — ce tableau est filtré (Task 6 retire les panneaux
    // vides) : un bloc dont seul le panneau secondaire est rempli mettrait ce
    // contenu à l'index 0 de `panels`, un index qui ne désigne pas le même champ
    // dans `sources`.
    const [edited, setEdited] = useState<Partial<Record<EditableField, string>>>({});
    const [debouncedEdited, setDebouncedEdited] = useState<Partial<Record<EditableField, string>>>({});
    const [openFields, setOpenFields] = useState<ReadonlySet<EditableField>>(new Set());
    const isDirty = Object.keys(edited).length > 0;

    // Recalcul de l'aperçu 300 ms après la dernière frappe, jamais à chaque
    // caractère : `debouncedEdited` ne suit `edited` qu'après un silence clavier.
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedEdited(edited), 300);
        return () => clearTimeout(timer);
    }, [edited]);

    // Association panneau affiché → clé de champ dans `sources`, dérivée de
    // `sources` (pas de `panels`) : Task 6 construit `panels` en filtrant
    // exactement `[code, secondaryCode]` sur la non-vacuité du code, dans cet
    // ordre — la même prédicat ici garde `fieldForPanel` aligné position à
    // position avec `panels`, y compris quand seul le second champ est rempli.
    const fieldForPanel = useMemo(
        () => EDITABLE_FIELDS.filter((field) => Boolean(sources?.[field])),
        [sources],
    );

    // Nommé `previewDoc`, jamais `document` : ce nom masquerait le `document`
    // global du DOM à l'intérieur du composant. Calculé à partir des sources
    // *debouncées* : seul le contenu envoyé à l'iframe suit la frappe avec
    // retard, `sources` (non debounced) continue de piloter l'existence de la
    // colonne d'aperçu et des boutons « Modifier » plus bas.
    const previewDoc = useMemo(() => {
        if (!sources) return null;
        const effectiveSources: PreviewSources = {
            ...sources,
            code: debouncedEdited.code ?? sources.code,
            secondaryCode: debouncedEdited.secondaryCode ?? sources.secondaryCode,
        };
        return buildPreviewDocument(effectiveSources);
    }, [sources, debouncedEdited]);

    // Éditabilité déterminée sur les sources d'origine, non debouncées : elle ne
    // doit pas clignoter pendant la frappe ni dépendre de ce que l'étudiant vient
    // d'écrire.
    const editable = useMemo(() => (sources ? buildPreviewDocument(sources).editable : false), [sources]);

    const handleCopy = (code: string, index: number) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        });
    };

    const openField = (field: EditableField) => {
        setOpenFields((prev) => new Set(prev).add(field));
    };

    // Referme l'éditeur sans toucher à `edited` : la modification reste (le
    // panneau repasse en lecture colorée sur `currentCode`, pas sur l'original).
    // Distinct de handleReset, qui efface tout et referme tous les panneaux.
    const closeField = (field: EditableField) => {
        setOpenFields((prev) => {
            const next = new Set(prev);
            next.delete(field);
            return next;
        });
    };

    const handleReset = () => {
        setEdited({});
        setDebouncedEdited({});
        setOpenFields(new Set());
    };

    const headerCard = (
        <div className="flex items-center gap-3 w-full min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                {panels.map((panel, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center bg-white/15 backdrop-blur-sm rounded px-2.5 py-1 text-xs font-mono text-white/95"
                    >
                        {panel.language.toLowerCase()}
                    </span>
                ))}
                {previewDoc && (
                    <span className="hidden lg:inline text-[11px] font-semibold tracking-[0.18em] uppercase text-white/45">
                        + aperçu
                    </span>
                )}
            </div>
            {isDirty && (
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 shrink-0 bg-white/15 backdrop-blur-sm rounded px-2.5 py-1 text-xs font-medium text-white/95 hover:bg-white/25"
                >
                    <RotateCcw size={13} className="shrink-0"/>
                    Réinitialiser
                </button>
            )}
        </div>
    );

    const highlighterProps = (language: string) => ({
        language: normalizeLanguage(language),
        customStyle: {
            margin: 0,
            fontSize: '0.8125rem',
            lineHeight: '1.65',
            height: 'auto',
            background: 'transparent',
        },
        wrapLongLines: false,
        showLineNumbers: true,
    });

    const codePanels = panels.map((panel, index) => {
        const field = fieldForPanel[index];
        const canEdit = editable && field !== undefined;
        const isOpen = field !== undefined && openFields.has(field);
        const currentCode = (field && edited[field]) ?? panel.code;

        return (
            <div key={index} className="flex flex-col">
                <div className="flex items-center justify-between gap-2 border-b border-bridge-400/40 px-3 py-1.5 dark:border-bridge-600/40">
                    <span className="text-xs font-mono uppercase text-bridge-500 dark:text-bridge-400">
                        {panel.language.toLowerCase()}
                    </span>
                    <div className="flex items-center gap-3">
                        {canEdit && !isOpen && (
                            <button
                                onClick={() => openField(field)}
                                className="flex items-center gap-1.5 text-xs text-bridge-500 hover:text-bridge-800 dark:text-bridge-400 dark:hover:text-bridge-100"
                                aria-label={`Modifier le code ${panel.language}`}
                            >
                                <FilePenLineIcon size={14} className="shrink-0"/>
                                Modifier
                            </button>
                        )}
                        {isOpen && field && (
                            <button
                                onClick={() => closeField(field)}
                                className="flex items-center gap-1.5 text-xs text-bridge-500 hover:text-bridge-800 dark:text-bridge-400 dark:hover:text-bridge-100"
                                aria-label={`Terminer l'édition du code ${panel.language}`}
                            >
                                <Check size={14} className="shrink-0"/>
                                Terminé
                            </button>
                        )}
                        <button
                            onClick={() => handleCopy(currentCode, index)}
                            className="flex items-center gap-1.5 text-xs text-bridge-500 hover:text-bridge-800 dark:text-bridge-400 dark:hover:text-bridge-100"
                            aria-label={`Copier le code ${panel.language}`}
                        >
                            <CopyIcon size={14} className="shrink-0"/>
                            {copiedIndex === index ? 'Copié !' : 'Copier'}
                        </button>
                    </div>
                </div>
                {isOpen && field ? (
                    <div style={{height: '320px'}}>
                        <MonacoEditor
                            height="100%"
                            language={panel.language.toLowerCase()}
                            value={currentCode}
                            theme={isDark ? MONACO_THEME_DARK : MONACO_THEME_LIGHT}
                            beforeMount={handleMonacoBeforeMount}
                            onMount={handleMonacoMount}
                            onChange={(value) => setEdited((prev) => ({...prev, [field]: value ?? ''}))}
                            options={{
                                minimap: {enabled: false},
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                            }}
                        />
                    </div>
                ) : (
                    <>
                        <div className="block dark:hidden">
                            <SyntaxHighlighter style={courseCodeLight} {...highlighterProps(panel.language)}>
                                {currentCode}
                            </SyntaxHighlighter>
                        </div>
                        <div className="hidden dark:block">
                            <SyntaxHighlighter style={courseCodeDark} {...highlighterProps(panel.language)}>
                                {currentCode}
                            </SyntaxHighlighter>
                        </div>
                    </>
                )}
            </div>
        );
    });

    const codeColumn = (
        <div className="divide-y divide-bridge-400/40 dark:divide-bridge-600/40">
            {codePanels}
        </div>
    );

    // `allow-modals` accompagne `allow-scripts` : sans lui, une iframe sandboxée
    // ignore silencieusement alert() / confirm() / prompt(), or ce sont les
    // exemples phares du cours de JavaScript — l'étudiant qui colle l'exemple de
    // la leçon ne verrait rien se produire. Ce jeton est orthogonal à
    // `allow-same-origin`, qui ne doit JAMAIS être ajouté : combiné à
    // `allow-scripts`, il permettrait au script de retirer son propre sandbox.
    const previewFrame = previewDoc && (
        <iframe
            srcDoc={previewDoc.html}
            sandbox={previewDoc.needsScripts ? "allow-scripts allow-modals" : ""}
            title="Aperçu du code"
            className="w-full border-0 bg-white"
        />
    );

    // Sans aperçu (ex. bloc PHP + HTML) : pas d'onglets, pas de colonne d'aperçu,
    // seulement les panneaux de code empilés.
    const content = !previewDoc ? (
        <div className="w-full h-full overflow-x-auto">
            {codeColumn}
        </div>
    ) : (
        <div className="w-full h-full overflow-hidden">

            {/* ── Tab strip mobile uniquement ── */}
            <div className="flex lg:hidden border-b border-bridge-400/40 dark:border-bridge-600/40">
                <button
                    onClick={() => setMobileTab('code')}
                    className={cn(
                        "flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px",
                        mobileTab === 'code'
                            ? "border-bridge-500 text-bridge-800 dark:text-bridge-100"
                            : "border-transparent text-bridge-500 dark:text-bridge-400 hover:text-bridge-700 dark:hover:text-bridge-200"
                    )}
                >
                    <Code2 className="w-3.5 h-3.5"/>
                    Code
                </button>
                <button
                    onClick={() => setMobileTab('preview')}
                    className={cn(
                        "flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px",
                        mobileTab === 'preview'
                            ? "border-bridge-500 text-bridge-800 dark:text-bridge-100"
                            : "border-transparent text-bridge-500 dark:text-bridge-400 hover:text-bridge-700 dark:hover:text-bridge-200"
                    )}
                >
                    <Eye className="w-3.5 h-3.5"/>
                    Aperçu
                </button>
            </div>

            {/* ── Code et aperçu : montés UNE seule fois ──

                Les deux dispositions (mobile à onglets, bureau côte à côte)
                partagent les mêmes nœuds. Les monter en double — une copie
                `lg:hidden`, une copie `hidden lg:flex` — était sans conséquence
                tant que les panneaux n'étaient que colorés ; depuis qu'un
                panneau peut passer en édition, cela instanciait DEUX Monaco
                (dont un dans un conteneur `display:none`) et faisait tourner le
                JS de l'étudiant dans deux iframes à la fois.

                L'enveloppe qui porte la bascule d'onglet passe en
                `display: contents` à partir de `lg` : elle s'efface alors de
                l'arbre de rendu et code et aperçu redeviennent les deux enfants
                directs de la rangée flex, exactement comme dans la disposition
                bureau d'origine — la chaîne de hauteurs dont dépend l'étirement
                de l'iframe (cf. globals.css) est préservée.

                Le `hidden` de l'onglet inactif est posé sur cette enveloppe, et
                surtout PAS sur `.code-with-preview-preview` : la règle
                `.course-code-card .code-with-preview-preview { display: flex }`
                de globals.css (spécificité 0,2,0) l'emporterait sur `.hidden`
                (0,1,0) et l'aperçu ne se cacherait jamais. */}
            <div className="lg:flex lg:h-full">
                <div className={cn("lg:contents", mobileTab !== 'code' && "hidden")}>
                    <div className="code-with-preview-mobile-scroll min-w-0 overflow-x-auto border-bridge-400/40 dark:border-bridge-600/40 lg:flex-1 lg:border-r">
                        {codeColumn}
                    </div>
                </div>
                <div className={cn("lg:contents", mobileTab !== 'preview' && "hidden")}>
                    <div className="code-with-preview-preview min-w-0 overflow-auto p-0 text-left max-h-[60dvh] lg:max-h-none lg:flex-1">
                        {previewFrame}
                    </div>
                </div>
            </div>

        </div>
    );

    return (
        <div className={cn("course-code-card my-8 sm:my-10", className)}>
            <BaseCard
                header={headerCard}
                content={content}
                currentModule={currentModule}
                withLed={false}
                withHover={false}
                withMarge={false}
            />
        </div>
    );
}
