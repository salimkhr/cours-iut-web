"use client"
import * as React from "react"

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"


import {BookOpen, BracesIcon, CodeXml, Home, LucideIcon, ServerCog} from "lucide-react";
import Link from "next/link";
import modules from "../../data/modules";

const iconMap: Record<string, LucideIcon> = {
    CodeXml: CodeXml,
    ServerCog: ServerCog,
    BracesIcon: BracesIcon,
};

export default function NavBar() {
    return (
        <NavigationMenu className="z-5 mx-auto mt-5">
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                        <Link href="/" className={navigationMenuTriggerStyle()}>
                            <Home className="w-20 h-20 mr-2"/>
                        </Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                {modules.map((module) => {
                        const Icon = iconMap[module.iconName] || BookOpen;
                        return (
                            <NavigationMenuItem key={module.id}>
                                <NavigationMenuLink asChild>
                                    <Link href={'/'+module.path} className={navigationMenuTriggerStyle()}>
                                        <Icon className="w-20 h-20 mr-2"/>
                                        {module.title}
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        )
                    }
                )}
            </NavigationMenuList>
        </NavigationMenu>
    )
}