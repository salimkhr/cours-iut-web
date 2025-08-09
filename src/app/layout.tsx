import type {Metadata} from 'next';
import {JetBrains_Mono} from 'next/font/google';
import './globals.css';
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
    title: "Développement Web | Liste des cours",
    description: "",
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
        </body>
        </html>
    );
}