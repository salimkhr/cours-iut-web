'use client';

import React from 'react';
import { CONTENT_COPY_PREFIX, ContentKey } from '@/lib/contentMeta';

interface CopyContextGuardProps {
    contentType: string;
    children: React.ReactNode;
}

export default function CopyContextGuard({ contentType, children }: CopyContextGuardProps) {
    const prefix = CONTENT_COPY_PREFIX[contentType as ContentKey];
    if (!prefix) return <>{children}</>;

    return (
        <div
            onCopy={(e) => {
                const selected = window.getSelection()?.toString() ?? '';
                if (!selected) return;
                e.preventDefault();
                e.clipboardData.setData('text/plain', prefix + selected);
            }}
        >
            {children}
        </div>
    );
}
