import modules from '../../config/modules';
import {Module} from '@/types/module';
import rawSectionState from '../../config/section-state.json';
import {SectionStateMap} from '@/types/SectionState'; // ton nouveau type

const sectionState = rawSectionState as SectionStateMap;

export default function getMergedModules(): Module[] {
    return modules.map((mod) => ({
        ...mod,
        sections: mod.sections.map((section) => {
            const stateForModule = sectionState[mod.id] ?? {};
            const rawState = stateForModule[section.id] ?? {};

            const dynamicState = {
                isAvailable: rawState.isAvailable ?? false,
                correctionIsAvailable: rawState.correctionIsAvailable ?? false
            };

            return {
                ...section,
                ...dynamicState
            };
        }),
    }));
}