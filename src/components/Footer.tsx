'use client';

import * as React from 'react';
import Link from 'next/link';
import { Github, LinkedinIcon, Mail } from 'lucide-react';

export default function Footer() {
    const startYear = 2024;
    const currentYear = new Date().getFullYear();
    const yearDisplay = startYear === currentYear ? `${currentYear}` : `${startYear} - ${currentYear}`;

    return (
        <footer className="px-4 py-6 border-t border-gray-200 bottom-0 bg-black z-50">
            <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
                <p className="text-base text-white">
                    &copy; {yearDisplay} Salim Khraimeche.
                </p>

                <div className="flex items-center gap-6">
                    <Link
                        href="mailto:salimkhr@gmail.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:underline flex items-center"
                    >
                        <Mail className="mr-2" />
                        <span>salimkhr@gmail.com</span>
                    </Link>

                    <Link
                        href="https://github.com/salimkhr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:underline flex items-center"
                    >
                        <Github />
                        <span>@salimkhr</span>
                    </Link>

                    <Link
                        href="https://linkedin.com/in/salim-khraimeche"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:underline flex items-center"
                    >
                        <LinkedinIcon />
                        <span className="ml-2">Salim Khraimeche</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}
