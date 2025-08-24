import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { ObjectId } from "bson";

export type QuizSession = {
  _id?: string | ObjectId;
  quizId: string | ObjectId;
  createdAt: string; // ISO
  participants: unknown[]; // kept generic for now
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // validate id
    const quizId = (() => {
      try {
        return new ObjectId(id);
      } catch {
        return id;
      }
    })();

    const db = await connectToDB();

    const now = new Date().toISOString();
    const doc: QuizSession = {
      quizId,
      createdAt: now,
      participants: [],
    };

    const collection = db.collection<QuizSession>("quizSessions");
    const result = await collection.insertOne(doc as QuizSession);
    const saved = await collection.findOne({ _id: result.insertedId });

    return NextResponse.json({ session: saved }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
