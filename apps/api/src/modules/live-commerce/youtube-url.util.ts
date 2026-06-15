const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{6,}$/;

export function parseYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

    if (host === "youtu.be") {
      return normalizeVideoId(parsed.pathname.split("/").filter(Boolean)[0]);
    }

    if (host !== "youtube.com" && host !== "m.youtube.com") {
      return null;
    }

    if (parsed.pathname === "/watch") {
      return normalizeVideoId(parsed.searchParams.get("v"));
    }

    const [section, videoId] = parsed.pathname.split("/").filter(Boolean);

    if (section === "live" || section === "embed") {
      return normalizeVideoId(videoId);
    }

    return null;
  } catch {
    return null;
  }
}

export function buildYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

function normalizeVideoId(videoId: string | null | undefined): string | null {
  if (!videoId) {
    return null;
  }

  return YOUTUBE_ID_PATTERN.test(videoId) ? videoId : null;
}
