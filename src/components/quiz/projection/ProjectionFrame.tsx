"use client";

import type {ReactNode} from "react";
import {useFitScale} from "@/hook/useFitScale";
import {fitScale} from "@/lib/fitScale";

/** Cadre de projection 16:9 : toute la mise en page est dessinée à cette taille. */
export const PROJECTION_W = 1920;
export const PROJECTION_H = 1080;

const computeScale = (panelW: number, panelH: number) => fitScale(panelW, panelH, PROJECTION_W, PROJECTION_H);

/**
 * Même mécanisme que `ZoomedSlide` du builder (`useFitScale`) : un cadre de taille fixe mis à
 * l'échelle par `transform: scale()` selon la place disponible. L'écran projeté est donc identique
 * sur un portable, un vidéoprojecteur ou en plein écran. Les classes responsives n'ont pas cours à
 * l'intérieur : la mise en page est celle du cadre, pas celle de la fenêtre.
 */
export default function ProjectionFrame({children}: {children: ReactNode}) {
    const {ref, scale} = useFitScale(computeScale);

    return (
        <div ref={ref} className="relative min-h-0 w-full flex-1 overflow-hidden">
            {scale !== null && (
                <div
                    className="absolute left-1/2 top-1/2 flex flex-col"
                    style={{
                        width: PROJECTION_W,
                        height: PROJECTION_H,
                        transform: `translate(-50%, -50%) scale(${scale})`,
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
}
