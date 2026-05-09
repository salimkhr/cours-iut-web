"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import Image from "next/image";

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";

import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";

import {ThemeToggle} from "@/components/ThemeToggle";
import LogoutButton from "@/components/login/LogoutButton";

import iconMap from "@/lib/iconMap";
import {BookOpen, Home, UserCheck, UserLockIcon} from "lucide-react";
import Module from "@/types/Module";

type SafeUser = {
    id: string;
    username: string | null;
    imageUrl: string;
    email: string | null;
} | null;

type Props = {
    userId: string | null;
    role: string | null;
    user: SafeUser;
    modules: Module[];
};

export default function NavBarClient({
                                         userId,
                                         role,
                                         user,
                                         modules
                                     }: Props) {

    const pathname = usePathname();

    const isLoggedIn = !!userId;
    const isAdmin = role === 'admin';

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(href + "/");

    const linkClass = (href: string) =>
        `${navigationMenuTriggerStyle()} transition-colors duration-200 ${
            isActive(href) ? "bg-accent text-accent-foreground" : ""
        }`;

    return (
        <header>
            <NavigationMenu className="border-b-2 border-border px-2">

                {/* LEFT NAV */}
                <div className="flex items-center gap-2">

                    <NavigationMenuItem>
                        <Link href="/" className={linkClass("/") + " flex items-center"}>
                            <Home className="w-5 h-5" />
                        </Link>
                    </NavigationMenuItem>

                    {isLoggedIn && isAdmin && (
                        <NavigationMenuItem>
                            <Link
                                href="/admin"
                                className={linkClass("/admin") + " flex items-center gap-1"}
                            >
                                <UserCheck className="w-5 h-5" />
                                <span className="hidden md:inline">Admin</span>
                            </Link>
                        </NavigationMenuItem>
                    )}

                    {!isLoggedIn && (
                        <NavigationMenuItem>
                            <Link
                                href="/sign-in"
                                className={linkClass("/sign-in") + " flex items-center gap-1"}
                            >
                                <UserLockIcon className="w-5 h-5" />
                                <span className="hidden md:inline">Login</span>
                            </Link>
                        </NavigationMenuItem>
                    )}

                </div>

                {/* MODULES */}
                {isLoggedIn && (
                    <div className="w-full overflow-x-auto">
                        <div className="flex flex-row items-center justify-center gap-2 whitespace-nowrap">

                            {modules.map((module) => {
                                const Icon = iconMap[module.iconName] || BookOpen;

                                return (
                                    <div key={module.path}>
                                        <Link
                                            href={`/${module.path}`}
                                            className={`${linkClass(`/${module.path}`)} flex items-center gap-2 whitespace-nowrap`}
                                        >
                                            <Icon className="w-5 h-5 shrink-0" />
                                            <span className="hidden md:inline">
                                {module.title}
                            </span>
                                        </Link>
                                    </div>
                                );
                            })}

                        </div>
                    </div>
                )}

                {/* RIGHT SIDE */}
                <NavigationMenuList className="ml-auto flex items-center gap-3">

                    {isLoggedIn && user && (
                        <DropdownMenu>

                            <DropdownMenuTrigger asChild>
                                <button className="flex flex-row items-center gap-2">
                                    <Image
                                        src={user.imageUrl}
                                        alt="avatar"
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                    <span className="hidden md:inline text-sm">
                                        {user.username ?? user.email}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-48">

                                <DropdownMenuItem asChild>
                                    <Link href="/account">
                                        Mon compte
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <ThemeToggle />
                                </DropdownMenuItem>

                                <DropdownMenuItem>
                                    <LogoutButton />
                                </DropdownMenuItem>

                            </DropdownMenuContent>

                        </DropdownMenu>
                    )}

                </NavigationMenuList>

            </NavigationMenu>
        </header>
    );
}