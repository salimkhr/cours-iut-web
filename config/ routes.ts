import modules from './modules';
import {Module} from "@/types/module";
import {Section} from "@/types/Section";
import {Content} from "@/types/content";

export function getModuleParams() {
    return modules.map((mod: Module) => ({
        moduleSlug: mod.path,
    }));
}

export function getSectionParams() {
    const params: { moduleSlug: string; sectionSlug: string }[] = [];

    modules.forEach((mod: Module) => {
        mod.sections.forEach((section: Section) => {
            if (section.isAvailable) {
                params.push({
                    moduleSlug: mod.path,
                    sectionSlug: section.path,
                });
            }
        });
    });

    return params;
}

export function getContentParams() {
    const params: { moduleSlug: string; sectionSlug: string; contentSlug: string }[] = [];

    modules.forEach((mod: Module) => {
            mod.sections.forEach((section: Section) => {
                if (section.isAvailable) {
                    section.contents.forEach((content: Content) => {
                            params.push({
                                moduleSlug: mod.path,
                                sectionSlug: section.path,
                                contentSlug: content.type,
                            });
                        }
                    )
                }
            });
        }
    )


    return params;
}
