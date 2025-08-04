export interface SectionAvailabilityState {
    isAvailable?: boolean;
    correctionIsAvailable?: boolean;
}

export interface SectionStateMap {
    [moduleId: string]: {
        [sectionId: string]: SectionAvailabilityState;
    };
}