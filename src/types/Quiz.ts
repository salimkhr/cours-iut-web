import { ObjectId } from "bson";
import Question from "@/types/Question";

export default interface Quiz {
  _id?: string | ObjectId;
  name: string;
  moduleId: string | ObjectId; // reference to Module
  questions: Question[]; // embedded questions
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
