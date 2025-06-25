"use client"

import * as React from "react"
import Link from "next/link"

const currentYear = new Date().getFullYear();
export default function Footer() {
    return (
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
                <p className="text-base">
                    &copy; 2024 - {currentYear} Salim Khraimeche.
                </p>
                <Link
                    href="mailto:salimkhr@gmail.com"
                    target="_blank"
                    className="flex items-center text-base hover:underline">
                    {/*<FaEnvelope className="mr-2"/>*/}
                    <span>salimkhr@gmail.com</span>
                </Link>
            </div>
        </div>
    );
}

