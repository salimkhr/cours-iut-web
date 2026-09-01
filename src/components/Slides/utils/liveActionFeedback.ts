import { toast } from "sonner";

/**
 * Enveloppe une action live (start/stop) pour afficher son echec au lieu de
 * le laisser filer en silence. Partagee entre SlidesActions et
 * RemoteControlView, qui exposent toutes deux des boutons demarrer/arreter.
 */
export async function runLiveAction(action: () => Promise<void>, fallbackMessage: string) {
    try {
        await action();
    } catch (err) {
        toast.error(err instanceof Error ? err.message : fallbackMessage);
    }
}
