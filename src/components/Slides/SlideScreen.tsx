'use client';
import React from 'react';
import {SlideHeading} from "./ui/SlideHeading";
import {SlideNote} from "./ui/SlideNote";
import {useSlides} from "@/components/Slides/context/SlidesContext";

export interface SlideScreenProps {
    /** Vide = pas de bandeau de titre. C'est ce qui laisse toute la surface aux
     *  slides de transition (`slide-transition`), dont l'annonce EST le titre :
     *  un bandeau au-dessus ferait doublon et écraserait l'effet. */
    title: string;
    /** Rang de la slide dans le deck, porté par le badge du bandeau de titre.
     *  Absent (aperçu builder) → on retombe sur la position du contexte. */
    order?: number;
    children: React.ReactNode;
}

export const SlideScreen: React.FC<SlideScreenProps> = ({title, order, children}) => {
    const {moduleTitle, sectionTitle, currentSlide} = useSlides();

    // Filtrer les enfants pour ne pas afficher le composant SlideNote dans le flux principal
    const filteredChildren = React.Children.toArray(children).filter(child => {
        if (React.isValidElement(child)) {
            const type = child.type;
            const isSlideNote = type === SlideNote || (typeof type === 'function' && ('displayName' in type && type.displayName === 'SlideNote' || 'name' in type && type.name === 'SlideNote'));
            return !isSlideNote;
        }
        return true;
    });

    // L'eyebrow n'apparaît que si le contexte porte l'identité (slides d'un
    // module) ; un Slide.tsx rendu hors de ce contexte affiche juste le titre.
    const eyebrow = [moduleTitle, sectionTitle].filter(Boolean).join(" · ");

    // Le badge porte le rang de la slide, comme la lettre de section dans le
    // cours. Deux chiffres pour rester carré et aligné sur « SECTION 01 » de la
    // slide de titre.
    const badgeLabel = String(order ?? currentSlide + 1).padStart(2, "0");

    return (
        <div className="relative isolate flex h-full w-full self-stretch mx-auto overflow-hidden slide-surface">
            <div
                aria-hidden="true"
                className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden"
            >
                <div className="absolute inset-0 bg-linear-to-br from-bridge-50 via-bridge-50/86 to-bridge-50/30 dark:from-bridge-900 dark:via-bridge-900/88 dark:to-bridge-900/44"/>
                {/* Le PNG du pont a un fond crème opaque, très proche de bridge-50
                    mais pas identique : sans masque, son cadre se lit comme un
                    rectangle net dans le coin. Le fondu radial l'ancre au coin
                    bas-droit et le dissout dans la surface de slide.
                    Le point le plus eloigne du calque (coin haut-gauche) tombe a
                    ~87 % sur l'echelle du degrade — trop pres de l'ancien palier
                    « transparent 84% » pour y arriver vraiment a zero, d'ou une
                    arete encore visible. Le palier redescend a 60% pour laisser
                    une vraie marge avant d'atteindre le bord le plus proche. */}
                <div
                    className="absolute bottom-[-1px] right-0 z-10 h-[34%] w-[30%] bg-contain bg-right-bottom bg-no-repeat bg-[url('/images/card/pont-light.png')] opacity-[0.7] dark:bg-[url('/images/card/pont-dark.png')] dark:opacity-[0.58]"
                    style={{
                        maskImage: "radial-gradient(115% 115% at 100% 100%, #000 42%, transparent 60%)",
                        WebkitMaskImage: "radial-gradient(115% 115% at 100% 100%, #000 42%, transparent 60%)",
                    }}
                />
            </div>

            {/* pb-20 réserve la bande basse occupée par SlidesActions (barre de
                ~44px calée à bottom-4) : sans elle, la barre recouvre la fin du
                contenu. Juste ce qu'il faut — au-delà on rogne le contenu pour
                rien. */}
            <div className="relative z-10 flex h-full min-h-0 w-full flex-col px-8 pt-8 pb-20 md:px-12 lg:px-16 lg:pt-10">
                {eyebrow && (
                    <div className="mb-3 shrink-0 text-sm font-semibold uppercase tracking-[0.18em] text-brand-dark/65 dark:text-bridge-100/70 md:text-base">
                        {eyebrow}
                    </div>
                )}

                {/* Exactement le bandeau « badge + filet » des titres de section
                    du cours (globals.css §course-section-head) : la couleur
                    module vit dans le badge, le titre reste en encre neutre.
                    Mêmes classes, donc une seule source de vérité. */}
                {title.trim() && (
                    <div className="course-section-head course-section-head--top mb-8 shrink-0">
                        <span className="course-section-badge" aria-hidden="true">
                            {badgeLabel}
                        </span>
                        <div className="course-section-headline">
                            <SlideHeading level={1}>
                                {title}
                            </SlideHeading>
                        </div>
                    </div>
                )}

                <div className="relative z-10 flex min-h-0 flex-1 flex-col slide-body overflow-hidden">
                    {filteredChildren}
                </div>
            </div>
        </div>
    );
};
