"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ZapIconHandle { startAnimation: () => void; stopAnimation: () => void; }
interface ZapIconProps extends HTMLAttributes<HTMLDivElement> { size?: number; }

const PATH: Variants = { normal: { opacity: 1, pathLength: 1, transition: { duration: 0.6, opacity: { duration: 0.1 } } }, animate: { opacity: [0, 1], pathLength: [0, 1], transition: { duration: 0.6, opacity: { duration: 0.1 } } } };

const ZapIcon = forwardRef<ZapIconHandle, ZapIconProps>(
    ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
        const controls = useAnimation();
        const controlled = useRef(false);
        useImperativeHandle(ref, () => { controlled.current = true; return { startAnimation: () => controls.start("animate"), stopAnimation: () => controls.start("normal") }; });
        const enter = useCallback((e: React.MouseEvent<HTMLDivElement>) => { if (controlled.current) onMouseEnter?.(e); else controls.start("animate"); }, [controls, onMouseEnter]);
        const leave = useCallback((e: React.MouseEvent<HTMLDivElement>) => { if (controlled.current) onMouseLeave?.(e); else controls.start("normal"); }, [controls, onMouseLeave]);
        return (
            <div className={cn(className)} onMouseEnter={enter} onMouseLeave={leave} {...props}>
                <svg fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size} xmlns="http://www.w3.org/2000/svg">
                    <motion.path animate={controls} d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" variants={PATH} />
                </svg>
            </div>
        );
    }
);
ZapIcon.displayName = "ZapIcon";
export { ZapIcon };
