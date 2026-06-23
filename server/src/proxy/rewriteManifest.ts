import { enc } from "./utils.js";

const absolutize = (line: string, baseUrl: string): string => {
  try {
    return new URL(line, baseUrl).toString();
  } catch {
    return line;
  }
};

const isPlaylistUrl = (url: string): boolean => /\.m3u8($|[?#])/i.test(url);

export const rewriteManifest = (
  text: string,
  manifestUrl: string,
  channelId: string,
  origin: string,
): string => {
  void origin;

  return text
    .split("\n")
    .map((rawLine) => {
      const line = rawLine.trim();
      if (line === "" || line.startsWith("#")) {
        if (line.includes('URI="')) {
          return rawLine.replace(/URI="([^"]+)"/g, (_match, uri: string) => {
            const absoluteUrl = absolutize(uri, manifestUrl);
            const route = isPlaylistUrl(absoluteUrl) ? "playlist" : "seg";
            return `URI="/proxy/${channelId}/${route}/${enc(absoluteUrl)}"`;
          });
        }

        return rawLine;
      }

      const absoluteUrl = absolutize(line, manifestUrl);
      const route = isPlaylistUrl(absoluteUrl) ? "playlist" : "seg";
      return `/proxy/${channelId}/${route}/${enc(absoluteUrl)}`;
    })
    .join("\n");
};
