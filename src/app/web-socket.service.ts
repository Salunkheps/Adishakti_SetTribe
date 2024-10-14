import { Injectable } from '@angular/core';
import * as Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Stomp.Client | null = null; // Initialize stompClient
  private messageSubject = new Subject<void>(); // Create a subject to emit loadMessages event
  private timerSubject = new Subject<void>();

  constructor(private router: Router, private http: HttpClient) { }

  // Connect to WebSocket server
  connect(): void {
    const socket = new SockJS('http://localhost:8075/ws'); // WebSocket endpoint
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, (frame: any) => {
      console.log('Connected: ' + frame);

      // Fetch the astrologer's registration ID from sessionStorage
      const astrologerRegId = sessionStorage.getItem('regId');
      console.log('Astrologer regId: ', astrologerRegId);

      // Subscribe to the astrologer's topic to receive notifications
      if (astrologerRegId) {
        this.stompClient?.subscribe('/topic/astrologer/' + astrologerRegId, (message: any) => {
          console.log('Received message: ', message);
          
          if (message.body === 'reload') {
            this.messageSubject.next(); // Trigger loadMessages when "reload" message is received
          } else if (message.body.startsWith('You have been rejected.')) {
            this.showRejectionAlert(message.body); // Show SweetAlert for rejection
          } else if (message.body == 'start-timer') {
            this.timerSubject.next(); // Trigger the timer start when "start-timer" message is received
          } else {
            this.showAlertForAstrologer(message.body); // Show SweetAlert if not "reload"
          }
        });
      }
      this.messageSubject.next(); // This will trigger loading of messages immediately after connection

      // Fetch the user's registration ID from sessionStorage
      const currentUser = sessionStorage.getItem('currentUser');
      let userRegId: string | null = null;

      if (currentUser) {
        // Parse the stored data to get the user's regId
        const currentUserData = JSON.parse(currentUser);
        userRegId = currentUserData?.regId;
        console.log('User regId: ', userRegId);
      }

      // Subscribe to the user's topic to receive notifications
      if (userRegId) {
        this.stompClient?.subscribe('/topic/user/' + userRegId, (message: any) => {
          console.log('Received message: ', message);
          if (message.body === 'reload') {
            this.messageSubject.next(); // Trigger loadMessages when "reload" message is received
          } else if (message.body == 'start-timer') {
            this.timerSubject.next(); // Trigger the timer start when "start-timer" message is received
          }
          else {
            this.showAlertForUser(message.body); // Show SweetAlert if not "reload"
          }
        });
      }
    }, (error: any) => {
      console.error('WebSocket connection error: ', error);
    });
  }
  // New method to show alert for rejection
  private showRejectionAlert(message: string): void {
    const [msg, reason] = message.split('Reason: '); // Split the message to separate the reason

    // First, clear the session storage
    sessionStorage.clear(); // Clear all session storage

    // Navigate to the landing page
    this.router.navigate(['/']).then(() => {
      // After navigating, show the SweetAlert
      Swal.fire({
        title: 'Rejection Notification',
        text: `Admin has rejected you for reason: ${reason}`, // Display the rejection message with reason
        icon: 'error',
        confirmButtonText: 'OK',
      });
    });
  }

  private showAlertForAstrologer(message: string): void {
    const [msg, chatSessionId] = message.split('|'); // Split message and session ID

    Swal.fire({
      title: 'Astrologer Notification',
      text: msg,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Chat Now',
    }).then((result) => {
      if (result.isConfirmed) {
        // Retrieve astrologer regId from session storage (or from any other source you have)
        const astrologerRegId = sessionStorage.getItem('regId'); // assuming it's stored under 'selectedAstrologer'
  
        // First, set the astrologer as busy
        this.http.put(`http://localhost:8075/api/astrologers/busy-status/${astrologerRegId}?isBusy=true`, {})
          .subscribe(() => {
            // After successfully marking astrologer as busy, call the astrologer-ready endpoint
            this.http.put(`http://localhost:8075/api/chatsessions/${chatSessionId}/astrologer-ready`, true)
              .subscribe(() => {
                sessionStorage.setItem('chatSessionId', chatSessionId);
                window.location.href = '/astrologer-chat-app';
              }, (error) => {
                console.error('Error marking astrologer as ready', error);
              });
          }, (error) => {
            console.error('Error updating astrologer busy status', error);
          });
  
      } else {
        console.log("Chat Now was canceled.");
      }
    });
  }

  private showAlertForUser(message: string): void {
    const [msg, chatSessionId] = message.split('|'); // Split message and session ID

    Swal.fire({
      title: 'Payment Approved!',
      text: msg,
      icon: 'success',
      confirmButtonText: 'Chat Now',
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Chat Now button clicked by user. Session ID:", chatSessionId);
        this.http.put(`http://localhost:8075/api/chatsessions/${chatSessionId}/user-ready`, true)
          .subscribe(() => {
            sessionStorage.setItem('chatSessionId', chatSessionId);
            window.location.href = '/chat';
          }, (error) => {
            console.error('Error marking user as ready', error);
          });

      } else {
        console.log("Chat Now was canceled.");
      }
    });
  }



  // Expose the subject as an observable to listen for message reload events
  getMessageSubject() {
    return this.messageSubject.asObservable();
  }

  // Expose the timer subject as an observable
  getTimerSubject() {
    return this.timerSubject.asObservable();
  }
  // Disconnect WebSocket
  disconnect(): void {
    if (this.stompClient !== null) {
      this.stompClient.disconnect(() => {
        console.log('Disconnected'); // Log disconnection message
      });
    }
  }
}