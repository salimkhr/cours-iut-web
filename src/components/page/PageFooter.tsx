import Link from "next/link";
import {Github, Linkedin, Mail} from "lucide-react";

interface PageFooterProps {
    path?: string;
}

const navItems = [
    {label: "Accueil", href: "/"},
    {label: "HTML & CSS", href: "/html-css"},
    {label: "JavaScript", href: "/javascript"},
    {label: "PHP", href: "/php"},
    {label: "Brainfuck", href: "/brainfuck"},
];

const socialItems = [
    {label: "GitHub", href: "https://github.com/salimkhr", icon: Github},
    {label: "LinkedIn", href: "https://www.linkedin.com/in/salim-khraimeche/", icon: Linkedin},
    {label: "Contact", href: "mailto:salimkhr@gmail.com", icon: Mail},
];

export default function PageFooter({}: PageFooterProps = {}) {
    return (
        <footer
            className="w-full bg-brand-dark text-brand-light/80 mt-auto opacity-0 animate-fade-in z-10 border-t border-brand-dark/15 dark:border-brand-light/15">
            <div className="mx-auto max-w-6xl px-6 lg:px-12 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-primary"/>
                        <h3 className="text-lg font-bold text-brand-light">Cours Web</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-brand-light/60 max-w-xs">
                        Plateforme pédagogique du BUT Informatique — fondamentaux du web,
                        front-end, back-end et frameworks modernes.
                    </p>
                </div>

                <nav className="flex flex-col gap-4" aria-label="Navigation pied de page">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-light">
                        Navigation
                    </h3>
                    <ul className="flex flex-col gap-2">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className="text-sm text-brand-light/60 hover:text-brand-accent transition-colors"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-light">
                        Réseaux
                    </h3>
                    <ul className="flex flex-col gap-2">
                        {socialItems.map(({label, href, icon: Icon}) => (
                            <li key={href}>
                                <Link
                                    href={href}
                                    target={href.startsWith("http") ? "_blank" : undefined}
                                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                                    className="inline-flex items-center gap-2 text-sm text-brand-light/60 hover:text-brand-accent transition-colors"
                                >
                                    <Icon size={16}/>
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="border-t border-brand-light/15">
                <div
                    className="mx-auto max-w-6xl px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-light/60">
                    <p>&copy; {new Date().getFullYear()} Salim Khraimeche — Tous droits réservés.</p>
                    <p>BUT Informatique — IUT</p>
                </div>
            </div>
        </footer>
    );
}
