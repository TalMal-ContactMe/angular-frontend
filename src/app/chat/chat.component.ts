import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { environment } from '../../environments/environment';
import { ChatService } from '../services/chat.service';
import { SenderType } from "../models/SenderType";
import { AvatarType } from "../models/AvatarType";
import { IChatMessage } from "../models/inbox/ChatMessage";
import { Observable, Subscription} from 'rxjs';

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
	
	@Output("hideAllComponents") hideAllComponents:  EventEmitter<any> = new EventEmitter();
	public isDisabled = true;
	public isShow = false; 
	
	public message: string = "";
	public messages: IChatMessage[] = [];
	
	private subscription!: Subscription;
	
	constructor(private chatService: ChatService)
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
	
	subscribeToChat()
	{
		// subscribe to messages sent from the server
		var chatObservable = this.chatService.subscribeToChat();
		if(chatObservable != null)
		{
			//console.log(chatObservable);
			this.subscription = chatObservable.subscribe(
				value => 
				{
					if(this.chatService.isMessageFromCurrentChat(value.chatId))
					{
						value.avatar = this.parseAvaterImage(this.chatService.getUserAvatar());
						value.avatarOnLeftSide = this.isAvatarOnLeftSide(value.senderType);
						// angular assumes epoch date is in milisecconds (formatting is done at html page)
						value.date = value.date * 1000;//this.datePipe.transform(new Date(), 'dd-MM-yyyy')
						//console.log(value);
						this.messages.push(value);
					}
					else
					{
						// message came with wrong chatId
					}
				},
		  		error => 
		  		{
					console.log(error);
					// TODO: shoud i retry websocket connection ? (after error the web socket sends a completed event and closes) 
				},
		        () => 
		  		{
					this.clearMessages();
				}
			);
		}
		else
		{
			console.log("could not subscribe to chat ");
		}
	}
	
 	ngOnDestroy() 
	{
		this.disconnectChat();
  	}
  	
  	public disconnectChat()
  	{
		this.clearMessages();
		if (this.subscription !== undefined && !this.subscription.closed) 
		{
			this.subscription.unsubscribe();
		}
	}
	
  	private clearMessages()
  	{
		this.messages = [];
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
	 * choose what side the image will be presented at left/right
	 */
	isShowImage(senderType: SenderType, imageType: string):boolean
	{
		if(senderType === imageType)
		{
			return true;
		}
		
		return false;
	}
	
	isAvatarOnLeftSide(senderType: SenderType):boolean
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
	
	parseAvaterImage(avatar: string):string
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
