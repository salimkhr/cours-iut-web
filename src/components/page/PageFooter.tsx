'use client'
import {FooterSvg} from "@/components/FooterSvg";
import {useEffect, useState} from "react";

interface PageFooterProps {
    path?: string;
}

export default function PageFooter({path}: PageFooterProps) {

    const variableName = `--color-${path}`;

    const [color, setColor] = useState<string>("");

    useEffect(() => {
        const root = getComputedStyle(document.documentElement);
        const value = root.getPropertyValue(variableName).trim();
        setColor(value);
    }, [variableName]);

    return (
        <div className="opacity-0 animate-fade-in z-0" style={{animationDelay: '0.5s',marginBottom:'45px', marginTop:'-300px'}}>
            <FooterSvg size={700} color={color}/>
        </div>
    );
}