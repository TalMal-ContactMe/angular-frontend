import { Component, ViewChild } from '@angular/core';
import { ChatComponent } from './chat/chat.component';
import { ContactFormComponent } from './contact-form/contact-form.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent 
{
	@ViewChild(ChatComponent, {static: true}) private chatChild!: ChatComponent;
	@ViewChild(ContactFormComponent, {static: true}) private contactChild!: ContactFormComponent;	
	
	reportServers = [
		{name: "Git", link: "https://github.com/talmal/contact-me"},
      	{name: "Eureka", link: "http://host.docker.internal:8761/myeureka/"},
      	{name: "RabbitMQ", link: "http://host.docker.internal:15672/"}
      	{name: "Config - contact backend", link: "http://host.docker.internal:8888/contact-form"},
      	{name: "Config - messager backend", link: "http://host.docker.internal:8888/message-sender"},
   ];

	hideAllComponents():any 
	{
    	this.chatChild.hide();
    	this.contactChild.hide();
  	}
}