import axios from "axios";
import Quiz from "@/types/Quiz";
import Question from "@/types/Question";

export type QuizzesQuery = {
  q?: string;
  moduleId?: string;
};

export type QuizPayload = Pick<Quiz, "name" | "questions" | "moduleId">;

export default function useAdminQuizzesApi() {
  async function listQuizzes(params: QuizzesQuery = {}) {
    const res = await axios.get("/api/admin/quizzes", { params });
    return (res.data.quizzes || []) as Quiz[];
  }

  async function addQuiz(data: QuizPayload) {
    const res = await axios.post("/api/admin/quizzes", data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data.quiz as Quiz;
  }

  async function editQuiz(id: string, data: Partial<QuizPayload>) {
    const res = await axios.put(`/api/admin/quizzes/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data.quiz as Quiz;
  }

  type QuizQuestionPayload = Omit<Question, "_id" | "createdAt" | "updatedAt">;

  async function addQuestionToQuiz(id: string, data: QuizQuestionPayload) {
    const res = await axios.post(`/api/admin/quizzes/${id}/questions`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data.quiz as Quiz;
  }

  async function editQuestionInQuiz(quizId: string, questionId: string, data: QuizQuestionPayload) {
    const res = await axios.put(`/api/admin/quizzes/${quizId}/questions/${questionId}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data.quiz as Quiz;
  }

  async function deleteQuiz(id: string) {
    await axios.delete(`/api/admin/quizzes/${id}`);
  }

  async function createSession(quizId: string) {
    const res = await axios.post(`/api/admin/quizzes/${quizId}/sessions`, {}, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data.session as { _id: string; createdAt: string; participants: unknown[] };
  }

  return { listQuizzes, addQuiz, editQuiz, deleteQuiz, addQuestionToQuiz, editQuestionInQuiz, createSession };
}
