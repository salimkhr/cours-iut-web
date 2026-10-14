import {describe, expect, it} from "bun:test";
import {getYouTubeId, youtubeThumbnailUrl} from "./youtube";

describe("getYouTubeId", () => {
    it("lit le format court youtu.be, avec ou sans paramètres de suivi", () => {
        expect(getYouTubeId("https://youtu.be/AiytemqB_F0")).toBe("AiytemqB_F0");
        expect(getYouTubeId("https://youtu.be/AiytemqB_F0?is=HuqiM0VeCgSwDDAG")).toBe("AiytemqB_F0");
    });

    it("lit le format watch?v=", () => {
        expect(getYouTubeId("https://www.youtube.com/watch?v=pyXouxa0WnY")).toBe("pyXouxa0WnY");
        expect(getYouTubeId("https://youtube.com/watch?feature=share&v=pyXouxa0WnY&t=42s")).toBe("pyXouxa0WnY");
        expect(getYouTubeId("https://m.youtube.com/watch?v=pyXouxa0WnY")).toBe("pyXouxa0WnY");
    });

    it("lit les formats embed, shorts et live", () => {
        expect(getYouTubeId("https://www.youtube.com/embed/VdpqKwFXYls")).toBe("VdpqKwFXYls");
        expect(getYouTubeId("https://www.youtube-nocookie.com/embed/VdpqKwFXYls")).toBe("VdpqKwFXYls");
        expect(getYouTubeId("https://www.youtube.com/shorts/VdpqKwFXYls")).toBe("VdpqKwFXYls");
        expect(getYouTubeId("https://www.youtube.com/live/VdpqKwFXYls")).toBe("VdpqKwFXYls");
    });

    it("retourne null pour une URL qui n'est pas une vidéo YouTube", () => {
        expect(getYouTubeId("https://openai.com/fr-FR/index/an-alien-mind/")).toBeNull();
        expect(getYouTubeId("https://www.youtube.com/@underscore_")).toBeNull();
        expect(getYouTubeId("https://www.youtube.com/playlist?list=PL123")).toBeNull();
        expect(getYouTubeId("https://youtube.com/watch")).toBeNull();
        expect(getYouTubeId("pas-une-url")).toBeNull();
    });

    it("refuse un identifiant qui n'a pas la forme attendue (11 caractères)", () => {
        expect(getYouTubeId("https://youtu.be/court")).toBeNull();
        expect(getYouTubeId("https://youtu.be/AiytemqB_F0/../../x")).toBeNull();
        expect(getYouTubeId("https://www.youtube.com/watch?v=<script>alert(1)</script>")).toBeNull();
    });

    it("ne se laisse pas tromper par un faux domaine", () => {
        expect(getYouTubeId("https://youtube.com.evil.example/watch?v=AiytemqB_F0")).toBeNull();
        expect(getYouTubeId("https://notyoutu.be/AiytemqB_F0")).toBeNull();
    });
});

describe("youtubeThumbnailUrl", () => {
    it("pointe vers le CDN d'images de YouTube", () => {
        expect(youtubeThumbnailUrl("AiytemqB_F0")).toBe("https://i.ytimg.com/vi/AiytemqB_F0/hqdefault.jpg");
    });
});
