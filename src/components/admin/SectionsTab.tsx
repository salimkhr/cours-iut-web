import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Edit, Trash} from "lucide-react";
import {Section} from "@/types/Section";
import SectionDrawer from "@/components/admin/SectionDrawer";
import {Badge} from "@/components/ui/badge";

interface SectionsTabProps {
    sections: Section[];
}

export default function SectionsTab({sections}: SectionsTabProps) {
    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Liste des sections</h2>
                <SectionDrawer/>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Chemin</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Cours</TableHead>
                        <TableHead>Durée</TableHead>
                        <TableHead>Disponible</TableHead>
                        <TableHead>Correction</TableHead>
                        <TableHead>Ordre</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sections.map((section) => (
                        <TableRow key={section.id}>
                            <TableCell>{section.title}</TableCell>
                            <TableCell>{section.path}</TableCell>
                            <TableCell className="space-x-1">
                                {/*{section.tags?.map((tag, i) => (*/}
                                {/*    <Badge key={i} variant="outline">{tag}</Badge>*/}
                                {/*))}*/}
                            </TableCell>
                            <TableCell>{section.contents.length}</TableCell>
                            <TableCell>{section.totalDuration} min</TableCell>
                            <TableCell>
                                {section.isAvailable ? (
                                    <Badge variant="outline" className="border-green-700 text-green-700">Oui</Badge>
                                ) : (
                                    <Badge variant="outline" className="border-orange-700 text-orange-700">Non</Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                {section.hasCorrection ? (
                                    <Badge variant="outline" className="border-green-700 text-green-700">Oui</Badge>
                                ) : (
                                    <Badge variant="outline" className="border-orange-700 text-orange-700">Non</Badge>
                                )}
                            </TableCell>
                            <TableCell>{section.order}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm"><Edit className="w-4 h-4"/></Button>
                                <Button variant="outline" size="sm" className="border-red-700 text-red-700"><Trash
                                    className="w-4 h-4"/></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
}
