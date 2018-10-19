import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class DataService {
    
  public domain_name = '127.0.0.1:8000';
  
  public message;
  public goal_name;
  
  public login_username;
  public login_password;
  public login_project;
  
  public createuser_email;
  public createuser_password;
  public createuser_fullname;
  public createuser_usertype = "User";
  public createuser_projname;
  
  public username;
  public realname;
  public role;
  public project;
  public project_name;
  public users;
  
  public httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };
  
  public authOptions;
  
  constructor(private http: HttpClient, private router: Router) { }
  
  createDemo()
  {
    this.message = "Creating the Demo, please wait...";
    this.http.get('http://' + this.domain_name + '/scrum/create-demo/', this.httpOptions).subscribe(
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
  
  createUser()
  {
    this.http.post('http://' + this.domain_name + '/scrum/api/scrumusers/', JSON.stringify({'email': this.createuser_email, 'password': this.createuser_password, 'full_name': this.createuser_fullname, 'usertype': this.createuser_usertype, 'projname': this.createuser_projname}), this.httpOptions).subscribe(
        data => {
            this.message = data['message'];
            this.createuser_email = '';
            this.createuser_password = '';
            this.createuser_fullname = '';
            this.createuser_usertype = '';
            this.createuser_projname = '';
        },
        err => {
            this.message = 'User Creation Failed! Unexpected Error!';
            console.error(err);
            this.createuser_email = '';
            this.createuser_password = '';
            this.createuser_fullname = '';
            this.createuser_usertype = '';
            this.createuser_projname = '';
        }
    );
  }
  
  login()
  {
    this.http.post('http://' + this.domain_name + '/scrum/api-token-auth/', JSON.stringify({'username': this.login_username, 'password': this.login_password, 'project': this.login_project}), this.httpOptions).subscribe(
        data => {
            sessionStorage.setItem('username', this.login_username);
            sessionStorage.setItem('realname', data['name']);
            sessionStorage.setItem('role', data['role']);
            sessionStorage.setItem('token', data['token']);
            sessionStorage.setItem('project_id', data['project_id']);
            this.username = this.login_username;
            this.role = data['role'];
            this.realname = data['name'];
            this.project = data['project_id'];
            this.message = 'Welcome!';
            this.router.navigate(['profile']);
            this.login_username = '';
            this.login_password = '';
            this.login_project = '';
            console.log(data);
            
            this.authOptions = {
                headers: new HttpHeaders({'Content-Type': 'application/json', 'Authorization': 'JWT ' + data['token']})
            };
        },
        err => {
            if(err['status'] == 400)
                this.message = 'Login Failed: Invalid Credentials.';
            else
                this.message = 'Login Failed! Unexpected Error!';
            console.error(err);
            this.login_username = '';
            this.login_password = '';
            this.login_project = '';
        }
    );
  }
  
  addGoal(on_user)
  {
    this.http.post('http://' + this.domain_name + '/scrum/api/scrumgoals/', JSON.stringify({'name': this.goal_name, 'user': on_user, 'project_id': this.project}), this.authOptions).subscribe(
        data => {
            console.log(data);
            this.users = data['data'];
            this.message = data['message'];
            this.goal_name = '';
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
  
  logout()
  {
    this.username = '';
    this.role = '';
    this.users = [];
    this.realname = '';
    this.project = 0;
    this.project_name = '';
    this.router.navigate(['home']);
    this.authOptions = {};
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('project_id');
    sessionStorage.removeItem('realname');
  }
  
  moveGoal(goal_id, to_id, hours)
  {
    this.http.patch('http://' + this.domain_name + '/scrum/api/scrumgoals/', JSON.stringify({'goal_id': goal_id, 'to_id': to_id, 'hours': hours, 'project_id': this.project}), this.authOptions).subscribe(
        data => {
            this.users = data['data'];
            this.message = data['message'];
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
    this.http.put('http://' + this.domain_name + '/scrum/api/scrumgoals/', JSON.stringify({'mode': 0, 'from_id': from_id, 'to_id': to_id, 'project_id': this.project}), this.authOptions).subscribe(
        data => {
            this.users = data['data'];
            this.message = data['message'];
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
}
