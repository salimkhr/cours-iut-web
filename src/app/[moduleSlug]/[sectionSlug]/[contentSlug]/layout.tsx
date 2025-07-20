'use client';

import {MDXProvider} from "@mdx-js/react";
import {useMDXComponents} from "@/app/mdx-components";

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <MDXProvider components={useMDXComponents}>
            <section className="mx-auto px-4 md:px-8">{children}</section>
        </MDXProvider>
    );
}
