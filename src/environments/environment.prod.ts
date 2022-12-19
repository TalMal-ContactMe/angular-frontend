import { config } from './config.prod';

export const environment = 
{
  	production: true,
  	
  	chatWebSocketUrl: "ws://"+config.dockerMachineIp+":8082",
	startNewChatUrl: "http://"+config.dockerMachineIp+":8082/contact/create/",
	isChatReadyUrl: "http://"+config.dockerMachineIp+":8082/contact/isReady",
	queryKeyChatId: "chatId",
	links: 
	{
		zipkin: "http://host.docker.internal:9411/zipkin/",
		eureka: "http://host.docker.internal:8761/myeureka/",
		rabbitmq: "http://host.docker.internal:15672/",
		git: "https://github.com/TalMal-ContactMe/contact-me-deployment"
	},
	imageRelativePathChatAvatar: "../assets/images/",
	imageMaleAvatar: "maleAvatar.png",
	imageFemaleAavatar: "femaleAvatar.png",
	imageRobotAavatar: "robotAvatar.png",
	imageOwnerAvatar: "maleAvatar.png",
	imageErrorAvatar: "errorAvatar.png",
	chatCoockieExpirationInDays: 7,
};
