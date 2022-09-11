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
	
	hideAllComponents():any 
	{
    	this.chatChild.hide();
    	this.contactChild.hide();
  	}
}