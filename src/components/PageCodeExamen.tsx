'use client'
import {ArrowRight, Check, ShieldCheck, X} from "lucide-react";
import {Input} from "@/components/ui/input";
import Heading from "@/components/ui/Heading";
import BaseCard from "@/components/Cards/BaseCard";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";

interface PageCodeExamenProps {
    moduleSlug: string;
    sectionSlug: string;
}

/**
 * Saisie du code d'un examen verrouillé. La vérification est faite par le serveur
 * (`/api/examen/unlock`), qui pose un cookie d'accès ; la page, rechargée, rend alors l'énoncé.
 * Avant cela, l'énoncé n'est jamais envoyé au navigateur.
 */
export default function PageCodeExamen({moduleSlug, sectionSlug}: PageCodeExamenProps) {
    const router = useRouter();
    const [code, setCode] = useState<string>('');
    const [isValidating, setIsValidating] = useState<boolean>(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [error, setError] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
        setCode(value);
        setError('');
        setIsValid(null);
    };

    const handleSubmit = async () => {
        if (code.length !== 6) {
            setError('Le code doit contenir 6 caractères');
            return;
        }

        setIsValidating(true);
        setError('');

        let valid = false;
        try {
            const res = await fetch('/api/examen/unlock', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({moduleSlug, sectionSlug, code}),
            });
            valid = res.ok;
            if (res.status === 429) {
                const {retryAfter} = await res.json().catch(() => ({retryAfter: 0})) as {retryAfter?: number};
                const minutes = Math.max(1, Math.ceil((retryAfter ?? 0) / 60));
                setError(`Trop de tentatives : réessayez dans ${minutes} min`);
                setIsValidating(false);
                return;
            }
            if (!valid && res.status !== 403) {
                setError('Vérification impossible, réessayez');
                setIsValidating(false);
                return;
            }
        } catch {
            setError('Vérification impossible, réessayez');
            setIsValidating(false);
            return;
        }

        setIsValid(valid);
        setIsValidating(false);

        if (!valid) {
            setError('Code incorrect');
            setTimeout(() => {
                setCode('');
                setIsValid(null);
                setError('');
            }, 1500);
        } else {
            // Le cookie d'accès est posé : le rendu serveur renvoie désormais l'énoncé.
            router.refresh();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && code.length === 6) {
            handleSubmit();
        }
    };

    return (
        <div className="flex items-center justify-center p-6 w-full">
            <BaseCard
                header={
                    <div className="flex items-center justify-center gap-3 w-full">
                        <ShieldCheck className="h-6 w-6 text-white"/>
                        <span className="text-white font-medium uppercase tracking-wide text-sm">
                            Accès sécurisé
                        </span>
                    </div>
                }
                content={
                    <div className="flex flex-col items-center gap-6 w-full px-8">
                        <Heading level={1} className="text-2xl lg:text-3xl text-center">
                            Accéder à l&apos;examen
                        </Heading>

                        <p className="text-muted-foreground text-center max-w-xl">
                            Un code d&apos;accès à 6 caractères est requis pour continuer.
                        </p>

                        <div className="w-full max-w-md space-y-4">
                            <Input
                                value={code}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Entrez le code"
                                className={`h-14 text-lg tracking-widest text-center uppercase rounded-xl 
                                    focus:ring-2 focus:ring-primary/50 transition-all
                                    ${isValid === false ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''}
                                    ${isValid === true ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}
                                `}
                                disabled={isValidating || isValid === true}
                                maxLength={6}
                                autoComplete="off"
                            />

                            {/* Status messages */}
                            {error && (
                                <div
                                    className="flex items-center justify-center gap-2 text-red-600 text-sm font-medium">
                                    <X className="w-4 h-4"/>
                                    <span>{error}</span>
                                </div>
                            )}

                            {isValid === true && (
                                <div
                                    className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
                                    <Check className="w-4 h-4"/>
                                    <span>Code validé avec succès</span>
                                </div>
                            )}
                        </div>

                        {/* Submit button */}
                        <Button
                            variant="outline"
                            onClick={handleSubmit}
                            disabled={code.length !== 6 || isValidating || isValid === true}
                            className={`
                                w-full max-w-md py-3.5 rounded-xl font-medium text-sm
                                flex items-center justify-center gap-2
                                transition-all duration-200
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${code.length === 6 && !isValidating && isValid !== true
                                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow'
                                : 'bg-muted text-muted-foreground'
                            }
                            `}
                        >
                            {isValidating ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    Vérification...
                                </>
                            ) : (
                                <>
                                    Déverrouiller le module
                                    <ArrowRight className="h-4 w-4"/>
                                </>
                            )}
                        </Button>
                    </div>
                }
                withLed={true}
                withHover={false}
            />
        </div>
    );
}