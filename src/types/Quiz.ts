import {ObjectId} from "bson";

export type QuizQuestionType = 'mcq' | 'multi' | 'truefalse';

// Stocké en DB — correct et explanation ne quittent jamais le serveur
export interface QuizQuestion {
    id: string;    // UUID généré — distinct du _id MongoDB
    type: QuizQuestionType;
    text: string;
    choices?: string[];
    correct: number | number[] | boolean;
    explanation: string;
}

// Version sanitisée envoyée au client via GET /api/quiz
export interface QuizQuestionClient {
    id: string;
    type: QuizQuestionType;
    text: string;
    choices?: string[];
}

// Réponse du POST /check
export interface QuizCheckResult {
    isCorrect: boolean;
    explanation: string;
}

// Document dans la collection quiz_attempts
export interface QuizAttempt {
    _id?: string | ObjectId;
    userId: string;
    moduleSlug: string;
    sectionSlug: string;
    score: number;
    total: number;
    completedAt: Date;
    answers: {
        questionId: string;
        answer: number | number[] | boolean;
        isCorrect: boolean;
    }[];
}

export type QuizAnswer = number | number[] | boolean;
