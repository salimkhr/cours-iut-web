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
    description: "",
    manifest: '/manifest.json',
    icons: {
        icon: '/icons/icon-192x192.png',
        apple: '/icons/icon-192x192.png'
    },
    other: {
        'theme-color': '#317EFB'
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
            <body className="min-h-screen font-sans bg-brand-light dark:bg-brand-dark text-brand-dark dark:text-brand-light">
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
                    {children}
                    <Toaster richColors closeButton/>
                </ThemeProvider>
            </body>
        </html>
    );
}
