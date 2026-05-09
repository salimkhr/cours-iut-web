import type {Metadata} from 'next';
import {IBM_Plex_Sans, JetBrains_Mono} from 'next/font/google';
import './globals.css';
import NavBar from "@/components/NavBar";
import {ThemeProvider} from "@/components/ThemeProvider";
import {ClerkProvider} from "@clerk/nextjs";
import {frFR} from '@clerk/localizations'

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

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <ClerkProvider localization={frFR}>
            <html lang="fr" className={`${jetbrainsMono.variable} ${ibmPlexSans.variable}`} suppressHydrationWarning>
                <body className="min-h-screen font-sans bg-brand-light dark:bg-brand-dark text-brand-dark dark:text-brand-light">
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <NavBar/>
                        {children}
                 </ThemeProvider>
            </body>
        </html>
        </ClerkProvider>
    );
}