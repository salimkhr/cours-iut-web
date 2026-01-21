'use client';
import React from 'react';
import Text from "@/components/ui/Text";
import {cn} from "@/lib/utils";
import {slideTextSizes, TextSize} from "@/components/Slides/ui/config/slideConfig";

interface SlideTextProps extends React.ComponentProps<typeof Text> {
    size?: TextSize;
}

export const SlideText: React.FC<SlideTextProps> = ({
                                                        className,
                                                        size = "default",
                                                        children,
                                                        ...props
                                                    }) => {
    return (
        <Text
            className={cn(
                slideTextSizes.text[size],
                "leading-relaxed mb-4",
                className
            )}
            {...props}
        >
            {children}
        </Text>
    );
};