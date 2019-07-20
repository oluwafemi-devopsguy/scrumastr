import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  public create_new_project: boolean = false;

  constructor(private router: Router, public dataservice: DataService) { }

  ngOnInit() {
  }
  
  toLogin()
  {
    this.router.navigate(['home']);
    this.dataservice.message = '';
  }

  showCreateProject() {
    this.create_new_project = !this.create_new_project;
  }

  createProject() {
    console.log("project creatinnnnnnnnnnnnnnnn") 
    this.dataservice.createuser_usertype = "Owner"
    this.dataservice.createuser_password = "password"
  }
  
  createUser()
  {
  console.log("inside user")
  console.log(this.dataservice.add_slack)
    this.dataservice.createUser(); 

  }

}
