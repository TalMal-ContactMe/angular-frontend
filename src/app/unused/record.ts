import { SenderType } from "./SenderType";

export interface IRecord{
	conversationId: string;
	messageId: string;
	sender: string;
	name: string
	email: string;	
	message: string;
	date: Date;
	senderType: SenderType;
}