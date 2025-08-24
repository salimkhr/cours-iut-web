import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Quiz from "@/types/Quiz";
import { ObjectId } from "bson";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const moduleId = url.searchParams.get("moduleId");

    const db = await connectToDB();
    const collection = db.collection<Quiz>("quizzes");

    const query: Record<string, unknown> = {};
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      query.name = { $regex: regex };
    }
    if (moduleId) {
      // accept either 24-hex string or raw
      try { query.moduleId = new ObjectId(moduleId); } catch { query.moduleId = moduleId; }
    }

    const quizzes = await collection.find(query).sort({ updatedAt: -1 }).toArray();
    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<Quiz>;

    const name = (body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Nom de quiz requis" }, { status: 400 });
    }
    if (!body.moduleId) {
      return NextResponse.json({ error: "moduleId requis" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const doc: Quiz = {
      name,
      moduleId: body.moduleId as unknown as string,
      questions: Array.isArray(body.questions) ? body.questions : [],
      createdAt: now,
      updatedAt: now,
    };

    const db = await connectToDB();
    const collection = db.collection<Quiz>("quizzes");

    const result = await collection.insertOne(doc as unknown as Quiz);
    const saved = await collection.findOne({ _id: result.insertedId });

    return NextResponse.json({ quiz: saved }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
