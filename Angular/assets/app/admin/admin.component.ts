import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { DragulaService } from 'ng2-dragula';
import { Subscription, Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MzModalModule } from 'ngx-materialize';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  public arrCount = [0, 1, 2, 3];
  public on_user;
  subs = new Subscription();
  public show_zero: boolean = true;
  public show_history: boolean = false;
  public show_project_chat: boolean = false;
  public show_sprint_option: boolean = false;
  public chat_text: string = "";
  public messages = [];
  public websocket;
  public msg_obs;
  public at_bottom: boolean = true;
  public id_hover = -1;
  public id_click = -1;
  sprint_start: Number;
  sprint_end: Number;
  goal_id: string;
  public chat_div_title: string = "Project Chat"
  present_scrum;
   public task_history: any;
  public iData: any;
  public image_upload: File = null;
  public scrum_image: File = null;
  public selected_history:any = [];

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

  constructor(public dataservice: DataService, private dragula: DragulaService, private http: HttpClient, private modalModule: MzModalModule) {

  this.dataservice.realname = sessionStorage.getItem('realname');
  this.dataservice.username = sessionStorage.getItem('username');
  this.dataservice.role = sessionStorage.getItem('role');
  this.dataservice.project = sessionStorage.getItem('project_id');
  this.dataservice.to_clear_board = sessionStorage.getItem('to_clear_board');

  this.dataservice.authOptions = {
        headers: new HttpHeaders({'Content-Type': 'application/json', 'Authorization': 'JWT ' + sessionStorage.getItem('token')})
    };
    this.dataservice.imageAuthOptions = {
        headers: new HttpHeaders({'Authorization': 'JWT ' + sessionStorage.getItem('token')})
    };

    this.websocket = new WebSocket(this.dataservice.websocket + this.dataservice.domain_name + '/scrum/');
    this.websocket.onopen = (evt) => {
      forkJoin(
          this.http.get(this.dataservice.domain_protocol + this.dataservice.domain_name + '/scrum/api/scrumprojects/' + this.dataservice.project + '/', this.dataservice.httpOptions),
          this.http.get(this.dataservice.domain_protocol + this.dataservice.domain_name + '/scrum/api/scrumsprint/?goal_project_id=' + this.dataservice.project, this.dataservice.authOptions)
        )
         .subscribe(([res1, res2]) => {
            this.msg_obs.observe(document.getElementById('chat_div_space'), { attributes: true, childList: true, subtree: true });
            this.dataservice.users = res1['data'];
            this.dataservice.project_name = res1['project_name'];
            this.dataservice.sprints = res2;
            this.dataservice.project_slack = res1['slack_installed'];
            this.dataservice.slack_app_id = res1['slack_app_id'];
            this.websocket.send(JSON.stringify({'user': this.dataservice.realname, 'message': '!join ' + this.dataservice.project_name, 'goal_id': 'main_chat_' + this.dataservice.project_name, 'slack_username': this.dataservice.slack_username }));
            console.log(this.dataservice.users)
            console.log(this.dataservice.project_slack)
            console.log(this.dataservice.user_slack)
            console.log(this.dataservice.slack_app_id)
            console.log(res1)


            
        },
        err => {
                this.dataservice.message = 'Unexpected Error!';
                console.log(err);
            });

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

  ngOnInit() {
  
  }

  logout()
  {
  	this.dataservice.message = 'Thank you for using scrum!';
  	this.dataservice.logout();
  }

   manageUser(event)
  {
    this.getClicked(event);
    var role_name = window.prompt('Change User Role:\nSelect Between: Developer, Admin, Quality Analyst, or Owner:', '');
    if(role_name == null || role_name == '')
    {
        this.dataservice.message = 'Edit Canceled.';
        return;
    }
    role_name = role_name.toLowerCase();
    if(role_name == 'developer' || role_name == 'quality analyst' || role_name == 'admin' || role_name == 'owner')
    {
        console.log(this.on_user)
        this.http.patch(this.dataservice.domain_protocol + this.dataservice.domain_name + '/scrum/api/scrumprojectroles/', JSON.stringify({'role': role_name, 'id': this.on_user, 'project_id': this.dataservice.project}), this.dataservice.authOptions).subscribe(
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

  getClicked(event)
  { 
    console.log()
    if(event.target.parentElement.parentElement.parentElement.parentElement.id) {
        this.on_user = event.target.parentElement.parentElement.parentElement.parentElement.id;
      console.log(this.on_user)
    } else {
    this.on_user = event.target.parentElement.parentElement.parentElement.parentElement.parentElement.id 
    console.log(this.on_user)
  }
  }

  toLogin()
  {
    this.dataservice.message = 'User successfully added!';
  }

  doNothing()
  {
     
  }

  setSelectedUser(id)
  {
    this.id_hover = id;    
  }

  createUser()
  {
    this.dataservice.createUser();  
  }

  sendEmail()
  {
    this.dataservice.sendEmail();  
  }

  home()
  {
  	this.dataservice.profile();
  }

  clearBoardSwitch() {
    console.log("Switch worked")
    console.log(this.dataservice.to_clear_board)
    this.dataservice.clearBoardSwitch()
    
  }

}
