"use client";

import {Github, LinkedinIcon, Mail} from "lucide-react";
import Link from "next/link";
import {useIsDark} from "@/hook/useIsDark";
import {useMounted} from "@/hook/useMounted";

const yearDisplay = new Date().getFullYear();

export default function Footer() {
    const mounted = useMounted();
    const isDark = useIsDark();
    if (!mounted) return null;

    return (
        <div
            className={`fixed bottom-0 left-0 w-full z-150 border-t transition-colors duration-300 ${
                isDark ? "bg-footer text-gray-200 border-white" : "bg-white text-black border-black"
            }`}
        >
            <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap justify-between items-center gap-4">
                <p className="text-base text-center sm:text-left w-full sm:w-auto">
                    &copy; {yearDisplay}-{yearDisplay + 1} Salim Khraimeche.
                </p>

                <div className="flex flex-wrap justify-center sm:justify-end items-center gap-4 w-full sm:w-auto">
                    <Link href="mailto:salimkhr@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center transition-colors duration-300">
                        <Mail className="mr-2" />
                        <span className="mx-2 text-sm md:text-base hidden md:inline">salimkhr@gmail.com</span>
                    </Link>
                    <span className="hidden sm:inline">|</span>
                    <Link href="https://github.com/salimkhr" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center transition-colors duration-300">
                        <Github className="mr-2" />
                        <span className="mx-2 text-sm md:text-base hidden md:inline">@salimkhr</span>
                    </Link>
                    <span className="hidden sm:inline">|</span>
                    <Link href="https://linkedin.com/in/salim-khraimeche" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center transition-colors duration-300">
                        <LinkedinIcon className="mr-2" />
                        <span className="mx-2 text-sm md:text-base hidden md:inline">Salim Khraimeche</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}