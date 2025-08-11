import type {Metadata} from 'next';
import {JetBrains_Mono} from 'next/font/google';
import './globals.css';
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import CsrfInitializer from "@/components/CsrfInitializer";

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-jetbrains-mono',
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

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" className={jetbrainsMono.variable}>
        <body className="min-h-screen font-mono">
        <NavBar/>
        {children}
        <Footer/>
        <CsrfInitializer/>
        </body>
        </html>
    );
}