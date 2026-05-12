"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {useTheme} from "next-themes";
import {authClient} from "@/lib/auth-client";

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import iconMap from "@/lib/iconMap";
import {
    BookOpen,
    Home,
    LogIn,
    LogOut,
    Moon,
    Settings,
    Sun,
    User as UserIcon,
    UserCheck,
    UserCog,
    UserLockIcon
} from "lucide-react";
import Module from "@/types/Module";
import {cn} from "@/lib/utils";
import {useMounted} from "@/hook/useMounted";

const dropdownContentClass = cn(
    "w-52 p-1.5 rounded-xl",
    "bg-bridge-50 text-bridge-900 border border-bridge-400/40",
    "dark:bg-bridge-800 dark:text-bridge-100 dark:border-bridge-500/45",
    "shadow-[0_12px_32px_-12px_rgba(147,97,58,0.45)]",
    "dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)]",
    "backdrop-blur-md"
);

const dropdownItemClass = cn(
    "rounded-lg px-3 py-2 text-sm font-medium cursor-pointer",
    "text-bridge-900 dark:text-bridge-100",
    "focus:bg-bridge-200 focus:text-bridge-900",
    "dark:focus:bg-bridge-700 dark:focus:text-bridge-50",
    "data-[highlighted]:bg-bridge-200 data-[highlighted]:text-bridge-900",
    "dark:data-[highlighted]:bg-bridge-700 dark:data-[highlighted]:text-bridge-50"
);

type SafeUser = {
    id: string;
    username: string | null;
    imageUrl: string | null;
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
    const router = useRouter();
    const mounted = useMounted();
    const {theme, setTheme} = useTheme();

    const isLoggedIn = !!userId;
    const isAdmin = role === 'admin';
    const isDark = mounted && theme === 'dark';

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(href + "/");

    const linkClass = (href: string) =>
        `${navigationMenuTriggerStyle()} transition-colors duration-200 ${
            isActive(href) ? "bg-accent text-accent-foreground" : ""
        }`;

    async function handleSignOut() {
        await authClient.signOut();
        router.push("/");
        router.refresh();
    }

    return (
        <header className="sticky top-0 z-50 bg-transparent backdrop-blur-xs">
            <NavigationMenu className="border-b border-border px-2">

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
                                href="/login"
                                className={linkClass("/login") + " flex items-center gap-1"}
                            >
                                <UserLockIcon className="w-5 h-5" />
                                <span className="hidden md:inline">Login</span>
                            </Link>
                        </NavigationMenuItem>
                    )}

                </div>

                {/* MODULES */}
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

                {/* RIGHT SIDE */}
                <NavigationMenuList className="ml-auto flex items-center gap-3">

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            {isLoggedIn && user ? (
                                <button
                                    aria-label="Menu utilisateur"
                                    className="flex flex-row items-center gap-2 rounded-full p-0.5 outline-none transition-colors hover:bg-bridge-200/50 dark:hover:bg-bridge-700/50 focus-visible:ring-2 focus-visible:ring-brand-primary"
                                >
                                    {user.imageUrl ? (
                                        <span className="block w-8 h-8 rounded-full overflow-hidden shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={user.imageUrl}
                                                alt="avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-bridge-300 dark:bg-bridge-700">
                                            <UserIcon className="w-4 h-4"/>
                                        </span>
                                    )}
                                    <span className="hidden md:inline text-sm pr-2">
                                        {user.username ?? user.email}
                                    </span>
                                </button>
                            ) : (
                                <button
                                    aria-label="Préférences"
                                    className="flex items-center justify-center w-9 h-9 rounded-full outline-none transition-colors text-bridge-900 dark:text-bridge-100 hover:bg-bridge-200/50 dark:hover:bg-bridge-700/50 focus-visible:ring-2 focus-visible:ring-brand-primary"
                                >
                                    <Settings className="w-5 h-5"/>
                                </button>
                            )}
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" sideOffset={8} className={dropdownContentClass}>
                            {isLoggedIn && user ? (
                                <>
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                setTheme(isDark ? 'light' : 'dark');
                                            }}
                                            className={dropdownItemClass}
                                        >
                                            <div className="flex items-center gap-2.5 w-full">
                                                {isDark ? <Sun className="w-4 h-4 shrink-0"/> : <Moon className="w-4 h-4 shrink-0"/>}
                                                <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
                                            </div>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator className="bg-bridge-400/40 dark:bg-bridge-500/45"/>
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem asChild className={dropdownItemClass}>
                                            <Link href="/account" className="flex items-center gap-2.5">
                                                <UserCog className="w-4 h-4 shrink-0"/>
                                                <span>Mon compte</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onSelect={() => handleSignOut()}
                                            className={dropdownItemClass}
                                        >
                                            <div className="flex items-center gap-2.5 w-full">
                                                <LogOut className="w-4 h-4 shrink-0"/>
                                                <span>Déconnexion</span>
                                            </div>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setTheme(isDark ? 'light' : 'dark');
                                        }}
                                        className={dropdownItemClass}
                                    >
                                        <div className="flex items-center gap-2.5 w-full">
                                            {isDark ? <Sun className="w-4 h-4 shrink-0"/> : <Moon className="w-4 h-4 shrink-0"/>}
                                            <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className={dropdownItemClass}>
                                        <Link href="/login" className="flex items-center gap-2.5">
                                            <LogIn className="w-4 h-4 shrink-0"/>
                                            <span>Connexion</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                </NavigationMenuList>

            </NavigationMenu>
        </header>
    );
}
