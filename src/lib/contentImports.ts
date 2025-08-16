// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY

import React from 'react';

export type ContentImportsType = {
    [moduleSlug: string]: {
        [sectionSlug: string]: {
            [contentSlug: string]: () => Promise<{ default: React.ComponentType }>;
        }
    }
};

export const contentImports: ContentImportsType = {
    'brainfuck': {
        'brainfuck-basics': {
            'cours': () => import('@/cours/brainfuck/brainfuck-basics/cours'),
        },
    },
    'html-css': {
        '1-les-formulaires': {
            'cours': () => import('@/cours/html-css/1-les-formulaires/cours'),
            'TP': () => import('@/cours/html-css/1-les-formulaires/TP'),
        },
        '2-rappel-de-css': {
            'cours': () => import('@/cours/html-css/2-rappel-de-css/cours'),
            'TP': () => import('@/cours/html-css/2-rappel-de-css/TP'),
        },
        '3-structure-responsive': {
            'cours': () => import('@/cours/html-css/3-structure-responsive/cours'),
            'TP': () => import('@/cours/html-css/3-structure-responsive/TP'),
        },
        '4-bootstrap': {
            'cours': () => import('@/cours/html-css/4-bootstrap/cours'),
            'TP': () => import('@/cours/html-css/4-bootstrap/TP'),
        },
        '5-bootstrap': {
            'TP': () => import('@/cours/html-css/5-bootstrap/TP'),
        },
        '6-rappel-de-html': {
            'cours': () => import('@/cours/html-css/6-rappel-de-html/cours'),
        },
    },
    'javascript': {},
    'php': {
        '1-introduction-au-php': {
            'cours': () => import('@/cours/php/1-introduction-au-php/cours'),
            'TP': () => import('@/cours/php/1-introduction-au-php/TP'),
        },
        '2-poo-tableaux': {
            'cours': () => import('@/cours/php/2-poo-tableaux/cours'),
            'TP': () => import('@/cours/php/2-poo-tableaux/TP'),
        },
        '4-le-mvc': {
            'cours': () => import('@/cours/php/4-le-mvc/cours'),
            'TP': () => import('@/cours/php/4-le-mvc/TP'),
        },
    },
};
