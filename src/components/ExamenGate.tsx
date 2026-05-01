'use client'
import {useState} from "react";
import Module from "@/types/Module";
import PageCodeExamen from "@/components/PageCodeExamen";
import {useMounted} from "@/hook/useMounted";

interface ExamenGateProps {
    currentModule: Module;
    children: React.ReactNode;
}

export default function ExamenGate({currentModule, children}: ExamenGateProps) {
    const mounted = useMounted();
    const [unlocked, setUnlocked] = useState(false);

    const examKey = `exam_unlocked_${currentModule._id?.toString()}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

    if (!mounted) {
        return <div className="flex items-center justify-center p-6">Chargement...</div>;
    }

    const isUnlocked = unlocked || sessionStorage.getItem(examKey) === 'true';

    if (!isUnlocked) {
        return <PageCodeExamen currentModule={currentModule} onSuccess={() => setUnlocked(true)} examKey={examKey}/>;
    }

    return <>{children}</>;
}
