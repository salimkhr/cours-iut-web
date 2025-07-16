'use client';

import React, { ReactNode } from 'react';

interface TerminalWindowProps {
  title?: string | React.ReactNode;
  children: ReactNode;
  className?: string;
  classNameTitle?: string;
}

export const TerminalWindow: React.FC<TerminalWindowProps> = ({ 
  title = '',
  children, 
  className = '',
  classNameTitle = ''
}) => {
  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Terminal Header */}
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
            <div className={`text-gray-400 font-mono text-sm ${classNameTitle}`}>{title}</div>
            <div className="w-16"></div>
            <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
        </div>

        {/* Terminal Content */}
        <div className="p-4 font-mono text-sm">
            {children}
        </div>
    </div>
  );
};