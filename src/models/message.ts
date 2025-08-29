export interface IMessage {
  id?: number;
  userId: number;
  content: string;
  createdAt: Date;
  firstname?: string;
  lastname?: string;
}
