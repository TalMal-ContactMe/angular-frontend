import { Injectable, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subscription} from 'rxjs';
import { IChatMessage } from "../models/inbox/ChatMessage";
import { SenderType } from "../models/SenderType";

@Injectable({
  providedIn: 'root'
})

export class WebsocketService 
{
	private webSocket$!: WebSocketSubject<any>;

	constructor() {}
	
	public connect(url: string):Observable<any>|null
	{
		var result = null;

		// close existing web socket 
		this.disconnect();
		
		// open a new web socket
		// remember to use wss:// instead of ws:// for a secure connection, in production		
		this.webSocket$ = webSocket(url);
		result = this.webSocket$.asObservable();
		
		return result;
	}
	
	/**
	 * close all connections
	 */
	public disconnect()
	{
		if(this.webSocket$)
		{
			this.webSocket$.complete();
		}
	}
	
	/**
		send message to web socket's target
	 */
	public sendMessage(message:IChatMessage) 
	{
		if(this.webSocket$)
		{
    		this.webSocket$.next(message);
		}
	}
	
	ngOnDestroy() 
	{
		console.log("in WebsocketService.ngOnDestroy");
        this.disconnect();
    }
}