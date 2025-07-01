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
          <main className="mx-auto w-full max-w-7xl px-4 md:px-8 min-h-screen">{children}</main>
      </MDXProvider>
  );
}
