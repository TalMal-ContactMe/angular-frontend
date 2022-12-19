// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { config } from './config.prod';
export const environment = 
{
	production: false,
  	
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
