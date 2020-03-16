import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ScrumboardComponent } from './scrumboard/scrumboard.component';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public scrumapi = 'https://api.chatscrum.com/scrum/api/scrumprojects/';
  public signUpurl = 'https://api.chatscrum.com/scrum/api/scrumusers/';
  public loginurl = 'https://api.chatscrum.com/scrum/api-token-auth/';
  public sprint = 'https://api.chatscrum.com/scrum/api/scrumsprint/?goal_project_id=';
  public createSprint = 'https://api.chatscrum.com/scrum/api/scrumsprint/';
  public createTaskUrl = 'https://api.chatscrum.com/scrum/api/scrumgoals/';
  public imageApi = 'https://api.chatscrum.com';

  public domain_name = '127.0.0.1:8000';
  public domain_protocol = 'https://';
  public websocket = 'wss://';

  
  public message;
  public goal_name;
  
  public login_username;
  public login_password;
  public login_project;
  
  public createuser_email;
  public createuser_password;
  public createuser_fullname;
  public createuser_usertype;
  public createuser_projname;
  public add_slack: boolean = false;
  
  public inviteuser_email;
  public message_body;

  public username;
  public user_slack;
  public project_slack;
  public slack_username
  public slack_app_id;
  public realname;
  public role;
  public role_id;
  public project;
  public project_name;
  public project_id;
  public to_clear_board;
  public users;
  public proj_log;
  public work_IDs = [];
  public users_done = [];
  public users_TFT = [];
  // public users_id = [];
  public workID_goal_array;
  public sprints;
  public sprint_start;
  public sprint_end;
  selected_sprint: any;
  
  public sprint_goals;
  public _user_sprint_goals;
  public user_goal_history;
  public user_notes;
  public off_today: boolean = true;
  public user_workid;
  public taskIdToEdit;
  public taskToEdit;
  public image_uploaded: File = null;
  public image_name;
  
  

  
  public httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };
  
  public authOptions;
  public imageAuthOptions;

  constructor(private http: HttpClient, private router: Router) { }
  
  createDemo()
  {
    this.message = "Creating the Demo, please wait...";
    this.http.get(this.domain_protocol + this.domain_name + '/scrum/create-demo/', this.httpOptions).subscribe(
        data => {
            this.login_username = data['username'];
            this.login_password = data['password'];
            this.login_project = data['project'];
            this.login();
        },
        err => {
            console.log(err);
        }
    );
  }

  sendEmail()
  {
    this.http.post(this.domain_protocol + this.domain_name + '/scrum/api/scrumemail/', JSON.stringify({'email': this.inviteuser_email, 'messagebody':this.message_body}), this.authOptions).subscribe(
        data => {
            this.message = 'Invitation Email has been sent'
            this.message_body = '';
            this.inviteuser_email = '';
        },
        err => {
            this.message = 'Email Not sent! Error!';
            console.error(err);
            this.message_body = '';
            this.inviteuser_email = '';
        }
    );
  }
  
 createUser()
  {
    console.log(this.add_slack)
    //this.http.post(this.domain_protocol + this.domain_name + '/scrum/api/scrumusers/', JSON.stringify({'email': this.createuser_email, 'password': this.createuser_password, 'full_name': this.createuser_fullname, 'usertype': this.createuser_usertype, 'projname': this.createuser_projname}), this.httpOptions).subscribe(
    //console.log({'email': this.createuser_email, 'password': this.createuser_password, 'full_name': this.createuser_fullname, 'usertype': this.createuser_usertype, 'projname': this.createuser_projname})
    this.http.post(this.signUpurl, JSON.stringify({'email': this.createuser_email, 'password': this.createuser_password, 'full_name': this.createuser_fullname, 'usertype': this.createuser_usertype, 'projname': this.createuser_projname}), this.httpOptions).subscribe(
        data => { 
          // this.slack_app_id = data['client_id']
          // if (this.createuser_usertype  == "Owner" && this.add_slack == true ) {
          //     console.log("======================= ADDING PROJECT TO SLACK=================================")
          //     console.log(this.createuser_usertype)
          //     // let element: HTMLElement = document.getElementById('slack_btn1') as HTMLElement;
          //     // element.click
          //     window.location.replace("https://slack.com/oauth/authorize?client_id=" + this.slack_app_id + "&state=main_chat_" + this.createuser_projname + ">>>" + this.createuser_email + "&scope=incoming-webhook,channels:read,channels:history,groups:history,mpim:history,emoji:read,files:read,groups:read,im:read,im:history,reactions:read,stars:read,users:read,team:read,chat:write:user,chat:write:bot,channels:write,bot")
          //     console.log("======================= After ADDING PROJECT TO SLACK=================================")
          //   }
            if ( 
                  data['message'] == 'User Created Successfully.' || 
                  data['message'] == 'Project Created Successfully for already existing User.'
                ) {
              document.getElementById('alert-success').style.display = 'block';
              setTimeout(() => {
              this.router.navigate(['login']);
              },  5000); 
              
              
            } else {
               document.getElementById('alert-error').style.display = 'block';
               document.getElementById('lodr').style.display = 'none';
               this.message = 'creating account.';
               this.createuser_password = '';
               this.createuser_fullname = '';
               this.createuser_projname = '';
               
               // document.getElementById('alert-error').style.display = 'block';
               // this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
               // this.router.navigate(['createuser']));
            };
            this.message = data['message'];
            this.createuser_email = '';
            this.createuser_password = '';
            this.createuser_fullname = '';
            this.createuser_projname = '';
            
            this.slack_app_id = data['client_id'];
            
        },
        err => {
            console.error(err);
            document.getElementById('lodr').style.display = 'none';
            document.getElementById('alert-error').style.display = 'block';
            this.message = 'User already exists or invalid data';
            this.createuser_password = '';
            this.createuser_fullname = '';
            this.createuser_projname = '';
            
            
        }

    );

  }

  
  admin()
  {
    this.message = 'Welcome to the Admin Panel'
    this.router.navigate(['admin']);
  }

  profile()
  {
    this.message = 'Welcome'
    this.router.navigate(['profile']);
  }

  login()
  {
    this.http.post(this.loginurl, JSON.stringify({'username': this.login_username, 'password': this.login_password, 'project': this.login_project}), this.httpOptions).subscribe(
    //this.http.post(this.domain_protocol + this.domain_name + '/scrum/api-token-auth/', JSON.stringify({'username': this.login_username, 'password': this.login_password, 'project': this.login_project}), this.httpOptions).subscribe(
        data => {
            sessionStorage.setItem('username', this.login_username);
            sessionStorage.setItem('realname', data['name']);
            sessionStorage.setItem('role', data['role']);
            sessionStorage.setItem('role_id', data['role_id']);
            sessionStorage.setItem('token', data['token']);
            sessionStorage.setItem('project_id', data['project_id']);
            sessionStorage.setItem('to_clear_board', data['to_clear_board']);
            sessionStorage.setItem('user_slack', data['user_slack']);
            sessionStorage.setItem('project_slack', data['project_slack']);
            sessionStorage.setItem('slack_username', data['slack_username']);
            sessionStorage.setItem('proj_log', data['proj_log']);
            this.username = this.login_username;
            this.role = data['role'];
            this.role_id = data['role_id'];
            this.realname = data['name'];
            this.project = data['project_id'];
            this.to_clear_board = data['to_clear_board'];
            this.user_slack = data['user_slack'];
            this.project_slack = data['project_slack'];
            this.slack_username = data['slack_username'];
            this.message = 'Welcome!';
            this.router.navigate(['scrumboard', data['project_id']]);
            this.login_username = '';
            this.login_password = '';
            this.login_project = '';
            
            // this.authOptions = {
            //   headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'JWT ' + data['token']})
            // };
        },
        err => {
            document.getElementById('alert-error').style.display = 'block';
            if(err['status'] == 400)
                this.message = 'Login Failed: Invalid Credentials.';
            else
                this.message = 'Login Failed! Unexpected Error!';
            console.error(err);
            document.getElementById('lodr').style.display = 'none';
            this.login_username = '';
            this.login_password = '';
            this.login_project = '';
        }
    );
  }

  getHeader(){
    return { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'JWT ' + sessionStorage.getItem('token')})}
  }
  
  ImageAuthgetHeader() {
    return { headers: new HttpHeaders({ 'Authorization': 'JWT ' + sessionStorage.getItem('token') }) }
  }

  loggedIn() {
    return sessionStorage.getItem('token')
  }
  
  addGoal(on_user)
  {
    this.http.post(this.domain_protocol + this.domain_name + '/scrum/api/scrumgoals/', JSON.stringify({'name': this.goal_name, 'user': on_user, 'project_id': this.project}), this.authOptions).subscribe(
        data => {
            console.log(data);
            this.users = data['data'];
            this.message = data['message'];
            this.goal_name = '';
            this.filterSprint(this.sprints);
        },
        err => {
            console.error(err);
            if(err['status'] == 401)
            {
                this.message = 'Session Invalid or Expired. Please Login.';
                this.logout();
            } else
            {
                this.message = 'Unexpected Error!';    
            }
            this.goal_name = '';
        }
    );  
  }
             
  filterSprint(uSprints) {
    this.sprints= uSprints
    var filter_goal = []
    console.log(filter_goal)
          for (var i = 0;  i < this.users.length; i++)  {
            for (var j = 0;  j < this.users[i].scrumgoal_set.length; j++)  {
              if (this.sprints.length) {
                if (this.users[i].scrumgoal_set[j].time_created >= this.sprints[this.sprints.length - 1].created_on && 
                  this.users[i].scrumgoal_set[j].time_created <= this.sprints[this.sprints.length - 1].ends_on)
                  {                  
                  console.log(this.users[i].scrumgoal_set[j].time_created)
                  console.log(this.users[i].scrumgoal_set[j].name)
                   // this.users[i].scrumgoal_set[j].user_id = this.users[i].id
                   filter_goal.push(this.users[i].scrumgoal_set[j]);
                  }
              } else {
                  this.users[i].scrumgoal_set[j].user_id = this.users[i].id
                  filter_goal.push(this.users[i].scrumgoal_set[j]); 
              }
            }
          }
          console.log(filter_goal)
          this.sprint_goals = filter_goal

  }

  changeSprint() 
  {   
    this.sprint_goals = [];
      for (var i = 0;  i < this.users.length; i++)  {
        for (var j = 0;  j < this.users[i].scrumgoal_set.length; j++)  {
          if (this.users[i].scrumgoal_set[j].time_created > this.selected_sprint.created_on && 
            this.users[i].scrumgoal_set[j].time_created < this.selected_sprint.ends_on)
            {                
             this.users[i].scrumgoal_set[j].user_id = this.users[i].id;
             this.sprint_goals.push(this.users[i].scrumgoal_set[j]);
            }
          } 
        }
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['home'])
  }

  moveGoal(goal_id, to_id, hours, push_id)
  {
    console.log("~~~~~~~~~~~~~~~~~~~~~~parameters passed ~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
    console.log(goal_id)
    console.log(to_id)
    console.log(hours)
    console.log(push_id)
    this.http.patch(this.domain_protocol + this.domain_name + '/scrum/api/scrumgoals/', JSON.stringify({'goal_id': goal_id, 'to_id': to_id, 'hours': hours, 'project_id': this.project, 'push_id': push_id}), this.authOptions).subscribe(
        data => {
            this.users = data['data'];
            this.message = data['message'];
            this.filterSprint(this.sprints)
              if (this.selected_sprint) {
                  this.changeSprint()
                }
                else{
                  this.filterSprint(this.sprints)
                }
        },
        err => {
            console.error(err);
            
            if(err['status'] == 401)
            {
                this.message = 'Session Invalid or Expired. Please Login.';
                this.logout();
            } else
            {
                this.message = 'Unexpected Error!';    
            }
        }
    );  
  }
  
  changeOwner(from_id, to_id)
  {
    this.http.put(this.domain_protocol + this.domain_name + '/scrum/api/scrumgoals/', JSON.stringify({'mode': 0, 'goal_id': from_id, 'to_id': to_id, 'project_id': this.project}), this.authOptions).subscribe(
        data => {
            this.users = data['data'];
            this.message = data['message'];
            this.filterSprint(this.sprints)
        },
        err => {
            console.error(err);
            if(err['status'] == 401)
            {
                this.message = 'Session Invalid or Expired. Please Login.';
                this.logout();
            } else
            {
                this.message = 'Unexpected Error!';    
            }
        }
    );   
  }

  clearBoardSwitch()  {

    this.http.put(this.domain_protocol + this.domain_name + '/scrum/api/scrumgoals/', JSON.stringify({'mode': 3, 'project_id': this.project}), this.authOptions).subscribe(
        data => {
            console.log("toggle successful")
            this.message = data['message'];
            console.log(data['to_clear_board'] + 'true')
            sessionStorage.setItem('to_clear_board', data['to_clear_board']);
            this.to_clear_board  = data['to_clear_board']; 

        },
        err => {
          console.log('toggle failed')
            console.error(err);
            if(err['status'] == 401)
            {
                this.message = 'Session Invalid or Expired. Please Login.';
                this.logout();
            } else
            {
                this.message = 'Unexpected Error!';    
            }
        }
    );   
  }

  allProjectGoals(project_id) {
    return this.http.get<any>(this.scrumapi + project_id, this.httpOptions);
    //return this.http.get<any>(this.domain_protocol + this.domain_name + '/scrum/api/scrumprojects/' + project_id, this.httpOptions);
  }

  allSprints(project_id) {
    return this.http.get<any>(this.sprint + project_id, this.httpOptions);
   //return this.http.get<any>(this.domain_protocol + this.domain_name + '/scrum/api/scrumsprint/?goal_project_id=' + project_id, this.httpOptions);
  }

  startSprintRequest(project_id) {
    let sprint_start_date = new Date(new Date().getTime());
    let sprint_end_date = new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000));
    //this.http.post(this.domain_protocol + this.domain_name + '/scrum/api/scrumsprint/?goal_project_id=' + project_id, JSON.stringify({"project_id": project_id, "created_on": sprint_start_date, "ends_on": sprint_end_date}), this.getHeader());
    return this.http.post(this.sprint + project_id, JSON.stringify({"project_id": project_id, "created_on": sprint_start_date, "ends_on": sprint_end_date}), this.getHeader());
  }

  addTaskRequest(project_id) {
    let user_role_id = sessionStorage.getItem('role_id')
    // return this.http.post(this.domain_protocol + this.domain_name + '/scrum/api/scrumgoals/', JSON.stringify({ "name": this.goal_name, "user": 'm' + user_role_id, "project_id": project_id }), this.getHeader());
    return this.http.post(this.createTaskUrl, JSON.stringify({ "name": this.goal_name, "user": 'm' + user_role_id, "project_id": project_id }), this.getHeader());
    this.goal_name = '';
  }

  editTaskRequest(project_id) {
    //return this.http.put(this.domain_protocol + this.domain_name + '/scrum/api/scrumgoals/', JSON.stringify({ 'mode': 1, 'goal_id': this.taskIdToEdit, 'new_name': this.taskToEdit, 'project_id': project_id }), this.getHeader());
    return this.http.put(this.createTaskUrl, JSON.stringify({ "mode": 1, "goal_id": this.taskIdToEdit, "new_name": this.taskToEdit, "project_id": project_id }), this.getHeader());
  }

  imageUploadRequest(project_id) {
    let file: File = this.image_uploaded;
    let imageUpload =  new FormData();
    imageUpload.append("image", file, file.name);
    imageUpload.append("mode", "1");
    imageUpload.append("goal_id", this.taskIdToEdit);
    imageUpload.append("project_id", project_id);

    //return this.http.put(this.domain_protocol + this.domain_name + '/scrum/api/scrumgoals/', imageUpload, this.ImageAuthgetHeader());
    return this.http.put(this.createTaskUrl, imageUpload, this.ImageAuthgetHeader());

  }
}
