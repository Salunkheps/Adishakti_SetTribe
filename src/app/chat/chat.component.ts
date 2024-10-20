import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { HttpClient } from '@angular/common/http';
import { Route, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  [x: string]: any;
  astrologers: any[] = []; // To hold the astrologers fetched from the API
  selectedClient: any = this.astrologers[0];
  messages: any[] = [];
  newMessage: string = '';
  isTyping: boolean = false;
  astrologerDetails: any; // Property to hold astrologer details
  sessionId: number | null = null; // Store sessionId once it's created
  currentUserRegId: string = ''; // User's regId
  astrologerRegId: string = ''; // Astrologer's regId
  countdown: number = 0; // Timer in seconds
  countdownInterval: any; // Interval for countdown
  selectedMinutes: number = 0;
  astrologerFirstName: string = '';
  astrologerLastName: string = '';
  isPaymentMade: boolean = false;
  selectedAstrologer: any; // Selected astrologer

  constructor(private chatService: ChatService, private http: HttpClient, private router: Router, private webSocketService: WebSocketService, private cdr: ChangeDetectorRef) {
    this.webSocketService.connect(); // Connect to WebSocket on component init
  }


  ngOnInit(): void {
    this.webSocketService.connect(); // Connect to WebSocket on component init
    this.sessionId = sessionStorage.getItem('chatSessionId') ? Number(sessionStorage.getItem('chatSessionId')) : null;
    this.astrologerRegId = sessionStorage.getItem('astrologerRegId') || '';

    this.selectedAstrologer = { regId: (this.astrologerRegId = sessionStorage.getItem('astrologerRegId') || '') };

    this.getDistinctAstrologers();

    this.loadSessionData(); // Fetch session data from the database
    const selectedMinutes = sessionStorage.getItem('selectedMinutes');

    // Subscribe to message reload events
    this.webSocketService.getMessageSubject().subscribe(() => {
      this.loadMessages();  // Reload messages when a new message is received via WebSocket
    });

    // Retrieve countdown from session storage if available
    const storedCountdown = sessionStorage.getItem('countdown');
    if (storedCountdown) {
      this.countdown = parseInt(storedCountdown, 10);
    } else if (selectedMinutes) {
      // Initialize countdown from selectedMinutes if no countdown was stored
      this.countdown = parseInt(selectedMinutes, 10) * 60;
      sessionStorage.setItem('countdown', this.countdown.toString()); // Save initial countdown
    }


    this.webSocketService.getTimerSubject().subscribe(() => {
      this.startCountdown();
    });

    this.webSocketService.getStopChatSubject().subscribe(() => {
      this.stopTimer();
    });

    this.webSocketService.getStopChatSubject().subscribe(() => {
      this.startTimer();
    });

    // Load countdown from session storage
    if (selectedMinutes) {
      this.countdown = parseInt(selectedMinutes, 10) * 60;
    }

    if (this.sessionId) {
    }
    if (this.astrologerRegId) {
      this.astrologerDetails = this.astrologerRegId; // Store astrologer details
    }
    if (this.currentUserRegId) {
      this.startSession();
    }
    if (this.currentUserRegId && this.astrologerRegId) {
      this.currentUserRegId = this.currentUserRegId;
      this.astrologerRegId = this.astrologerRegId;

      if (this.sessionId) {
        this.loadMessages(); // Load messages for the existing session
        this.checkReadyStatus(); // Call the method to check ready status
      } else {
        // If no existing session, create a new session
      }
    }
  }
  startTimer() {
    sessionStorage.setItem('stopChat', 'false');
  }
  stopTimer() {
    sessionStorage.setItem('stopChat', 'true');
  }
  getDistinctAstrologers() {
    // Fetch 'currentUser' from session storage
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const userId = currentUser.regId; // Extract 'regId' from currentUser
    if (userId) {
      // Make the API call using the extracted userId
      this.http.get<any[]>(`http://localhost:8075/api/chatsessions/user/${userId}/distinct-astrologer`)
        .subscribe(
          (data) => {
            this.astrologers = data;
          },
          (error) => {
            console.error('Error fetching astrologers:', error);
          }
        );
    } else {
      console.error('User ID not found in session storage');
    }
  }

  loadSessionData() {
    this.http.get<any>(`http://localhost:8075/api/chatsessions/${this.sessionId}`).subscribe(
      (sessionData) => {
        console.log('Session Data:', sessionData);

        this.selectedMinutes = sessionData.selectedMinutes;
        sessionStorage.setItem('selectedMinutes', this.selectedMinutes.toString()); // Set to session storage

        this.astrologerFirstName = sessionData.astrologer.firstName;
        this.astrologerLastName = sessionData.astrologer.lastName;
        this.currentUserRegId = sessionData.user.regId;
        this.astrologerRegId = sessionData.astrologer.regId;

        // Update astrologerDetails here
        this.astrologerDetails = {
          firstName: this.astrologerFirstName,
          lastName: this.astrologerLastName
        };

        sessionStorage.setItem('astrologerRegId', this.astrologerRegId);

        this.loadMessages();
        this.checkReadyStatus();
      },
      (error) => {
        console.error('Error loading session data:', error);
      }
    );
  }


  // Method to check if both astrologer and user are ready
  checkReadyStatus() {
    this.http.get<boolean>(`http://localhost:8075/api/chatsessions/check-ready/${this.sessionId}`).subscribe(
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
  startSession() {
    // const chatSessionId = sessionStorage.getItem('chatSessionId'); // Get chat session ID from session storage
    const selectedMinutes = sessionStorage.getItem('selectedMinutes'); // Get selected minutes from session storage

    if (this.sessionId && selectedMinutes) {
      const sessionData = {
        selectedMinutes: parseInt(selectedMinutes, 10) // Parse selectedMinutes to integer
      };

      // Use PUT request to update the session
      this.http.put<any>(`http://localhost:8075/api/chatsessions/update/${this.sessionId}`, sessionData).subscribe(
        (response) => {
          // Check if response is as expected 
          if (response && response.success) { // Assuming 'success' indicates the operation's success
            console.log('Session updated successfully:', response);
          } else {
            console.error('Unexpected response format:', response);
          }
        },
        (error) => {
          // Log detailed error information
          console.error('Error updating session:', error);
          if (error.error && error.error.message) {
            console.error('Error message from server:', error.error.message);
          }
        }
      );
    } else {
      console.error('Chat session ID or selected minutes are missing from session storage.');
    }
  }

  startCountdown() {
    // Save the countdown in session storage every second
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
      } else {
        this.stopCountdown();
        this.showChatFinishedAlert(); // Call the SweetAlert method when time is up
      }
    }, 1000);
  }
  // Method to stop the countdown
  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval); // Clear the interval to stop the countdown
    }
  }

  showChatFinishedAlert() {
    Swal.fire({
      title: 'Chat Finished',
      text: 'Please submit your valuable feedback.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Feedback',
      cancelButtonText: 'Close',
    }).then((result) => {
      if (result.isConfirmed) {
        // Navigate to the feedback route
        sessionStorage.removeItem('selectedMinutes');
        this.router.navigate(['/feedback']);
      }
    });
  }

  openExtendChat() {
    // Stop the chat session immediately when the SweetAlert opens
    if (this.sessionId !== null) {
      this.stopChatSession(this.sessionId); // Stop the session if sessionId is not null
    } else {
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
        sessionStorage.setItem('stopChat', 'false');
      }
    });
  }

  extendChatSession(minutes: number) {
    const apiUrl = `http://localhost:8075/api/chatsessions/extend-chat/minutes/${this.sessionId}`;
    const body = { extendedMinutes: minutes };  // Your PUT payload
    this.http.put(apiUrl, body).subscribe(
      (response) => {
        Swal.fire('Success', 'Chat session extended by ' + minutes + ' minutes', 'success');
      },
      (error) => {
        Swal.fire('Error', 'Failed to extend chat session', 'error');
      }
    );
  }

  // New method to stop the chat session and save stopChat value in session storage
  stopChatSession(sessionId: number) {
    const url = `http://localhost:8075/api/chatsessions/${sessionId}/stop-chat`;
    this.http.put(url, {}, { responseType: 'text' }).subscribe({
      next: (response) => {
        console.log('Chat session stopped:', response);
        // Store the stopChat value (e.g., true) in session storage
        sessionStorage.setItem('stopChat', 'true');
      },
      error: (error) => {
        console.error('Error stopping chat session:', error);
        Swal.fire('Error', 'Failed to stop the chat session', 'error');
        // Optionally, store stopChat as false if the API call fails
        sessionStorage.setItem('stopChat', 'false');
      }
    });
  }

  loadMessages() {
    if (this.sessionId) {
      this.http.get<any[]>(`http://localhost:8075/api/chatmessages/session/${this.sessionId}`).subscribe(
        (messages) => {
          // Sort messages by timestamp in ascending order
          this.messages = messages
            .map((msg) => ({
              content: msg.content,
              time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSender: msg.senderRegId === this.currentUserRegId,
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
    if (this.newMessage.trim() && this.sessionId) {
      const messageData = {
        senderRegId: this.currentUserRegId,
        receiverRegId: this.astrologerRegId,
        content: this.newMessage,
        sessionId: this.sessionId,
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
          this.newMessage = ''; // Clear input after sending
          this.scrollToBottom(); // Ensure the view is scrolled to the bottom
          console.log("message Data : ", messageData);

        },
        (error) => {
          console.error('Error sending message:', error);
        }
      );
    }
  }

  selectAstrologer(astrologer: any) {
    this.selectedAstrologer = astrologer;
    this.astrologerDetails = {
      firstName: astrologer.firstName,
      lastName: astrologer.lastName,
    };

    console.log('Selected astrologer:', astrologer);
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const userRegId = currentUser.regId; // Extract user's regId

    if (userRegId && astrologer.regId) {
      this.http.get<any[]>(`http://localhost:8075/api/chatmessages/messages?userRegId=${userRegId}&astrologerRegId=${astrologer.regId}`)
        .subscribe(
          (messages) => {
            this.messages = messages
              .map((msg) => ({
                content: msg.content,
                time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSender: msg.senderRegId === this.currentUserRegId,
                timestamp: new Date(msg.timestamp) // Store the timestamp for sorting
              }))
              .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Sort based on timestamp
            this.cdr.detectChanges(); // Add this line        this.scrollToBottom();
            this.scrollToBottom();
          },
          (error) => {
            console.error('Error fetching chat messages:', error);
          }
        );
    } else {
      console.error('User ID or astrologer ID is missing');
    }
  }

  isPaymentMadeForSelectedAstrologer(): boolean {
    return this.selectedAstrologer?.regId === this.astrologerRegId;
  }

  formatCountdown(): string {
    const minutes: number = Math.floor(this.countdown / 60);
    const seconds: number = this.countdown % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect(); // Disconnect on component destroy
  }
}