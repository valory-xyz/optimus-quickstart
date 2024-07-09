export const copyToClipboard = async (text: string): Promise<void> =>
  navigator.clipboard.writeText(text);
