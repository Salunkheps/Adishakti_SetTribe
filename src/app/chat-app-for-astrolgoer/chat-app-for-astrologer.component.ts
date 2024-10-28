import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-chat-app-for-astrologer',
  templateUrl: './chat-app-for-astrologer.component.html',
  styleUrls: ['./chat-app-for-astrologer.component.css']
})
export class ChatAppForAstrologerComponent implements OnInit, OnDestroy {

  private hasCheckedStopChat = false; // New variable to track if we have checked stopChat
  clients: any[] = [];
  selectedClient: any; messages: any[] = [];
  newMessage: string = '';
  isTyping: boolean = false;
  userDetails: any;
  loading: boolean = true; // Track loading state

  chatSessionId: string | null = null; // Store sessionId from session storage
  userRegId: string = ''; // User's regId, fetched from the backend using chat session ID
  astrologerRegId: string | null = null; // Astrologer's regId from session storage
  countdown: number = 0;
  countdownInterval: any;
  selectedMinutes: number = 0;
  selectedClientRegId: string | null = null;
  stopChatCheckInterval: any;
  feedbackAlertShown: boolean = false; // Flag to track if SweetAlert has been shown

  constructor(private chatService: ChatService, private http: HttpClient, private router: Router, private webSocketService: WebSocketService, private cdr: ChangeDetectorRef) {
    this.webSocketService.connect(); // Connect to WebSocket on component init
  }

  ngOnInit(): void {

    // Load astrologer details from session storage
    const astrologer = JSON.parse(sessionStorage.getItem('astrologer')!);
    this.chatSessionId = sessionStorage.getItem('chatSessionId'); // Load chatSessionId from session storage
    this.loading = false; // Hide loading overlay when ready
    this.fetchClients();

    this.webSocketService.getTimerSubject().subscribe(() => {
      this.startCountdown();
    });
    // Subscribe to message reload events
    this.webSocketService.getMessageSubject().subscribe(() => {
      this.loadMessages();  // Reload messages when a new message is received via WebSocket
      this.cdr.detectChanges();  // Ensure UI updates when new messages are received via WebSocket

    });

    this.webSocketService.getStopChatSubject().subscribe(() => {
      this.stopTimer();
    });

    this.webSocketService.getStartChatSubject().subscribe(() => {
      this.startTimer();
    });


    if (astrologer) {
      this.astrologerRegId = astrologer.regId;
    }

    // Retrieve user regId using the chat session ID
    if (this.chatSessionId) {
      this.checkReadyStatus(); // Call the method to check ready status
      this.http.get<any>(`http://localhost:8075/api/chatsessions/session-details/${this.chatSessionId}`).subscribe(
        (response) => {
          const { selectedMinutes, userRegId } = response;

          // Save selectedMinutes and userRegId in session storage
          sessionStorage.setItem('selectedMinutes', selectedMinutes.toString());
          sessionStorage.setItem('userRegId', userRegId);
          this.userRegId = userRegId; // Set userRegId to call getUserDetails

          this.getUserDetails(); // Fetch user details now
          this.countdown = selectedMinutes * 60;

          // Check if a countdown is already in session storage
          const savedCountdown = sessionStorage.getItem('countdown');
          if (savedCountdown) {
            this.countdown = parseInt(savedCountdown, 10); // Parse saved countdown
          }
        },
        (error) => {
          console.error('Error fetching session details:', error);
        }
      );
    }


    // Load countdown from session storage
    const savedCountdown = sessionStorage.getItem('countdown');
    if (savedCountdown) {
      this.countdown = parseInt(savedCountdown, 100);
    }
  }
  startTimer() {
    console.log('Chat resumed, setting stopChat to false');
    sessionStorage.setItem('stopChat', 'false');
  }

  stopTimer() {
    console.log('Chat stopped, setting stopChat to true');
    sessionStorage.setItem('stopChat', 'true');
  }

