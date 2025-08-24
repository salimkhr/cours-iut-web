import axios from "axios";
import Question from "@/types/Question";

export type QuestionsQuery = {
  q?: string;
  type?: string;
  difficulty?: string;
};

export type QuestionPayload = Omit<Question, "_id" | "createdAt" | "updatedAt">;

export default function useAdminQuestionsApi() {
  async function listQuestions(params: QuestionsQuery) {
    const res = await axios.get("/api/admin/questions", { params });
    return (res.data.questions || []) as Question[];
  }

  async function addQuestion(data: QuestionPayload) {
    const res = await axios.post("/api/admin/questions", data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data.question as Question;
  }

  async function editQuestion(id: string, data: QuestionPayload) {
    const res = await axios.put(`/api/admin/questions/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data.question as Question;
  }

  async function deleteQuestion(id: string) {
    await axios.delete(`/api/admin/questions/${id}`);
  }

  return { listQuestions, addQuestion, editQuestion, deleteQuestion };
}
