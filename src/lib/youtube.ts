const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

const SHORT_HOSTS = new Set(["youtu.be"]);
const LONG_HOSTS = new Set([
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "music.youtube.com",
    "youtube-nocookie.com",
    "www.youtube-nocookie.com",
]);

/**
 * Identifiant d'une vidéo YouTube à partir de son URL (youtu.be/…, watch?v=…, embed/…, shorts/…, live/…),
 * ou `null`. Les domaines sont comparés exactement : `youtube.com.evil.example` n'est pas YouTube.
 */
export function getYouTubeId(rawUrl: string): string | null {
    if (!URL.canParse(rawUrl)) return null;
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    const host = url.hostname.toLowerCase();
    let candidate: string | null = null;

    if (SHORT_HOSTS.has(host)) {
        candidate = url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (LONG_HOSTS.has(host)) {
        const [first, second] = url.pathname.split("/").filter(Boolean);
        if (first === "watch") candidate = url.searchParams.get("v");
        else if (first === "embed" || first === "shorts" || first === "live" || first === "v") candidate = second ?? null;
    }

    return candidate && VIDEO_ID.test(candidate) ? candidate : null;
}

/** Vignette « hqdefault » (480×360) : existe pour toute vidéo publique, sans clé d'API. */
export function youtubeThumbnailUrl(videoId: string): string {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
