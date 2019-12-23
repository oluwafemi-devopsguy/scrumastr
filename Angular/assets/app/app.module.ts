import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { DataService } from './data.service';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';

import { GenerateTokenComponent } from './generate-token/generate-token.component';
import { GroupClassComponent } from './group-class/group-class.component';
import { SignupComponent } from './signup/signup.component';

import { HttpClientModule } from '@angular/common/http';
import { ProfileComponent } from './profile/profile.component';
import { WorkIDsPipe } from './profile/profile.pipe';
import { TFTsGoalsPipe } from './profile/profile.pipe';
import { InitUserLanePipe } from './profile/profile.pipe';
import { ElementizePipe } from './profile/profile.pipe';

import { DragulaModule } from 'ng2-dragula';
import { MzButtonModule, MzModalModule } from 'ngx-materialize';
import { AdminComponent } from './admin/admin.component';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TermsComponent } from './terms/terms.component';
import { SupportComponent } from './support/support.component';
import { ScrumboardComponent } from './scrumboard/scrumboard.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    UserComponent,
    ProfileComponent,
    GenerateTokenComponent,
    GroupClassComponent,
    SignupComponent,
    AdminComponent,
    WorkIDsPipe,
    TFTsGoalsPipe, 
    InitUserLanePipe,
    ElementizePipe,
    TermsComponent,
    SupportComponent,
    ScrumboardComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MzButtonModule,
    MzModalModule,
    DragulaModule.forRoot()

  ],
  providers: [
    DataService
  ],
  schemas: [NO_ERRORS_SCHEMA],

  bootstrap: [AppComponent]

})
export class AppModule { }
