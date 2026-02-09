'use client';
import {SlidesScreen} from "@/components/Slides/SlidesScreen";
import React from 'react';
import {SlideScreen} from "@/components/Slides/SlideScreen";
import {SlideText} from "@/components/Slides/ui/SlideText";
import {SlideList, SlideListItem} from "@/components/Slides/ui/SlideList";
import {SlideNote} from "@/components/Slides/ui/SlideNote";

import Module from "@/types/Module";
import Section from "@/types/Section";

export default function PropagationSlides() {
    const mockModule: Module = {
        _id: "javascript",
        title: "JavaScript",
        path: "javascript",
        iconName: "Braces",
        description: "Apprendre les bases de JavaScript pour le web interactif",
        sections: [],
        associatedSae: []
    };

    const mockSection: Section = {
        title: "Propagation et Délégation",
        path: "propagation-et-delegation",
        contents: [],
        description: "Propagation des événements et délégation en JavaScript",
        tags: ["Events", "Propagation", "Delegation", "Bubbling", "Capture"],
        totalDuration: 0,
        hasCorrection: false,
        order: 3
    };

    // Diagrams

    return (
        <div className="w-full">
            <SlidesScreen module={mockModule} section={mockSection}>
                {/* Introduction */}
                <SlideScreen title="Propagation des Événements - Introduction">
                    <SlideNote>
                        {`- Bienvenue dans le cours sur la propagation des événements !
- Ce concept est fondamental pour comprendre comment les événements se déplacent dans le DOM.
- Expliquer que la propagation permet la délégation d'événements, une technique très puissante.`}
                    </SlideNote>
                    <SlideText>
                        Lorsqu'un événement est déclenché sur un élément du DOM, il ne reste pas uniquement sur cet
                        élément. Il traverse plusieurs phases avant d'être complètement traité.
                    </SlideText>
                    <SlideList>
                        <SlideListItem>L'événement parcourt l'arbre DOM en suivant un chemin précis</SlideListItem>
                        <SlideListItem>Trois phases distinctes : capture, cible, et bouillonnement</SlideListItem>
                        <SlideListItem>Comprendre ce mécanisme permet d'optimiser la gestion des
                            événements</SlideListItem>
                    </SlideList>
                </SlideScreen>
            </SlidesScreen>
        </div>
    );
}