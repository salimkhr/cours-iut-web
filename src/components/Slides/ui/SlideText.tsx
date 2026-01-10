'use client';
import React from 'react';
import Text from "@/components/ui/Text";
import {cn} from "@/lib/utils";

interface SlideTextProps extends React.ComponentProps<typeof Text> {
  size?: "default" | "large" | "xl";
}

export const SlideText: React.FC<SlideTextProps> = ({ 
  className, 
  size = "default", 
  children, 
  ...props 
}) => {
  const sizeClasses = {
    default: "text-2xl md:text-3xl lg:text-4xl",
    large: "text-3xl md:text-4xl lg:text-5xl",
    xl: "text-4xl md:text-5xl lg:text-6xl",
  };

  return (
    <Text 
      className={cn(
        sizeClasses[size],
        "leading-relaxed mb-4",
        className
      )} 
      {...props}
    >
      {children}
    </Text>
  );
};
