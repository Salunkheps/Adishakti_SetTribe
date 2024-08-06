
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FindAstrologersComponent } from './find-astrologers/find-astrologers.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { BlogsComponent } from './blogs/blogs.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { FeedbackFormComponent } from './feedback-form/feedback-form.component';
import { AstrologerSignupComponent } from './astrologer-signup/astrologer-signup.component';
import { ChatWithAstrologerComponent } from './chat-with-astrologer/chat-with-astrologer.component';
import { AstrologerDashboardComponent } from './astrologer-dashboard/astrologer-dashboard.component';
import { AstroProfileComponent } from './astro-profile/astro-profile.component';
import { ClientListComponent } from './client-list/client-list.component';
import { AstroReportComponent } from './astro-report/astro-report.component';
import { InsertblogComponent } from './insertblog/insertblog.component';
import { ChatsComponent } from './chats/chats.component';
import { CallWithAstrologerComponent } from './call-with-astrologer/call-with-astrologer.component';
import { AdminDashboardComponent } from './Admin/admin-dashboard/admin-dashboard.component';
import { ManageAstrologersComponent } from './Admin/manage-astrologers/manage-astrologers.component';
import { AstrologerRequestComponent } from './Admin/astrologer-request/astrologer-request.component';
import { ManageBlogComponent } from './Admin/manage-blog/manage-blog.component';
import { ManageSkillsComponent } from './Admin/manage-skills/manage-skills.component';
import { ManageUsersComponent } from './Admin/manage-users/manage-users.component';

// import { NavbarComponent } from './navbar/navbar.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'Home', component: HomeComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  // { path: 'navbar', component: NavbarComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'feedback', component: FeedbackFormComponent },
  { path: 'astrologer-signup', component: AstrologerSignupComponent },
  { path: 'chat-with-astrologer', component: ChatWithAstrologerComponent },
  { path: 'astrodash', component: AstrologerDashboardComponent },
  { path: 'astroprofile', component: AstroProfileComponent },
  { path: 'astroclient', component: ClientListComponent },
  { path: 'astroreport', component: AstroReportComponent },
  { path: 'astroclient', component: ClientListComponent },
  { path: 'insert-blog-component', component: InsertblogComponent },         
  { path: 'find-astrologers', component: FindAstrologersComponent },
  { path: 'chats', component: ChatsComponent},
  { path: 'callwithastro/:id', component: CallWithAstrologerComponent},
{path:'admin',component:AdminDashboardComponent},
{path:'manageast',component:ManageAstrologersComponent},
{path:'astrequest',component:AstrologerRequestComponent},
{path:'manageblog',component:ManageBlogComponent},
{path:'manageskills',component:ManageSkillsComponent},
{path:'manageusers',component:ManageUsersComponent},
];  

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
