import {expect, test} from "bun:test";
import {canManageQuiz} from "@/lib/quiz/permissions";

test("seul un admin peut gérer un quiz", () => {
    expect(canManageQuiz({user: {role: "admin"}})).toBe(true);
    expect(canManageQuiz({user: {role: "user"}})).toBe(false);
    expect(canManageQuiz({user: {}})).toBe(false);
    expect(canManageQuiz(null)).toBe(false);
});
