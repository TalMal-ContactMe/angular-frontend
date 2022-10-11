import { config } from './config.prod';

export const environment = 
{
  	production: true,
  	
  	chatWebSocketUrl: "ws://"+config.dockerMachineIp+":8082",
	startNewChatUrl: "http://"+config.dockerMachineIp+":8082/contact/create/",
  	//chatWebSocketUrl: "ws://contactForm:8082",
	//startNewChatUrl: "http://contactForm:8082/contact/create/",
	queryKeyChatId: "chatId",
	
	imageRelativePathChatAvatar: "../assets/images/",
	imageMaleAvatar: "maleAvatar.png",
	imageFemaleAavatar: "femaleAvatar.png",
	imageRobotAavatar: "robotAvatar.png",
	imageOwnerAvatar: "maleAvatar.png",
};
