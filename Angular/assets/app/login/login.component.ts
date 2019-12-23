import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router, public dataservice: DataService, private titleService:Title) { }

  ngOnInit() {
  this.setTitle('Login')
  }

  setTitle (title) {
    this.titleService.setTitle(title);
  }

  toUser()
  {
    this.router.navigate(['createuser']);
    this.dataservice.message = '';
  }
  
  login()
  {
    this.dataservice.login();
  }
}
