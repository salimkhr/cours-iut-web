import axios from "axios";
import {ContentRef} from "@/types/CourseContent";
import Module from "@/types/Module";

type AddModuleResponse = {
    insertedId: string;
};

// Forme d'une section telle qu'envoyée/reçue par les routes /api/admin/[id]/sections : les
// champs texte multi-lignes (objectives/tags) sont déjà transformés en tableaux, `contents` peut
// encore être une liste de types bruts (formulaire) avant sérialisation complète en `ContentRef[]`
// côté API. Anciennement exporté par `SectionForm.tsx` (supprimé en tâche 19) sous le nom `Section`.
export type SectionApiPayload = {
    title: string;
    path: string;
    description?: string;
    objectives?: string[] | string;
    tags: string[] | string;
    totalDuration: number;
    hasCorrection: boolean;
    isAvailable?: boolean;
    correctionIsAvailable?: boolean;
    order: number;
    contents: ContentRef[] | string[];
    examenIsLock?: boolean;
    courseIntroMinutes?: number;
    brief?: {
        objectives: string[];
        notions: string[];
        filRougeStep: string;
        filRougeOutcome?: string;
        providedBase?: string;
        notes?: string;
    };
    curriculum?: {notions: string[]; apis: string[]};
};

// Hook regroupant les appels API d'administration (modules/sections)
export default function useAdminApi() {
    // Ajouter un module
    async function addModule(newMod: Omit<Module, "_id">): Promise<AddModuleResponse> {
        const res = await axios.post("/api/admin/modules", newMod, {
            headers: {"Content-Type": "application/json"},
        });
        return res.data as AddModuleResponse;
    }

    // Ajouter une section à un module
    async function addSection(moduleId: string, section: SectionApiPayload) {
        const res = await axios.post(`/api/admin/${moduleId}/sections`, section, {
            headers: {"Content-Type": "application/json"},
        });

        if (res.status < 200 || res.status >= 300) {
            throw new Error("Erreur API");
        }

        return res.data.section;
    }

    // Éditer une section
    async function editSection(moduleId: string, sectionId: string, updatedSection: SectionApiPayload) {
        const res = await axios.put(`/api/admin/${moduleId}/sections`, { ...updatedSection, sectionId }, {
            headers: {"Content-Type": "application/json"},
        });

        if (res.status < 200 || res.status >= 300) {
            throw new Error("Erreur API");
        }

        return res.data.section;
    }

    // Modifier la visibilité d'un module
    async function toggleModuleVisibility(moduleId: string, isVisible: boolean) {
        await axios.patch(`/api/admin/modules/${moduleId}`, {isVisible}, {
            headers: {"Content-Type": "application/json"},
        });
    }

    // Supprimer un module
    async function deleteModule(moduleId: string) {
        await axios.delete(`/api/admin/modules/${moduleId}`);
    }

    // Supprimer une section
    async function deleteSection(moduleId: string, sectionPath: string) {
        await axios.delete(`/api/admin/${moduleId}/sections?sectionPath=${encodeURIComponent(sectionPath)}`);
    }

    return {addModule, addSection, editSection, toggleModuleVisibility, deleteModule, deleteSection};
}
