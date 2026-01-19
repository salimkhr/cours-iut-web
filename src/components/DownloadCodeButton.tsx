'use client'
import React, {useState} from 'react';
import {Braces, Check, Code2, Database, FileCode, FileJson, FileType} from 'lucide-react';
import {Button} from '@/components/ui/button';

interface DownloadCodeButtonProps {
    language?: string;
    filename?: string;
    children: string;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const getLanguageIcon = (language: string) => {
    const icons: Record<string, React.ReactNode> = {
        javascript: <FileCode size={16} />,
        typescript: <FileCode size={16} />,
        jsx: <Braces size={16} />,
        tsx: <Braces size={16} />,
        css: <FileType size={16} />,
        html: <Code2 size={16} />,
        json: <FileJson size={16} />,
        python: <FileCode size={16} />,
        java: <FileCode size={16} />,
        sql: <Database size={16} />,
    };

    return icons[language.toLowerCase()] || <FileCode size={16} />;
};

export const DownloadCodeButton: React.FC<DownloadCodeButtonProps> = ({
                                                                          language = 'javascript',
                                                                          filename = 'code.js',
                                                                          children,
                                                                          variant = 'outline',
                                                                          size = 'default'
                                                                      }) => {
    const [isDownloaded, setIsDownloaded] = useState(false);

    const code = typeof children === 'string' ? children : '';

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setIsDownloaded(true);
        setTimeout(() => setIsDownloaded(false), 2000);
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleDownload}
            className="gap-2"
        >
            {isDownloaded ? (
                <>
                    <Check size={16} />
                    Téléchargé !
                </>
            ) : (
                <>
                    {getLanguageIcon(language)}
                    {/*<Download size={16} />*/}
                    {filename}
                </>
            )}
        </Button>
    );
};