import { buildYouTubeEmbedUrl, parseYouTubeVideoId } from "./youtube-url.util";

describe("YouTube live URL utilities", () => {
  it.each([
    ["https://www.youtube.com/watch?v=VIDEO_ID", "VIDEO_ID"],
    ["https://youtu.be/VIDEO_ID", "VIDEO_ID"],
    ["https://www.youtube.com/live/VIDEO_ID", "VIDEO_ID"],
    ["https://www.youtube.com/embed/VIDEO_ID", "VIDEO_ID"],
  ])("parses %s", (url, expected) => {
    expect(parseYouTubeVideoId(url)).toBe(expected);
  });

  it("rejects non-YouTube URLs", () => {
    expect(parseYouTubeVideoId("https://example.com/watch?v=VIDEO_ID")).toBe(
      null,
    );
  });

  it("builds a YouTube embed URL", () => {
    expect(buildYouTubeEmbedUrl("VIDEO_ID")).toBe(
      "https://www.youtube.com/embed/VIDEO_ID",
    );
  });
});
