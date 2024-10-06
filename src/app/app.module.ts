import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { BannerComponent } from './banner/banner.component';
import { StatsComponent } from './stats/stats.component';
import { TopRatedAstrologersComponent } from './top-rated-astrologers/top-rated-astrologers.component';
import { LatestBlogsComponent } from './latest-blogs/latest-blogs.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { FindAstrologersComponent } from './find-astrologers/find-astrologers.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { BlogsComponent } from './blogs/blogs.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { FeedbackFormComponent } from './feedback-form/feedback-form.component';
import { AstrologerSignupComponent } from './astrologer-signup/astrologer-signup.component';
import { ChatWithAstrologerComponent } from './chat-with-astrologer/chat-with-astrologer.component';
import { WhyadiComponent } from './whyadi/whyadi.component';
import { AstrologerDashboardComponent } from './astrologer-dashboard/astrologer-dashboard.component';
import { AstroProfileComponent } from './astro-profile/astro-profile.component';
import { ClientListComponent } from './client-list/client-list.component';
import { AstroReportComponent } from './astro-report/astro-report.component';
import { InsertblogComponent } from './insertblog/insertblog.component';

import { CallWithAstrologerComponent } from './call-with-astrologer/call-with-astrologer.component';

import { AstrologerLoginComponent } from './astrologer-login/astrologer-login.component';
import { ManageAstrologersComponent } from './manage-astrologers/manage-astrologers.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ManageSkillsComponent } from './manage-skills/manage-skills.component';
import { ManageBlogsComponent } from './manage-blogs/manage-blogs.component';
import { AdminastrologerComponent } from './adminastrologer/adminastrologer.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { PaymentComponent } from './payment/payment.component';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about/about.component';
import { Footer2Component } from './footer2/footer2.component';
import { HealthcareComponent } from './healthcare/healthcare.component';
import { DataTablesModule } from "angular-datatables";
import { ChatComponent } from './chat/chat.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // Import FontAwesomeModule
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ConsultationPriceComponent } from './consultation-price/consultation-price.component';
import { ChatAppForAstrologerComponent } from './chat-app-for-astrolgoer/chat-app-for-astrologer.component';
import { ManagePaymentsComponent } from './manage-payments/manage-payments.component';
import { WebSocketService } from './web-socket.service';





@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    BannerComponent,
    StatsComponent,
    TopRatedAstrologersComponent,
    LatestBlogsComponent,
    FooterComponent,
    HomeComponent,
    FindAstrologersComponent,
    AboutUsComponent,
    BlogsComponent,
    LoginComponent,
    SignupComponent,
    AdminLoginComponent,
    FeedbackFormComponent,
    AstrologerSignupComponent,
    ChatWithAstrologerComponent,
    WhyadiComponent,
    AstrologerDashboardComponent,
    AstroProfileComponent,
    ClientListComponent,
    AstroReportComponent,
    
    InsertblogComponent,

    CallWithAstrologerComponent,

    AstrologerLoginComponent,
    ManageAstrologersComponent,
    ManageUsersComponent,
    ManageSkillsComponent,
    ManageBlogsComponent,
    AdminastrologerComponent,
    AdminDashboardComponent,
    PaymentComponent,
    AboutComponent,
    Footer2Component,
    HealthcareComponent,
    ChatComponent,
    ConsultationPriceComponent,
    ChatAppForAstrologerComponent,
    ManagePaymentsComponent,



  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    // UsersRoutingModule,
    HttpClientModule,
    DataTablesModule,
    FontAwesomeModule,
    SweetAlert2Module,
  ],
  providers: [    WebSocketService // Ensure WebSocketService is provided here
],
  bootstrap: [AppComponent]
})
export class AppModule { }
