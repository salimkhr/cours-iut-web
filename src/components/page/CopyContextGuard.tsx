'use client';

import React from 'react';
interface CopyContextGuardProps {
    children: React.ReactNode;
}

export default function CopyContextGuard({ children }: CopyContextGuardProps) {
    return <>{children}</>;
}
