import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import { AdminComponent } from './admin/admin.component';
import { ProfileComponent } from './profile/profile.component';
import { DragulaModule } from 'ng2-dragula';

import { TermsComponent } from './terms/terms.component';
import { SupportComponent } from './support/support.component';
import { ScrumboardComponent } from './scrumboard/scrumboard.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
    { path: "", redirectTo: "/home", pathMatch: "full" },
    { path: "home", component: HomeComponent},
    { path: "login", component: LoginComponent },
    { path: "createuser", component: UserComponent },
  { path: "scrumboard", component: ScrumboardComponent, canActivate: [AuthGuard] },
    { path: "profile", component: ProfileComponent },
    { path: "admin", component: AdminComponent },
    { path: "terms", component: TermsComponent },
    { path: "support", component: SupportComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), DragulaModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
