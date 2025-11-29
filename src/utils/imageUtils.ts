export const extractImageUrlsFromMarkdown = (markdown: string): string[] => {
  const regex = /!\[.*?\]\((.*?)\)/g;
  const urls: string[] = [];
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    if (match[1]) {
      urls.push(match[1]);
    }
  }

  return urls;
};
