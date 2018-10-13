import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MzModalModule } from 'ngx-materialize';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public arrCount = [0, 1, 2, 3];
  subs = new Subscription();
  public show_zero: boolean = true;
  public chat_text: string = "";
  public messages = [];
  public websocket;
  public msg_obs;
  public on_user;
  public at_bottom: boolean = true;
    
  public modalOptions: Materialize.ModalOptions = {
    dismissible: false, // Modal can be dismissed by clicking outside of the modal
    opacity: .5, // Opacity of modal background
    inDuration: 300, // Transition in duration
    outDuration: 200, // Transition out duration
    startingTop: '100%', // Starting top style attribute
    endingTop: '10%', // Ending top style attribute
    ready: (modal, trigger) => { // Callback for Modal open. Modal and trigger parameters available.
      alert('Ready');
      console.log(modal, trigger);
    },
    complete: () => { alert('Closed'); } // Callback for Modal close
  };
  
  constructor(
      public dataservice: DataService, private dragula: DragulaService, private http: HttpClient, private modalModule: MzModalModule
      ) { 
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
    this.dataservice.username = sessionStorage.getItem('username');
    this.dataservice.role = sessionStorage.getItem('role');
    this.dataservice.project = sessionStorage.getItem('project_id');

    this.dataservice.authOptions = {
        headers: new HttpHeaders({'Content-Type': 'application/json', 'Authorization': 'JWT ' + sessionStorage.getItem('token')})
    };

    this.msg_obs = new MutationObserver((mutations) => {
        var chat_scroll = document.getElementById('chat_div_space');
        console.log(chat_scroll.scrollHeight - chat_scroll.clientHeight);
        console.log(chat_scroll.scrollTop);
        if(this.at_bottom)
            chat_scroll.scrollTop = chat_scroll.scrollHeight - chat_scroll.clientHeight;
        console.log(this.messages);
    });

    this.websocket = new WebSocket('ws://' + this.dataservice.domain_name + '/scrum/');
    this.websocket.onopen = (evt) => {
        this.http.get('http://' + this.dataservice.domain_name + '/scrum/api/scrumprojects/' + this.dataservice.project + '/', this.dataservice.httpOptions).subscribe(
            data => {
                console.log(data);
                this.msg_obs.observe(document.getElementById('chat_div_space'), { attributes: true, childList: true, subtree: true });
                this.dataservice.project_name = data['project_name'];
                this.dataservice.users = data['data'];
                this.websocket.send(JSON.stringify({'user': this.dataservice.realname, 'message': '!join ' + this.dataservice.project_name}));
            },
            err => {
                this.dataservice.message = 'Unexpected Error!';
                console.log(err);
            }
        );
    }

    this.websocket.onmessage = (evt) => {
        var data = JSON.parse(evt.data);
        if(data['messages'] !== undefined)
        {
            this.messages = []
            for(var i = 0; i < data['messages']['length']; i++)
            {
                this.messages.push(data['messages'][i]['user'] + ': ' + data['messages'][i]['message']);
            }
        } else
        {
            this.messages.push(data['user'] + ': ' + data['message']);
        }
        this.at_bottom = false;
        var chat_scroll = document.getElementById('chat_div_space');
        if(chat_scroll.scrollTop == chat_scroll.scrollHeight - chat_scroll.clientHeight)
            this.at_bottom = true;
    }

    this.websocket.onclose = (evt) => {
        console.log('Disconnected!');
        this.msg_obs.disconnect();
    }
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
        this.http.put('http://' + this.dataservice.domain_name + '/scrum/api/scrumgoals/', JSON.stringify({'mode': 1, 'goal_id': event.target.parentElement.id, 'new_name': goal_name, 'project_id': this.dataservice.project}), this.dataservice.authOptions).subscribe(
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
    role_name = role_name.toLowerCase();
    if(role_name == null || role_name == '')
    {
        this.dataservice.message = 'Edit Canceled.';
    } else if(role_name == 'developer' || role_name == 'quality analyst' || role_name == 'admin' || role_name == 'owner')
    {
        this.http.patch('http://' + this.dataservice.domain_name + '/scrum/api/scrumprojectroles/', JSON.stringify({'role': role_name, 'id': event.target.parentElement.parentElement.parentElement.id, 'project_id': this.dataservice.project}), this.dataservice.authOptions).subscribe(
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
  
  sendMessage()
  {
    this.websocket.send(JSON.stringify({'user': this.dataservice.realname, 'message': this.chat_text}))
    this.chat_text = '';
  }
  
  ngOnInit() {
  }
  
  getClicked(event)
  {
    console.log(event);
    if(event.target.parentElement.parentElement.id == "author")
        this.on_user = event.target.parentElement.parentElement.parentElement.id;
    else
        this.on_user = event.target.parentElement.parentElement.parentElement.parentElement.id;
    console.log(this.on_user);
  }

  addGoal()
  {
    this.dataservice.addGoal(this.on_user);
  }
  
  logout()
  {
    this.dataservice.message = 'Thank you for using Scrum!';
    this.websocket.close();
    this.dataservice.logout();
  }
  
  ngOnDestroy()
  {
    this.subs.unsubscribe();  
    this.dragula.destroy('mainTable');
  }

//   addGoalModal(){
//     $(document).ready(function(){
//         // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
//         $('.modal-trigger').leanModal();
//       });
//   }
}
