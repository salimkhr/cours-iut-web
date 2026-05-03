import type {Metadata} from 'next';
import {IBM_Plex_Sans, JetBrains_Mono} from 'next/font/google';
import './globals.css';
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import CsrfInitializer from "@/components/CsrfInitializer";
import {ThemeProvider} from "@/components/ThemeProvider";
import {AuthProvider} from "@/context/AuthContext";

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
        <html lang="fr" className={`${jetbrainsMono.variable} ${ibmPlexSans.variable}`} suppressHydrationWarning>
        <body className="min-h-screen font-sans">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                <NavBar/>
                {children}
                <Footer/>
                <CsrfInitializer/>
            </AuthProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
