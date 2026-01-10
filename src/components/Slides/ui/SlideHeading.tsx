'use client';
import React from 'react';
import Heading from "@/components/ui/Heading";
import {cn} from "@/lib/utils";

interface SlideHeadingProps extends React.ComponentProps<typeof Heading> {
}

export const SlideHeading: React.FC<SlideHeadingProps> = ({ 
  className, 
  level = 2,
  children, 
  ...props 
}) => {
  const styles: Record<number, string> = {
    1: "text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-primary",
    2: "text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 text-secondary-foreground",
    3: "text-3xl md:text-4xl lg:text-5xl font-medium mb-4 text-muted-foreground",
  };

  return (
    <Heading 
      level={level}
      className={cn(
        styles[level] || styles[2],
        "mt-0", // Reset default margins
        className
      )} 
      {...props}
    >
      {children}
    </Heading>
  );
};
