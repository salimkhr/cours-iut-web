import axios from "axios";
import { Section as SectionFrom } from "@/components/admin/SectionForm";
import Module from "@/types/module";

// Hook regroupant les appels API d'administration (modules/sections)
export default function useAdminApi() {
  // Ajouter un module
  async function addModule(newMod: Omit<Module, "_id">) {
    const res = await axios.post("/api/admin/modules", newMod, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data as Module;
  }

  // Ajouter une section à un module
  async function addSection(moduleId: string, section: SectionFrom) {
    const res = await axios.post(`/api/admin/${moduleId}/sections`, section, {
      headers: { "Content-Type": "application/json" },
    });

    if (res.status < 200 || res.status >= 300) {
      throw new Error("Erreur API");
    }

    return res.data.section;
  }

  // Éditer une section
  async function editSection(moduleId: string, updatedSection: SectionFrom) {
    const res = await axios.put(`/api/admin/${moduleId}/sections`, updatedSection, {
      headers: { "Content-Type": "application/json" },
    });

    if (res.status < 200 || res.status >= 300) {
      throw new Error("Erreur API");
    }

    return res.data.section;
  }

  return { addModule, addSection, editSection };
}
