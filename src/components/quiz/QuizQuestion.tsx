"use client";

import {useState} from "react";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {QuizAnswer, QuizQuestionClient} from "@/types/Quiz";

interface QuizQuestionProps {
    question: QuizQuestionClient;
    onAnswer: (answer: QuizAnswer) => void;
    disabled?: boolean;
}

export default function QuizQuestion({question, onAnswer, disabled}: QuizQuestionProps) {
    const [radioValue, setRadioValue] = useState<string | undefined>(undefined);
    const [multiSelected, setMultiSelected] = useState<number[]>([]);

    if (question.type === "mcq") {
        return (
            <RadioGroup
                disabled={disabled}
                value={radioValue}
                onValueChange={(val) => {
                    setRadioValue(val);
                    onAnswer(Number(val));
                }}
                className="flex flex-col gap-3"
            >
                {(question.choices ?? []).map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <RadioGroupItem value={String(idx)} id={`${question.id}-${idx}`} disabled={disabled}/>
                        <Label htmlFor={`${question.id}-${idx}`} className="text-sm cursor-pointer">{opt}</Label>
                    </div>
                ))}
            </RadioGroup>
        );
    }

    if (question.type === "truefalse") {
        return (
            <RadioGroup
                disabled={disabled}
                value={radioValue}
                onValueChange={(val) => {
                    setRadioValue(val);
                    onAnswer(val === "true");
                }}
                className="flex flex-col gap-3"
            >
                <div className="flex items-center gap-3">
                    <RadioGroupItem value="true" id={`${question.id}-true`} disabled={disabled}/>
                    <Label htmlFor={`${question.id}-true`} className="text-sm cursor-pointer">Vrai</Label>
                </div>
                <div className="flex items-center gap-3">
                    <RadioGroupItem value="false" id={`${question.id}-false`} disabled={disabled}/>
                    <Label htmlFor={`${question.id}-false`} className="text-sm cursor-pointer">Faux</Label>
                </div>
            </RadioGroup>
        );
    }

    // multi
    return (
        <div className="flex flex-col gap-3">
            {(question.choices ?? []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                    <Checkbox
                        id={`${question.id}-${idx}`}
                        disabled={disabled}
                        checked={multiSelected.includes(idx)}
                        onCheckedChange={(checked) => {
                            const next = checked
                                ? [...multiSelected, idx]
                                : multiSelected.filter(i => i !== idx);
                            setMultiSelected(next);
                            onAnswer(next);
                        }}
                    />
                    <Label htmlFor={`${question.id}-${idx}`} className="text-sm cursor-pointer">{opt}</Label>
                </div>
            ))}
        </div>
    );
}
