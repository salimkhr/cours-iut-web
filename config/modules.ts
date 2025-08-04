import {Module} from '@/types/module';

const modules: Module[] = [
    {
        "id": "html-css",
        "title": "HTML & CSS",
        "path": "html-css",
        "iconName": "CodeXml",
        "description": "Créez des interfaces web responsives avec HTML, CSS et Bootstrap",
        "color": "#E34F26",
        "sections": [
            {
                "id": "html-css-1_formulaire",
                "title": "Les formulaires",
                "path": "1_formulaire",
                "description": "Apprenez à créer des formulaires HTML, gérer les champs, les validations de base et les envois.",
                "totalDuration": 1,
                "tags": ["html", "formulaire", "react"],
                "contents": [
                    {"type": "cours", "componentPath": "html-css/1_formulaire/LesFormulaires"},
                    {"type": "TP", "componentPath": "html-css/1_formulaire/LesFormulairesTp"}
                ],
                "hasCorrection": true,
                "order": 1,

            },
            {
                "id": "html-css-2_css",
                "title": "Rappel de CSS",
                "path": "2_css",
                "description": "Révision des sélecteurs, des propriétés de base, des marges, bordures, couleurs et typographies.",
                "totalDuration": 1,
                "tags": ["css", "bases"],
                "contents": [
                    {"type": "cours", "componentPath": "html-css/2_css/RappelCss"},
                    {"type": "TP", "componentPath": "html-css/2_css/RappelCssTp"}
                ],
                "hasCorrection": true,
                "order": 2
            },
            {
                "id": "html-css-3_flex-grid",
                "title": "Structure Responsive",
                "path": "3_flex-grid",
                "description": "Maîtrisez le positionnement avec Flexbox et Grid, et adaptez vos mises en page avec les media queries.",
                "totalDuration": 1,
                "tags": ["css", "flexbox", "grid", "responsive"],
                "contents": [
                    {"type": "cours", "componentPath": "html-css/3_flex-grid/FlexGrid"},
                    {"type": "TP", "componentPath": "html-css/3_flex-grid/FlexGridTp"}
                ],
                "hasCorrection": true,
                "order": 3
            },
            {
                "id": "html-css-4_bootstrap",
                "title": "Bootstrap",
                "path": "4_bootstrap",
                "description": "Introduction à Bootstrap : système de grille, classes utilitaires, boutons, et composants UI de base.",
                "totalDuration": 1,
                "tags": ["bootstrap", "framework", "css"],
                "contents": [
                    {"type": "cours", "componentPath": "html-css/4_bootstrap/Bootstrap"},
                    {"type": "TP", "componentPath": "html-css/4_bootstrap/BootstrapTp"}
                ],
                "hasCorrection": true,
                "order": 4
            },
            {
                "id": "html-css-5_bootstrap",
                "title": "Bootstrap",
                "path": "5_bootstrap",
                "description": "Approfondissement de Bootstrap : composants avancés, formulaires, modals, responsive utilities.",
                "totalDuration": 1,
                "tags": ["bootstrap", "components", "css"],
                "contents": [
                    // {"type": "cours", "componentPath": "html-css/5_bootstrap/BootstrapAvance"},
                    {"type": "TP", "componentPath": "html-css/5_bootstrap/BootstrapAvanceTp"}
                ],
                "hasCorrection": true,
                "order": 5
            },
            {
                "id": "html-css-10_html",
                "title": "Rappel de HTML",
                "path": "10_html",
                "description": "Revue des balises HTML essentielles : structure de page, titres, paragraphes, listes, liens et images.",
                "totalDuration": 1,
                "tags": ["html", "bases"],
                "contents": [
                    {"type": "cours", "componentPath": "html-css/10_html/RappelHtml"}
                ],
                "hasCorrection": false,
                "order": 10
            }
        ]

    },
    {
        "id": "php",
        "title": "PHP",
        "path": "php",
        "iconName": "ServerCog",
        "description": "Maîtrisez la programmation côté serveur et la gestion des données",
        "color": "#777BB4",
        "sections": [
            {
                "id": "php-1_intro",
                "title": "Introduction au PHP",
                "path": "1_intro",
                "description": "Présentation du langage PHP, syntaxe de base, variables, conditions, boucles et des tableaux.",
                "totalDuration": 1,
                "tags": ["php", "introduction", "bases", "tableaux"],
                "contents": [
                    {"type": "cours", "componentPath": "php/1_intro/IntroductionPhp"},
                    {"type": "TP", "componentPath": "php/1_intro/IntroductionPhpTp"},
                ],
                "hasCorrection": true,
                "order": 1
            },
            {
                "id": "php-2_fonctions-poo",
                "title": "POO & Tableaux",
                "path": "2_fonctions-poo",
                "description": "Utilisation des fonction / tableaux associatif et de la programmation orientée objet.",
                "totalDuration": 2,
                "tags": ["php", "poo", "fonctions", "tableaux"],
                "contents": [
                    {"type": "cours", "componentPath": "php/2_fonctions-poo/FonctionsEtPoo"},
                    {"type": "TP", "componentPath": "php/2_fonctions-poo/FonctionsEtPooTp"},
                ],
                "hasCorrection": true,
                "order": 2
            },
            {
                "id": "php-3_formulaires",
                "title": "Les formulaires",
                "path": "3_formulaires",
                "description": "Traitement des données de formulaire, validation et sécurisation des entrées utilisateur.",
                "totalDuration": 3,
                "tags": ["php", "formulaires", "validation"],
                "contents": [
                    {"type": "cours", "componentPath": "php/3_formulaires/Formulaires"},
                    {"type": "TP", "componentPath": "php/3_formulaires/FormulairesTp"},
                ],
                "hasCorrection": true,
                "order": 3
            },
            {
                "id": "php-4_mvc",
                "title": "Le MVC",
                "path": "4_mvc",
                "description": "Introduction à l’architecture MVC avec PHP : séparation du modèle, de la vue et du contrôleur.",
                "totalDuration": 1,
                "tags": ["php", "mvc", "architecture"],
                "contents": [
                    {"type": "cours", "componentPath": "php/4_mvc/MvcIntro"},
                    {"type": "TP", "componentPath": "php/4_mvc/MvcTp"},
                ],
                "hasCorrection": true,
                "order": 4
            },
            {
                "id": "php-5_bdd",
                "title": "La BDD",
                "path": "5_bdd",
                "description": "Connexion à une base de données avec PDO, exécution de requêtes SQL simples en PHP.",
                "totalDuration": 2,
                "tags": ["php", "bdd", "pdo"],
                "contents": [
                    {"type": "cours", "componentPath": "php/5_bdd/ConnexionBdd"},
                    {"type": "TP", "componentPath": "php/5_bdd/ConnexionBddTp"},
                ],
                "hasCorrection": true,
                "order": 5
            },
            {
                "id": "php-6_bdd-avancees",
                "title": "La BDD avancées",
                "path": "6_bdd-avancees",
                "description": "Requêtes préparées, jointures SQL, transactions et gestion d’erreurs côté base de données.",
                "totalDuration": 2,
                "tags": ["php", "sql", "bdd", "avancé"],
                "contents": [
                    {"type": "cours", "componentPath": "php/6_bdd-avancees/BddAvancees"},
                    {"type": "TP", "componentPath": "php/6_bdd-avancees/BddAvanceesTp"},
                ],
                "hasCorrection": true,
                "order": 6
            },
            {
                "id": "php-7_sessions",
                "title": "Les Sessions",
                "path": "7_sessions",
                "description": "Utilisation des sessions PHP pour gérer l'état utilisateur : démarrage, stockage, sécurité.",
                "totalDuration": 1,
                "tags": ["php", "sessions", "auth"],
                "contents": [
                    {"type": "cours", "componentPath": "php/7_sessions/Sessions"},
                    {"type": "TP", "componentPath": "php/7_sessions/SessionsTp"},
                ],
                "hasCorrection": true,
                "order": 7
            },
            {
                "id": "php-8_symfony",
                "title": "Symfony",
                "path": "8_symfony",
                "description": "Découverte du framework Symfony : structure d’un projet, routes, contrôleurs et vues Twig.",
                "totalDuration": 1,
                "tags": ["php", "symfony", "framework"],
                "contents": [
                    {"type": "cours", "componentPath": "php/8_symfony/SymfonyIntro"},
                    {"type": "TP", "componentPath": "php/8_symfony/SymfonyTp"},
                ],
                "hasCorrection": false,
                "order": 8
            },
            {
                "id": "php-9_examen",
                "title": "Examen",
                "path": "9_examen",
                "description": "Sujet d’examen final PHP reprenant, avec un MCV, les Formulaires, la base de données et les session",
                "totalDuration": 1,
                "tags": ["php", "examen", "évaluation"],
                "contents": [
                    {"type": "examen", "componentPath": "php/9_examen/Examen"}
                ],
                "hasCorrection": false,
                "order": 9
            }
        ]
    },
    {
        "id": "javascript",
        "title": "JavaScript",
        "path": "javascript",
        "iconName": "BracesIcon",
        "description": "Créez des expériences web dynamiques et réactives",
        "color": "#F7DF1E",
        "sections": [
            {
                "id": "js-1_dom",
                "title": "Le DOM",
                "path": "1_dom",
                "description": "Manipulation du DOM avec JavaScript : sélection, modification, création et suppression d’éléments.",
                "totalDuration": 2,
                "tags": ["javascript", "dom", "manipulation"],
                "contents": [
                    {"type": "cours", "componentPath": "js/1_dom/DomIntro"},
                    {"type": "TP", "componentPath": "js/1_dom/DomTp"},
                ],
                "hasCorrection": true,
                "order": 1
            },
            {
                "id": "js-2_evenements",
                "title": "Les événements",
                "path": "2_evenements",
                "description": "Gestion des événements en JavaScript : écouteurs, propagation, et interactions de base avec l’utilisateur.",
                "totalDuration": 2,
                "tags": ["javascript", "events", "interaction"],
                "contents": [
                    {"type": "cours", "componentPath": "js/2_evenements/EvenementsIntro"},
                    {"type": "TP", "componentPath": "js/2_evenements/EvenementsTp"},
                ],
                "hasCorrection": true,
                "order": 2
            },
            {
                "id": "js-3_evenements-avances",
                "title": "Les événements avancés",
                "path": "3_evenements-avances",
                "description": "Approfondissement sur les événements : délégation, événements clavier, souris, formulaires.",
                "totalDuration": 2,
                "tags": ["javascript", "events", "advanced"],
                "contents": [
                    {"type": "cours", "componentPath": "js/3_evenements-avances/EvenementsAvances"},
                    {"type": "TP", "componentPath": "js/3_evenements-avances/EvenementsAvancesTp"},
                ],
                "hasCorrection": true,
                "order": 3
            },
            {
                "id": "js-4_fetch",
                "title": "Fetch",
                "path": "4_fetch",
                "description": "Utilisation de l’API Fetch pour interagir avec des ressources distantes.",
                "totalDuration": 2,
                "tags": ["javascript", "fetch", "api", "asynchrone"],
                "contents": [
                    {"type": "cours", "componentPath": "js/4_fetch/FetchIntro"},
                    {"type": "TP", "componentPath": "js/4_fetch/FetchTp"},
                ],
                "hasCorrection": true,
                "order": 4
            },
            {
                "id": "js-5_react",
                "title": "React JS",
                "path": "5_react",
                "description": "Introduction à React JS : composants, props, state et rendu conditionnel.",
                "totalDuration": 1,
                "tags": ["javascript", "react", "frontend"],
                "contents": [
                    {"type": "cours", "componentPath": "js/5_react/ReactIntro"},
                    {"type": "TP", "componentPath": "js/5_react/ReactTp"},
                ],
                "hasCorrection": true,
                "order": 5
            },
            {
                "id": "js-6_examen",
                "title": "Examen",
                "path": "6_examen",
                "description": "Sujet d’évaluation final JavaScript incluant DOM, événements, fetch.",
                "totalDuration": 1,
                "tags": ["javascript", "examen", "évaluation"],
                "contents": [
                    {"type": "projet", "componentPath": "js/6_examen/Examen"}
                ],
                "hasCorrection": false,
                "order": 6
            }
        ]
    }
];

export default modules;
