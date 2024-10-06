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

import { CallWithAstrologerComponent } from './call-with-astrologer/call-with-astrologer.component';
import { AstrologerLoginComponent } from './astrologer-login/astrologer-login.component';
import { ManageSkillsComponent } from './manage-skills/manage-skills.component';
import { ManageAstrologersComponent } from './manage-astrologers/manage-astrologers.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminastrologerComponent } from './adminastrologer/adminastrologer.component';
import { ManageBlogsComponent } from './manage-blogs/manage-blogs.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { PaymentComponent } from './payment/payment.component';
import { AuthService } from './auth.guard';
import { HealthcareComponent } from './healthcare/healthcare.component';
import { ChatComponent } from './chat/chat.component';
import { ConsultationPriceComponent } from './consultation-price/consultation-price.component';
import { ManagePaymentsComponent } from './manage-payments/manage-payments.component';
import { ChatAppForAstrologerComponent } from './chat-app-for-astrolgoer/chat-app-for-astrologer.component';
// import { NavbarComponent } from './navbar/navbar.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'Home', component: HomeComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'blogs/:id', component: BlogsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  // { path: 'navbar', component: NavbarComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'feedback', component: FeedbackFormComponent },
  { path: 'astrologer-signup', component: AstrologerSignupComponent },
  { path: 'chatwithastro', component: ChatWithAstrologerComponent, canActivate: [AuthService] },
  { path: 'astrodash', component: AstrologerDashboardComponent },
  { path: 'astroprofile', component: AstroProfileComponent },
  { path: 'astroclient', component: ClientListComponent },
  { path: 'astroreport', component: AstroReportComponent },
  { path: 'astroclient', component: ClientListComponent },
  { path: 'insert-blog-component', component: InsertblogComponent },
  { path: 'find-astrologers', component: FindAstrologersComponent, canActivate: [AuthService] },

  { path: 'callwithastro/:id', component: CallWithAstrologerComponent, canActivate: [AuthService] },
  { path: 'astrologer-login', component: AstrologerLoginComponent },
  { path: 'insert-blog', component: InsertblogComponent },

  { path: 'admin', component: AdminDashboardComponent },
  { path: '', component: AdminDashboardComponent },
  { path: 'manageskills', component: ManageSkillsComponent },
  { path: 'manageastrologer', component: ManageAstrologersComponent },
  { path: 'manageusers', component: ManageUsersComponent },
  { path: 'manageblog', component: ManageBlogsComponent },
  { path: 'adminastrologer', component: AdminastrologerComponent },
  { path: '', redirectTo: '/admin', pathMatch: 'full' },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'admin-dashbord', component: AdminDashboardComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'healthcare', component: HealthcareComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'consultation-price', component: ConsultationPriceComponent },
  { path: 'manage-payment', component: ManagePaymentsComponent },
  { path: 'astrologer-chat-app', component: ChatAppForAstrologerComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
