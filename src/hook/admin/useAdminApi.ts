import axios from "axios";
import {Section as SectionFrom} from "@/components/admin/SectionForm";
import Module from "@/types/Module";

// Hook regroupant les appels API d'administration (modules/sections)
export default function useAdminApi() {
    // Ajouter un module
    async function addModule(newMod: Omit<Module, "_id">) {
        const res = await axios.post("/api/admin/modules", newMod, {
            headers: {"Content-Type": "application/json"},
        });
        return res.data as Module;
    }

    // Ajouter une section à un module
    async function addSection(moduleId: string, section: SectionFrom) {
        const res = await axios.post(`/api/admin/${moduleId}/sections`, section, {
            headers: {"Content-Type": "application/json"},
        });

        if (res.status < 200 || res.status >= 300) {
            throw new Error("Erreur API");
        }

        return res.data.section;
    }

    // Éditer une section
    async function editSection(moduleId: string, sectionId: string, updatedSection: SectionFrom) {
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
