import { Component, ViewChild } from '@angular/core';
import { ChatComponent } from './chat/chat.component';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent 
{
	@ViewChild(ChatComponent, {static: true}) private chatChild!: ChatComponent;
	@ViewChild(ContactFormComponent, {static: true}) private contactChild!: ContactFormComponent;	

	public isLoading = false; 
	public loadingInterval = 0;
	public gitUrl = environment.links.git;
	public reportServers = [
		{name: "Zipkin", link: environment.links.zipkin},
      	{name: "Eureka", link: environment.links.eureka},
      	{name: "RabbitMQ (username:user, password:pass)", link: environment.links.rabbitmq},
      	{name: "Git", link: environment.links.git},
   ];
   
 	constructor(private http: HttpClient)
  	{
		// start interval to check backend availability 
		this.loadingInterval = setInterval(() => 
		{
			this.isSystemReady();
			this.isLoading = true;
		},1000);
	}
	
  	// check if backend server ready to accept requests
	isSystemReady()
	{
		this.http.get(environment.isChatReadyUrl)
		.subscribe({
			next: (data) =>
			{
				// end loading interval and allow site use
				this.isLoading = false;
				clearInterval(this.loadingInterval);
			},
	        error: (error) => 
	        {
				//console.log(error)
			},
	        complete: () => 
	        {
				//console.log('Server connection established.');
	        }
		});
	}
	
	hideAllComponents():any 
	{
		this.chatChild.hide();
    	this.contactChild.hide();
  	}
}