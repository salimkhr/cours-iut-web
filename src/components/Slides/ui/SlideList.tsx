'use client';
import React from 'react';
import {List, ListItem} from "@/components/ui/List";
import {cn} from "@/lib/utils";
import {slideTextSizes, TextSize} from "@/components/Slides/ui/config/slideConfig";

interface SlideListProps extends React.ComponentProps<typeof List> {
    size?: TextSize;
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
    size?: TextSize;
}

export const SlideListItem: React.FC<SlideListItemProps> = ({
                                                                className,
                                                                size = "default",
                                                                children,
                                                                ...props
                                                            }) => {
    return (
        <ListItem
            className={cn(
                slideTextSizes.text[size],
                "leading-relaxed mb-2",
                className
            )}
            {...props}
        >
            {children}
        </ListItem>
    );
};