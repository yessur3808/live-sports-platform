import { enc } from "./utils.js";

const absolutize = (line: string, baseUrl: string): string => {
  try {
    return new URL(line, baseUrl).toString();
  } catch {
    return line;
  }
};

export const rewriteManifest = (
  text: string,
  manifestUrl: string,
  channelId: string,
  origin: string,
): string => {
  return text
    .split("\n")
    .map((rawLine) => {
      const line = rawLine.trim();
      if (line === "" || line.startsWith("#")) {
        if (line.includes('URI="')) {
          return rawLine.replace(/URI="([^"]+)"/g, (_match, uri: string) => {
            const absoluteUrl = absolutize(uri, manifestUrl);
            return `URI="${origin}/proxy/${channelId}/seg/${enc(absoluteUrl)}"`;
          });
        }

        return rawLine;
      }

      const absoluteUrl = absolutize(line, manifestUrl);
      const route = absoluteUrl.includes(".m3u8") ? "playlist" : "seg";
      return `${origin}/proxy/${channelId}/${route}/${enc(absoluteUrl)}`;
    })
    .join("\n");
};
