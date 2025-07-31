"use client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
// import {useToast} from "@/components/ui/use-toast";
import React, {useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Module} from "@/types/module";
import {PlusCircle} from "lucide-react";

export default function ModuleDrawer() {
    // const {toast} = useToast();
    const [modules, setModules] = useState<Module[]>([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        title: "",
        path: "",
        iconName: "",
        description: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = () => {
        const newModule: Module = {
            ...form,
            sections: [],
            id: 0
        };

        setModules([...modules, newModule]);
        // toast({
        //     title: "Module créé",
        //     description: `Le module "${form.title}" a été ajouté.`,
        // });

        // Reset form
        setForm({
            title: "",
            path: "",
            iconName: "",
            description: "",
        });
    };

    return (
        <div className="p-6 space-y-6">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline"><PlusCircle/> Nouveau module</Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Créer un module</DialogTitle>
                        <DialogDescription>
                            Renseigne les informations pour ajouter un module.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div>
                            <Label htmlFor="title">Titre</Label>
                            <Input
                                id="title"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="path">Chemin</Label>
                            <Input
                                id="path"
                                name="path"
                                value={form.path}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="iconName">Icône</Label>
                            <Input
                                id="iconName"
                                name="iconName"
                                value={form.iconName}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" variant="outline" className="border-green-700 text-green-700">
                                Créer
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Liste visuelle des modules ajoutés */}
            {modules.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-2">Modules créés :</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        {modules.map((mod) => (
                            <li key={mod.id}>
                                <strong>{mod.title}</strong> – {mod.path}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
