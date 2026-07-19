import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { getGitlabConfig } from "./gitlab";

const savedEnv = { gitUrl: process.env.NEXT_PUBLIC_GIT_URL, token: process.env.GITLAB_CORRECTION_TOKEN };

beforeEach(() => {
    process.env.NEXT_PUBLIC_GIT_URL = "https://git.example.dev/correction";
    process.env.GITLAB_CORRECTION_TOKEN = "glpat-test";
});

afterEach(() => {
    process.env.NEXT_PUBLIC_GIT_URL = savedEnv.gitUrl;
    process.env.GITLAB_CORRECTION_TOKEN = savedEnv.token;
});

describe("getGitlabConfig", () => {
    test("dérive base et groupe racine de NEXT_PUBLIC_GIT_URL", () => {
        const cfg = getGitlabConfig();
        expect(cfg.baseUrl).toBe("https://git.example.dev");
        expect(cfg.rootGroupPath).toBe("correction");
        expect(cfg.token).toBe("glpat-test");
    });

    test("échoue explicitement si le token manque", () => {
        delete process.env.GITLAB_CORRECTION_TOKEN;
        expect(() => getGitlabConfig()).toThrow(/GITLAB_CORRECTION_TOKEN/);
    });

    test("échoue si l'URL ne contient pas de chemin de groupe", () => {
        process.env.NEXT_PUBLIC_GIT_URL = "https://git.example.dev";
        expect(() => getGitlabConfig()).toThrow(/groupe racine/);
    });
});
