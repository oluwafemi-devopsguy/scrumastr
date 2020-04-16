import { Injectable, ElementRef, ViewChild } from '@angular/core';
import {formatDate} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  @ViewChild('con') cont: ElementRef;
  @ViewChild('conn', {read: ElementRef}) private elem: ElementRef;
  

  public ws: any;
  public ws_url = 'wss://9zvbc650m4.execute-api.us-east-2.amazonaws.com/chatscrum/';
  public messages = [];
  public chat_text:String;
  public mutableObserver: MutationObserver;
  full_data = localStorage.getItem('full_data');
  
  
  
  
  constructor() {  
    
    this.ws = new WebSocket(this.ws_url);
    
    
  }

 

  getMessages() {
    
   

    this.ws.onopen = (event) => {

      const secondContext = {
        action: "connectToProject",
        project_name: String(sessionStorage.getItem('proj_name'))
      }

      this.ws.send(JSON.stringify(secondContext));


      const context = {
        action:"getRecentMessages", 
        project_name:String(sessionStorage.getItem('proj_name')),
        "token": sessionStorage.getItem('token')
      };

      this.ws.send(JSON.stringify(context));

      

    };


    this.ws.onmessage = (event) => {

      let data = JSON.parse(event.data) 

        if (data['messages'] !== undefined) {

          data['messages'].forEach((message) => {
            this.messages.push(message);
          })
        }
    }
    let elem = document.getElementById('conn');
    
  
    
  }

  getCurrentTime() {
    let currentDate = new Date();
    return formatDate(currentDate, "h:mm a . dd-MM-yyyy", 'en-US');
    //return new Date().toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
  }

  autoScroll() {
    window.scrollBy(0,1);
    let scrolldelay = setTimeout('autoscroll()', 10);
  }

  sendMessage() {
    if (this.chat_text) {
      let context = {
        "action": "sendMessage",
        "project_name": String(sessionStorage.getItem('proj_name')),
        "username": String(sessionStorage.getItem('realname')),
        "timestamp": this.getCurrentTime(),
        "message": this.chat_text,
        "token": sessionStorage.getItem('token')
        
      }

      this.ws.send(JSON.stringify(context));
      this.chat_text = '';
      
      
    }
  }

  


 

}
