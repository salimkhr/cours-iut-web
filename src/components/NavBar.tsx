import {BookOpen, BracesIcon, CodeXml, Home, LucideIcon, ServerCog} from 'lucide-react'
import Link from 'next/link'
import {headers} from 'next/headers'
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import getMergedModules from "@/lib/getMergedModules";


export default async function NavBar() {

    const header = await headers();
    const pathname = header.get('x-pathname');

    const modules = getMergedModules();

    const isActive = (href: string) => {
        return pathname === '/' + href || pathname?.startsWith(href + '/')
    }

    const iconMap: Record<string, LucideIcon> = {
        CodeXml: CodeXml,
        ServerCog: ServerCog,
        BracesIcon: BracesIcon,
    };

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
                <div className="flex w-full overflow-x-auto whitespace-nowrap justify-end md:justify-center">
                    <NavigationMenuList className="flex items-center m-2">
                        {modules.map((module) => {
                            const Icon = iconMap[module.iconName] || BookOpen;
                            return (
                                <NavigationMenuItem key={module.id}>
                                    <NavigationMenuLink asChild active={isActive(module.path)}>
                                        <Link
                                            href={`/${module.path}`}
                                            className={navigationMenuTriggerStyle()}
                                        >
                                            <Icon className="size-8"/>
                                            <span className="mx-2 text-lg hidden md:inline">{module.title}</span>
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