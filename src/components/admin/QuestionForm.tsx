"use client";

import {useEffect} from "react";
import {useFieldArray, useForm} from "react-hook-form";
import Question, {Difficulty, QuestionType} from "@/types/Question";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

export type QuestionFormData = Omit<Question, "_id" | "createdAt" | "updatedAt">;

interface QuestionFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "add" | "edit";
    question?: Question;
    onSubmit: (data: QuestionFormData) => void;
}

export default function QuestionForm({open, onOpenChange, mode, question, onSubmit}: QuestionFormProps) {
    const {register, handleSubmit, control, watch, setValue, reset, formState: {errors}} = useForm<QuestionFormData>({
        defaultValues: {
            text: "",
            type: "multiple-choice",
            choices: [{value: ""}, {value: ""}, {value: ""}, {value: ""}],
            correctAnswer: "",
            points: 1,
            timeLimit: undefined,
            explanation: "",
            difficulty: undefined,
        },
    });

    const type = watch("type");

    const {fields, append, remove} = useFieldArray({
        control,
        name: "choices",
    });

    useEffect(() => {
        if (mode === "edit" && question) {
            reset({
                text: question.text,
                type: question.type,
                choices: question.type === "multiple-choice" ? (question.choices || []) : [{value: ""}, {value: ""}, {value: ""}, {value: ""}],
                correctAnswer: question.correctAnswer,
                points: question.points,
                timeLimit: question.timeLimit,
                explanation: question.explanation || "",
                difficulty: question.difficulty,
            });
        } else if (mode === "add") {
            reset({
                text: "",
                type: "multiple-choice",
                choices: [{value: ""}, {value: ""}, {value: ""}, {value: ""}],
                correctAnswer: "",
                points: 1,
                timeLimit: undefined,
                explanation: "",
                difficulty: undefined
            });
        }
    }, [mode, question, reset]);

    // Ensure correctness linkage
    useEffect(() => {
        // Always keep choices as an array to satisfy RHF field array controller
        if (!watch("choices") || (watch("choices") as unknown as string[])?.length < 2) {
            setValue("choices", [{value: ""}, {value: ""}, {value: ""}, {value: ""}] as unknown as { value: string }[]);
        }
        // reset correctAnswer when type changes
        setValue("correctAnswer", "");
    }, [setValue, type, watch]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{mode === 'add' ? 'Ajouter une question' : 'Modifier une question'}</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Label>Texte (Markdown)</Label>
                            <Textarea rows={5} {...register('text', {required: 'Texte requis'})} />
                            {errors.text && <p className="text-red-500 text-xs">{errors.text.message}</p>}
                        </div>

                        <div>
                            <Label>Type</Label>
                            <Select
                                onValueChange={(v: QuestionType) => setValue('type', v)}
                                defaultValue={mode === 'edit' && question ? question.type : 'multiple-choice'}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sélectionner un type"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="multiple-choice">multiple-choice</SelectItem>
                                    <SelectItem value="true-false">true-false</SelectItem>
                                    <SelectItem value="short-answer">short-answer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Points</Label>
                            <Input type="number" step="1" min="0" {...register('points', {
                                required: 'Points requis',
                                valueAsNumber: true
                            })} />
                            {errors.points && <p className="text-red-500 text-xs">{errors.points.message}</p>}
                        </div>

                        <div>
                            <Label>Temps (sec, optionnel)</Label>
                            <Input type="number" step="1" min="0" {...register('timeLimit', {valueAsNumber: true})} />
                        </div>

                        <div>
                            <Label>Difficulté (optionnel)</Label>
                            <Select onValueChange={(v: Difficulty) => setValue('difficulty', v)}
                                    defaultValue={question?.difficulty}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Aucune"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">easy</SelectItem>
                                    <SelectItem value="medium">medium</SelectItem>
                                    <SelectItem value="hard">hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {type === 'multiple-choice' && (
                            <div className="md:col-span-2 space-y-2">
                                <Label>Choix de réponses</Label>
                                <div className="space-y-2">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex gap-2">
                                            <Input
                                                className="flex-1" {...register(`choices.${index}` as const, {required: true})} />
                                            <Button type="button" variant="outline" onClick={() => remove(index)}
                                                    disabled={fields.length <= 2}>Supprimer</Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" onClick={() => append({value: ""})}>Ajouter
                                        un
                                        choix</Button>
                                </div>
                                <div>
                                    <Label>Réponse correcte</Label>
                                    <Select onValueChange={(v: string) => setValue('correctAnswer', v)}
                                            defaultValue={question?.correctAnswer}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Sélectionner la bonne réponse"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(watch('choices') as unknown as string[] | undefined)?.filter(Boolean)?.map((c, i) => (
                                                <SelectItem key={i} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {type === 'true-false' && (
                            <div>
                                <Label>Réponse correcte</Label>
                                <Select onValueChange={(v: string) => setValue('correctAnswer', v)}
                                        defaultValue={question?.correctAnswer}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choisir"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">true</SelectItem>
                                        <SelectItem value="false">false</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {type === 'short-answer' && (
                            <div>
                                <Label>Réponse correcte</Label>
                                <Input {...register('correctAnswer', {required: 'Réponse requise'})} />
                                {errors.correctAnswer &&
                                    <p className="text-red-500 text-xs">{errors.correctAnswer.message}</p>}
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <Label>Explication (Markdown, optionnel)</Label>
                            <Textarea rows={4} {...register('explanation')} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                        <Button type="submit" variant="outline">{mode === 'add' ? 'Ajouter' : 'Enregistrer'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
