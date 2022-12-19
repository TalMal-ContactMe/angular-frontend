import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { environment } from '../../environments/environment';
import { ChatService } from '../services/chat.service';
import { LocalStoreService } from '../services/local-store.service';
import { SenderType } from "../models/SenderType";
import { AvatarType } from "../models/AvatarType";
import { IChatMessage } from "../models/inbox/ChatMessage";
import { Observable, Subscription} from 'rxjs';
import { MessageIdFlag } from "../models/MessageIdFlag";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: []
})
export class ChatComponent implements OnInit, OnDestroy
{
	// chat avatar image path
	public readonly maleAavatar: string = environment.imageRelativePathChatAvatar+environment.imageMaleAvatar;
	public readonly femaleAavatar: string = environment.imageRelativePathChatAvatar+environment.imageFemaleAavatar;
	public readonly robotAavatar: string = environment.imageRelativePathChatAvatar+environment.imageRobotAavatar;
	public readonly ownerAavatar: string = environment.imageRelativePathChatAvatar+environment.imageOwnerAvatar;
	public readonly errorAavatar: string = environment.imageRelativePathChatAvatar+environment.imageErrorAvatar;
	
	@Output("hideAllComponents") hideAllComponents:  EventEmitter<any> = new EventEmitter();
	public isDisabled = true;
	public isShow = false; 
	
	public message: string = "";
	private static readonly messagesLocalStorageKey: string = "localMessages";

	private subscriptionMap = new Map();
	private observableMap = new Map();
	
	constructor(private chatService: ChatService, private localStoreService: LocalStoreService)
	{
		// bind enableChat() to enable chat presentation, when chat connection is opened
		this.chatService.onChatAvailable(this.enableChat.bind(this));
		
		// bind disconnectChat() to close chat and init properties, when chat connection is closed
		this.chatService.onChatDisconnect(this.disconnectChat.bind(this));
		
		// bind subscribeToChat() to enable subscription open after chat was started
		this.chatService.onChatStarted(this.subscribeToChat.bind(this));
		
		// check for existing chat, and present chat if exists
		if(this.chatService.isChatDetailsAvailable())
		{
			this.isDisabled = false;
			this.isShow = true;
			this.subscribeToChat();
		}
		else
		{
			this.isDisabled = true;
			this.isShow = false;
		}
	}
	
	ngOnInit(){}
	
	/**
	 * open chat connection and present chat to user
	 */
	enableChat()
	{
		this.show();
		this.isDisabled = false;
	}
	
	/**
	 *	erase preexisting chat, before subscribing to new chat.
	 *	use saved chat id to subscribe to live chat, with backend.
	 */
	subscribeToChat()
	{
		this.fixMessagesWithCommunicationProblem();
		
		// subscribe to messages sent from the server
		var chatObservable = this.chatService.subscribeToChat();
		if(chatObservable != null)
		{
			this.observableMap.set(this.chatService.getChatId(),chatObservable);
			this.subscriptionMap.set(this.chatService.getChatId(), chatObservable.subscribe(
			value => 
			{
				// check if input message belongs to this chat 
				if(this.chatService.isMessageFromCurrentChat(value.chatId))
				{
					// set appropriate image for message with communication problems 
					if(value.messageId === MessageIdFlag[MessageIdFlag.COMMUNICATION_ERROR])
					{
						// set ERROR image to be displayed with message
						value.avatar = this.parseAvaterImage(AvatarType.ERROR); 
					}
					else
					{
						// set user avatar to be displayed with message
						value.avatar = this.parseAvaterImage(this.chatService.getUserAvatar());	
					}

					// set appropriate presentation side in conversation
					value.avatarOnLeftSide = this.isAvatarOnLeftSide(value.senderType);
					
					// set appropriate date format for message - angular assumes epoch date is in milisecconds (formatting is done at html page)
					value.date = value.date * 1000;//this.datePipe.transform(new Date(), 'dd-MM-yyyy')
					
					// store message in browser local storage
					this.storeMessage(value);
				}
				else
				{
					// message came with wrong chatId
					console.log("in subscribeToChat with wrong chat id: saved chat id: "+this.chatService.getChatId()+", message caht id: "+value.chatId);
				}
			},
	  		error => 
	  		{
				// error signal - after this signal the web socket sends a completed event and closes
				console.log(error);
			},
	        () => 
	  		{
				// complete subscription signal - nothing to do here 
			}));
		}
		else
		{
			console.log("could not subscribe to chat ");
		}
	}
	
