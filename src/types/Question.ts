import {ObjectId} from "bson";

export type QuestionType = "multiple-choice" | "true-false" | "short-answer";
export type Difficulty = "easy" | "medium" | "hard";

export default interface Question {
    _id?: string | ObjectId;
    text: string; // Markdown
    type: QuestionType;
    choices?: string[]; // only for multiple-choice
    correctAnswer: string; // for true-false: "true" | "false"; for multiple-choice: one of choices; for short-answer: free text
    points: number;
    timeLimit?: number; // seconds
    explanation?: string; // Markdown
    difficulty?: Difficulty;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}