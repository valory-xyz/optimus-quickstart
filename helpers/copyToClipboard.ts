import { message } from "antd";

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  message.success("Copied to clipboard");
};
