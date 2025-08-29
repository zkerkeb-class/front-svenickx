import { IMessage } from "../models/message";

export const sortMessages = (messages: IMessage[], slice?: number) => {
  const sorted = messages.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateA - dateB;
  });
  // Si slice est défini, retourne les x derniers messages
  if (slice !== undefined) {
    return sorted.slice(-slice);
  }
  return sorted;
};
