'use client';

import React, { useEffect, useState, CSSProperties, forwardRef } from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCopyIcon } from 'lucide-react';
import { Prism as ReactPrism } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

type PrismProps = {
    children: string;
    language: string;
    style: { [key: string]: CSSProperties };
};

const Prism = forwardRef<HTMLDivElement, PrismProps>((props, ref) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    // @ts-expect-error: ReactPrism may not support all props typing
    return <ReactPrism ref={ref} {...props} customStyle={{ border: '1px solid #ccc', borderRadius: '0.5rem' }} />;
});
Prism.displayName = 'Prism';

type CardInputProps = {
    title: string;
    description: string;
    code: string;
    inputElement?: React.ReactNode;
};

const CardInput: React.FC<CardInputProps> = ({ title, description, code, inputElement }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="flex justify-center pb-6">
            <Card className="w-[90%] max-w-[90vw] border border-black shadow-[6px_6px_0px_black] rounded-sm">
                <CardHeader className="flex justify-between items-center px-4 py-2 border-b border-black bg-white">
                    <h3 className="text-md font-semibold">{title}</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="flex items-center gap-2"
                    >
                        <ClipboardCopyIcon className="w-4 h-4" />
                        {copied ? 'Copié !' : 'Copier'}
                    </Button>
                </CardHeader>

                <CardContent className="p-4 border-t border-black">
                    <p className="mb-4 text-sm">{description}</p>
                    <div className="mb-4">
                        <Prism
                            language="html"
                            style={oneLight}
                        >
                            {code}
                        </Prism>
                    </div>
                    {inputElement}
                </CardContent>

                <CardFooter className="hidden" />
            </Card>
        </div>
    );
};

export default CardInput;