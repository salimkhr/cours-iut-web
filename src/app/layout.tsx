import type {Metadata} from 'next';
import {IBM_Plex_Sans, JetBrains_Mono} from 'next/font/google';
import './globals.css';
import NavBar from "@/components/NavBar";
import {ThemeProvider} from "@/components/ThemeProvider";
import {Toaster} from "@/components/ui/sonner";
import getModules from "@/lib/getModules";
import {generateModuleThemeCss} from "@/lib/generateModuleThemeCss";

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-jetbrains-mono',
});

const ibmPlexSans = IBM_Plex_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-ibm-plex-sans',
});

export const metadata: Metadata = {
    title: "Développement Web | Liste des cours",
    description: "Plateforme pedagogique pour travailler les cours, TP, slides et examens de developpement web en BUT Informatique.",
    metadataBase: new URL("https://salimkhraimeche.dev"),
    manifest: '/manifest.json',
    icons: {
        icon: '/icons/icon-192x192.png',
        apple: '/icons/icon-192x192.png'
    },
    other: {
        'theme-color': '#C2410C'
    }
};

export default async function RootLayout({children}: { children: React.ReactNode }) {
    // Tolérant à la phase de build (DB mockée) : pas de couleur → fallback globals.css.
    let themeCss = "";
    try {
        themeCss = generateModuleThemeCss(await getModules());
    } catch {
        themeCss = "";
    }

    return (
        <html lang="fr" className={`${jetbrainsMono.variable} ${ibmPlexSans.variable}`} suppressHydrationWarning>
            <body className="min-h-screen font-sans bg-background text-foreground">
                {themeCss && (
                    <style id="module-theme-vars" dangerouslySetInnerHTML={{__html: themeCss}}/>
                )}
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <NavBar/>
                    <a
                        href="#contenu-principal"
                        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-light focus:shadow-[0_18px_36px_-14px_rgba(147,97,58,0.65)]"
                    >
                        Aller au contenu
                    </a>
                    <div id="contenu-principal" tabIndex={-1} className="outline-none">
                        {children}
                    </div>
                    <Toaster richColors closeButton/>
                </ThemeProvider>
            </body>
        </html>
    );
}
