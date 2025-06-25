// src/mdx-components.ts
import type { MDXComponents } from 'mdx/types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Link from 'next/link';

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        h1: ({ children, ...props }) => (
            <h1 className="text-3xl font-bold text-blue-600 mb-4" {...props}>
                {children}
            </h1>
        ),
        h2: ({ children, ...props }) => (
            <h2 className="text-2xl font-semibold text-blue-500 mt-6 mb-3" {...props}>
                {children}
            </h2>
        ),
        p: ({ children, ...props }) => (
            <p className="text-gray-700 leading-relaxed mb-4" {...props}>
                {children}
            </p>
        ),
        a: ({ href, children, ...props }) => (
            <Link href={href ?? '#'} {...props} className="text-blue-500 underline hover:text-blue-700">
                {children}
            </Link>
        ),
        ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside mb-4" {...props}>
                {children}
            </ul>
        ),
        li: ({ children, ...props }) => (
            <li className="mb-1" {...props}>
                {children}
            </li>
        ),
        code: ({ className, children, ...props }) => {
            const language = className?.replace('language-', '') || 'text';

            return (
                <SyntaxHighlighter language={language} style={materialLight} PreTag="div" {...props}>
                    {String(children).trim()}
                </SyntaxHighlighter>
            );
        },
        ...components,
    };
}
