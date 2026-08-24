export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatDate(date?: string | number | Date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString();
}
export function getYouTubeEmbedUrl(url: string): string {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;

  // Extract 11-character YouTube video ID from any link format
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }

  return url;
}
