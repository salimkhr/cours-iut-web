import {BookOpen, Home, UserCheck, UserLockIcon, UserPlus} from 'lucide-react'
import Link from 'next/link'
import {headers} from 'next/headers'
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import getModules from "@/lib/getModules";
import iconMap from "@/lib/iconMap";
import {ThemeToggle} from "@/components/ThemeToggle";
import {auth} from "@/lib/auth";
import LogoutButton from "@/components/login/LogoutButton";


export default async function NavBar() {

    const header = await headers();
    const pathname = header.get('x-pathname');

    const modules = await getModules();

    const isActive = (href: string) => {
        return pathname === '/' + href || pathname?.startsWith(href + '/')
    }

    const sessionRes = await auth.api.getSession({headers: await headers()});
    const isLoggedIn = !!sessionRes?.session;
    const isAdmin = sessionRes?.user?.role === 'admin';

    return (
        <header>
            <NavigationMenu className="border-b-2 border-border">
                <NavigationMenuList className="flex items-center">
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link href="/" className={navigationMenuTriggerStyle()}>
                                <Home className="size-7 shrink-0"/>
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    {(isLoggedIn && isAdmin) && (
                        <>
                            <NavigationMenuItem key="admin">
                                <NavigationMenuLink asChild active={isActive('admin')}>
                                    <Link
                                        href={`/admin`}
                                        className={`${navigationMenuTriggerStyle()} gap-2`}
                                    >
                                        <div className="flex flex-row gap-2">
                                            <UserCheck className="size-7 shrink-0"/>
                                            <span
                                                className="text-lg hidden md:inline">{sessionRes?.user?.name || 'Admin'}</span>
                                        </div>
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem key="register">
                                <NavigationMenuLink asChild active={isActive('register')}>
                                    <Link
                                        href={`/register`}
                                        className={`${navigationMenuTriggerStyle()} gap-2`}
                                    >
                                        <div className="flex flex-row gap-2">
                                            <UserPlus className="size-7 shrink-0"/>
                                            <span className="text-lg hidden md:inline">Inscription</span>
                                        </div>
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </>
                    )}
                    {!isLoggedIn && (
                        <NavigationMenuItem key="login">
                            <NavigationMenuLink asChild active={isActive('admin')}>
                                <Link
                                    href={`/admin`}
                                    className={`${navigationMenuTriggerStyle()} gap-2`}
                                >
                                    <div className="flex flex-row gap-2">
                                        <UserLockIcon className="size-7 shrink-0"/>
                                        <span className="text-lg hidden md:inline">Login</span>
                                    </div>
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    )}
                </NavigationMenuList>

                {/* Groupe Modules */}
                <div className="flex w-full overflow-x-auto whitespace-nowrap justify-end md:justify-center">
                    <NavigationMenuList className="flex items-center gap-2">
                        {modules.map((module) => {
                            const Icon = iconMap[module.iconName] || BookOpen;
                            return (
                                <NavigationMenuItem key={module._id}>
                                    <NavigationMenuLink asChild active={isActive(module.path)}>
                                        <Link
                                            href={`/${module.path}`}
                                            className={`${navigationMenuTriggerStyle()} gap-2`}
                                        >
                                            <div className="flex flex-row gap-2">
                                                <Icon className="size-7 shrink-0"/>
                                                <span className="text-lg hidden md:inline">{module.title}</span>
                                            </div>
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            );
                        })}
                    </NavigationMenuList>
                </div>

                {/* Bouton Theme Toggle */}
                <NavigationMenuList className="flex items-center ml-auto">
                    <NavigationMenuItem>
                        <ThemeToggle/>
                    </NavigationMenuItem>
                    {isLoggedIn ? <NavigationMenuItem key="logout">
                        <LogoutButton/>
                    </NavigationMenuItem> : null}
                </NavigationMenuList>
            </NavigationMenu>
        </header>
    )
}