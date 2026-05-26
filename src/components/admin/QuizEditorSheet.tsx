'use client';

import {useEffect} from 'react';
import {Controller, useFieldArray, useForm} from 'react-hook-form';
import {ClipboardList, Plus, Trash2} from 'lucide-react';
import {Sheet, SheetContent} from '@/components/ui/sheet';
import AdminSheetHeader from '@/components/admin/AdminSheetHeader';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Checkbox} from '@/components/ui/checkbox';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {cn} from '@/lib/utils';
import Section from '@/types/Section';
import Module from '@/types/Module';
import {QuizQuestion, QuizQuestionType} from '@/types/Quiz';
import useAdminApi from '@/hook/admin/useAdminApi';
import Eyebrow from '@/components/admin/ui/Eyebrow';

interface QuizEditorSheetProps {
    section: Section;
    modData: Module;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type FormQuestion = {
    id: string;
    type: QuizQuestionType;
    text: string;
    choices: string[];
    correct: string;
    explanation: string;
};

type FormData = { questions: FormQuestion[] };

const inputCn = "bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45 focus-visible:ring-bridge-500/50";
const labelCn = "text-xs font-semibold text-brand-dark dark:text-bridge-200";

function deserializeCorrect(q: QuizQuestion): string {
    if (Array.isArray(q.correct)) return q.correct.join(',');
    if (typeof q.correct === 'boolean') return q.correct ? 'true' : 'false';
    return String(q.correct);
}

function serializeCorrect(type: QuizQuestionType, raw: string): number | number[] | boolean {
    if (type === 'truefalse') return raw === 'true';
    if (type === 'multi') return raw.split(',').map(Number).filter(n => !isNaN(n));
    return Number(raw);
}

export default function QuizEditorSheet({section, modData, open, onOpenChange}: QuizEditorSheetProps) {
    const {saveQuiz} = useAdminApi();

    const {register, handleSubmit, control, watch, reset} = useForm<FormData>({
        defaultValues: {questions: []},
    });

    const {fields, append, remove} = useFieldArray({control, name: 'questions'});

    useEffect(() => {
        if (open) {
            reset({
                questions: (section.quiz?.questions ?? []).map(q => ({
                    id: q.id,
                    type: q.type,
                    text: q.text,
                    choices: q.choices ?? [],
                    correct: deserializeCorrect(q),
                    explanation: q.explanation,
                })),
            });
        }
    }, [open, section, reset]);

    const onSubmit = async (data: FormData) => {
        const questions: QuizQuestion[] = data.questions.map(q => ({
            id: q.id || crypto.randomUUID(),
            type: q.type,
            text: q.text,
            choices: q.type !== 'truefalse' ? q.choices.filter(Boolean) : undefined,
            correct: serializeCorrect(q.type, q.correct),
            explanation: q.explanation,
        }));
        await saveQuiz(modData.path, section.path, questions);
        onOpenChange(false);
    };

    const addQuestion = () => {
        append({
            id: crypto.randomUUID(),
            type: 'mcq',
            text: '',
            choices: ['', '', '', ''],
            correct: '0',
            explanation: '',
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className={cn(
                    'p-0 gap-0 overflow-hidden flex flex-col sm:max-w-[600px]',
                    'bg-[#f7ebd9] dark:bg-[#13110d]',
                    'border-l border-bridge-500/45',
                    '[&>button]:text-white/80 [&>button:hover]:text-white dark:[&>button]:text-brand-dark/80 dark:[&>button:hover]:text-brand-dark',
                )}
            >
                <AdminSheetHeader
                    icon={ClipboardList}
                    eyebrow="Quiz"
                    title={`Quiz — ${section.title}`}
                    srDescription="Éditeur de questions du quiz"
                    className="bg-brand-primary"
                />

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                        {fields.length === 0 && (
                            <p className="text-sm text-brand-dark/50 dark:text-bridge-300/50 text-center py-6">
                                Aucune question. Cliquez sur &quot;Ajouter une question&quot; pour commencer.
                            </p>
                        )}

                        {fields.map((field, index) => {
                            const type = watch(`questions.${index}.type`);
                            const choices = watch(`questions.${index}.choices`) ?? [];

                            return (
                                <section key={field.id} className="flex flex-col gap-3 rounded-lg border border-bridge-500/30 p-4">
                                    <div className="flex items-center justify-between">
                                        <Eyebrow>Question {index + 1}</Eyebrow>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-red-400 hover:text-red-600"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5"/>
                                        </Button>
                                    </div>

                                    <div>
                                        <Label className={labelCn}>Type</Label>
                                        <select
                                            className={cn(inputCn, 'w-full rounded-md border px-3 py-2 text-sm')}
                                            {...register(`questions.${index}.type`)}
                                        >
                                            <option value="mcq">QCM (une réponse)</option>
                                            <option value="multi">Multi-choix</option>
                                            <option value="truefalse">Vrai / Faux</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label className={labelCn}>Énoncé *</Label>
                                        <Textarea
                                            className={inputCn}
                                            {...register(`questions.${index}.text`, {required: true})}
                                        />
                                    </div>

                                    {(type === 'mcq' || type === 'multi') && (
                                        <div className="flex flex-col gap-2">
                                            <Label className={labelCn}>Choix</Label>
                                            {choices.map((_, ci) => (
                                                <Input
                                                    key={ci}
                                                    className={inputCn}
                                                    placeholder={`Choix ${ci + 1}`}
                                                    {...register(`questions.${index}.choices.${ci}`)}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {type === 'mcq' && choices.filter(Boolean).length > 0 && (
                                        <div>
                                            <Label className={labelCn}>Réponse correcte</Label>
                                            <Controller
                                                control={control}
                                                name={`questions.${index}.correct`}
                                                render={({field: f}) => (
                                                    <RadioGroup
                                                        value={f.value}
                                                        onValueChange={f.onChange}
                                                        className="flex flex-col gap-1 mt-1"
                                                    >
                                                        {choices.map((c, ci) =>
                                                            c ? (
                                                                <div key={ci} className="flex items-center gap-2">
                                                                    <RadioGroupItem value={String(ci)} id={`q${index}-c${ci}`}/>
                                                                    <Label htmlFor={`q${index}-c${ci}`} className="text-xs">{c}</Label>
                                                                </div>
                                                            ) : null
                                                        )}
                                                    </RadioGroup>
                                                )}
                                            />
                                        </div>
                                    )}

                                    {type === 'multi' && choices.filter(Boolean).length > 0 && (
                                        <div>
                                            <Label className={labelCn}>Réponses correctes</Label>
                                            <Controller
                                                control={control}
                                                name={`questions.${index}.correct`}
                                                render={({field: f}) => {
                                                    const selected = f.value ? f.value.split(',').map(Number) : [];
                                                    return (
                                                        <div className="flex flex-col gap-1 mt-1">
                                                            {choices.map((c, ci) =>
                                                                c ? (
                                                                    <div key={ci} className="flex items-center gap-2">
                                                                        <Checkbox
                                                                            id={`q${index}-m${ci}`}
                                                                            checked={selected.includes(ci)}
                                                                            onCheckedChange={(chk) => {
                                                                                const next = chk
                                                                                    ? [...selected, ci]
                                                                                    : selected.filter(i => i !== ci);
                                                                                f.onChange(next.sort().join(','));
                                                                            }}
                                                                        />
                                                                        <Label htmlFor={`q${index}-m${ci}`} className="text-xs">{c}</Label>
                                                                    </div>
                                                                ) : null
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </div>
                                    )}

                                    {type === 'truefalse' && (
                                        <div>
                                            <Label className={labelCn}>Réponse correcte</Label>
                                            <Controller
                                                control={control}
                                                name={`questions.${index}.correct`}
                                                render={({field: f}) => (
                                                    <RadioGroup
                                                        value={f.value}
                                                        onValueChange={f.onChange}
                                                        className="flex gap-4 mt-1"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <RadioGroupItem value="true" id={`q${index}-true`}/>
                                                            <Label htmlFor={`q${index}-true`} className="text-xs">Vrai</Label>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <RadioGroupItem value="false" id={`q${index}-false`}/>
                                                            <Label htmlFor={`q${index}-false`} className="text-xs">Faux</Label>
                                                        </div>
                                                    </RadioGroup>
                                                )}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <Label className={labelCn}>Explication *</Label>
                                        <Textarea
                                            className={inputCn}
                                            placeholder="Explication affichée après la réponse de l'étudiant"
                                            {...register(`questions.${index}.explanation`, {required: true})}
                                        />
                                    </div>
                                </section>
                            );
                        })}

                        <Button
                            type="button"
                            variant="ghost"
                            className="self-start gap-2 text-bridge-600 dark:text-bridge-300 hover:text-bridge-800"
                            onClick={addQuestion}
                        >
                            <Plus className="w-4 h-4"/>
                            Ajouter une question
                        </Button>
                    </div>

                    <div className="shrink-0 border-t border-bridge-700/20 dark:border-bridge-500/20 px-6 py-4 flex items-center justify-between gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-brand-dark dark:text-bridge-200"
                            onClick={() => onOpenChange(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="bg-brand-primary text-white dark:text-brand-dark hover:bg-brand-accent-dark dark:hover:bg-brand-primary/80"
                        >
                            Enregistrer
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
