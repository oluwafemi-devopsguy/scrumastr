
import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { DragulaService } from 'ng2-dragula';
import { Subscription, Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MzModalModule } from 'ngx-materialize';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public arrCount = [0, 1, 2];
  public color:string = "blue"
  subs = new Subscription();
  public show_zero: boolean = true;
  public show_history: boolean = false;
  public show_project_chat: boolean = false;
  public show_sprint_option: boolean = false;
  public chat_text: string = "";
  public goal_push_id;
  public messages = [];
  public websocket;
  public msg_obs;
  public on_user;
  public proj_log;
  public at_bottom: boolean = true;
  public id_hover = -1;
  public id_click = -1;
  public id_clicks = -1;
  sprint_start: Number;
  sprint_end: Number;
  goal_id: string;
  public chat_div_title: string = "Project Chat"
  present_scrum;  
  public nav_drop: boolean = false;
  public task_history: any;
  public iData: any;
  public image_upload: File = null;
  public scrum_image: File = null;
  public selected_history:any = [];
  public clicked_user;
  public note;
  public workid;
  public branch;
  public log;
  public log_priority;
  public note_priority;
  public board: string = "AllTask"
  public rep;
    
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
                this.dataservice.users_done = []
                console.log(value);
                var el = value['el'];
                var target = value['target'];
                var source = value['source'];
                
                if (target['parentElement'] == source['parentElement']) {
                  console.log("The if ===================")
                  console.log( target['parentElement']['id'])
                  console.log(el['id'])
                  console.log(target['parentElement'])
                  console.log(source['parentElement'])

                    var hours = -1;
                    if(target['id'] == '2' && source['id'] == '1')
                    {
                        var hours_in = window.prompt('How many hours did you spend on this task?');
                        hours = parseInt(hours_in, 10);
                        if(hours + '' == 'NaN')
                            hours = -1; 

                        hours = hours;
                        var push_id = window.prompt('Enter Task Push ID?');
                        
                        if(push_id == '') {
                          console.log('tHE PUSH IS NULL')
                          push_id = "Null Value" 
                          }                                        
                    }
                   
                    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@in hours@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
                    console.log(hours)
                    this.dataservice.moveGoal(el['id'], target['id'], hours, push_id);
                  // if (this.dataservice.selected_sprint) {
                  //   this.changeSprint()
                  // }
                  // else{
                  //   this.filterSprint(this.dataservice.sprints)
                  // }
                } else if (target['parentElement'].id == source['parentElement'].id)  {
                  hours = -12;
                  console.log(" 888888888888888888888 inside else if inner if 8888888888888888888888888888")
                  console.log(target['id'])
                  console.log(source['id'])
                  
                    if(target['id'] == '2' && source['id'] == '1')
                    {
                        hours = -11;
                        var push_id = window.prompt('Enter Task Push ID?');
                        
                        if(push_id == '') {
                          console.log('tHE PUSH IS NULL')
                          push_id = "Null Value" 
                          } 
                        else if(!push_id)  {
                           hours = -13;
                           push_id = "Canceled"
                          console.log("##@@@@@@@@@@@####################################uyuyuyyu $$$$$$$$$$$$$$$$$$$$$$")
                        }                     
                    }

                    if (target['id'] == "2" && source['id'] < "1") {
                      hours = -13;
                     var push_id = window.prompt('Enter Task Push ID?');
                        
                        if(push_id == '') {
                          console.log('tHE PUSH IS NULL')
                          push_id = "Null Value" 
                          } 
                          } 
                  console.log("%%%%%%%%%%%%((((((((((((((((((())))))))))))))))))&&&&&&&&&&&&&&&&&&&")
                  console.log(target['id'])
                  console.log(source['id'])
                  console.log(el['id'])
                  console.log(hours)
                  this.dataservice.moveGoal(el['id'], target['id'], hours, push_id);
                }

                 else {
                  console.log("********************************thec else ==================")
                  console.log( target['parentElement']['id'])
                  console.log(el['id'])
                  console.log(target['parentElement'])
                  console.log(source['parentElement']['parentElement'])
                    this.dataservice.changeOwner(el['id'], target['parentElement']['id']);
                } 
            }
        )
    );
    
    this.dataservice.realname = sessionStorage.getItem('realname');
    this.dataservice.username = sessionStorage.getItem('username');
    this.dataservice.role = sessionStorage.getItem('role');
    this.dataservice.project = sessionStorage.getItem('project_id');
    this.dataservice.to_clear_board = sessionStorage.getItem('to_clear_board');
    this.dataservice.project_slack = sessionStorage.getItem('project_slack');
    this.dataservice.user_slack = sessionStorage.getItem('user_slack');
    this.dataservice.slack_username = sessionStorage.getItem('slack_username');


    this.dataservice.authOptions = {
        headers: new HttpHeaders({'Content-Type': 'application/json', 'Authorization': 'JWT ' + sessionStorage.getItem('token')})
    };
    this.dataservice.imageAuthOptions = {
        headers: new HttpHeaders({'Authorization': 'JWT ' + sessionStorage.getItem('token')})
    };
    this.msg_obs = new MutationObserver((mutations) => {
        var chat_scroll = document.getElementById('chat_div_space');
        console.log(chat_scroll.scrollHeight - chat_scroll.clientHeight);
        console.log(chat_scroll.scrollTop);
        if(this.at_bottom)
            chat_scroll.scrollTop = chat_scroll.scrollHeight - chat_scroll.clientHeight;
        console.log(this.messages);
    });

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
            this.dataservice.to_clear_board = res1['to_clear_board'];
            this.dataservice.sprints = res2;
            this.dataservice.project_slack = res1['slack_installed'];
            this.dataservice.slack_app_id = res1['slack_app_id'];
            this.websocket.send(JSON.stringify({'project_id': this.dataservice.project, 'user': this.dataservice.realname, 'message': '!join ' + this.dataservice.project_name, 'goal_id': 'main_chat_' + this.dataservice.project_name, 'slack_username': this.dataservice.slack_username }));
            console.log(this.dataservice.users)
            console.log(this.dataservice.project_slack)
            console.log(this.dataservice.user_slack)
            console.log(this.dataservice.slack_app_id)


            if (this.dataservice.user_slack == "false" && this.dataservice.project_slack == true) {
              console.log("=======================C SIGNING IN USER TO SLACK =================================")
              window.location.replace("https://slack.com/oauth/authorize?client_id=" + this.dataservice.slack_app_id + "&state=main_chat_" + this.dataservice.project_name + ">>>" + this.dataservice.username + "&scope=identity.basic identity.team identity.avatar identity.email")
            } 




            this.filterSprint(res2)
        },
        err => {
                this.dataservice.message = 'Unexpected Error!';
                console.log(err);
            });

    }

    // this.websocket.onmessage = (evt) => {
    //     var data = JSON.parse(evt.data);
    //     if(data['messages'] !== undefined)
    //     {
    //         this.messages = []
    //         for(var i = 0; i < data['messages']['length']; i++)
    //         {
    //             this.messages.push(data['messages'][i]['user'] + ': ' + data['messages'][i]['message']);
    //         }
    //     } else
    //     {
    //         this.messages.push(data['user'] + ': ' + data['message']);
    //     }
    //     this.at_bottom = false;
    //     var chat_scroll = document.getElementById('chat_div_space');
    //     if(chat_scroll.scrollTop == chat_scroll.scrollHeight - chat_scroll.clientHeight)
    //         this.at_bottom = true;
    // }
    this.websocket.onmessage = (evt) => {
        var data = JSON.parse(evt.data);
        if(data['messages'] !== undefined)
        {
            this.messages = []
            for(var i = 0; i < data['messages']['length']; i++)
            {
                this.messages.push(data['messages'][i]);
                console.log('first')
            }
        } else
        {
            this.messages.push(data);
            console.log('second')
        }
        console.log(this.messages)
        // {
        //     this.messages = []
        //     for(var i = 0; i < data['messages']['length']; i++)
        //     {
        //         this.messages.push(data['messages'][i]['user'] + ': ' + data['messages'][i]['message']);
        //     }
        // } else
        // {
        //     this.messages.push(data['user'] + ': ' + data['message']);
        // }
        console.log(this.messages)
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
    this.dataservice.message ="";
    this.show_zero = !this.show_zero;  
  }


  changeSprint() 
  {  
  this.dataservice.users_done = [] 
    this.dataservice.message ="";
    this.dataservice.sprint_goals = [];
      for (var i = 0;  i < this.dataservice.users.length; i++)  {
        for (var j = 0;  j < this.dataservice.users[i].scrumgoal_set.length; j++)  {
          if (this.dataservice.users[i].scrumgoal_set[j].time_created > this.dataservice.selected_sprint.created_on && 
            this.dataservice.users[i].scrumgoal_set[j].time_created < this.dataservice.selected_sprint.ends_on)
            {                
             this.dataservice.users[i].scrumgoal_set[j].user_id = this.dataservice.users[i].id;
             this.dataservice.sprint_goals.push(this.dataservice.users[i].scrumgoal_set[j]);
            }
          } 
        }
  }

            
  filterSprint(uSprints) {
    this.dataservice.users_done = []
    this.dataservice.sprints= uSprints
    var filter_goal = []
    console.log(filter_goal)
        // this.dataservice.sprint_goals.length = 0 
          for (var i = 0;  i < this.dataservice.users.length; i++)  {
            console.log(filter_goal)
            console.log(this.dataservice.users.length)
            for (var j = 0;  j < this.dataservice.users[i].scrumgoal_set.length; j++)  {
              if (this.dataservice.sprints.length) {
                if (this.dataservice.users[i].scrumgoal_set[j].time_created >= this.dataservice.sprints[this.dataservice.sprints.length - 1].created_on && 
                  this.dataservice.users[i].scrumgoal_set[j].time_created <= this.dataservice.sprints[this.dataservice.sprints.length - 1].ends_on)
                  {                  
                  // console.log(this.dataservice.users[i].scrumgoal_set[j].time_created)
                  // console.log(this.dataservice.users[i].scrumgoal_set[j].name)
                   // this.dataservice.users[i].scrumgoal_set[j].user_id = this.dataservice.users[i].id
                   filter_goal.push(this.dataservice.users[i].scrumgoal_set[j]);
                   
                  }this.show_sprint_option = true;
              } else {
                  this.dataservice.users[i].scrumgoal_set[j].user_id = this.dataservice.users[i].id
                  filter_goal.push(this.dataservice.users[i].scrumgoal_set[j]); 
                  
              }
            }
          }
          // console.log(filter_goal)
          this.dataservice.sprint_goals = filter_goal
  }


  createSprintMethod(myDate) {
          console.log(this.dataservice.users)
          console.log(this.dataservice.sprints)
          forkJoin(
          this.http.post(this.dataservice.domain_protocol + this.dataservice.domain_name + '/scrum/api/scrumsprint/?goal_project_id=' + this.dataservice.project, JSON.stringify({'project_id': this.dataservice.project, 'ends_on': myDate}), this.dataservice.authOptions),
          this.http.get(this.dataservice.domain_protocol + this.dataservice.domain_name + '/scrum/api/scrumprojects/' + this.dataservice.project + '/', this.dataservice.httpOptions)
        )
         .subscribe(([res2, res1]) => {
            this.msg_obs.observe(document.getElementById('chat_div_space'), { attributes: true, childList: true, subtree: true });
            this.dataservice.users = res2['users'];
            this.dataservice.project_name = res1['project_name'];
            this.dataservice.sprints = res2['data']
            this.dataservice.message = res2['message']
            
            console.log(this.dataservice.sprints)
            console.log(this.dataservice.users)
            console.log(this.dataservice.sprint_goals)
            this.filterSprint(res2['data'])
            console.log(this.dataservice.sprint_goals)
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

  createSprint() 
  {
    var myDate = new Date(new Date().getTime()+(7*24*60*60*1000));
    if (this.dataservice.sprints.length) {
      console.log('if works');
      var present_scrum_id = this.dataservice.sprints[this.dataservice.sprints.length - 1].id;
      this.present_scrum = this.dataservice.sprints[this.dataservice.sprints.length - 1].ends_on;
      this.present_scrum =  new Date(this.present_scrum).valueOf();
      
      
      //  Test if Today Date is greater than last scrum
      console.log(this.present_scrum);
      console.log(new Date().valueOf());
      if (this.present_scrum > new Date().valueOf()) {
        if (confirm("Sprint #" + present_scrum_id + " is currently running. End this spring and start another one?  Click \"OK\" to continue Create New Sprint!!!")) {
          this.dataservice.message == "Current Sprint ended";          
          this.createSprintMethod(myDate)
          return;
            }
        else {
          this.dataservice.message = 'Last Sprint continued!!!';
          console.log("Sprint Continue");
          return;
            
        }
      } else  {
          this.createSprintMethod(myDate);
        
          return;
      }   
    } else {
        console.log('else works');
        this.createSprintMethod(myDate);
        
        return;
    }    
  } 

  
  editGoal(event)
  {
    this.dataservice.message ="";
    console.log(event);
    console.log(this.dataservice.users);
    var taskID = event.target.parentElement.id.substring(1);
    console.log("new editgoal----====================")
  console.log(taskID)
    var message = null;
    for(var i = 0; i < this.dataservice.users.length; i++)
    {
        if(this.dataservice.users[i].id == event.target.parentElement.parentElement.parentElement.id.substring(1))
        {
            for(var j = 0; j < this.dataservice.users[i].scrumgoal_set.length; j++)
            {
                if(this.dataservice.users[i].scrumgoal_set[j].goal_project_id == taskID)
                {
                    message = this.dataservice.users[i].scrumgoal_set[j].name;
                    break;
                }
            }
            break;
        }
    }
    var goal_name = window.prompt('Editing Task ID #' + taskID + ':', message);
    if(goal_name == null || goal_name == '')
    {
        this.dataservice.message = 'Edit Canceled.';
    } else
    {
        this.http.put(this.dataservice.domain_protocol + this.dataservice.domain_name + '/scrum/api/scrumgoals/', JSON.stringify({'mode': 1, 'goal_id': event.target.parentElement.id, 'new_name': goal_name, 'project_id': this.dataservice.project}), this.dataservice.authOptions).subscribe(
            data => {
                this.dataservice.users = data['data'];
                this.dataservice.message = data['message'];                
                if (this.dataservice.selected_sprint) {
                  this.changeSprint()
                }
                else{
                  this.filterSprint(this.dataservice.sprints)
                }
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

  remove_user(nickname, id) {
    var pop_event = window.confirm('Delete " ' + nickname + '"?');
    if (pop_event) {
      console.log("Deleted")
      this.http.delete(this.dataservice.domain_protocol + this.dataservice.domain_name + '/scrum/api/scrumprojectroles/' + id + "/", this.dataservice.authOptions).subscribe(
            data => {
                this.dataservice.users = data['data'];
                this.dataservice.message = data['message'];
                if (this.dataservice.selected_sprint) {
                  this.changeSprint()
                }
                else{
                  this.filterSprint(this.dataservice.sprints)
                }
                
                
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
    } else {
      console.log("Canceled")
    }
    }


  deleteTask(goal_name, goal_id) {
      this.dataservice.message ="";
      var pop_event = window.confirm('Delete " ' + goal_name + '"?');
      console.log(goal_id)
      if (pop_event) {
          this.http.put(this.dataservice.domain_protocol + this.dataservice.domain_name + '/scrum/api/scrumgoals/', JSON.stringify({'mode': 2, 'goal_id':'g' + goal_id, 'new_name': goal_name, 'project_id': this.dataservice.project}), this.dataservice.authOptions).subscribe(
            data => {
                this.dataservice.users = data['data'];
                this.dataservice.message = data['message'];
                if (this.dataservice.selected_sprint) {
                  this.changeSprint()
                }
                else{
                  this.filterSprint(this.dataservice.sprints)
                }
                
                
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
      } else {
          console.log('cancel');
      };
    }
  
  manageUser(event)
  {
    this.dataservice.message ="";
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
  
  doNothing()
  {
     
  }
  
  sendMessage(identity)
  {
    this.dataservice.message ="";
    if (this.chat_div_title == "Project Chat") {
      
      this.goal_id = "main_chat_" + this.dataservice.project_name 
      console.log(this.goal_id)
    }
    console.log(this.dataservice.realname)
    this.websocket.send(JSON.stringify({
      'project_id': this.dataservice.project, 
      'user': this.dataservice.realname, 
      'message': this.chat_text,
      'goal_id': this.goal_id,
      'slack_username': this.dataservice.slack_username }))
    this.chat_text = '';
  }

  ngOnInit() {
    console.log(this.dataservice.proj_log);

    }

  onUser(the_user)  {
    this.on_user = "m" + the_user
    console.log("onuser")
    console.log(this.on_user)
  }

  getClicked(event)
  { 
    this.dataservice.message ="";
    console.log()
    if(event.target.parentElement.parentElement.parentElement.parentElement.id) {
        this.on_user = event.target.parentElement.parentElement.parentElement.parentElement.id;
      console.log(this.on_user)
    } else {
    this.on_user = event.target.parentElement.parentElement.parentElement.parentElement.parentElement.id 
    console.log(this.on_user)
  }
  }

  goalClicked(clicked_goal_id) {
      this.dataservice.message =""; 
      console.log(clicked_goal_id);
      this.goal_id = "G" + clicked_goal_id;
    }

  initGoalChat(){
    this.dataservice.message ="";
    this.websocket.send(JSON.stringify({'project_id': this.dataservice.project, 'user': this.dataservice.realname, 'message': '!goal_chat' + this.goal_id, 'goal_id': this.goal_id, 'slack_username': this.dataservice.slack_username }))
    this.show_project_chat = true;
    this.chat_div_title = this.goal_id + " Chat"
  }

  allTask() {
    this.dataservice.message ="";
    this.board = "AllTask"
  }

  myTask()  {
    this.dataservice.message ="";
    console.log(this.dataservice.realname)
    this.board = "MyTask"
  }

  backlog()  {
    this.dataservice.message ="";
    console.log(this.dataservice.project)
    this.board = "Backlog"
  }

  initMainChat(){
    this.dataservice.message ="";
    this.websocket.send(JSON.stringify({'project_id': this.dataservice.project,  'user': this.dataservice.realname, 'message': '!join ' + this.dataservice.project_name, 'goal_id': 'main_chat_' + this.dataservice.project_name, 'slack_username': this.dataservice.slack_username }));
    this.chat_div_title = "Project Chat"
    this.show_project_chat = false;
  }


  // imageUpload()  {
  //   console.log(this.dataservice.authOptions)
  //   console.log(this.image_upload)
  //   let details = {
  //       'mode': 1,
  //       'goal_id': this.goal_id, 
  //       'project_id': this.dataservice.project,
  //       // 'file':this.image_upload
  //     };
  //   this.iData =  new FormData();
    
  //   this.iData.append('image', this.image_upload, this.image_upload.name);
  //   console.log(this.iData)
  //   this.http.put(this.dataservice.domain_protocol + this.dataservice.domain_name + '/scrum/api/scrumgoals/', this.iData,
  //     this.dataservice.authOptions).subscribe(
  //       data => {
  //         this.dataservice.users = data['data'];
  //         this.dataservice.message = data['message'];
  //         this.filterSprint(this.dataservice.sprints)
  //       },
  //       err => {
  //         console.error(err);
  //         if(err['status'] == 401)
  //          {
  //           this.dataservice.message = 'Session Invalid or Expired. Please Login.';
  //           this.dataservice.logout();
  //          } else
  //          {
  //             this.dataservice.message = 'Unexpected Error!';    
  //           }
  //         }
  //       );
  // }



  addGoal()
  {
    this.dataservice.message ="";
    console.log("inside addgoal" + this.on_user);


    this.dataservice.addGoal(this.on_user);
  }
  
  setSelectedUser(id)
  {
    this.id_hover = id;    
  }
  
  logout()
  {
    this.dataservice.message = 'Thank you for using Scrum!';
    this.websocket.close();
    this.dataservice.logout();
  }

  admin()
  {
    this.websocket.close();
    this.dataservice.admin();
  }
  
  home()
  {
    this.dataservice.profile();
  }

  ngOnDestroy()
  {
    this.subs.unsubscribe();  
    this.dragula.destroy('mainTable');
  }



// this.dataservice.sprint_goals = [];
//       for (var i = 0;  i < this.dataservice.users.length; i++)  {
//         for (var j = 0;  j < this.dataservice.users[i].scrumgoal_set.length; j++)  {
//           if (this.dataservice.users[i].scrumgoal_set[j].time_created > this.dataservice.selected_sprint.created_on && 
//             this.dataservice.users[i].scrumgoal_set[j].time_created < this.dataservice.selected_sprint.ends_on)
//             {                
//              this.dataservice.users[i].scrumgoal_set[j].user_id = this.dataservice.users[i].id;
//              this.dataservice.sprint_goals.push(this.dataservice.users[i].scrumgoal_set[j]);
//             }
//           } 


  UserGoalHistory(nickname,nickname_id){
    console.log("UserGoalHistory")
    console.log(nickname_id)
    this.clicked_user = nickname
      for (var i = 0;  i < this.dataservice.users.length; i++)  {
       
          if (this.dataservice.users[i].id == nickname_id)
            {     
            console.log(this.dataservice.users[i].scrumgoal_set) 
            console.log(nickname)
            this.dataservice.user_goal_history = this.dataservice.users[i].scrumgoal_set
            }
         }
        
  }

  // addNote(){
  //   // console.log("add notes")
  //   // console.log(this.note_priority)
  //   console.log("add notes")
  // }

  add_a_note()  {
    this.dataservice.message ="";
    console.log(this.note_priority)
    console.log(this.note)
     if(this.note == '' || this.note == null) {
        console.log('Note is empty string or null')
        this.dataservice.message = "Note field cannot be empty"
        return
      } 
     

    this.http.post(this.dataservice.domain_protocol + this.dataservice.domain_name + '/scrum/api/scrumnotes/', JSON.stringify({'note': this.note, 'priority': this.note_priority, 'user': this.on_user, 'project_id': this.dataservice.project}), this.dataservice.authOptions).subscribe(
            data => {
                this.dataservice.users = data['data'];
                this.dataservice.message = data['message'];
                this.note = '';  


                for (var i = 0;  i < this.dataservice.users.length; i++)  {       
                if (this.dataservice.users[i].id == this.on_user.slice(1))
                  { 
                  console.log(this.dataservice.users[i].scrumnote_set) 
                  this.dataservice.user_notes = this.dataservice.users[i].scrumnote_set
                  }
               } 


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

  note_to_goal(id, goal, priority)  {
    this.dataservice.message ="";
    this.dataservice.goal_name = goal
    console.log(goal)
    console.log(this.on_user)
    this.dataservice.addGoal(this.on_user);
    this.deleteNote(id)
  }

  deleteNote(note_id)  {
    this.http.put(this.dataservice.domain_protocol + this.dataservice.domain_name + '/scrum/api/scrumnotes/', JSON.stringify({ 'id': note_id, 'project_id': this.dataservice.project}), this.dataservice.authOptions).subscribe(
            data => {
                this.dataservice.users = data['data'];
                this.dataservice.message = data['message'];
                this.show_notes()
                if (this.dataservice.selected_sprint) {
                  this.changeSprint()
                }
                else{
                  this.filterSprint(this.dataservice.sprints)
                }               
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

  show_notes() {
    this.dataservice.message ="";
      for (var i = 0;  i < this.dataservice.users.length; i++)  {
       
          if (this.dataservice.users[i].id == this.on_user.slice(1))
            { 
            console.log(this.dataservice.users[i].scrumnote_set) 
            this.dataservice.user_notes = this.dataservice.users[i].scrumnote_set
            }
         }
  }


//   addGoalModal(){
//     $(document).ready(function(){
//         // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
//         $('.modal-trigger').leanModal();
//       });
//   }

  add_a_workid()  {
    this.dataservice.message ="";
    console.log(this.workid)
    console.log(this.branch)
     if(this.workid == '' || this.workid == null) {
        console.log('WorkID is empty string or null')
        this.dataservice.message = "Workid field cannot be empty"
        return
      } 
     

    this.http.post(this.dataservice.domain_protocol + this.dataservice.domain_name + '/scrum/api/scrumworkid/', JSON.stringify({'workid': this.workid, 'branch': this.branch, 'user': this.on_user, 'project_id': this.dataservice.project}), this.dataservice.authOptions).subscribe(
            data => {
                this.dataservice.users = data['data'];
                this.dataservice.message = data['message'];
                this.workid = ''; 


                for (var i = 0;  i < this.dataservice.users.length; i++)  {       
                if (this.dataservice.users[i].id == this.on_user.slice(1))
                  { 
                  console.log(this.dataservice.users)  
                  console.log(this.dataservice.users[i].scrumworkid_set) 
                  this.dataservice.user_workid = this.dataservice.users[i].scrumworkid_set
                  }
               } 


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

  deleteworkid(workid_id)  {
    this.http.put(this.dataservice.domain_protocol + this.dataservice.domain_name + '/scrum/api/scrumworkid/', JSON.stringify({ 'id': workid_id, 'project_id': this.dataservice.project}), this.dataservice.authOptions).subscribe(
            data => {
                this.dataservice.users = data['data'];
                this.dataservice.message = data['message'];
                this.show_workid()
                if (this.dataservice.selected_sprint) {
                  this.changeSprint()
                }
                else{
                  this.filterSprint(this.dataservice.sprints)
                }               
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

  show_workid() {
    this.dataservice.message ="";
      for (var i = 0;  i < this.dataservice.users.length; i++)  {
       
          if (this.dataservice.users[i].id == this.on_user.slice(1))
            { 
            console.log(this.dataservice.users[i].scrumworkid_set) 
            this.dataservice.user_workid = this.dataservice.users[i].scrumworkid_set
            }
         }
  }



  ///////////////////////////

  add_a_log()  {
    this.dataservice.message ="";
    console.log(this.log_priority)
    console.log(this.log)
     if(this.log == '' || this.log == null) {
        console.log('Field is empty string or null')
        this.dataservice.message = "Input field cannot be empty"
        return
      } 
     

    this.http.post(this.dataservice.domain_protocol + this.dataservice.domain_name + '/scrum/api/scrumlog/', JSON.stringify({'log': this.log, 'priority': this.log_priority, 'user': this.on_user, 'project_id': this.dataservice.project}), this.dataservice.authOptions).subscribe(
            data => {
                this.dataservice.users = data['data'];
                this.dataservice.message = data['message'];
                this.log = '';  


                for (var i = 0;  i < this.dataservice.users.length; i++)  {       
                if (this.dataservice.users[i].id == this.on_user.slice(1))
                  { 
                  console.log(this.dataservice.users[i].scrumlog_set) 
                  this.dataservice.proj_log = this.dataservice.users[2].scrumlog_set
                  }
               } 


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


  log_to_goal(id, goal, priority, clickuser)  {
    this.dataservice.message ="";
    this.dataservice.goal_name = goal
    this.clicked_user = "m" + clickuser
    console.log(goal)
    console.log(this.clicked_user)
    this.dataservice.addGoal(this.clicked_user);
    this.deleteLog(id)
  }



  show_log() {
    this.dataservice.message ="";
      for (var i = 0;  i < this.dataservice.users.length; i++)  {
      console.log("Back logs")
      console.log(this.dataservice.users)
          if (this.dataservice.users[i].id == this.dataservice.users[i].id)
            { 
            console.log(this.dataservice.users[i]) 
            this.dataservice.proj_log = this.dataservice.users[2].scrumlog_set
            console.log(this.dataservice.proj_log)
            }
         }
  }

  deleteLog(log_id)  {
    this.http.put(this.dataservice.domain_protocol + this.dataservice.domain_name + '/scrum/api/scrumlog/', JSON.stringify({ 'id': log_id, 'project_id': this.dataservice.project}), this.dataservice.authOptions).subscribe(
            data => {
                this.dataservice.users = data['data'];
                this.dataservice.message = data['message'];
                this.show_log()
                if (this.dataservice.selected_sprint) {
                  this.changeSprint()
                }
                else{
                  this.filterSprint(this.dataservice.sprints)
                }               
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








  selectFile(event) {
    console.log(event)
    this.image_upload =event.target.files;
  }

  imageUpload() {
    this.dataservice.message ="";
    if (this.image_upload == null) {
      this.dataservice.message = "No file selected!!!"
      console.log("No file selected!");
      return
    }
    let details = {
        'mode': 1,
        'goal_id': this.goal_id, 
        'project_id': this.dataservice.project,
        
      };
    let file: File = this.image_upload[0];
    console.log(this.dataservice.imageAuthOptions)
    console.log(file)

    this.iData =  new FormData();
    
    this.iData.append('image', file, file.name);
    this.iData.append('mode', 1);
    this.iData.append('goal_id', this.goal_id);
    this.iData.append('project_id', this.dataservice.project);
    console.log(file)
    console.log(this.iData)
    this.http.put(this.dataservice.domain_protocol + this.dataservice.domain_name + '/scrum/api/scrumgoals/', this.iData,
      this.dataservice.imageAuthOptions)
      .subscribe(
        data => {
          this.dataservice.users = data['data'];
          this.dataservice.message = data['message'];
          this.filterSprint(this.dataservice.sprints)
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

  ResizeImage(iName) {
    this.dataservice.message ="";
    console.log(iName)
    // window.open(this.dataservice.domain_protocol + this.dataservice.domain_name + iName, "Image open", "width=1000, height=1000");
     this.scrum_image = iName
  }

   ResizeImageFull() {
    window.open(this.dataservice.domain_protocol + this.dataservice.domain_name + this.scrum_image, "Image open", "width=1500px, height=1500px");

  }

   navDrop() {
    this.dataservice.message ="";
    console.log(this.nav_drop)
    this.nav_drop = !this.nav_drop
    console.log(this.nav_drop)
  }

    CheckHistory(task, push_id) {
      this.dataservice.message ="";
      console.log(task);
      console.log("kfkfgkfgk" + push_id);
      this.goal_push_id = push_id;
      this.task_history = task;
      this.show_history = !this.show_history; 
  }


closeAll() {
  
  console.log()
  var len = document.getElementsByTagName("details").length;
  for (var i = 0; i < len; i++) {
    document.getElementsByTagName('details')[i].removeAttribute("open")
  }
  // testVar = "detail" + testVar
  // document.getElementById(testVar).removeAttribute("open", "open")
    // Array.from(document.getElementsByTagName('span')) 
  
}


autogrow() {
  let textArea = document.getElementById("chat_text")
  textArea.style.overflow = 'hidden';
  textArea.style.height = 'auto';
  textArea.style.height = textArea.scrollHeight + 'px';
  console.log(this.chat_text)

}

  scrollIntoView(anchorHash) {
    console.log("This is scroll into view")
    console.log(anchorHash)
    this.dataservice.message ="";
    this.id_clicks = parseInt(anchorHash.substring(2), 10);
    console.log(this.id_clicks)
    console.log(anchorHash.substring(0))
    console.log(anchorHash.substring(1))
    console.log(anchorHash.substring(2))
    setTimeout(() => {
        const anchor = document.getElementById(anchorHash);
        console.log(anchorHash);
        if (anchor) {
            anchor.focus();
            anchor.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
        }
    });
}


taskHighlight(message) {
  console.log("This is task highlight")
  console.log(message)
  let m = message.split(" ").pop(); 
    if( m.startsWith("#") && m.length > 1)  {
      console.log("Start wiith =====")
      console.log(m)
      console.log(m.substring(1))
      let gs = "gs" + m.substring(1)
      console.log(gs)
      this.scrollIntoView(gs)
    }
  
  // var test = '';
  // this.rep = 'gg';
  // var text = "oooooooo";
  
  // let stylizedText: string = '';
  // for(let m of message.split(" "))  {
  //   if( m.startsWith("#") && m.length > 1)
  //     stylizedText += `<span style="font-weight: bold; color: #1f7a7a">${m}</span> `;
  //   else
  //     stylizedText += m + " ";
  // }  
  // console.log("THE OUTPUT DATA")
  // console.log(stylizedText)
  // console.log(this.chat_text)
  // console.log(message)
  // this.chat_text = message.replace(/yes/g, "<a>tttty</a>")
 // var newDiv = document.createElement("span");
 // newDiv.innerHTML = "yytt"
 // newDiv.style.color = "red"

 //  this.chat_text = newDiv
 //  console.log("Output values after replace")
 //  console.log(this.rep)
 //  console.log(this.chat_text)
 //  console.log("Output values end of replace")

}

insertElement() {
  var text = "oooooooo";
  var newDiv = document.createElement("span");
  var divContent = document.createTextNode(text)

  newDiv.innerHTML = "yytt"

  var output = newDiv.appendChild(divContent)
  console.log(output)
  return output

}


}