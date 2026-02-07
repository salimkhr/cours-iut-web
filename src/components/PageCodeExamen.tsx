'use client'
import {ArrowRight, Check, ShieldCheck, X} from "lucide-react";
import {Input} from "@/components/ui/input";
import Heading from "@/components/ui/Heading";
import BaseCard from "@/components/Cards/BaseCard";
import Module from "@/types/Module";
import {useState} from "react";
import {Button} from "@/components/ui/button";

interface PageCodeExamenProps {
    currentModule: Module;
    onSuccess?: () => void;
    examKey: string;
}

export default function PageCodeExamen({currentModule, onSuccess, examKey}: PageCodeExamenProps) {
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

        // Simulation de la validation
        await new Promise(resolve => setTimeout(resolve, 1000));

        const validCode = currentModule._id?.toString().slice(-6).toUpperCase() || '';
        const valid = code === validCode;

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
            // Stocker dans sessionStorage que l'examen est débloqué pour ce module
            sessionStorage.setItem(examKey, 'true');

            // Appeler le callback de succès après un court délai
            setTimeout(() => {
                onSuccess?.();
            }, 1000);
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
                            Accéder à l'examen
                        </Heading>

                        <p className="text-muted-foreground text-center max-w-xl">
                            Un code d'accès à 6 caractères est requis pour continuer.
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