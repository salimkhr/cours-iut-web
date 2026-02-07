'use client'
import {useEffect, useState} from "react";
import Module from "@/types/Module";
import PageCodeExamen from "@/components/PageCodeExamen";

interface ExamenGateProps {
    currentModule: Module;
    children: React.ReactNode;
}

export default function ExamenGate({currentModule, children}: ExamenGateProps) {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    const examKey = `exam_unlocked_${currentModule._id?.toString()}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;


    useEffect(() => {
        const unlocked = sessionStorage.getItem(examKey) === 'true';
        setIsUnlocked(unlocked);
        setIsChecking(false);
    }, [currentModule._id]);

    const handleUnlock = () => {
        setIsUnlocked(true);
    };

    if (isChecking) {
        return <div className="flex items-center justify-center p-6">Chargement...</div>;
    }

    if (!isUnlocked) {
        return <PageCodeExamen currentModule={currentModule} onSuccess={handleUnlock} examKey={examKey}/>;
    }

    return <>{children}</>;
}