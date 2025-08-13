"use client";

import Link from "next/link";
import Heading from "@/components/ui/Heading";
import {List, ListItem} from "@/components/ui/List";
import Module from "@/types/module";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import {Table, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

interface ModuleInfoProps {
    currentModule: Module;
}

export default function ModuleInfo({currentModule}: ModuleInfoProps) {
    const coefficients = currentModule.coefficients?.filter((c) => c.value > 0);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className={`border-2 text-md  text-${currentModule.path}`}>
                    Voir les informations du module
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl p-0">
                <DialogHeader className="border-b-1 p-3">
                    <DialogTitle className="text-center">Informations sur le module</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                    {/* Équipe pédagogique */}
                    <div className="flex flex-col w-full">
                        <Heading level={4} className="mb-2">
                            Équipe pédagogique&nbsp;:
                        </Heading>
                        <div>
                          <span>
                            <Link
                                className={`text-${currentModule.path} border-b border-${currentModule.path}`}
                                href={`mailto:${currentModule.manager?.email}`}
                            >
                              M.{currentModule.manager?.firstName}{" "}
                                {currentModule.manager?.lastName}
                            </Link>
                            ,&nbsp;
                          </span>
                            {currentModule.instructors?.map((instructor) => (
                                <span key={instructor.email}>
                                  <Link
                                      className={`text-${currentModule.path} border-b border-${currentModule.path}`}
                                      href={`mailto:${instructor.email}`}
                                  >
                                    M.{instructor.firstName} {instructor.lastName}
                                  </Link>
                                </span>
                            ))}
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
                    </div>

                    {/* Coefficients */}
                    <div className="mt-6">
                        <Heading level={4} className="mb-2">
                            Coefficients des compétences&nbsp;:
                        </Heading>
                        <Table aria-label="Table des coefficients">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center">compétence</TableHead>
                                    <TableHead className="text-center">Coefficient</TableHead>
                                </TableRow>
                            </TableHeader>
                        </Table>
                        <List>
                            {coefficients?.map((coefficient) => (
                                <TableRow
                                    key={`value_${coefficient.competenceName}`}
                                >
                                    <TableCell>{coefficient.competenceName}</TableCell>
                                    <TableCell className="text-center">{coefficient.value}</TableCell>
                                </TableRow>
                            ))}
                        </List>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
