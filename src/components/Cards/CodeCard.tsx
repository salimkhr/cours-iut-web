'use client';

import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCopyIcon } from 'lucide-react';

interface CodeCardProps {
    code: string;
    language?: string;
    color?: string;
}


export default function CodeCard({
                                     code,
                                     language = 'js'
                                 }: CodeCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="group hover:shadow-xl">
            <Card className="border-2 border-black bg-white rounded-lg shadow-lg overflow-hidden text-left py-0 gap-0">
                <CardHeader
                    className="flex justify-between items-center border-b-2"
                    // style={{ backgroundColor: color }}
                >
                    <span className="text-sm font-mono text-black uppercase">{language}</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-black hover:underline"
                    >
                        <ClipboardCopyIcon className="w-4 h-4" />
                        {copied ? 'Copié' : 'Copier'}
                    </Button>
                </CardHeader>

                <CardContent className="p-0">
                    {/*<Prism language={language} style={oneLight}>*/}
                        {code}
                    {/*</Prism>*/}
                </CardContent>

                <CardFooter className="hidden" />
            </Card>
        </div>
    );
}