  // Method to check if both astrologer and user are ready
  checkReadyStatus() {
    this.http.get<boolean>(`http://localhost:8075/api/chatsessions/check-ready/${this.chatSessionId}`).subscribe(
      (isReady: boolean) => {
        if (isReady) {
          // If both are ready, start the countdown
          this.startCountdown();
        }
      },
      (error) => {
        console.error('Error checking ready status:', error);
      }
    );
  }

  // New method to fetch user details based on userRegId
  getUserDetails(): void {
    this.http.get<any>(`http://localhost:8075/api/users/regId/${this.userRegId}`).subscribe(
      (response) => {
        this.userDetails = {
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          // Include any other relevant fields you want to save
        };
        console.log('User details:', this.userDetails);
      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }
  loadMessages() {
    if (this.chatSessionId) {
      this.http.get<any[]>(`http://localhost:8075/api/chatmessages/session/${this.chatSessionId}`).subscribe(
        (messages) => {
          // Sort messages by timestamp in ascending order
          this.messages = messages
            .map((msg) => ({
              content: msg.content,
              time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSender: msg.senderRegId === this.astrologerRegId,
              timestamp: new Date(msg.timestamp) // Store the timestamp for sorting
            }))
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Sort based on timestamp
          this.cdr.detectChanges(); // Add this line
          this.scrollToBottom(); // Ensure the view is scrolled to the bottom to show the latest message
        },
        (error) => {
          console.error('Error loading messages:', error);
        }
      );
    }
  }
  scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages'); // Replace with the correct container class or ID
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100); // Delay to allow messages to render before scrolling
  }

  getFormattedTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  sendMessage() {

    this.astrologerRegId = sessionStorage.getItem('regId'); // Assuming the regId is stored as a string

    if (this.newMessage.trim() && this.chatSessionId) {
      const messageData = {
        senderRegId: this.astrologerRegId, // Astrologer is the sender
        receiverRegId: this.userRegId,     // User is the receiver
        content: this.newMessage,
        sessionId: this.chatSessionId,
      };

      this.http.post<any>('http://localhost:8075/api/chatmessages/create', messageData).subscribe(
        (message) => {
          this.messages.push({
            content: message.content,
            time: this.getFormattedTime(),
            isSender: true,
            timestamp: new Date(), // Add a timestamp to the message

          });
          this.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Sort after adding new message
          this.cdr.detectChanges(); // Add this line
          this.newMessage = ''; // Clear input after sending
          this.scrollToBottom(); // Ensure the view is scrolled to the bottom
        },
        (error) => {
          console.error('Error sending message:', error);
        }
      );
    }
  }
  selectClient(clientRegId: any) {
    this.selectedClientRegId = clientRegId;
    this.fetchChatMessages(clientRegId);  // Assuming `regId` is the userRegId   
  }
  startCountdown() {
    // Save the countdown in session storage every second
    this.feedbackAlertShown = false; // Reset flag when countdown starts

    this.countdownInterval = setInterval(() => {
      const stopChat = sessionStorage.getItem('stopChat');
      if (stopChat === 'true') {
        this.stopCountdown(); // Stop the countdown
        console.log('Countdown stopped because stopChat is true.');
        return; // Exit the interval if stopChat is true
      }
      if (this.countdown > 0) {
        this.countdown--; // Decrease the countdown by 1 second
        sessionStorage.setItem('countdown', this.countdown.toString()); // Save countdown
        // Check if countdown is less than 70 seconds to start scanning
      if (this.countdown < 70) {
        this.checkStopChatStatus(); // Start scanning for stopChat
        // this.hasCheckedStopChat = true; // Mark that we have checked
      }
      } else {
        // this.stopCountdown();
        this.showChatFinishedAlert(); // Call the SweetAlert method when time is up
        this.stopCountdown(); // Stop the countdown after it finishes
      }
    }, 1000);
    // Start a separate interval to check stopChat every second
    setInterval(() => {
      const stopChat = sessionStorage.getItem('stopChat');
      const remainingTime = parseInt(sessionStorage.getItem('countdown') || '0', 10);

      if (stopChat === 'false' && remainingTime > 0 && remainingTime < 70) {
        // Resume the countdown if it was previously stopped
        this.resumeChat()
        if (this.countdownInterval === null) { // Check if the countdown is stopped
          this.startCountdown(); // Restart the countdown
        }
      }
    }, 1000);
  }

  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval); // Clear the interval to stop the countdown
      this.countdownInterval = null; // Set countdownInterval to null
    }
  }


  showChatFinishedAlert() {
    Swal.fire({
      title: 'Chat Finished',
      text: 'Time Expired.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Go to Dashboard',
      cancelButtonText: 'Close',
    }).then((result) => {
      if (result.isConfirmed) {
        // Retrieve astrologer regId from session storage (assuming it is stored as 'selectedAstrologer')
        const astrologerRegId = sessionStorage.getItem('regId');

        // Call API to update astrologer's busy status to false
        this.http.put(`http://localhost:8075/api/astrologers/busy-status/${astrologerRegId}?isBusy=false`, {})
          .subscribe(() => {
            // After successful status update, navigate to the dashboard
            // Remove items from session storage
            sessionStorage.removeItem('chatSessionId');
            sessionStorage.removeItem('selectedMinutes');
            sessionStorage.removeItem('userRegId');
            sessionStorage.removeItem('countdown');
            this.router.navigate(['/astrodash']);
          }, (error) => {
            console.error('Error updating astrologer busy status', error);
          });
      }
    });
  }


  formatCountdown(): string {
    const minutes: number = Math.floor(this.countdown / 60);
    const seconds: number = this.countdown % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect(); // Disconnect on component destroy
    clearInterval(this.countdownInterval); 
  }

  fetchClients() {
    // Replace 'Devraj_052557' with the astrologer's regId dynamically if necessary
    const astrologerRegId = sessionStorage.getItem('regId');
    const url = `http://localhost:8075/api/chatsessions/astrologer/${astrologerRegId}/distinct-users`;

    this.http.get<any[]>(url).subscribe(
      (response) => {
        // Populate clients with the list of users
        this.clients = response;
        if (this.clients.length > 0) {
          // Set the first client as selected by default
          this.selectedClient = this.clients[0];
        }
      },
      (error) => {
        console.error('Error fetching clients:', error);
        Swal.fire('Error', 'Failed to load clients', 'error');
      }
    );
  }

  fetchChatMessages(clientRegId: string) {
    const astrologerRegId = sessionStorage.getItem('regId');
    console.log('Astrologer regId:', astrologerRegId);


    const url = `http://localhost:8075/api/chatmessages/messages?userRegId=${clientRegId}&astrologerRegId=${astrologerRegId}`;

    this.http.get<any[]>(url).subscribe(
      (messages) => {
        this.messages = messages
          .map((msg) => ({
            content: msg.content,
            time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSender: msg.senderRegId === this.astrologerRegId,
            timestamp: new Date(msg.timestamp) // Store the timestamp for sorting
          }))
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Sort based on timestamp
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      (error) => {
        console.error('Error fetching chat messages:', error);
        Swal.fire('Error', 'Failed to load chat messages', 'error');
      }
    );
  }

  openExtendChat() {
    // Stop the chat session immediately when the SweetAlert opens
    const sessionId = sessionStorage.getItem('chatSessionId');

    if (sessionId !== null) {
      this.stopChat()
      this.stopChatSession(Number(sessionId)); // Stop the session if sessionId is not null
    } else {
      this.resumeChat()
      console.error('Session ID is null. Cannot stop the chat session.');
    }
    Swal.fire({
      title: 'Enter the number of minutes to extend',
      input: 'number',
      inputAttributes: {
        min: '1',  // Minimum value for minutes
        max: '60', // Maximum value (optional, set it based on your logic)
        step: '1'
      },
      showCancelButton: true,
      confirmButtonText: 'Extend',
      cancelButtonText: 'Cancel', // Add cancel button text
      showLoaderOnConfirm: true,
      preConfirm: (minutes) => {
        if (minutes <= 0) {
          Swal.showValidationMessage('Please enter a valid number of minutes');
        }
        return minutes;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.extendChatSession(result.value);
      } else if (result.isDismissed) {
        // If the user clicks the cancel button
        this.resumeChat()
      }
    });
  }
  extendChatSession(minutes: number) {
    const sessionId = sessionStorage.getItem('chatSessionId');

    const apiUrl = `http://localhost:8075/api/chatsessions/extend-chat-by-astrologer/minutes/${sessionId}`;
    const body = { extendedMinutes: minutes };

    this.http.put(apiUrl, body).subscribe(
      (response) => {
        // Success Alert when the chat session is successfully extended
        Swal.fire({
          title: 'Success',
          text: 'Chat session extended by ' + minutes + ' minutes',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
      (error) => {
        // Error Alert when the chat session extension fails
        Swal.fire({
          title: 'Error',
          text: 'Failed to extend chat session',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );
  }
  // New method to stop chat
  stopChat() {
    const chatSessionId = sessionStorage.getItem('chatSessionId');
    if (chatSessionId) {
      this.http.put(`http://localhost:8075/api/chatsessions/stop-chat/${chatSessionId}`, {}, { responseType: 'text' })
        .subscribe(
          response => {
            console.log('Chat stopped successfully:', response);
            // Optionally, you can add logic here to update the UI or notify the user
            // Swal.fire('Chat Stopped', 'The chat has been stopped successfully.', 'success');
            this.checkStopChatStatus();
          },
          error => {
            console.error('Error stopping chat:', error);
            // Swal.fire('Error', 'Failed to stop the chat. Please try again.', 'error');
            this.checkStopChatStatus();
          }
        );
    } else {
      console.warn('No chat session ID found in session storage.');
    }
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
            this.checkStopChatStatus();
          },
          error => {
            console.error('Error resuming chat:', error);
            // Swal.fire('Error', 'Failed to resume the chat. Please try again.', 'error');
            this.checkStopChatStatus();
          }
        );
    } else {
      console.warn('No chat session ID found in session storage.');
    }
  }

  // Function to check countdown and run checkStopChatStatus if < 60 seconds
  checkCountdownAndRun(): void {
    const countdown = this.getCountdownFromSessionStorage();

    if (countdown !== null && countdown < 60) {
      this.checkStopChatStatus();
    }
  }
  getCountdownFromSessionStorage(): number | null {
    // Replace 'countdown' with the actual key you're using in session storage
    const countdown = sessionStorage.getItem('countdown');

    // Check if countdown exists and is a valid number
    if (countdown && !isNaN(Number(countdown))) {
      return parseInt(countdown, 10);
    }
    return null;  // Return null if countdown is not valid
  }

  // Fetch stopChat value every second from the backend
  checkStopChatStatus() {
    const sessionId = sessionStorage.getItem('chatSessionId');

    if (sessionId) {
      this.stopChatCheckInterval = setInterval(() => {
        this.http.get<boolean>(`http://localhost:8075/api/chatsessions/fetch-stop-chat/${sessionId}`)
          .subscribe(
            (stopChat) => {
              sessionStorage.setItem('stopChat', stopChat.toString());
              if (stopChat) {
                this.stopCountdown();
              }
            },
            (error) => {
              // console.error('Error fetching stopChat status:', error);
            }
          );
      }, 1000);
    }
  }
  // New method to stop the chat session and save stopChat value in session storage
  stopChatSession(sessionId: number) {
    const url = `http://localhost:8075/api/chatsessions/stop-chat/${sessionId}`;
    this.http.put(url, {}, { responseType: 'text' }).subscribe({
      next: (response) => {
        console.log('Chat session stopped:', response);
        // Store the stopChat value (e.g., true) in session storage
        // sessionStorage.setItem('stopChat', 'true');
        this.stopChat();
      },
      error: (error) => {
        console.error('Error stopping chat session:', error);
        Swal.fire('Error', 'Failed to stop the chat session', 'error');
        // Optionally, store stopChat as false if the API call fails
        this.resumeChat()
        // sessionStorage.setItem('stopChat', 'false');
      }
    });
  }
}