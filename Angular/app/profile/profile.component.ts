import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public arrCount = [0, 1, 2, 3];
  subs = new Subscription();
  public show_zero: boolean = false;
  public chat_text: string = "";
  public messages = [];
  public websocket;
  
  constructor(public dataservice: DataService, private dragula: DragulaService, private http: HttpClient) { 
    this.dragula.createGroup('mainTable', {
        revertOnSpill: true,
        direction: 'horizontal',
        invalid: (el) => {
            return el.id == 'author' || el.id == 'remove' || el.id == 'blank';
        }
    });
    
    this.subs.add(
        this.dragula.drop('mainTable').subscribe(
            value => {
                console.log(value);
                var el = value['el'];
                var target = value['target'];
                var source = value['source'];
                
                if(target['id'] == source['id'])
                {
                    var offset = 0;
                    
                    for(var i = 0; i < target['children'].length; i++)
                    {
                        if(i == 0 && target['children'][i]['id'] == 'author')
                        {
                            offset = 1;
                            continue;
                        }
                        
                        if(target['children'][i]['id'] == el['id'])
                        {
                            console.log(i - offset);
                            this.dataservice.moveGoal(source['id'], i - offset);
                            break;
                        }
                    }
                } else
                {
                    this.dataservice.changeOwner(source['id'], target['id']);
                }
            }
        )
    );
    
    this.dataservice.realname = sessionStorage.getItem('realname');
    this.websocket = new WebSocket('ws://127.0.0.1:8000');
    this.websocket.onopen = (evt) => {
        this.websocket.send(JSON.stringify({'message': this.dataservice.realname + ' has joined the room.'}))
    }
    this.websocket.onmessage = (evt) => {
        this.messages.push(JSON.parse(evt.data)['message']);
        console.log(this.messages);
    }
    
    this.dataservice.username = sessionStorage.getItem('username');
    this.dataservice.role = sessionStorage.getItem('role');
    this.dataservice.project = sessionStorage.getItem('project_id');
    
    this.dataservice.authOptions = {
        headers: new HttpHeaders({'Content-Type': 'application/json', 'Authorization': 'JWT ' + sessionStorage.getItem('token')})
    };
    this.http.get('http://127.0.0.1:8000/scrum/api/scrumprojects/' + this.dataservice.project , this.dataservice.httpOptions).subscribe(
        data => {
            console.log(data);
            this.dataservice.project_name = data['project_name'];
            this.dataservice.users = data['data'];
        },
        err => {
            this.dataservice.message = 'Unexpected Error!';
            console.log(err);
        }
    );
  }
  
  swapState()
  {
    this.show_zero = !this.show_zero;  
  }
  
  editGoal(event)
  {
    console.log(event); 
    var items = event.target.innerText.split(/\)\s(.+)/);
    var goal_name = window.prompt('Editing Task ID #' + items[0] + ':', items[1]);
    if(goal_name == null || goal_name == '')
    {
        this.dataservice.message = 'Edit Canceled.';
    } else
    {
        this.http.put('http://127.0.0.1:8000/scrum/api/scrumgoals/', JSON.stringify({'mode': 1, 'goal_id': event.path[1].id, 'new_name': goal_name, 'project_id': this.dataservice.project}), this.dataservice.authOptions).subscribe(
            data => {
                this.dataservice.users = data['data'];
                this.dataservice.message = data['message'];
            },
            err => {
                console.error(err);
                if(err['status'] == 401)
                {
                    this.dataservice.message = 'Session Invalid or Expired. Please Login.';
                    this.dataservice.logout();
                } else
                {
                    this.dataservice.message = 'Unexpected Error!';    
                }
            }
        );
    }
  }
  
  manageUser(event)
  {
    console.log(event);
    var role_name = window.prompt('Change User Role:\nSelect Between: Developer, Admin, Quality Analyst, or Owner:', '');
    if(role_name == null || role_name == '')
    {
        this.dataservice.message = 'Edit Canceled.';
    } else if(role_name == 'Developer' || role_name == 'Quality Analyst' || role_name == 'Admin' || role_name == 'Owner')
    {
        this.http.patch('http://127.0.0.1:8000/scrum/api/scrumprojectroles/', JSON.stringify({'role': role_name, 'id': event.path[1].id, 'project_id': this.dataservice.project}), this.dataservice.authOptions).subscribe(
            data => {
                this.dataservice.users = data['data'];
                this.dataservice.message = data['message'];
            },
            err => {
                console.error(err);
                if(err['status'] == 401)
                {
                    this.dataservice.message = 'Session Invalid or Expired. Please Login.';
                    this.dataservice.logout();
                } else
                {
                    this.dataservice.message = 'Unexpected Error!';    
                }
            }
        );
    } else
    {
        this.dataservice.message = 'Invalid Input.';
    }
  }
  
  doNothing()
  {
     
  }
  
  sendMessage(message)
  {
    this.websocket.send(JSON.stringify({'message': this.dataservice.realname + ': ' + this.chat_text}))
    this.chat_text = '';
  }
  
  ngOnInit() {
  }

  addGoal()
  {
    this.dataservice.addGoal();  
  }
  
  logout()
  {
    this.dataservice.message = 'Thank you for using Scrum!';
    this.websocket.send(JSON.stringify({'message': this.dataservice.realname + ' has left the room.'}))
    this.websocket.close();
    this.dataservice.logout();
  }
  
  ngOnDestroy()
  {
    this.subs.unsubscribe();  
    this.dragula.destroy('mainTable');
  }
}
