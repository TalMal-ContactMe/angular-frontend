import { Injectable} from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Router, UrlSerializer } from '@angular/router';

import { Observable, Subscription, Subject } from 'rxjs';

import { CookieService } from 'ngx-cookie-service';
import { IContactRequest } from "../models/outbox/ContactRequest";
import { IChatMessage } from "../models/inbox/ChatMessage";
import { SenderType } from "../models/SenderType";
import { WebsocketService } from '../services/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService 
{	
	//TODO: switch env file when running server like: ng serve --configuration=production
	// TODO: handle network failer, when hosts file does not contain "host.docker.internal -> docker machine ip"
	private static readonly BROWSER_COOKIE_KEY_USER_CHAT: string = "userCookie";
	private chatId: string = "";
	private userName: string = "";
	private avatar: string = "";
	
	private onChatStartedFunctionHolder!: () => void;
	private onChatAvailableFunctionHolder!: () => void;
	private onChatDisconnectFunctionHolder!: () => void;

  	constructor(private websocketService: WebsocketService, private cookieService: CookieService, private http: HttpClient, private router: Router, private urlSerializer: UrlSerializer)
  	{
		//console.log(process.env.ENVIRONMENT);
		console.log(environment.startNewChatUrl);
	}
	
	// start a new chat and set cookie for future use 
  	startChat(name:string, email:string, message:string, avatar:string)
  	{
		this.closeExistingChat();
		
		var contactRequest = this.buildIContactRequest(name,email,message);
		//console.log("starting new chat: " + JSON.stringify(contactRequest));
		
		// TODO: do i need to unsubscribe from this post call ?
		// send request to server
		console.log("in startChat() calling: "+environment.startNewChatUrl);
		this.http
	      .post(environment.startNewChatUrl, contactRequest)
	      .subscribe({
	        next: (data) => 
	        {
				var contactResponse: IChatMessage = JSON.parse(JSON.stringify(data));
				//console.log(contactResponse);
				
				// set user cookie to identify chat 
				this.cookieService.set(ChatService.BROWSER_COOKIE_KEY_USER_CHAT ,this.buildUserCookie(contactResponse.name,contactResponse.chatId, avatar));
				
				// TODO: handle server not available situation and errors
				// TODO: what about security, authentication
				this.onChatStartedFunctionHolder();
			},
	        error: (error) => console.log(error),
	        complete: () => {
	          //console.log('startChat complete');
	        }
	      });
	}
	
	// load existing messages and, open a websocket connection to slack 
  	public subscribeToChat():Observable<any>|null
	{
		var result = null;
		
		// get existing chat details
		var chatId = this.getChatId();
		if(chatId)
		{
			// build target url
			var tree = this.router.createUrlTree([], {queryParams: {[environment.queryKeyChatId]: chatId}});
  			var urlWithChatId = environment.chatWebSocketUrl + this.urlSerializer.serialize(tree)
			console.log("in subscribeToChat() calling: "+urlWithChatId);
			
			// open web socket connection to url
			result = this.websocketService.connect(urlWithChatId);
			
			// enable chat component in view
			this.onChatAvailableFunctionHolder();
		}
		else
		{
			console.log("no existing chat cookie found, start a new chat by submitting the contact form");
		}
		
		return result;
	}	

	// send message to websocket to sned it to server side
  	public sendNewMessage(newMessage:string)
  	{
		this.websocketService.sendMessage(this.buildIChatMessage(newMessage));
	}

	/**
	 * init variables to be ready to subscribe to new chat, and close open connections
	 */
	public closeExistingChat() 
	{
		//console.log("in chat.service.closeExistingChat()");
		this.onChatDisconnectFunctionHolder();
		
		this.chatId = "";
		this.userName = "";
		this.avatar = "";
		this.cookieService.delete(ChatService.BROWSER_COOKIE_KEY_USER_CHAT);
  	}
  	
  	public isChatDetailsAvailable():boolean
  	{
		return this.getChatId()?true:false;
	}
	
	private getChatId():string
	{
		if(!this.chatId)
		{
			this.loadUserCookie();
		}
		
		return this.chatId;
	}
	
	private getUserName():string
	{
		if(!this.userName)
		{
			this.loadUserCookie();
		}
		
		return this.userName;
	}
	
	public getUserAvatar():string
	{
		if(!this.avatar)
		{
			this.loadUserCookie();
		}
		
		return this.avatar;		
	}
	
	/**
	load chat details from user cookie 
	 */
	private loadUserCookie()
	{
		var userCookie = this.cookieService.get(ChatService.BROWSER_COOKIE_KEY_USER_CHAT)
		if(userCookie)
		{
			var parsedUserCookie = JSON.parse(userCookie);
			if(parsedUserCookie)
			{
				this.chatId = parsedUserCookie.chatId;
				this.userName = parsedUserCookie.name;
				this.avatar = parsedUserCookie.avatar;
			}
		}
	}
	
	public isMessageFromCurrentChat(chatIdToTest: string):boolean
	{
		var result = false;
		var curentChatId = this.getChatId();
		if(curentChatId && chatIdToTest && chatIdToTest === curentChatId)
		{
			result = true;
		}
		
		return result;
	}
	
	
	// set function callback to enable chat component in view
  	onChatAvailable(fn: () => void) 
  	{
    	this.onChatAvailableFunctionHolder = fn;
  	}
  	
  	// set function callback to disconnect chat 
  	onChatDisconnect(fn: () => void) 
  	{
		this.onChatDisconnectFunctionHolder = fn;
	}
	
	onChatStarted(fn: () => void) 
  	{
		this.onChatStartedFunctionHolder = fn;
	}
	
  	
  	private buildUserCookie(_name:string, _chatId:string, _avatar:string)
  	{
		var result = 
		{	
			name: _name, 
			chatId: _chatId,
			avatar: _avatar
		};
		
		return JSON.stringify(result);
	}
	
	private buildIContactRequest(_name:string, _email:string, _message:string):IContactRequest
	{
		return {
			name: _name,
			email: _email,
			message: _message
		};	
	}
	
	private buildIChatMessage(message:string):IChatMessage
	{
		return {
			chatId: this.getChatId(),
			messageId: "00000000", // message id is givven by slack
			name: this.getUserName(),
			message: message,
			avatar: this.getUserAvatar(),
			avatarOnLeftSide: true,
			date: new Date(), //this.datePipe.transform(new Date(), 'dd-MM-yyyy')
			senderType: SenderType.USER
		};	
	}
}
