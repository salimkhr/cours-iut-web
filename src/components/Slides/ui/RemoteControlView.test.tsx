/// <reference types="bun-types" />
import React from "react";
import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { RemoteControlView } from "@/components/Slides/ui/RemoteControlView";
import { SlidesContext, type SlidesContextType } from "@/components/Slides/context/SlidesContext";

const base: SlidesContextType = {
    currentSlide: 1,
    currentStep: 0,
    slidesCount: 5,
    slideSteps: {},
    nextSlide: () => {},
    prevSlide: () => {},
    goToSlide: () => {},
    registerSteps: () => {},
    currentNotes: null,
    showNotes: false,
    setShowNotes: () => {},
    isFullscreen: false,
    toggleFullscreen: () => {},
    currentSlideTitle: "Les boucles",
};

function render(value: SlidesContextType) {
    return renderToStaticMarkup(
        <SlidesContext.Provider value={value}>
            <RemoteControlView />
        </SlidesContext.Provider>
    );
}

test("affiche le titre et le numero de la slide en cours", () => {
    const html = render(base);
    expect(html).toContain("Les boucles");
    expect(html).toContain("Slide 2 / 5");
});

test("sans session live : boutons desactives, message explicite, bouton demarrer visible", () => {
    const html = render({ ...base, startPresenting: async () => {} });

    expect(html).toContain("Aucune présentation en cours");
    expect(html).toContain("Démarrer la présentation");
    expect(html).toContain("Démarrez une présentation pour naviguer.");
    // Les deux boutons de navigation portent l'attribut disabled.
    expect((html.match(/disabled=""/g) ?? []).length).toBeGreaterThanOrEqual(2);
});

test("session live, appareil controleur : boutons de navigation actifs, bouton stop visible", () => {
    const html = render({
        ...base,
        live: {
            isLive: true,
            isPresenter: true,
            isController: true,
            presenterName: "profdi",
            connection: "connected",
            drift: { delta: 0, direction: "synced" },
            paused: false,
            resync: () => {},
        },
        stopPresenting: async () => {},
    });

    expect(html).toContain("Vous contrôlez");
    expect(html).not.toContain("Aucune présentation en cours");
    expect(html).not.toContain("Démarrez une présentation pour naviguer.");
    expect(html).toContain("Arrêter la présentation");
});

test("session live, appareil suiveur : affiche le nom du presentateur", () => {
    const html = render({
        ...base,
        live: {
            isLive: true,
            isPresenter: true,
            isController: false,
            presenterName: "Chef Marlène",
            connection: "connected",
            drift: { delta: 0, direction: "synced" },
            paused: false,
            resync: () => {},
        },
    });

    expect(html).toContain("Suit Chef Marlène");
});
