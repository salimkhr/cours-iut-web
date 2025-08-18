import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Code from "@/components/ui/Code";

export default function Cours() {
    return (
        <div className="mx-auto p-6">
            <section>
                <p>
                    <strong>Brainfuck</strong> est un langage minimaliste et ésotérique créé par Urban Müller en
                    1993. Il se compose uniquement de <strong>8 commandes</strong>, mais permet de réaliser des
                    programmes complets.
                </p>
                <p>Objectifs du cours :</p>
                <ul className="list-disc list-inside">
                    <li>Comprendre la logique de Brainfuck</li>
                    <li>Manipuler le pointeur et les cellules mémoire</li>
                    <li>Écrire vos premiers programmes simples</li>
                </ul>
            </section>

            {/* Commandes */}
            <section className="space-y-2">
                <Heading level={3}>Les 8 commandes de Brainfuck</Heading>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Commande</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><Code>{">"}</Code></TableCell>
                            <TableCell>Déplace le pointeur vers la cellule
                                suivante</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{"<"}</Code></TableCell>
                            <TableCell>Déplace le pointeur vers la cellule
                                précédente</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{"+"}</Code></TableCell>
                            <TableCell>Incrémente la valeur de la cellule
                                courante</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{"-"}</Code></TableCell>
                            <TableCell>Décrémente la valeur de la cellule
                                courante</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{"."}</Code></TableCell>
                            <TableCell>Affiche le caractère ASCII correspondant à la
                                cellule
                                courante
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{","}</Code></TableCell>
                            <TableCell>Lit un caractère depuis l’entrée et le stocke
                                dans la
                                cellule courante
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{"["}</Code></TableCell>
                            <TableCell>Début d’une boucle (tant que la cellule courante
                                ≠ 0)
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{"]"}</Code></TableCell>
                            <TableCell>Fin d’une boucle</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </section>

            {/* Exemple Hello World */}
            <section className="space-y-2">
                <Heading level={3}>Exemple : Hello World</Heading>
                <CodeCard
                    language="brainfuck"
                    filename="hello.bf"
                >
                    {`++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.`}
                </CodeCard>
            </section>
        </div>
    );
}