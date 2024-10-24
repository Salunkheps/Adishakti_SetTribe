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
  private stopChatSubject = new Subject<void>();
  private startChatSubject = new Subject<void>();
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
          const [notificationMessage, chatSessionId] = message.body.split('|');

          if (message.body === 'reload') {
            this.messageSubject.next(); // Trigger loadMessages when "reload" message is received
          } else if (message.body.startsWith('User wants to extend the chat by')) {
            this.handleChatExtensionRequest(message.body);
          } else if (message.body.startsWith('You have been rejected.')) {
            this.showRejectionAlert(message.body); // Show SweetAlert for rejection
          } else if (message.body == 'start-timer') {
            this.timerSubject.next(); // Trigger the timer start when "start-timer" message is received
          } else if (notificationMessage === 'The chat session has been stopped.') {
            this.stopChatSubject.next(); // Correct handling of stop message
          } else if (notificationMessage === 'The chat session has resumed.') {
            this.startChatSubject.next(); // Correct handling of resume message
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
          } else if (message.body.startsWith('Astrologer has approved your request to extend chat. Please pay')) {
            this.showAlertForUserChatExtension(message.body); // New method for chat extension approval
          } else if (message.body === 'start-timer') {
            this.timerSubject.next(); // Trigger the timer start when "start-timer" message is received
          } else if (message.body.startsWith('The chat session has been stopped.')) {
            this.stopChatSubject.next();
          } else if (message.body.startsWith('The chat session has resumed.')) {
            this.startChatSubject.next();
          } else if (message.body.startsWith('Your chat has been extended by')) {
            this.NotifyUserChatExtendedByAstrologer(message.body);
          } else {
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
    // Check if chatSessionId is already present in session storage
    const storedChatSessionId = sessionStorage.getItem('chatSessionId');

    if (!storedChatSessionId) {
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
    } else {
      // If chatSessionId is already present, show a different SweetAlert (ABC)
      Swal.fire({
        title: 'Chat Extended',
        text: 'Admin has approved the payment and now your chat has been extended.',
        icon: 'info',
        confirmButtonText: 'OK',
      }).then((result) => {
        if (result.isConfirmed) {
          sessionStorage.setItem('stopChat', 'false'); // Set stopChat to false in session storage
          console.log("Stop chat has been set to false.");
        }
      });
    }
  }

  private showAlertForUser(message: string): void {
    const [msg, chatSessionId] = message.split('|'); // Split message and session ID

    // Check if chatSessionId is already present in session storage
    const storedChatSessionId = sessionStorage.getItem('chatSessionId');

    if (!storedChatSessionId) {
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
    } else {
      // If chatSessionId is already present, show a different SweetAlert (ABC)
      Swal.fire({
        title: 'Chat Extended',
        text: 'Admin has approved the payment and now your chat has been Extended.',
        icon: 'info',
        confirmButtonText: 'OK',
      }).then((result) => {
        if (result.isConfirmed) {
          sessionStorage.setItem('stopChat', 'false'); // Set stopChat to false in session storage
          console.log("Stop chat has been set to false.");
        }
      });
    }
  }


  // Expose the subject as an observable to listen for message reload events
  getMessageSubject() {
    return this.messageSubject.asObservable();
  }

  // Expose the timer subject as an observable
  getTimerSubject() {
    return this.timerSubject.asObservable();
  }

  getStopChatSubject() {
    return this.stopChatSubject.asObservable();
  }

  getStartChatSubject() {
    return this.startChatSubject.asObservable();
  }
  // New method to handle chat extension requests
  private handleChatExtensionRequest(message: string): void {
    const [msg, chatSessionId] = message.split('|'); // Split the message and session ID

    Swal.fire({
      title: 'Chat Extension Request',
      text: msg,
      icon: 'info',
      confirmButtonText: 'Extend Chat',
      showCancelButton: true,
      cancelButtonText: 'Reject Chat',
    }).then((result) => {
      if (result.isConfirmed) {
        // Logic to extend the chat
        this.http.put(`http://localhost:8075/api/chatsessions/extend-chat/approve/${chatSessionId}`, {})
          .subscribe(() => {
            console.log("Chat extension approved for session ID:", chatSessionId);

            // Optionally show a success message
            Swal.fire({
              title: 'Chat Extension Approved',
              text: 'The chat extension request has been approved.',
              icon: 'success',
              confirmButtonText: 'OK',
            }).then(() => {

            });
          }, (error) => {
            console.error('Error extending chat session', error);
          });
      } else if (result.isDismissed) {
        // Show a prompt to ask for the rejection reason
        Swal.fire({
          title: 'Reject Reason',
          input: 'text',
          inputLabel: 'Please provide a reason for rejecting the extension:',
          inputPlaceholder: 'Type your reason here...',
          showCancelButton: true,
          confirmButtonText: 'Submit',
          cancelButtonText: 'Cancel',
        }).then((reasonResult) => {

          if (reasonResult.isConfirmed) {
            const declineReason = reasonResult.value; // Get the input value

            // Send the rejection reason to the backend
            this.http.put(`http://localhost:8075/api/chatsessions/extend-chat/reject/${chatSessionId}`, {
              declineExtendChatReason: declineReason // Send the reason in the request body
            }).subscribe(() => {
              console.log("Chat extension rejected for session ID:", chatSessionId);
              Swal.fire({
                title: 'Rejection Confirmed',
                text: 'Chat extension request has been rejected.',
                icon: 'success',
                confirmButtonText: 'OK',
              });
            }, (error) => {
              Swal.fire({
                title: 'Error',
                text: 'There was an issue rejecting the chat extension. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK',
              });
            });
          } else {
            console.log("Chat extension request was canceled.");
          }
        });
      }
    });
  }

  private showAlertForUserChatExtension(message: string): void {
    const [msg, chatSessionId] = message.split('|'); // Split message and session ID

    // Extract the totalAmount from the message using a regular expression
    const totalAmountMatch = msg.match(/pay (\d+)/);
    const totalAmount = totalAmountMatch ? totalAmountMatch[1] : null; // Extract the number

    if (totalAmount) {
      sessionStorage.setItem('totalAmount', totalAmount); // Save totalAmount in session storage
    }
    Swal.fire({
      title: 'Chat Extension Approved!',
      text: msg,
      icon: 'success',
      confirmButtonText: 'Proceed to Pay',
      showCancelButton: true,
      cancelButtonText: 'Cancel', // Adding a cancel button    
    }).then((result) => {
      if (result.isConfirmed) {
        // Navigate to the payment page when the user clicks "Proceed to Pay"
        sessionStorage.setItem('chatSessionId', chatSessionId);
        this.router.navigate(['/payment-to-extend-chat']); // Navigate to the payment page
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        console.log("Payment process was canceled.");
        this.resumeChat(); // Call the resumeChat method if "Cancel" is clicked
      }
    });
  }


  // New method to resume chat
  resumeChat() {
    const chatSessionId = sessionStorage.getItem('chatSessionId');
    if (chatSessionId) {
      this.http.put(`http://localhost:8075/api/chatsessions/resume-chat/${chatSessionId}`, {}, { responseType: 'text' })
        .subscribe(
          response => {
            console.log('Chat resumed successfully:', response);
            // Optionally, you can add logic here to update the UI or notify the user
            // Swal.fire('Chat Resumed', 'The chat has been resumed successfully.', 'success');
            // this.checkStopChatStatus();
          },
          error => {
            console.error('Error resuming chat:', error);
            // Swal.fire('Error', 'Failed to resume the chat. Please try again.', 'error');
            // this.checkStopChatStatus();
          }
        );
    } else {
      console.warn('No chat session ID found in session storage.');
    }
  }

  // Disconnect WebSocket
  disconnect(): void {
    if (this.stompClient !== null) {
      this.stompClient.disconnect(() => {
        console.log('Disconnected'); // Log disconnection message
      });
    }
  }
  private NotifyUserChatExtendedByAstrologer(message: string): void {
    const [msg, chatSessionId, extendedTime] = message.split('|'); // Assuming the extended time is included in the message
  
    // Show notification for chat extension
    Swal.fire({
      title: 'Chat Extension Approved',
      text: msg, // Show the extended time in the message
      icon: 'success',
      confirmButtonText: 'OK',
    }).then(() => {
      // Any additional logic can go here if needed
    });
  }
  

}