	/**
	 * read messages from browser local storage.
	 * return empty array if nothing found or on error 
	 */
	public getMessages():IChatMessage[]
	{
		var result: IChatMessage[] = [];
		var existingValue = this.localStoreService.getData(ChatComponent.messagesLocalStorageKey);
		if(existingValue)
		{
			result = JSON.parse(existingValue);
		}
		
		return result;
	}
	
	/**
	 * store message in browser local storage 
	 */
	private storeMessage(newMessage: IChatMessage)
  	{
		// get existing messages for key	
		var existingValue = this.localStoreService.getData(ChatComponent.messagesLocalStorageKey);
		if(!existingValue)
		{
			// key not found - create new array and store newMessage
			var messages: IChatMessage[] = [];
			messages.push(newMessage); 
			this.localStoreService.saveData(ChatComponent.messagesLocalStorageKey, JSON.stringify(messages));
		}
		else
		{
			// update existing local storage messages
			var existingMessages = JSON.parse(existingValue);
			// check message chronological order, to avoid duplicates
			if(newMessage.date > existingMessages[existingMessages.length - 1].date)
			{ 
				existingMessages.push(newMessage);
				this.localStoreService.saveData(ChatComponent.messagesLocalStorageKey, JSON.stringify(existingMessages));
			}
		}
	}
	
 	ngOnDestroy() 
	{
		this.disconnectChat();
  	}
  	
  	/**
  	 * erase messages from browser local storage.
  	 * close subscriptions, and remove saved chats from server memory. 
  	 */
  	public disconnectChat()
  	{
		this.clearMessages();
		var chatId = this.chatService.getChatId();
		if (chatId && this.observableMap.get(chatId) !== undefined && !this.observableMap.get(chatId).closed) 
		{
			if(this.observableMap.get(chatId))
			{
				this.observableMap.delete(chatId);
			}
			
			if(this.subscriptionMap.get(chatId))
			{
				this.subscriptionMap.get(chatId).unsubscribe();
				this.subscriptionMap.delete(chatId);
			}
		}
	}
	
  	/**
  	 * erase messages from browser local storage.
  	 */
  	private clearMessages()
  	{
		this.localStoreService.removeData(ChatComponent.messagesLocalStorageKey);
	}

	/**
	 * look for messages with communication problem (in browser local storage).
	 * replace found messages with valid ones.
	 * ASSUMPTION: currently, there is no communication problem.
	 */
	private fixMessagesWithCommunicationProblem()
	{
		/* TODO: when browser is refreshed while there is a communication problem, 
		local storage messages will not appear, because you are erasing them in the code below,
		and waiting for them to load anew from the backend, but there is a communication problem.
		*/
		
		// check for previously existing communication error
		for(let message of this.getMessages())
		{
			if(message.messageId === MessageIdFlag[MessageIdFlag.COMMUNICATION_ERROR])
			{
				// found one - clear storage and wait for messages reload.
				this.clearMessages();
				break;
			}
		};		
	}
	
	/**
	 * send message using web socket
	 */
	sendMessageWebSocket() 
	{
		this.chatService.sendNewMessage(this.message);
		this.message = "";
	}
	
	/**
	 * check if presenting the image is appropriate for the SenderType
	 */
	public isShowImage(senderType: SenderType, imageType: string):boolean
	{
		if(senderType === imageType)
		{
			return true;
		}
		
		return false;
	}
	
	/**
	 * choose what side the image will be presented at left/right
	 */
	private isAvatarOnLeftSide(senderType: SenderType):boolean
	{
		var result = true;
		
		switch(senderType)
		{
			case SenderType.OWNER:
			case SenderType.ROBOT:
			{
				result = false;
				break;
			}
			case SenderType.USER:
			default:
			{
				result = true;
				break;
			}
		}
		
		return result;
	}
	
	/**
	 * link avatarType and avatar image path.
	 */
	private parseAvaterImage(avatar: string):string
	{
		var result = null;
		 
		switch(avatar)
		{
			case AvatarType.FEMALE:
			{
				result = this.femaleAavatar;
				break;
			}
			case AvatarType.OTHER:
			{
				result = this.robotAavatar;
				break;
			}
			case AvatarType.ERROR:
			{
				result = this.errorAavatar;
				break;
			}
			case AvatarType.MALE:
			default:
			{
				result = this.maleAavatar;
				break;
			}
		}

		return result;
	}
	
	// hide all components except this one
  	show()
  	{
		this.hideAllComponents.emit();
		this.isShow = true;
	}
  	
  	hide()
  	{
		this.isShow = false;
	}
}