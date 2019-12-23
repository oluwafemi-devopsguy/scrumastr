import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import * as $ from 'jquery/dist/jquery.min.js';
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  public create_new_project: boolean = false;

  constructor(private router: Router, public dataservice: DataService, private titleService:Title) { 
    
  }

  ngOnInit() {
    const showProName = document.getElementById("c") as HTMLInputElement
    showProName.checked = false;
    this.showProField();
    this.setTitle("Sign Up");
  }

  // pageLoader () {
  //   $(window).on('load', function() {
  //     $('#mdb-preloader').addClass('loaded');
  //   });
  // }

  setTitle (title) {
    this.titleService.setTitle(title);
  }

  sgnBTN() {
      $('#btn-one').html('<span id="lodr" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>SIGN UP').addClass('disabled');
  }


  showProField() {
    let proField = document.getElementById("c") as HTMLInputElement
    let disInput = document.getElementById('ownerField') as HTMLInputElement
    if (proField.checked) {
      disInput.disabled = false
      document.getElementById('owner-Field').style.opacity = '1'
    } else {
      disInput.disabled = true
      document.getElementById('owner-Field').style.opacity = '0.4'
    }
  }

  
  toLogin()
  {
    this.router.navigate(['home']);
    this.dataservice.message = '';
  }

  
  createUser()
  {
    let proField = document.getElementById("c") as HTMLInputElement
    console.log(this.dataservice.add_slack)
    if (proField.checked == true) {
        this.dataservice.createuser_usertype = 'Owner'
     } else {
        this.dataservice.createuser_usertype = 'User'
     }
    document.getElementById('alert-error').style.display = 'none';
    this.dataservice.createUser();
  }

}
