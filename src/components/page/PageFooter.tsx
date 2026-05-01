'use client'
import {FooterSvg} from "@/components/FooterSvg";
import {useMemo} from "react";
import {useMounted} from "@/hook/useMounted";

interface PageFooterProps {
    path?: string;
}

export default function PageFooter({path}: PageFooterProps) {
    const mounted = useMounted();

    const color = useMemo(() => {
        if (!mounted || typeof window === 'undefined') return "";
        const root = getComputedStyle(document.documentElement);
        return root.getPropertyValue(`--color-${path}`).trim();
    }, [mounted, path]);

    return (
        <div className="hidden md:block opacity-0 animate-fade-in z-0" style={{animationDelay: '0.5s',marginBottom:'45px', marginTop:'-300px'}}>
            <FooterSvg size={700} color={color}/>
        </div>
    );
}