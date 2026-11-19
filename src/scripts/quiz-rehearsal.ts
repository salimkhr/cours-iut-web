// src/scripts/quiz-rehearsal.ts
//
// Répétition générale du quiz live, par HTTP, comme en salle.
//
//   bun run quiz-rehearsal seed     # base LOCALE uniquement : admin + étudiants de test, quiz de 21 questions
//   bun run quiz-rehearsal run      # joue une séance complète contre QUIZ_BASE_URL et rend un rapport
//
// Variables (run) :
//   QUIZ_BASE_URL         serveur visé (défaut http://localhost:3100)
//   QUIZ_MODULE_ID        module dont le quiz est joué (défaut : module de test local)
//   QUIZ_ADMIN_COOKIE     cookie de session admin ; sinon connexion avec le compte admin de test
//   QUIZ_STUDENTS         nombre d'étudiants connectés (défaut 40 ; 0 = projections seules, mode staging)
//   QUIZ_PROJECTIONS      flux de projection supplémentaires (défaut 1)
//   QUIZ_FORWARDED_FOR    IP commune envoyée en X-Forwarded-For (simule le NAT de l'IUT)
//   QUIZ_LONG_PAUSES      silences en secondes, après certaines questions (défaut "70")
//   QUIZ_PAUSE            pause par défaut sur chaque correction, en secondes (défaut 2)
//
// Les comptes de test n'existent qu'en local : le seed refuse toute autre base.

import {MongoClient} from "mongodb";
import {QUIZ_REHEARSAL_ADMIN, QUIZ_REHEARSAL_PASSWORD, rehearsalStudent} from "../../tests/fixtures/quiz-rehearsal-users";

const DB_NAME = "cours-iut-web";
const TEST_MODULE_PATH = "zz-test-design";

type Phase = "lobby" | "running" | "review" | "finished";
interface PublicState {
    phase: Phase;
    question: {id: string; index: number; total: number; options: {id: string; text: string}[]; expectedCount: number; durationSeconds: number} | null;
    deadline: number | null;
    serverNow: number;
    participantCount: number;
    done?: boolean;
    finishedCount?: number;
    reveal?: {scoreObtained: number; scoreMax: number} | null;
    score?: number;
    scoreMax?: number;
}

// ── Seed (local uniquement) ─────────────────────────────────────────────────

function assertLocal(uri: string) {
    const host = new URL(uri.replace(/^mongodb(\+srv)?:/, "http:")).hostname;
    if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(host)) {
        throw new Error(`Base non locale (${host}) : seed de répétition refusé.`);
    }
}

async function seed() {
    const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
    assertLocal(uri);
    const {auth} = await import("@/lib/auth");
    const {QuizService} = await import("@/lib/quiz/QuizService");

    const client = await MongoClient.connect(uri);
    try {
        const db = client.db(DB_NAME);
        const users = db.collection("user");
        const accounts = [QUIZ_REHEARSAL_ADMIN, ...Array.from({length: 40}, (_, i) => rehearsalStudent(i))];
        for (const a of accounts) {
            if (await users.findOne({email: a.email})) continue;
            await auth.api.createUser({
                body: {
                    email: a.email, password: QUIZ_REHEARSAL_PASSWORD, name: a.name, role: a.role,
                    data: {username: a.username, displayUsername: a.username, group: a.group, emailVerified: true},
                },
            });
        }
        console.log(`Comptes de test : ${accounts.length} présents.`);

        const mod = await db.collection("modules").findOne({path: TEST_MODULE_PATH});
        if (!mod) throw new Error(`Module ${TEST_MODULE_PATH} absent de la base locale`);
        const moduleId = String(mod._id);
        const quizzes = new QuizService(db);
        if (await quizzes.get(moduleId)) await db.collection("module_quizzes").deleteOne({moduleId});
        await quizzes.create(moduleId);
        // Même forme que le quiz de vendredi : 21 questions, la première à poids 0 avec deux bonnes réponses.
        for (let q = 0; q < 21; q++) {
            const options = q === 0
                ? [{text: "A", correct: true}, {text: "B", correct: false}, {text: "C", correct: false}, {text: "D", correct: true}]
                : [{text: "A", correct: q % 4 === 0}, {text: "B", correct: q % 4 === 1}, {text: "C", correct: q % 4 === 2}, {text: "D", correct: q % 4 === 3}]
                    .slice(0, q === 10 ? 3 : 4);
            if (!options.some((o) => o.correct)) options[0].correct = true;
            await quizzes.addQuestion(moduleId, {
                blocks: [{id: crypto.randomUUID(), type: "text", props: {content: `Question de répétition ${q}`}}],
                weight: q === 0 ? 0 : 1,
                durationSeconds: Number(process.env.QUIZ_DURATION ?? 8),
                options,
            });
        }
        console.log(`Quiz de répétition : 21 questions sur ${TEST_MODULE_PATH} (QUIZ_MODULE_ID=${moduleId}).`);
    } finally {
        await client.close();
    }
    process.exit(0);
}

