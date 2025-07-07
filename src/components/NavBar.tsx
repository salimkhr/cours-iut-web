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
import {usePathname} from "next/navigation";

const iconMap: Record<string, LucideIcon> = {
    CodeXml: CodeXml,
    ServerCog: ServerCog,
    BracesIcon: BracesIcon,
};

export default function NavBar() {

    const pathname = usePathname()
    const isActive = (href: string) => {

        console.log(pathname,'/'+href, pathname === '/'+href);

        return pathname === '/'+href || pathname.startsWith(href + '/')
    }


    return (
        <header>
            <NavigationMenu className="border-b-2 border-border">
            <NavigationMenuList className="flex items-center">
                <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                        <Link href="/" className={navigationMenuTriggerStyle()}>
                            <Home className="size-8"/>
                        </Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>

            {/* Groupe Modules */}
                <div className="flex justify-center w-full">
                    <NavigationMenuList className="flex items-center m-2">
                    {modules.map((module) => {
                        const Icon = iconMap[module.iconName] || BookOpen;
                        return (
                            <NavigationMenuItem key={module.id}>
                                <NavigationMenuLink asChild>
                                    <Link
                                        href={module.path}
                                        className={navigationMenuTriggerStyle({
                                            className: isActive(module.path) ? "border-2 border-primary" : "",
                                        })}
                                    >
                                        <Icon className="size-8"/>
                                        <span className="mx-2 text-lg">{module.title}</span>
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        );
                    })}
                </NavigationMenuList>
                </div>
            </NavigationMenu>
        </header>
)
            }