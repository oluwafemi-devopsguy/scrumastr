import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  public ws: any;
  public ws_url: String = 'https://6vpxcuvqe4.execute-api.us-west-2.amazonaws.com/dev/';
  messages = [];
  
  
  constructor() { 
    this.ws = new Websocket('https://6vpxcuvqe4.execute-api.us-west-2.amazonaws.com/dev/');
  }


  getMessages(message_array) {

    this.ws.onopen = (event) => {
      const context = {
        action:"getMessages", 
        project_id:sessionStorage.getItem('project_id')
      };

      this.ws.send(JSON.stringify(context));

    };


    this.ws.onmessage = (event) => {

      let data = JSON.parse(event.data) 

        if (data['messages'] !== undefined) {

          data['messages'].forEach((message) => {
            message_array.push(message);
          })
        }
    }
  }

  getCurrentTime() {
    return new Date().toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
  }

  sendMessage(chat_text) {
    if (chat_text) {
      let context = {
        "action": "sendMessage"
        "username": sessionStorage.getItem('username')
        "timestamp": new Date()
      }
    }
  }
 

}