// ── Client HTTP ─────────────────────────────────────────────────────────────

const BASE = (process.env.QUIZ_BASE_URL ?? "http://localhost:3100").replace(/\/$/, "");
const ORIGIN = new URL(BASE).origin;
const FORWARDED = process.env.QUIZ_FORWARDED_FOR;

function headers(cookie: string | null, json = false): Record<string, string> {
    return {
        Origin: ORIGIN,
        ...(cookie ? {Cookie: cookie} : {}),
        ...(json ? {"Content-Type": "application/json"} : {}),
        ...(FORWARDED ? {"X-Forwarded-For": FORWARDED} : {}),
    };
}

async function post<T>(path: string, cookie: string | null, body?: unknown): Promise<{status: number; data: T | null; res: Response}> {
    const res = await fetch(`${BASE}${path}`, {method: "POST", headers: headers(cookie, true), body: JSON.stringify(body ?? {})});
    const data = await res.json().catch(() => null) as T | null;
    return {status: res.status, data, res};
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Connexion comme le navigateur : 429 → on attend Retry-After et on réessaie (ce qu'un étudiant ferait). */
async function signIn(email: string, stats: {rateLimited: number}): Promise<string> {
    for (let attempt = 0; attempt < 60; attempt++) {
        const {status, res} = await post("/api/auth/sign-in/email", null, {email, password: QUIZ_REHEARSAL_PASSWORD});
        if (status === 200) {
            return res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
        }
        if (status === 429) {
            stats.rateLimited++;
            await sleep(Number(res.headers.get("retry-after") ?? "5") * 1000 + Math.random() * 1000);
            continue;
        }
        throw new Error(`Connexion ${email} : HTTP ${status}`);
    }
    throw new Error(`Connexion ${email} : abandon après 60 essais`);
}

interface Client {
    label: string;
    cookie: string;
    audience: "student" | "projection";
    states: {at: number; state: PublicState}[];
    disconnects: number;
    reconnects: number;
    closed: boolean;
    revealScores: number;
}

/** Suit le flux SSE comme `connectQuizStream` : relance sur fin ou erreur, avec un délai croissant. */
async function follow(client: Client, sessionId: string) {
    const query = client.audience === "projection" ? "?audience=projection" : "";
    let attempt = 0;
    while (!client.closed) {
        try {
            const res = await fetch(`${BASE}/api/quiz/sessions/${sessionId}/stream${query}`, {headers: headers(client.cookie)});
            if (res.status !== 200 || !res.body) throw new Error(`stream HTTP ${res.status}`);
            if (res.headers.get("content-encoding")) console.warn(`  ! ${client.label} : Content-Encoding ${res.headers.get("content-encoding")} sur le flux`);
            attempt = 0;
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            while (!client.closed) {
                const {value, done} = await reader.read();
                if (done) throw new Error("flux terminé");
                buffer += decoder.decode(value, {stream: true});
                let end;
                while ((end = buffer.indexOf("\n\n")) >= 0) {
                    const frame = buffer.slice(0, end);
                    buffer = buffer.slice(end + 2);
                    if (!frame.startsWith("event: state")) continue;
                    const state = JSON.parse(frame.slice(frame.indexOf("data: ") + 6)) as PublicState;
                    client.states.push({at: Date.now(), state});
                }
            }
            await reader.cancel().catch(() => {});
        } catch (error) {
            if (client.closed) return;
            client.disconnects++;
            console.warn(`  ! ${client.label} : ${(error as Error).message}, relance`);
            await sleep([1000, 2000, 4000, 8000][attempt] ?? 10_000);
            attempt++;
            client.reconnects++;
        }
    }
}

/** Attend que chaque client ait reçu un état vérifiant `pred` après `since` ; rend les délais d'arrivée. */
async function waitAll(clients: Client[], since: number, pred: (s: PublicState) => boolean, timeoutMs: number): Promise<number[]> {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
        const arrivals = clients.map((c) => c.states.find((s) => s.at >= since && pred(s.state))?.at ?? null);
        if (arrivals.every((a) => a !== null)) return arrivals.map((a) => (a as number) - since);
        if (Date.now() > deadline) {
            const missing = clients.filter((_, i) => arrivals[i] === null).map((c) => c.label);
            throw new Error(`Événement manquant après ${timeoutMs} ms pour : ${missing.join(", ")}`);
        }
        await sleep(25);
    }
}

const pct = (values: number[], p: number) => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? 0;
};

