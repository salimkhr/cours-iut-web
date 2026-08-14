"use client";

import {useState} from "react";
import type Module from "@/types/Module";
import StepStrip from "@/components/admin/module-workflow/StepStrip";
import WorkflowStep from "@/components/admin/module-workflow/WorkflowStep";
import {currentStepId, moduleSteps, type StepId} from "@/lib/pedagogy/moduleProgress";

interface ModuleWorkflowProps {
    module: Module;
}

export default function ModuleWorkflow({module}: ModuleWorkflowProps) {
    const steps = moduleSteps(module);
    const [openStep, setOpenStep] = useState<StepId>(currentStepId(module));

    return (
        <div className="flex flex-col gap-6">
            <StepStrip steps={steps} currentId={openStep} onSelect={setOpenStep}/>
            <div className="flex flex-col gap-3">
                {steps.map((step) => (
                    <WorkflowStep
                        key={step.id}
                        label={step.label}
                        state={step.state}
                        open={openStep === step.id}
                        onOpenChange={(open) => setOpenStep(open ? step.id : openStep)}
                    >
                        <p className="text-sm text-bridge-600 dark:text-bridge-300">
                            Étape « {step.label} » — contenu à venir.
                        </p>
                    </WorkflowStep>
                ))}
            </div>
        </div>
    );
}
