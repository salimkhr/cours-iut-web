export interface LiveSessionState {
    sessionId: string;        // `${moduleSlug}/${sectionSlug}`
    presenterName: string;
    currentSlide: number;
    currentStep: number;
    startedAt: number;        // epoch ms
    updatedAt: number;
}

export interface LiveCommand {
    slide: number;
    step: number;
}

export type LiveConnection = "connected" | "reconnecting" | "offline";
