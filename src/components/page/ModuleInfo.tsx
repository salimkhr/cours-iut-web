"use client";

import Link from "next/link";
import Heading from "@/components/ui/Heading";
import {List, ListItem} from "@/components/ui/List";
import Module from "@/types/Module";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";

interface ModuleInfoProps {
    currentModule: Module;
}

export default function ModuleInfo({currentModule}: ModuleInfoProps) {
    const coefficients = currentModule.coefficients?.filter((c) => c.value > 0);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className={`border-2 font-bold text-${currentModule.path}`}>
                    Plus d&apos;infos
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl p-0">
                <DialogHeader className="border-b-1 p-3">
                    <DialogTitle className="text-center">Informations sur le module</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                    {/* Équipe pédagogique */}

                    <Heading level={4} className="mb-2">
                        Équipe pédagogique&nbsp;:
                    </Heading>
                    <div>
                        <List>
                            <ListItem>
                                <Link
                                    className={`text-${currentModule.path} border-b border-${currentModule.path}`}
                                    href={`mailto:${currentModule.manager?.email}`}
                                >
                                    M.{currentModule.manager?.firstName} {currentModule.manager?.lastName}
                                </Link>
                            </ListItem>
                            {currentModule.instructors?.map((instructor) => (
                                <ListItem key={instructor.email}>
                                    <Link
                                        className={`text-${currentModule.path} border-b border-${currentModule.path}`}
                                        href={`mailto:${instructor.email}`}
                                    >
                                        M.{instructor.firstName} {instructor.lastName}
                                    </Link>
                                </ListItem>
                            ))}
                            {currentModule.instructors?.length === 0 && (
                                <span>Aucun responsable affecté a ce module</span>
                            )}
                        </List>
                    </div>

                    <Heading level={4} className="mt-6">
                        SAÉ associée&nbsp;:
                    </Heading>
                    <List>
                        {currentModule.associatedSae?.map((sae) => (
                            <ListItem key={sae}>{sae}</ListItem>
                        ))}
                        {currentModule.associatedSae?.length === 0 && (
                            <span>Aucune SAÉ pour ce module</span>
                        )}
                    </List>


                    {/* Coefficients */}
                    <div className="mt-6">
                        <Heading level={4} className="mb-2">
                            Coefficients des compétences&nbsp;:
                        </Heading>
                        <List>
                            {coefficients?.map((coefficient) => (
                                <ListItem
                                    key={coefficient.competenceName}> {coefficient.competenceName}&nbsp;:&nbsp;<span
                                    className="italic"> {coefficient.value}</span></ListItem>
                            ))}
                        </List>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
