'use client';

import {useState} from 'react';
import {ChevronDown, ChevronUp} from 'lucide-react';
import ModuleCard from '@/components/Cards/ModuleCard';
import type Module from '@/types/Module';

type Props = {
    modules: (Module & { _id: string })[];
};

export default function ExtraModulesSection({ modules }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <div className="w-full px-6 lg:pl-12 lg:pr-6 mt-2 mb-8 flex flex-col items-center gap-4">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-primary dark:text-brand-primary-200/60 hover:text-brand-dark dark:hover:text-bridge-100 transition-colors"
            >
                {open
                    ? <><ChevronUp className="w-3.5 h-3.5" /> Voir moins</>
                    : <><ChevronDown className="w-3.5 h-3.5" /> Voir plus</>
                }
            </button>

            {open && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
                    {modules.map((currentModule, index) => (
                        <div
                            key={`${currentModule.path}_extra_${index}`}
                            className="opacity-0 animate-fade-in-up w-full"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <ModuleCard currentModule={currentModule} isAuthed={true} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
