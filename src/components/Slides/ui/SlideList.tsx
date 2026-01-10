'use client';
import React from 'react';
import {List, ListItem} from "@/components/ui/List";
import {cn} from "@/lib/utils";

interface SlideListProps extends React.ComponentProps<typeof List> {
  size?: "default" | "large";
}

export const SlideList: React.FC<SlideListProps> = ({ 
  className, 
  size = "default", 
  children, 
  spacing = "relaxed",
  ...props 
}) => {
  return (
    <List 
      className={cn(
        "pl-10 mb-6",
        className
      )} 
      spacing={spacing}
      {...props}
    >
      {children}
    </List>
  );
};

interface SlideListItemProps extends React.ComponentProps<typeof ListItem> {
  size?: "default" | "large";
}

export const SlideListItem: React.FC<SlideListItemProps> = ({ 
  className, 
  size = "default", 
  children, 
  ...props 
}) => {
  const sizeClasses = {
    default: "text-2xl md:text-3xl lg:text-4xl",
    large: "text-3xl md:text-4xl lg:text-5xl",
  };

  return (
    <ListItem 
      className={cn(
        sizeClasses[size],
        "leading-relaxed mb-2",
        className
      )} 
      {...props}
    >
      {children}
    </ListItem>
  );
};
