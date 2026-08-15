"use client";

import {useState} from "react";
import type Module from "@/types/Module";
import StepStrip from "@/components/admin/module-workflow/StepStrip";
import WorkflowStep from "@/components/admin/module-workflow/WorkflowStep";
import BriefsStep from "@/components/admin/module-workflow/steps/BriefsStep";
import CadrageStep from "@/components/admin/module-workflow/steps/CadrageStep";
import NotionsStep from "@/components/admin/module-workflow/steps/NotionsStep";
import ProjetStep from "@/components/admin/module-workflow/steps/ProjetStep";
import ReferenceStep from "@/components/admin/module-workflow/steps/ReferenceStep";
import ReglagesStep from "@/components/admin/module-workflow/steps/ReglagesStep";
import SectionsStep from "@/components/admin/module-workflow/steps/SectionsStep";
import {currentStepId, moduleSteps, type StepId} from "@/lib/pedagogy/moduleProgress";

interface ModuleWorkflowProps {
    module: Module;
}

export default function ModuleWorkflow({module: initialModule}: ModuleWorkflowProps) {
    const [module, setModule] = useState(initialModule);
    const steps = moduleSteps(module);
    const [openStep, setOpenStep] = useState<StepId>(currentStepId(module));

    const handleSaved = (patch: Partial<Module>) => {
        setModule((prev) => ({...prev, ...patch}));
    };

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
                        {step.id === "cadrage" && <CadrageStep module={module} onSaved={handleSaved}/>}
                        {step.id === "notions" && <NotionsStep module={module} onSaved={handleSaved}/>}
                        {step.id === "projet" && <ProjetStep module={module} onSaved={handleSaved}/>}
                        {step.id === "reference" && <ReferenceStep module={module} onSaved={handleSaved}/>}
                        {step.id === "sections" && <SectionsStep module={module} onSaved={handleSaved}/>}
                        {step.id === "briefs" && <BriefsStep module={module} onSaved={handleSaved}/>}
                        {step.id === "reglages" && <ReglagesStep module={module} onSaved={handleSaved}/>}
                    </WorkflowStep>
                ))}
            </div>
        </div>
    );
}
