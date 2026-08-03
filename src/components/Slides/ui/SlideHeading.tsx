'use client';
import React from 'react';
import Heading from "@/components/ui/Heading";
import {cn} from "@/lib/utils";
import {slideTextSizes} from "@/components/Slides/ui/config/slideConfig";

type SlideHeadingProps = React.ComponentProps<typeof Heading>

export const SlideHeading: React.FC<SlideHeadingProps> = ({
                                                              className,
                                                              level = 2,
                                                              children,
                                                              ...props
                                                          }) => {
    // Le niveau 1 peut être surchargé par SlideScreen selon la DA du deck.
    const styles: Record<number, string> = {
        1: slideTextSizes.heading[1],
        2: `${slideTextSizes.heading[2]} text-brand-dark dark:text-brand-light`,
        3: `${slideTextSizes.heading[3]} text-bridge-600 dark:text-bridge-300`,
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
