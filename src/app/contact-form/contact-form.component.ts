import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, NgForm } from '@angular/forms'
import { ChatService } from '../services/chat.service';
import { AvatarType } from "../models/AvatarType";

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.css']
})
export class ContactFormComponent
{
	@Output("hideAllComponents") hideAllComponents:  EventEmitter<any> = new EventEmitter();
	public isShow = true;  
	
	defaultAvatar = "Male";
	avatars = [
		{id: '1', value: AvatarType.MALE},
		{id: '2', value: AvatarType.FEMALE},
		{id: '3', value: AvatarType.OTHER}
	];
	
	public FormData: FormGroup= this.builder.group(
	{
		name: new FormControl('', [Validators.required]),
		message: new FormControl('', [Validators.required]),
		email: new FormControl('', [Validators.required, Validators.email]),
		avatar: new FormControl('', [Validators.required])
	});
	 
  	constructor(private builder: FormBuilder, private chatService: ChatService) 
  	{
		// when chat details exist (in a cookie) show chat and hide contact form 
		if(this.chatService.isChatDetailsAvailable())
		{
			this.isShow = false;
		}
		else
		{
			this.isShow = true;
		}
	 }

	// extract form data, and start chat
	onSubmit(formData:FormGroup) 
	{
		var data = JSON.parse(JSON.stringify(formData));
		this.chatService.startChat(data.name, data.email, data.message, data.avatar);
	}
	
	// hide all components except this one
  	show()
  	{
		this.hideAllComponents.emit();
		this.isShow = true;
	}
  	
  	// hide this component
  	hide()
  	{
		this.isShow = false;
	}
}
