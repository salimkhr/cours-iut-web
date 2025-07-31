"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Checkbox} from "@/components/ui/checkbox";
import {PlusCircle} from "lucide-react";
import {Section} from "@/types/Section";
// import {getModules} from "@/hook/useModules";

export default function SectionDrawer() {
    const [open, setOpen] = useState(false);

    // const modules = getModules()

    const [form, setForm] = useState<Partial<Section>>({
        title: "",
        path: "",
        description: "",
        tags: "[]",
        totalDuration: 0,
        hasCorrection: false,
        isAvailable: true,
        order: 1,
        // moduleId: undefined
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleToggle = (name: keyof Section) => {
        setForm({...form, [name]: !form[name]});
    };

    /*const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // const tags = e.target.value.split(",").map(t => t.trim());
        // setForm({...form, tags});
    };*/

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // TODO: Ajouter appel API ou mutation Prisma
        setOpen(false);
        setForm({
            title: "",
            path: "",
            description: "",
            tags: "[]",
            totalDuration: 0,
            hasCorrection: false,
            isAvailable: true,
            order: 1,
            // moduleId: undefined
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Nouvelle section
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Créer une section</DialogTitle>
                    <DialogDescription>Renseigne les informations de la section.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    <div>
                        <Label htmlFor="title">Titre</Label>
                        <Input id="title" name="title" value={form.title || ""} onChange={handleChange} required/>
                    </div>

                    <div>
                        <Label htmlFor="path">Chemin</Label>
                        <Input id="path" name="path" value={form.path || ""} onChange={handleChange} required/>
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" value={form.description || ""}
                                  onChange={handleChange}/>
                    </div>

                    <div>
                        <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                        <Input id="tags" name="tags" value={form.tags}/>
                    </div>

                    <div>
                        <Label htmlFor="totalDuration">Durée totale (en Séances)</Label>
                        <Input
                            id="totalDuration"
                            name="totalDuration"
                            type="number"
                            value={form.totalDuration || 1}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={form.isAvailable}
                                onCheckedChange={() => handleToggle("isAvailable")}
                                id="isAvailable"
                            />
                            <Label htmlFor="isAvailable">Disponible</Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={form.hasCorrection}
                                onCheckedChange={() => handleToggle("hasCorrection")}
                                id="hasCorrection"
                            />
                            <Label htmlFor="hasCorrection">Correction</Label>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="order">Ordre</Label>
                        <Input
                            id="order"
                            name="order"
                            type="number"
                            value={form.order || 1}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="moduleId">Module parent</Label>
                        {/*<Select*/}
                        {/*    value={form.moduleId}*/}
                        {/*    onValueChange={(val) => setForm({...form, moduleId: parseInt(val)})}*/}
                        {/*>*/}
                        {/*    <SelectTrigger>*/}
                        {/*        <SelectValue placeholder="Choisir un module"/>*/}
                        {/*    </SelectTrigger>*/}
                        {/*    <SelectContent>*/}
                        {/*        {modules?.map((mod) => (*/}
                        {/*            <SelectItem key={mod.id} value={mod.id.toString()}>*/}
                        {/*                {mod.title}*/}
                        {/*            </SelectItem>*/}
                        {/*        ))}*/}
                        {/*    </SelectContent>*/}
                        {/*</Select>*/}
                    </div>

                    <DialogFooter>
                        <Button type="submit" variant="outline" className="border-green-700 text-green-700">
                            Créer la section
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
