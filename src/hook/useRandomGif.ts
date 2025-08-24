import { useCallback, useEffect, useState } from "react";

interface GifData {
  images: {
    original: {
      url: string;
    };
  };
}

export default function useRandomGif() {
  const [gifUrl, setGifUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGif = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://api.giphy.com/v1/gifs/random?api_key=V1lkx88QRDG9DnAdryMooFePC01U9WTa&tag=404-not-found&rating=g"
      );
      const { data } = (await response.json()) as { data: GifData };
      setGifUrl(data.images.original.url);
    } catch {
      setGifUrl(
        "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTg3ejJ6dTBucnNpYmR5bnE1N3A1Mm9ocGw5MzUwM3Q0Yjh4bnB6MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lJnAXeJO8tE7E37mxq/giphy.gif"
      );
      setError("Failed to load GIF");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // chargement initial
    fetchGif();
  }, [fetchGif]);

  return { gifUrl, loading, error, refetch: fetchGif };
}
