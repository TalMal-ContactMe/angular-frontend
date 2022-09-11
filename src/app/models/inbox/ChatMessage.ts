import { SenderType } from "../SenderType";

export interface IChatMessage
{
	chatId: string;
	messageId: string;
	name: string;
	message: string;
	avatar: string;
	avatarOnLeftSide: boolean;
	date: Date;
	senderType: SenderType;
}