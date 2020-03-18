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
      this.router.navigate(['scrumboard/'+sessionStorage.getItem('project_id')])
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

  createUser(){
    this.dataservice.createUser(); 
  }
  

}
