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

  constructor(public dataservice: DataService, private dragula: DragulaService, private http: HttpClient, private modalModule: MzModalModule) { }

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
        this.http.patch('http://' + this.dataservice.domain_name + '/scrum/api/scrumprojectroles/', JSON.stringify({'role': role_name, 'id': this.on_user, 'project_id': this.dataservice.project}), this.dataservice.authOptions).subscribe(
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

  createUser()
  {
    this.dataservice.createUser();  
  }

  home()
  {
  	this.dataservice.profile();
  }

}
