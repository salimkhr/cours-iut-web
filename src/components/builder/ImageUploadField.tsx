"use client";

import { useRef, useState, useEffect } from "react";
import { ImageIcon, X, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
}

type UploadState = "empty" | "uploading" | "success" | "error";

export function ImageUploadField({ value, onChange, label }: ImageUploadFieldProps) {
    const [state, setState] = useState<UploadState>(value ? "success" : "empty");
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const xhrRef = useRef<XMLHttpRequest | null>(null);

    useEffect(() => {
        return () => { xhrRef.current?.abort(); };
    }, []);

    function upload(file: File) {
        setState("uploading");
        setProgress(0);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
                setProgress(Math.round((e.loaded / e.total) * 100));
            }
        });

        xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText) as { url: string };
                    onChange(data.url);
                    setState("success");
                } catch {
                    setError("Format de réponse invalide");
                    setState("error");
                }
            } else {
                let msg = "Erreur lors de l'envoi";
                try {
                    const data = JSON.parse(xhr.responseText) as { error?: string };
                    if (data.error) msg = data.error;
                } catch { /* responseText non-JSON */ }
                setError(msg);
                setState("error");
            }
        });

        xhr.addEventListener("error", () => {
            setError("Erreur réseau");
            setState("error");
        });

        xhr.open("POST", "/api/admin/content/upload-image");
        xhrRef.current = xhr;
        xhr.send(formData);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) upload(file);
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) upload(file);
        e.target.value = "";
    }

    function handleRemove() {
        onChange("");
        setState("empty");
        setError(null);
        setProgress(0);
    }

    const dropZoneCls = cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer select-none",
        dragOver
            ? "border-brand-primary bg-brand-primary/5"
            : "border-bridge-400/40 dark:border-bridge-500/35 hover:border-brand-primary/50 hover:bg-brand-primary/5",
    );

    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <Label className="text-sm font-semibold text-brand-dark dark:text-bridge-200">
                    {label}
                </Label>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
            />

            {state === "empty" && (
                <div
                    className={dropZoneCls}
                    onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
                    aria-label="Zone de dépôt d'image — cliquez ou glissez un fichier"
                >
                    <ImageIcon className="w-8 h-8 text-bridge-400 dark:text-bridge-500" />
                    <p className="text-sm text-bridge-500 dark:text-bridge-400 text-center">
                        Glissez une image ou{" "}
                        <span className="text-brand-primary font-medium">cliquez pour parcourir</span>
                    </p>
                    <p className="text-xs text-bridge-400 dark:text-bridge-500">
                        JPEG · PNG · WebP · GIF — max 10 Mo
                    </p>
                </div>
            )}

            {state === "uploading" && (
                <div className="rounded-lg border border-bridge-400/40 dark:border-bridge-500/35 p-4 flex flex-col gap-2">
                    <p className="text-sm text-bridge-600 dark:text-bridge-300">Envoi en cours…</p>
                    <div className="w-full h-1.5 bg-bridge-200 dark:bg-bridge-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-primary rounded-full transition-all duration-200"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-bridge-400 dark:text-bridge-500 text-right">
                        {progress} %
                    </p>
                </div>
            )}

            {state === "success" && (
                <div className="rounded-lg border border-bridge-400/40 dark:border-bridge-500/35 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={value}
                        alt="Aperçu de l'image uploadée"
                        className="w-full object-cover max-h-48"
                    />
                    <div className="p-2 flex justify-end border-t border-bridge-400/20 dark:border-bridge-500/20">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleRemove}
                        >
                            <X className="w-3.5 h-3.5" /> Supprimer
                        </Button>
                    </div>
                </div>
            )}

            {state === "error" && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex flex-col gap-2">
                    <p className="text-sm text-destructive">{error}</p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="self-start h-7 text-xs gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                        onClick={() => { setState("empty"); setError(null); }}
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Réessayer
                    </Button>
                </div>
            )}
        </div>
    );
}
