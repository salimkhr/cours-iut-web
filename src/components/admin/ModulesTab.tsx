import React from 'react';
import ModuleDrawer from "@/components/admin/ModuleDrawer";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Edit, Trash} from "lucide-react";
import {Module} from "@/types/module";

interface ModulesTabsProps {
    modules: Module[];
}

export default function ModulesTab({modules}: ModulesTabsProps) {
    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Liste des modules</h2>
                <ModuleDrawer/>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Chemin</TableHead>
                        <TableHead>Icône</TableHead>
                        <TableHead>Nombre de cours</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {modules.map((mod) => (
                        <TableRow key={mod.id}>
                            <TableCell>{mod.title}</TableCell>
                            <TableCell>{mod.path}</TableCell>
                            <TableCell>{mod.iconName}</TableCell>
                            <TableCell>{mod.sections.length}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm"><Edit/></Button>
                                <Button variant="outline" className={"border-red-700 text-red-700"}
                                        size="sm"><Trash/></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
        ;
};