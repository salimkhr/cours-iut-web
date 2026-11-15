"use client";

import {useState, type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {normalizeJoinCode, SHORT_CODE_LENGTH} from "@/lib/quiz/joinCode";

/** Mode ordinateur : le code affiché sous le QR remplace le scan. */
export default function JoinCodeForm() {
    const router = useRouter();
    const [value, setValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const code = normalizeJoinCode(value);
        if (!code) {
            setError(`Saisissez le code de ${SHORT_CODE_LENGTH} caractères affiché au tableau.`);
            return;
        }
        setError(null);
        setSending(true);
        router.push(`/quiz/${encodeURIComponent(code)}`);
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <Label htmlFor="quiz-code" className="text-base font-semibold">Code du quiz</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                    id="quiz-code"
                    name="code"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    placeholder="ABC234"
                    aria-invalid={error !== null}
                    aria-describedby="quiz-code-help"
                    className="h-14 flex-1 text-center text-3xl font-extrabold uppercase tracking-[0.3em] tabular-nums placeholder:tracking-[0.3em] placeholder:opacity-40 md:text-3xl"
                />
                <Button type="submit" size="lg" className="h-14 px-8 text-base" disabled={sending || value.trim() === ""}>
                    {sending ? "Connexion…" : "Rejoindre"}
                </Button>
            </div>
            <p
                id="quiz-code-help"
                role={error ? "alert" : undefined}
                className={error ? "text-sm font-semibold text-destructive" : "text-sm text-bridge-600 dark:text-bridge-300"}
            >
                {error ?? "Le code est affiché sous le QR code, au tableau. Les majuscules ne comptent pas."}
            </p>
        </form>
    );
}
