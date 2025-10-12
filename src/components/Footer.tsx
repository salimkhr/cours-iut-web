import {Github, LinkedinIcon, Mail} from "lucide-react";
import Link from "next/link";

const yearDisplay = new Date().getFullYear();

export default function Footer() {
    return (
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 text-black dark:text-white border-t border-gray-200 dark:border-gray-800 z-50">
            <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap justify-between items-center gap-4">
                {/* Copyright */}
                <p className="text-base text-gray-700 dark:text-gray-300 text-center sm:text-left w-full sm:w-auto">
                    &copy; {yearDisplay}-{yearDisplay + 1} Salim Khraimeche.
                </p>

                {/* Contact Links */}
                <div className="flex flex-wrap justify-center sm:justify-end items-center gap-4 w-full sm:w-auto">
                    <Link
                        href="mailto:salimkhr@gmail.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 flex items-center transition-colors"
                    >
                        <Mail className="mr-2"/>
                        <span className="mx-2 text-sm md:text-base hidden md:inline">salimkhr@gmail.com</span>
                    </Link>
                    <span className="hidden sm:inline text-gray-400 dark:text-gray-600">|</span>
                    <Link
                        href="https://github.com/salimkhr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 flex items-center transition-colors"
                    >
                        <Github className="mr-2"/>
                        <span className="mx-2 text-sm md:text-base hidden md:inline">@salimkhr</span>
                    </Link>
                    <span className="hidden sm:inline text-gray-400 dark:text-gray-600">|</span>
                    <Link
                        href="https://linkedin.com/in/salim-khraimeche"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 flex items-center transition-colors"
                    >
                        <LinkedinIcon className="mr-2"/>
                        <span className="mx-2 text-sm md:text-base hidden md:inline">Salim Khraimeche</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}