// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { config } from './config.prod';
export const environment = 
{
	production: false,
	
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
