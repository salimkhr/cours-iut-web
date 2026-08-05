"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import NavReadingProgress from "@/components/NavReadingProgress";
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

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import iconMap, {isValidIcon} from "@/lib/iconMap";
import {Home, LogOut, Moon, Settings, ShieldAlert, ShieldOff, Sun, UserCheck, UserCog, UserLockIcon} from "lucide-react";
import {clearE2EBypassCookie} from "@/lib/e2eBypass";
import Module from "@/types/Module";
import {avatarColor, avatarInitials, cn} from "@/lib/utils";
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
    /** Le proxy a été traversé via le contournement e2e (jamais en production). */
    e2eBypass?: boolean;
};

export default function NavBarClient({
                                         userId,
                                         role,
                                         user,
                                         modules,
                                         e2eBypass = false
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
        cn(
            navigationMenuTriggerStyle(),
            "bg-transparent text-bridge-900 hover:bg-transparent hover:text-brand-primary focus:bg-transparent focus:text-brand-primary active:bg-transparent data-[state=open]:bg-transparent data-[state=open]:hover:bg-transparent data-[state=open]:focus:bg-transparent",
            "dark:text-bridge-100 dark:hover:text-brand-primary dark:focus:text-brand-primary",
            isActive(href) && "text-brand-primary dark:text-brand-primary"
        );

    async function handleSignOut() {
        await authClient.signOut();
        router.push("/");
        router.refresh();
    }

    return (
        <header className="sticky top-0 z-50 bg-background/88 backdrop-blur-md">
            <NavReadingProgress />
            <NavigationMenu className="h-(--navbar-h) border-b border-border px-2">

                {/* LEFT NAV */}
                <div className="flex list-none items-center gap-2">

                    {/* Les libellés passent en `hidden md:inline` sous 768 px, ce qui
                        les retire aussi de l'arbre d'accessibilité : sans aria-label,
                        un lecteur d'écran mobile n'annonçait que « lien ». */}
                    <NavigationMenuItem>
                        <Link href="/" aria-label="Accueil" className={linkClass("/") + " flex items-center"}>
                            <Home className="w-5 h-5" />
                        </Link>
                    </NavigationMenuItem>

                    {isLoggedIn && isAdmin && (
                        <NavigationMenuItem>
                            <Link
                                href="/admin"
                                aria-label="Admin"
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
                                // Sans session, la navigation devrait s'arrêter à /login.
                                // Si l'on consulte un cours quand même, c'est le cookie
                                // e2e-bypass qui ouvre le proxy : on le signale ici plutôt
                                // que de laisser croire à un défaut d'authentification.
                                aria-label={e2eBypass
                                    ? "Contournement e2e actif — navigation sans session. Aller à la page de connexion."
                                    : "Se connecter"}
                                title={e2eBypass
                                    ? "Cookie e2e-bypass : le proxy est traversé sans session. Supprimez-le pour retrouver le parcours étudiant."
                                    : undefined}
                                className={cn(
                                    linkClass("/login"),
                                    "flex items-center gap-1",
                                    e2eBypass && "text-amber-700 dark:text-amber-300"
                                )}
                            >
                                {e2eBypass
                                    ? <ShieldAlert className="w-5 h-5" />
                                    : <UserLockIcon className="w-5 h-5" />}
                                {/* `whitespace-nowrap` : « Contournement e2e » repassait à la
                                    ligne et débordait de la hauteur fixe de la barre. */}
                                <span className="hidden md:inline whitespace-nowrap">
                                    {e2eBypass ? "Bypass e2e" : "Connexion"}
                                </span>
                            </Link>
                        </NavigationMenuItem>
                    )}

                </div>

                {/* MODULES */}
                <div className="w-full overflow-x-auto">
                    <div className="flex flex-row items-center justify-center gap-2 whitespace-nowrap">

                        {modules.map((module) => {
                            if (!isValidIcon(module.iconName)) {
                                throw new Error(`Module "${module.path}" : icône "${module.iconName}" introuvable dans Lucide`);
                            }
                            const Icon = iconMap[module.iconName];

                            return (
                                <div key={module.path}>
                                    <Link
                                        href={`/${module.path}`}
                                        aria-label={module.title}
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
                                    <Avatar className="size-6 shrink-0">
                                        <AvatarImage src={user.imageUrl ?? undefined} alt={user.username ?? 'avatar'} />
                                        <AvatarFallback
                                            className="text-white text-xs font-semibold"
                                            style={{ backgroundColor: avatarColor(user.username ?? user.email ?? 'U') }}
                                        >
                                            {avatarInitials(user.username ?? user.email ?? 'U')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden md:inline text-sm pr-2">
                                        {user.username ?? user.email}
                                    </span>
                                </button>
                            ) : (
                                <button
                                    aria-label="Préférences d'affichage"
                                    title="Préférences d'affichage"
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

                                    {/* Sortie de secours : le cookie e2e ouvre le proxy sans
                                        session et donne l'illusion d'un défaut d'auth. On
                                        recharge en dur, la page courante n'étant plus
                                        accessible une fois le contournement levé. */}
                                    {e2eBypass && (
                                        <DropdownMenuItem
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                clearE2EBypassCookie().then(() => window.location.reload());
                                            }}
                                            className={cn(dropdownItemClass, "text-amber-700 dark:text-amber-300")}
                                        >
                                            <div className="flex items-center gap-2.5 w-full">
                                                <ShieldOff className="w-4 h-4 shrink-0"/>
                                                <span className="whitespace-nowrap">Retirer le cookie e2e</span>
                                            </div>
                                        </DropdownMenuItem>
                                    )}
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                </NavigationMenuList>

            </NavigationMenu>
        </header>
    );
}
