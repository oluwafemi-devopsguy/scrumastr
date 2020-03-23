import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class DataService {
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
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  public authOptions;
  public imageAuthOptions;

  constructor(private http: HttpClient, private router: Router) { }

  createUser() {
    //this.http.post(this.domain_protocol + this.domain_name + '/scrum/api/scrumusers/', JSON.stringify({'email': this.createuser_email, 'password': this.createuser_password, 'full_name': this.createuser_fullname, 'usertype': this.createuser_usertype, 'projname': this.createuser_projname}), this.httpOptions).subscribe(
    this.http.post(this.imageApi + '/scrum/api/scrumusers/', JSON.stringify({ 'email': this.createuser_email, 'password': this.createuser_password, 'full_name': this.createuser_fullname, 'usertype': this.createuser_usertype, 'projname': this.createuser_projname }), this.httpOptions).subscribe(
      data => {
        if (
          data['message'] == 'User Created Successfully.' ||
          data['message'] == 'Project Created Successfully for already existing User.'
        ) {
          document.getElementById('alert-success').style.display = 'block';
          setTimeout(() => {
            this.router.navigate(['login']);
          }, 3000);


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
        document.getElementById('lodr').style.display = 'none';
        document.getElementById('alert-error').style.display = 'block';
        this.message = 'User already exists or invalid data';
        this.createuser_password = '';
        this.createuser_fullname = '';
        this.createuser_projname = '';


      }

    );

  }


  login() {
    this.http.post(this.imageApi + '/scrum/api-token-auth/', JSON.stringify({ 'username': this.login_username, 'password': this.login_password, 'project': this.login_project }), this.httpOptions).subscribe(
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

      },
      err => {
        document.getElementById('alert-error').style.display = 'block';
        if (err['status'] == 400)
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

  getHeader() {
    return { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'JWT ' + sessionStorage.getItem('token') }) }
  }

  ImageAuthgetHeader() {
    return { headers: new HttpHeaders({ 'Authorization': 'JWT ' + sessionStorage.getItem('token') }) }
  }

  loggedIn() {
    return sessionStorage.getItem('token')
  }


  logout() {
    sessionStorage.removeItem('token');
    this.router.navigate(['home']);
  }

  allProjectGoals(project_id) {
    return this.http.get<any>(this.imageApi + '/scrum/api/scrumprojects/' + project_id, this.httpOptions);
    //return this.http.get<any>(this.domain_protocol + this.domain_name + '/scrum/api/scrumprojects/' + project_id, this.httpOptions);
  }

  allSprints(project_id) {
    return this.http.get<any>(this.imageApi + '/scrum/api/scrumsprint/?goal_project_id=' + project_id, this.httpOptions);
    //return this.http.get<any>(this.domain_protocol + this.domain_name + '/scrum/api/scrumsprint/?goal_project_id=' + project_id, this.httpOptions);
  }

  startSprintRequest(project_id) {
    let sprint_start_date = new Date(new Date().getTime());
    let sprint_end_date = new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000));
    //this.http.post(this.domain_protocol + this.domain_name + '/scrum/api/scrumsprint/?goal_project_id=' + project_id, JSON.stringify({"project_id": project_id, "created_on": sprint_start_date, "ends_on": sprint_end_date}), this.getHeader());
    return this.http.post(this.imageApi + '/scrum/api/scrumsprint/?goal_project_id=' + project_id, JSON.stringify({ "project_id": project_id, "created_on": sprint_start_date, "ends_on": sprint_end_date }), this.getHeader());
  }

  addTaskRequest(project_id, user_role_id) {
    // return this.http.post(this.domain_protocol + this.domain_name + '/scrum/api/scrumgoals/', JSON.stringify({ "name": this.goal_name, "user": 'm' + user_role_id, "project_id": project_id }), this.getHeader());
    return this.http.post(this.imageApi + '/scrum/api/scrumgoals/', JSON.stringify({ "name": this.goal_name, "user": 'm' + user_role_id, "project_id": project_id }), this.getHeader());
  }

  editTaskRequest(project_id) {
    //return this.http.put(this.domain_protocol + this.domain_name + '/scrum/api/scrumgoals/', JSON.stringify({ 'mode': 1, 'goal_id': this.taskIdToEdit, 'new_name': this.taskToEdit, 'project_id': project_id }), this.getHeader());
    return this.http.put(this.imageApi + '/scrum/api/scrumgoals/', JSON.stringify({ "mode": 1, "goal_id": this.taskIdToEdit, "new_name": this.taskToEdit, "project_id": project_id }), this.getHeader());
  }

  imageUploadRequest(project_id) {
    let file: File = this.image_uploaded;
    let imageUpload = new FormData();
    imageUpload.append("image", file, file.name);
    imageUpload.append("mode", "1");
    imageUpload.append("goal_id", this.taskIdToEdit);
    imageUpload.append("project_id", project_id);

    //return this.http.put(this.domain_protocol + this.domain_name + '/scrum/api/scrumgoals/', imageUpload, this.ImageAuthgetHeader());
    return this.http.put(this.imageApi + '/scrum/api/scrumgoals/', imageUpload, this.ImageAuthgetHeader());

  }

  addNoteRequest(project_id, user_role_id, note, priority) {
    //return this.http.post(this.domain_protocol + this.domain_name + '/scrum/api/scrumnotes/', JSON.stringify({ 'note': note, 'priority': priority, 'user': user_role_id, 'project_id': project_id }), this.getHeader());
    return this.http.post(this.imageApi + '/scrum/api/scrumnotes/', JSON.stringify({ 'note': note, 'priority': priority, 'user': 'm' + user_role_id, 'project_id': project_id }), this.getHeader());
  }

  deleteNoteRequest(project_id, note_id) {
    //return this.http.post(this.domain_protocol + this.domain_name + '/scrum/api/scrumnotes/', JSON.stringify({ 'id': note_id, 'project_id': project_id }), this.getHeader());
    return this.http.put(this.imageApi + '/scrum/api/scrumnotes/', JSON.stringify({ 'id': note_id, 'project_id': project_id }), this.getHeader());
  }

  moveGoalRequest(goal_id, to_id, hours, push_id, project_id) {
    //return this.http.patch(this.imageApi + '/scrum/api/scrumgoals/', JSON.stringify({ 'goal_id': goal_id, 'to_id': to_id, 'hours': hours, 'project_id': this.project, 'push_id': push_id }), this.getHeader());
    return this.http.patch(this.imageApi + '/scrum/api/scrumgoals/', JSON.stringify({ 'goal_id': goal_id, 'to_id': to_id, 'hours': hours, 'project_id': project_id, 'push_id': push_id }), this.getHeader());
  } 

}
