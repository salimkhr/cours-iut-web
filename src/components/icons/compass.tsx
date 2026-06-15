"use client";

import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface CompassIconHandle { startAnimation: () => void; stopAnimation: () => void; }
interface CompassIconProps extends HTMLAttributes<HTMLDivElement> { size?: number; }

const CompassIcon = forwardRef<CompassIconHandle, CompassIconProps>(
    ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
        const controls = useAnimation();
        const controlled = useRef(false);
        useImperativeHandle(ref, () => { controlled.current = true; return { startAnimation: () => controls.start("animate"), stopAnimation: () => controls.start("normal") }; });
        const enter = useCallback((e: React.MouseEvent<HTMLDivElement>) => { if (controlled.current) onMouseEnter?.(e); else controls.start("animate"); }, [controls, onMouseEnter]);
        const leave = useCallback((e: React.MouseEvent<HTMLDivElement>) => { if (controlled.current) onMouseLeave?.(e); else controls.start("normal"); }, [controls, onMouseLeave]);
        return (
            <div className={cn(className)} onMouseEnter={enter} onMouseLeave={leave} {...props}>
                <svg fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size} xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" />
                    <motion.polygon animate={controls} points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" transition={{ type: "spring", stiffness: 120, damping: 15 }} variants={{ normal: { rotate: 0 }, animate: { rotate: 360 } }} />
                </svg>
            </div>
        );
    }
);
CompassIcon.displayName = "CompassIcon";
export { CompassIcon };
