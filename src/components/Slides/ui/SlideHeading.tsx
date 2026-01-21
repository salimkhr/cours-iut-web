'use client';
import React from 'react';
import Heading from "@/components/ui/Heading";
import {cn} from "@/lib/utils";
import {slideTextSizes} from "@/components/Slides/ui/config/slideConfig";

interface SlideHeadingProps extends React.ComponentProps<typeof Heading> {
}

export const SlideHeading: React.FC<SlideHeadingProps> = ({
                                                              className,
                                                              level = 2,
                                                              children,
                                                              ...props
                                                          }) => {
    const styles: Record<number, string> = {
        1: `${slideTextSizes.heading[1]} text-primary`,
        2: `${slideTextSizes.heading[2]} text-secondary-foreground`,
        3: `${slideTextSizes.heading[3]} text-muted-foreground`,
    };

    return (
        <Heading
            level={level}
            className={cn(
                styles[level] || styles[2],
                "mt-0",
                className
            )}
            {...props}
        >
            {children}
        </Heading>
    );
};