import { useCallback, useEffect, useState } from "react";

interface GifData {
  images: {
    original: {
      url: string;
    };
  };
}

export default function useRandomGif(tag = "404-not-found") {
  const [gifUrl, setGifUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGif = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/random?api_key=${apiKey}&tag=${encodeURIComponent(tag)}&rating=g`
      );
      if (!response.ok) throw new Error(`Giphy error ${response.status}`);
      const { data } = (await response.json()) as { data: GifData };
      const url = data?.images?.original?.url;
      if (!url) throw new Error("No GIF returned");
      setGifUrl(url);
    } catch {
      setGifUrl(
        "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTg3ejJ6dTBucnNpYmR5bnE1N3A1Mm9ocGw5MzUwM3Q0Yjh4bnB6MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lJnAXeJO8tE7E37mxq/giphy.gif"
      );
      setError("Failed to load GIF");
    } finally {
      setLoading(false);
    }
  }, [tag]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGif();
  }, [fetchGif]);

  return { gifUrl, loading, error, refetch: fetchGif };
}
