'use client';

import * as React from 'react';
import Link from 'next/link';
import {Mail} from "lucide-react";

export default function Footer() {
    const startYear = 2024;
    const currentYear = new Date().getFullYear();
    const yearDisplay = startYear === currentYear ? `${currentYear}` : `${startYear} - ${currentYear}`;

    return (
        <footer className="container mx-auto px-4 py-6 border-t border-gray-200 sticky bottom-0 z-10">
            <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
                <p className="text-base text-gray-600">
                    &copy; {yearDisplay} Salim Khraimeche.
                </p>
                <Link
                    href="mailto:salimkhr@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-indigo-600 hover:underline flex items-center"
                >
                    <Mail className={"mr-2"}/> <span>salimkhr@gmail.com</span>
                </Link>
            </div>
        </footer>
    );
}
