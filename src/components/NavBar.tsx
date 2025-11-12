import {BookOpen, Home, UserCheck, UserLockIcon} from 'lucide-react'
import Link from 'next/link'
import {cookies, headers} from 'next/headers'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import getModules from "@/lib/getModules";
import iconMap from "@/lib/iconMap";
import {verifyToken} from "@/lib/token";
import {ThemeToggle} from "@/components/ThemeToggle";


export default async function NavBar() {

    const header = await headers();
    const pathname = header.get('x-pathname');

    const modules = await getModules();

    const isActive = (href: string) => {
        return pathname === '/' + href || pathname?.startsWith(href + '/')
    }

    const cookie = await cookies();

    const session = cookie.get('session')?.value;
    const isAdmin = session !== undefined && await verifyToken(session);

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
                    {isAdmin ? <NavigationMenuItem key="admin">
                        <NavigationMenuTrigger>
                            <div className="flex flex-row gap-2">
                                <UserCheck className="size-7 shrink-0"/>
                                <span className="text-lg hidden md:inline">Admin</span>
                            </div>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[300px] gap-4">
                                <li>
                                    <NavigationMenuLink asChild>
                                        <Link href="/admin/modules">
                                            <div className="font-medium">Modules</div>
                                        </Link>
                                    </NavigationMenuLink>
                                    <NavigationMenuLink asChild>
                                        <Link href="/admin/quizzes">
                                            <div className="font-medium">Quizz</div>
                                        </Link>
                                    </NavigationMenuLink>
                                    <NavigationMenuLink asChild>
                                        <Link href="/admin/users">
                                            <div className="font-medium">Utilisateurs</div>
                                        </Link>
                                    </NavigationMenuLink>
                                </li>
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem> : <NavigationMenuItem key="login">
                        <NavigationMenuLink asChild active={isActive(module.path)}>
                            <Link
                                href={`/login`}
                                className={`${navigationMenuTriggerStyle()} gap-2`}
                            >
                                <div className="flex flex-row gap-2">
                                    <UserLockIcon className="size-7 shrink-0"/>
                                    <span className="text-lg hidden md:inline">Login</span>
                                </div>
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>}
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
                        <ThemeToggle />
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </header>
    )
}