import { Injectable, NgZone } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class SseService 
{
  constructor(private zone: NgZone) {}
  
	connect(url: string): void 
	{
    	let source = new EventSource(url);
    	source.addEventListener('message', message => 
    	{
        	console.log(JSON.parse(message.data));
        });        
	}

  getServerSentEvent(url: string): Observable<any> 
  {
    return Observable.create((observer:any) => 
    {
      const eventSource = this.getEventSource(url);
      eventSource.onmessage = (event: any)=> 
      {
		//console.log("sse onmessage()" + JSON.parse(event.data));
        this.zone.run(() => 
        {
          observer.next(event.data);
        });
      };
      
      eventSource.onerror = (error: any)=> 
      {
		//console.log("sse onerror() ");
		//console.log(error);
        this.zone.run(() => 
        {
          observer.error(error);
        });
      };
    });
  }
  
    private getEventSource(url: string): EventSource 
    {
    	return new EventSource(url);
  	}
}