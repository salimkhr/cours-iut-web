"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {ExternalLink, Loader2, Pencil, Plus, Trash2} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Switch} from "@/components/ui/switch";
import {Badge} from "@/components/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminDataTable, {type AdminColumn} from "@/components/admin/ui/AdminDataTable";
import {
    RESOURCE_KINDS,
    RESOURCE_KIND_LABELS,
    resourceFormSchema,
    type ResourceFormData,
    type ResourceKind,
} from "@/lib/schemas/resource.schema";
import type {Resource} from "@/types/Resource";

const ENDPOINT = "/api/admin/resources";

type FormState = {title: string; url: string; description: string; kind: ResourceKind; durationMin: string; note: string};
type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {title: "", url: "", description: "", kind: "article", durationMin: "", note: ""};

async function request(url: string, method: string, body?: unknown): Promise<void> {
    const res = await fetch(url, {
        method,
        headers: body === undefined ? undefined : {"Content-Type": "application/json"},
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {error?: unknown};
        throw new Error(typeof data.error === "string" ? data.error : "Opération impossible");
    }
}

/** Gestion des ressources de veille affichées sur la homepage (étudiants connectés). */
export default function ResourcesPanel({resources}: {resources: Resource[]}) {
    const router = useRouter();
    const [editing, setEditing] = useState<Resource | "new" | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [busy, setBusy] = useState(false);
    const [toDelete, setToDelete] = useState<Resource | null>(null);

    function openForm(target: Resource | "new") {
        setErrors({});
        setForm(
            target === "new"
                ? EMPTY_FORM
                : {
                    title: target.title,
                    url: target.url,
                    description: target.description,
                    kind: target.kind,
                    durationMin: target.durationMin ? String(target.durationMin) : "",
                    note: target.note ?? "",
                },
        );
        setEditing(target);
    }

    async function run(action: () => Promise<void>, success: string) {
        setBusy(true);
        try {
            await action();
            toast.success(success);
            router.refresh();
            return true;
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Opération impossible");
            return false;
        } finally {
            setBusy(false);
        }
    }

    async function handleSubmit() {
        const parsed = resourceFormSchema.safeParse({
            ...form,
            durationMin: form.durationMin.trim() ? Number(form.durationMin) : undefined,
        });
        if (!parsed.success) {
            const fieldErrors: FieldErrors = {};
            for (const issue of parsed.error.issues) {
                const key = issue.path[0] as keyof FormState | undefined;
                if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
            }
            setErrors(fieldErrors);
            return;
        }
        const data: ResourceFormData = parsed.data;
        const isNew = editing === "new";
        const ok = await run(
            () => (isNew ? request(ENDPOINT, "POST", data) : request(`${ENDPOINT}/${(editing as Resource)._id}`, "PUT", data)),
            isNew ? "Ressource ajoutée." : "Ressource modifiée.",
        );
        if (ok) setEditing(null);
    }

    const columns: AdminColumn<Resource>[] = [
        {
            id: "title",
            header: "Ressource",
            cell: (row) => (
                <div className="flex max-w-md flex-col gap-0.5 whitespace-normal">
                    <span className="font-semibold text-brand-dark dark:text-bridge-100">{row.title}</span>
                    <a
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 truncate text-xs text-brand-primary hover:underline"
                    >
                        <ExternalLink className="size-3 shrink-0" aria-hidden="true"/>
                        {row.url}
                    </a>
                </div>
            ),
        },
        {
            id: "kind",
            header: "Type",
            cell: (row) => <Badge variant="outline">{RESOURCE_KIND_LABELS[row.kind]}</Badge>,
        },
        {
            id: "duration",
            header: "Durée",
            cell: (row) => (
                <span className="text-sm tabular-nums text-bridge-700 dark:text-bridge-200">
                    {row.durationMin ? `${row.durationMin} min` : "—"}
                </span>
            ),
        },
        {
            id: "visible",
            header: "Visible",
            cell: (row) => (
                <Switch
                    checked={row.isVisible}
                    disabled={busy}
                    aria-label={`Afficher « ${row.title} » sur l'accueil`}
                    onCheckedChange={(isVisible) =>
                        void run(
                            () => request(`${ENDPOINT}/${row._id}`, "PATCH", {isVisible}),
                            isVisible ? "Ressource affichée." : "Ressource masquée.",
                        )
                    }
                />
            ),
        },
        {
            id: "actions",
            header: <span className="sr-only">Actions</span>,
            cell: (row) => (
                <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label={`Modifier « ${row.title} »`} onClick={() => openForm(row)}>
                        <Pencil/>
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={`Supprimer « ${row.title} »`} onClick={() => setToDelete(row)}>
                        <Trash2/>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end">
                <Button onClick={() => openForm("new")}>
                    <Plus/>
                    Ajouter une ressource
                </Button>
            </div>

            <AdminDataTable
                columns={columns}
                data={resources}
                getRowKey={(row) => row._id}
                emptyMessage="Aucune ressource pour l'instant."
                renderSubRow={(row) => (
                    <div className="flex max-w-3xl flex-col gap-1 text-sm text-bridge-700 dark:text-bridge-200">
                        <p>{row.description}</p>
                        {row.note && (
                            <p className="italic">
                                <span className="not-italic font-semibold">Mot du prof : </span>
                                {row.note}
                            </p>
                        )}
                    </div>
                )}
            />

            <Dialog open={editing !== null} onOpenChange={(open) => !open && !busy && setEditing(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing === "new" ? "Ajouter une ressource" : "Modifier la ressource"}</DialogTitle>
                        <DialogDescription>
                            Affichée sur la page d&apos;accueil, pour les étudiants connectés.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="resource-title">Titre</Label>
                            <Input
                                id="resource-title"
                                value={form.title}
                                aria-invalid={!!errors.title}
                                onChange={(e) => setForm({...form, title: e.target.value})}
                            />
                            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="resource-url">Lien</Label>
                            <Input
                                id="resource-url"
                                type="url"
                                inputMode="url"
                                placeholder="https://"
                                value={form.url}
                                aria-invalid={!!errors.url}
                                onChange={(e) => setForm({...form, url: e.target.value})}
                            />
                            {errors.url && <p className="text-xs text-destructive">{errors.url}</p>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="resource-kind">Type</Label>
                            <Select value={form.kind} onValueChange={(kind) => setForm({...form, kind: kind as ResourceKind})}>
                                <SelectTrigger id="resource-kind" className="w-full">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    {RESOURCE_KINDS.map((kind) => (
                                        <SelectItem key={kind} value={kind}>
                                            {RESOURCE_KIND_LABELS[kind]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="resource-description">Description</Label>
                            <Textarea
                                id="resource-description"
                                rows={4}
                                value={form.description}
                                aria-invalid={!!errors.description}
                                onChange={(e) => setForm({...form, description: e.target.value})}
                            />
                            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="resource-duration">Durée en minutes (facultatif)</Label>
                            <Input
                                id="resource-duration"
                                type="number"
                                inputMode="numeric"
                                min={1}
                                max={600}
                                placeholder="5"
                                value={form.durationMin}
                                aria-invalid={!!errors.durationMin}
                                onChange={(e) => setForm({...form, durationMin: e.target.value})}
                            />
                            {errors.durationMin && <p className="text-xs text-destructive">{errors.durationMin}</p>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="resource-note">Mot du prof (facultatif)</Label>
                            <Textarea
                                id="resource-note"
                                rows={2}
                                placeholder="Pourquoi je vous la conseille…"
                                value={form.note}
                                aria-invalid={!!errors.note}
                                onChange={(e) => setForm({...form, note: e.target.value})}
                            />
                            <p className="text-xs text-bridge-600 dark:text-bridge-300">
                                Affiché sur l&apos;accueil, avec la ressource la plus récente.
                            </p>
                            {errors.note && <p className="text-xs text-destructive">{errors.note}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" disabled={busy} onClick={() => setEditing(null)}>
                            Annuler
                        </Button>
                        <Button disabled={busy} onClick={() => void handleSubmit()}>
                            {busy && <Loader2 className="animate-spin"/>}
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette ressource ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            « {toDelete?.title} » sera retirée définitivement. Pour la cacher sans la perdre, utilisez
                            plutôt l&apos;interrupteur « Visible ».
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                const target = toDelete;
                                setToDelete(null);
                                if (target) void run(() => request(`${ENDPOINT}/${target._id}`, "DELETE"), "Ressource supprimée.");
                            }}
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
