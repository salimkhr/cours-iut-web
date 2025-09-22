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
      'Cours': () => import('@/cours/brainfuck/brainfuck-basics/Cours'),
    },
  },
  'html-css': {
    '1-les-formulaires': {
      'Cours': () => import('@/cours/html-css/1-les-formulaires/Cours'),
      'TP': () => import('@/cours/html-css/1-les-formulaires/TP'),
    },
    '2-rappel-de-css': {
      'Cours': () => import('@/cours/html-css/2-rappel-de-css/Cours'),
      'TP': () => import('@/cours/html-css/2-rappel-de-css/TP'),
    },
    '3-structure-responsive': {
      'Cours': () => import('@/cours/html-css/3-structure-responsive/Cours'),
      'TP': () => import('@/cours/html-css/3-structure-responsive/TP'),
    },
    '4-bootstrap': {
      'Cours': () => import('@/cours/html-css/4-bootstrap/Cours'),
      'TP': () => import('@/cours/html-css/4-bootstrap/TP'),
    },
    '5-bootstrap': {
      'TP': () => import('@/cours/html-css/5-bootstrap/TP'),
    },
    '6-rappel-de-html': {
      'Cours': () => import('@/cours/html-css/6-rappel-de-html/Cours'),
    },
  },
  'javascript': {
  },
  'php': {
    '1-introduction-au-php': {
      'Cours': () => import('@/cours/php/1-introduction-au-php/Cours'),
      'TP': () => import('@/cours/php/1-introduction-au-php/TP'),
    },
    '10-symfony': {
      'Cours': () => import('@/cours/php/10-symfony/Cours'),
      'TP': () => import('@/cours/php/10-symfony/TP'),
    },
    '2-fonction-tableaux': {
      'Cours': () => import('@/cours/php/2-fonction-tableaux/Cours'),
      'TP': () => import('@/cours/php/2-fonction-tableaux/TP'),
    },
    '3-le-mvc': {
      'Cours': () => import('@/cours/php/3-le-mvc/Cours'),
      'TP': () => import('@/cours/php/3-le-mvc/TP'),
    },
    '4-les-formulaires': {
      'Cours': () => import('@/cours/php/4-les-formulaires/Cours'),
      'TP': () => import('@/cours/php/4-les-formulaires/TP'),
    },
    '5-lire-des-donnees-en-base': {
      'Cours': () => import('@/cours/php/5-lire-des-donnees-en-base/Cours'),
      'TP': () => import('@/cours/php/5-lire-des-donnees-en-base/TP'),
    },
    '6-le-mvc-avance': {
      'Cours': () => import('@/cours/php/6-le-mvc-avance/Cours'),
      'TP': () => import('@/cours/php/6-le-mvc-avance/TP'),
    },
    '7-ecrire-des-donnees-en-base': {
      'Cours': () => import('@/cours/php/7-ecrire-des-donnees-en-base/Cours'),
      'TP': () => import('@/cours/php/7-ecrire-des-donnees-en-base/TP'),
    },
    '8-les-sessions': {
      'Cours': () => import('@/cours/php/8-les-sessions/Cours'),
      'TP': () => import('@/cours/php/8-les-sessions/TP'),
    },
    '9-examen': {
      'Examen': () => import('@/cours/php/9-examen/Examen'),
    },
  },
};