// ── Séance ──────────────────────────────────────────────────────────────────

async function run() {
    const studentCount = Number(process.env.QUIZ_STUDENTS ?? 40);
    const projectionCount = Number(process.env.QUIZ_PROJECTIONS ?? 1);
    const longPauses = (process.env.QUIZ_LONG_PAUSES ?? "70").split(",").filter(Boolean).map(Number);
    const pause = Number(process.env.QUIZ_PAUSE ?? 2) * 1000;
    /** Après quelles questions placer les silences : réparties sur les 20 corrections. */
    const longPauseSlots = longPauses.map((_, i) => Math.floor(((i + 1) * 20) / (longPauses.length + 1)));
    const report: string[] = [];
    const latencies: Record<string, number[]> = {};
    const record = (key: string, values: number[]) => (latencies[key] ??= []).push(...values);

    // 1. Connexions : toute la salle en même temps, depuis la même IP.
    const loginStats = {rateLimited: 0};
    const adminCookie = process.env.QUIZ_ADMIN_COOKIE ?? await signIn(QUIZ_REHEARSAL_ADMIN.email, loginStats);
    const moduleId = process.env.QUIZ_MODULE_ID;
    if (!moduleId) throw new Error("QUIZ_MODULE_ID manquant (donné par la commande seed)");

    const loginStart = Date.now();
    const loginTimes: number[] = [];
    const cookies = await Promise.all(Array.from({length: studentCount}, async (_, i) => {
        const cookie = await signIn(rehearsalStudent(i).email, loginStats);
        loginTimes.push(Date.now() - loginStart);
        return cookie;
    }));
    report.push(`Connexions : ${studentCount} étudiants en ${((Date.now() - loginStart) / 1000).toFixed(1)} s, ` +
        `${loginStats.rateLimited} refus 429 (médiane ${(pct(loginTimes, 0.5) / 1000).toFixed(1)} s, dernier ${(Math.max(0, ...loginTimes) / 1000).toFixed(1)} s)`);

    // 2. Session, jonction par code court, flux.
    const created = await post<{sessionId: string; shortCode: string}>("/api/quiz/sessions", adminCookie, {moduleId});
    if (created.status !== 201 || !created.data) throw new Error(`Création de session : HTTP ${created.status}`);
    const {sessionId, shortCode} = created.data;
    report.push(`Session ${shortCode} (${sessionId})`);

    const joinStart = Date.now();
    const joins = await Promise.all(cookies.map((c) => post("/api/quiz/join", c, {code: shortCode.toLowerCase()})));
    const badJoins = joins.filter((j) => j.status !== 200).map((j) => j.status);
    report.push(`Jonctions : ${joins.length - badJoins.length}/${joins.length} en ${Date.now() - joinStart} ms${badJoins.length ? ` (échecs : ${badJoins.join(", ")})` : ""}`);

    const students: Client[] = cookies.map((cookie, i) => ({label: `étudiant ${i}`, cookie, audience: "student", states: [], disconnects: 0, reconnects: 0, closed: false, revealScores: 0}));
    const projections: Client[] = Array.from({length: projectionCount}, (_, i) => ({label: `projection ${i}`, cookie: adminCookie, audience: "projection", states: [], disconnects: 0, reconnects: 0, closed: false, revealScores: 0}));
    const all = [...students, ...projections];
    for (const c of all) void follow(c, sessionId);
    await waitAll(all, 0, (s) => s.phase === "lobby", 15_000);

    // 3. Phase autonome : chaque étudiant enchaîne ses questions à son rythme.
    const t0 = Date.now();
    const res0 = await post(`/api/quiz/sessions/${sessionId}/start`, adminCookie);
    if (res0.status !== 200) throw new Error(`start : HTTP ${res0.status}`);
    record("ouverture de la question 1", await waitAll(all, t0, (st) => st.phase === "running", 15_000));
    let answerErrors = 0;
    const latest = (c: Client) => c.states.at(-1)?.state;

    await Promise.all(students.map(async (s, i) => {
        let handled = -1;
        for (;;) {
            const state = latest(s);
            if (!state || state.phase === "lobby") {
                await sleep(25);
                continue;
            }
            if (state.phase !== "running" || state.done) return;
            const question = state.question;
            if (!question || question.index === handled) {
                await sleep(25);
                continue;
            }
            handled = question.index;
            // Un étudiant sur dix laisse filer la question : le chrono du serveur le fait avancer.
            if ((i + question.index) % 10 === 0) continue;
            // Réponse étalée sur la première moitié du temps accordé.
            await sleep(Math.random() * question.durationSeconds * 1000 * 0.5);
            const ids = [...question.options].sort(() => Math.random() - 0.5).slice(0, question.expectedCount).map((o) => o.id);
            const sent = Date.now();
            const r = await post(`/api/quiz/sessions/${sessionId}/answer`, s.cookie, {questionId: question.id, selectedIds: ids});
            if (r.status !== 200) {
                answerErrors++;
                console.warn(`  ! ${s.label} q${question.index} : réponse HTTP ${r.status}`);
            }
            record("réponse (aller-retour)", [Date.now() - sent]);
        }
    }));

    // Sans étudiant (mode staging), personne ne termine : l'enseignant passe lui-même à la correction.
    if (studentCount === 0) {
        const reveal = await post(`/api/quiz/sessions/${sessionId}/reveal`, adminCookie);
        if (reveal.status !== 200) throw new Error(`reveal : HTTP ${reveal.status}`);
    }

    // 4. Correction collective : ouverte seule quand tout le monde a fini.
    // La correction s'ouvre sur la dernière réponse, souvent avant la fin des boucles étudiantes :
    // on compte donc depuis le départ, sinon l'état déjà reçu est ignoré.
    let t = t0;
    let total = 0;
    for (let q = 0; ; q++) {
        record("correction", await waitAll(all, t, (st) => st.phase === "review" && st.question?.index === q, 600_000));
        total = latest(all[0])!.question!.total;
        for (const s of students) {
            const r = s.states.findLast((x) => x.state.phase === "review" && x.state.question?.index === q)!.state;
            s.revealScores += r.reveal?.scoreObtained ?? 0;
        }

        // Silences longs répartis dans la séance (correction commentée), pour éprouver les flux inactifs.
        const silenceAt = longPauseSlots.indexOf(q);
        const silence = silenceAt >= 0 ? longPauses[silenceAt] * 1000 : pause;
        if (silence > pause) console.log(`  silence de ${silence / 1000} s sur la correction (q${q})`);
        await sleep(silence);

        t = Date.now();
        const res = await post(`/api/quiz/sessions/${sessionId}/next`, adminCookie);
        if (res.status !== 200) throw new Error(`next : HTTP ${res.status}`);
        if (q === total - 1) {
            record("fin", await waitAll(all, t, (st) => st.phase === "finished", 15_000));
            break;
        }
        process.stdout.write(`  question ${q + 1}/${total} corrigée
`);
    }

    // 5. Cohérence des scores : somme des corrections reçues = score final affiché.
    let scoreMismatch = 0;
    for (const s of students) {
        const final = s.states.findLast((x) => x.state.phase === "finished")!.state;
        if (Math.abs((final.score ?? -1) - s.revealScores) > 1e-6) scoreMismatch++;
        if (final.scoreMax !== total - 1) scoreMismatch++;
    }
    for (const c of all) c.closed = true;

    report.push(`Questions jouées : ${total}`);
    report.push(`Réponses en erreur : ${answerErrors}`);
    report.push(`Scores incohérents : ${scoreMismatch}/${students.length} (barème attendu ${total - 1})`);
    report.push(`Coupures de flux : ${all.reduce((n, c) => n + c.disconnects, 0)}, relances : ${all.reduce((n, c) => n + c.reconnects, 0)}`);
    report.push(`États reçus : ${all.reduce((n, c) => n + c.states.length, 0)} sur ${all.length} flux`);
    for (const [key, values] of Object.entries(latencies)) {
        report.push(`Délai ${key} : médiane ${pct(values, 0.5)} ms, p95 ${pct(values, 0.95)} ms, max ${Math.max(...values)} ms (${values.length} mesures)`);
    }
    console.log("\n── Rapport de répétition ──\n" + report.map((l) => `- ${l}`).join("\n"));
    process.exit(0);
}

const command = process.argv[2];
if (command === "seed") await seed();
else if (command === "run") await run().catch((error) => {
    console.error(`\nÉchec de la répétition : ${(error as Error).message}`);
    process.exit(1);
});
else {
    console.error("Usage : bun run quiz-rehearsal <seed|run>");
    process.exit(1);
}
