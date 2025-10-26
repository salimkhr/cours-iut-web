import type {Metadata} from 'next';
import {JetBrains_Mono} from 'next/font/google';
import './globals.css';
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import CsrfInitializer from "@/components/CsrfInitializer";
import {ThemeProvider} from "@/components/ThemeProvider";

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
    title: "Développement Web | Liste des cours",
    description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr" className={jetbrainsMono.variable} suppressHydrationWarning>
        <body className="min-h-screen font-mono">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <NavBar />
            {children}
            <Footer />
            <CsrfInitializer />
        </ThemeProvider>
        </body>
        </html>
    );
}
