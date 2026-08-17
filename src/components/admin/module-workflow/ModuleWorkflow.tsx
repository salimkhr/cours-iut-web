"use client";

import {useState} from "react";
import type Module from "@/types/Module";
import StepStrip from "@/components/admin/module-workflow/StepStrip";
import WorkflowStep from "@/components/admin/module-workflow/WorkflowStep";
import CadrageStep from "@/components/admin/module-workflow/steps/CadrageStep";
import NotionsStep from "@/components/admin/module-workflow/steps/NotionsStep";
import ProjetStep from "@/components/admin/module-workflow/steps/ProjetStep";
import ReferenceStep from "@/components/admin/module-workflow/steps/ReferenceStep";
import SectionsStep from "@/components/admin/module-workflow/steps/SectionsStep";
import {currentStepId, moduleSteps, type StepId} from "@/lib/pedagogy/moduleProgress";
import {MODULE_STEP_PROMPTS} from "@/lib/pedagogy/stepPrompts";

interface ModuleWorkflowProps {
    module: Module;
}

export default function ModuleWorkflow({module: initialModule}: ModuleWorkflowProps) {
    const [module, setModule] = useState(initialModule);
    const steps = moduleSteps(module);
    const [activeStepId, setActiveStepId] = useState<StepId>(currentStepId(module));
    const activeStep = steps.find((step) => step.id === activeStepId) ?? steps[0];
    const activePrompt = MODULE_STEP_PROMPTS.find((prompt) => prompt.stepId === activeStep.id);

    const handleSaved = (patch: Partial<Module>) => {
        setModule((prev) => ({...prev, ...patch}));
    };

    return (
        <div className="flex flex-col gap-6">
            <StepStrip steps={steps} currentId={activeStepId} onSelect={setActiveStepId}/>
            <WorkflowStep
                label={activeStep.label}
                state={activeStep.state}
                promptId={activePrompt?.id}
                promptDescription={activePrompt?.description}
            >
                {activeStep.id === "cadrage" && <CadrageStep module={module} onSaved={handleSaved}/>}
                {activeStep.id === "notions" && <NotionsStep module={module} onSaved={handleSaved}/>}
                {activeStep.id === "projet" && <ProjetStep module={module} onSaved={handleSaved}/>}
                {activeStep.id === "reference" && <ReferenceStep module={module} onSaved={handleSaved}/>}
                {activeStep.id === "sections" && <SectionsStep module={module} onSaved={handleSaved}/>}
            </WorkflowStep>
        </div>
    );
}
