"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUploadField } from "@/components/builder/ImageUploadField";

interface ImageEditDialogProps {
    open: boolean;
    value: string;
    onChange: (url: string) => void;
    onClose: () => void;
}

/** Dialog d&apos;édition de l&apos;image d&apos;un bloc image-card (réutilise ImageUploadField + upload existant). */
export function ImageEditDialog({ open, value, onChange, onClose }: ImageEditDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-sm">Image du bloc</DialogTitle>
                </DialogHeader>
                <ImageUploadField value={value} onChange={onChange} label="Image" />
            </DialogContent>
        </Dialog>
    );
}
