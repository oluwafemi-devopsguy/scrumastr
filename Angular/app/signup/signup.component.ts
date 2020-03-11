import { Component, OnInit } from '@angular/core';

import { DataService } from '../data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  constructor(private router: Router, public dataservice: DataService) { }

  ngOnInit() {
    if (sessionStorage.getItem('token')) {
      this.router.navigate(['scrumboard'])
    }
    const showProName = document.getElementById("c") as HTMLInputElement
    showProName.checked = true
    this.dataservice.createuser_usertype = 'user'
    this.showProField()
  }


  showProField() {
    let proField = document.getElementById("c") as HTMLInputElement
    if (!proField.checked) {
      document.getElementById('ownerField').style.display = 'block'
    } else {
       document.getElementById('ownerField').style.display = 'none'
    }
  }

  // userModel = new Scrumuser ('','','','','');

  feedback = ""

  rose(message) {
    var x = document.getElementById("alert");
    document.getElementById('alert').innerHTML = message;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
  }

  // createUser() {
  // 	if (!this._scrumdataService.type) {
  //      this._scrumdataService.type = 'owner'
  //   }
  //   // console.log(this.userModel)
  //   console.log({'email': this._scrumdataService.email, 'password': this._scrumdataService.password, 'full_name': this._scrumdataService.fullname, 'usertype': this._scrumdataService.type, 'projname': this._scrumdataService.projname})
  //   this._scrumdataService.signup({'email': this._scrumdataService.email, 'password': this._scrumdataService.password, 'full_name': this._scrumdataService.fullname, 'usertype': this._scrumdataService.type, 'projname': this._scrumdataService.projname}).subscribe(
  //   data => {
  //     this.feedback = 'Account Created Successfully!', 
  //     console.log(data),
  //     document.getElementById('alert-success').style.display = 'block'
  //     this._scrumdataService.email = '';
  //     this._scrumdataService.password = '';
  //     this._scrumdataService.fullname = '';
  //     this._scrumdataService.type = '';
  //     this._scrumdataService.projname = '';
  //   },
  //   error => {
  //     this.feedback = 'creating account',
  //     console.log(error),
  //     document.getElementById('alert-error').style.display = 'block'
  //     this._scrumdataService.email = '';
  //     this._scrumdataService.password = '';
  //     this._scrumdataService.fullname = '';
  //     this._scrumdataService.type = '';
  //     this._scrumdataService.projname = '';
  //   }
  //   )
  // }

  createUser(){
    console.log("inside user")
    console.log(this.dataservice.add_slack)
    this.dataservice.createUser(); 
  }
  

}
