'use client';
import * as React from 'react';
import Link from 'next/link';
import { Github, LinkedinIcon, Mail } from 'lucide-react';

export default function Footer() {
    const startYear = 2024;
    const currentYear = new Date().getFullYear();
    const yearDisplay = startYear === currentYear ? `${currentYear}` : `${startYear} - ${currentYear}`;

    return (
        <footer className="px-4 py-6 border-t border-gray-200 bg-black text-white w-full">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
                <p className="text-base text-center sm:text-left w-full sm:w-auto">
                    &copy; {yearDisplay} Salim Khraimeche.
                </p>
                <div className="flex flex-wrap justify-center sm:justify-end items-center gap-4 w-full sm:w-auto">
                    <Link
                        href="mailto:salimkhr@gmail.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center"
                    >
                        <Mail className="mr-2" />
                        <span className="mx-2 text-lg hidden md:inline">salimkhr@gmail.com</span>
                    </Link>
                    <Link
                        href="https://github.com/salimkhr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center"
                    >
                        <Github />
                        <span className="mx-2 text-lg hidden md:inline">@salimkhr</span>
                    </Link>
                    <Link
                        href="https://linkedin.com/in/salim-khraimeche"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center"
                    >
                        <LinkedinIcon />
                        <span className="mx-2 text-lg hidden md:inline">Salim Khraimeche</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}
