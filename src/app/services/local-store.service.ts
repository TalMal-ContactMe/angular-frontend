import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
/**
 * wrapper around local storage native library
 */
export class LocalStoreService 
{
	constructor() { }
  
	public saveData(key: string, value: string) 
	{
    	localStorage.setItem(key, value);
 	}

	public getData(key: string) 
	{
    	return localStorage.getItem(key)
  	}
  	
  	public removeData(key: string) 
  	{
    	localStorage.removeItem(key);
  	}

  	public clearData() 
  	{
    	localStorage.clear();
  	}
}
