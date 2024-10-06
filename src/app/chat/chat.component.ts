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
  clients = [
    { id: 1, firstName: 'Alice', lastName: 'Smith', image: 'path/to/alice.png', lastMessage: 'Hello!' },
  ];

  selectedClient: any = this.clients[0];
  messages: any[] = [];
  newMessage: string = '';
  isTyping: boolean = false;
  astrologerDetails: any; // Property to hold astrologer details


  sessionId: number | null = null; // Store sessionId once it's created
  currentUserRegId: string = ''; // User's regId
  astrologerRegId: string = ''; // Astrologer's regId
  countdown: number = 0; // Timer in seconds
  countdownInterval: any; // Interval for countdown

  constructor(private chatService: ChatService, private http: HttpClient, private router: Router, private webSocketService: WebSocketService,private cdr: ChangeDetectorRef) { }


  ngOnInit(): void {
    this.sessionId = sessionStorage.getItem('chatSessionId') ? Number(sessionStorage.getItem('chatSessionId')) : null;
    // Load user and astrologer details from session storage
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')!);
    const selectedAstrologer = JSON.parse(sessionStorage.getItem('selectedAstrologer')!);
    const selectedMinutes = sessionStorage.getItem('selectedMinutes');
    this.webSocketService.connect(); // Connect to WebSocket on component init

    
    // Subscribe to message reload events
    this.webSocketService.getMessageSubject().subscribe(() => {
      this.loadMessages();  // Reload messages when a new message is received via WebSocket
    });

    // Load countdown from session storage
    if (selectedMinutes) {
      this.countdown = parseInt(selectedMinutes, 10) * 60;
    }

    // Check if currentSessionId exists in session storage
    // const existingSessionId = sessionStorage.getItem('currentSessionId');

    if (selectedAstrologer) {
      this.astrologerDetails = selectedAstrologer; // Store astrologer details
      // console.log('Astrologer details:', this.astrologerDetails); // Debug log
    }
    if (currentUser) {
      this.startSession();
    }
    if (currentUser && selectedAstrologer) {
      this.currentUserRegId = currentUser.regId;
      this.astrologerRegId = selectedAstrologer.regId;

      if (this.sessionId) {
        this.loadMessages(); // Load messages for the existing session
      } else {
        // If no existing session, create a new session
      }

      // Start countdown if it’s greater than zero
      if (this.countdown > 0) {
        this.startCountdown();
      }
    }
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
      if (this.countdown > 0) {
        this.countdown--; // Decrease the countdown by 1 second
        sessionStorage.setItem('countdown', this.countdown.toString()); // Save countdown
      } else {
        this.stopCountdown();
        this.showChatFinishedAlert(); // Call the SweetAlert method when time is up
      }
    }, 1000);
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
        this.router.navigate(['/feedback']);
      }
    });
  }

  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval); // Clear the interval
      this.countdownInterval = null;
      sessionStorage.removeItem('countdown'); // Clear countdown from session storage
    }
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
        },
        (error) => {
          console.error('Error sending message:', error);
        }
      );
    }
  }

  selectClient(client: any) {
    this.selectedClient = client;
    this.startSession(); // Start or fetch the session for the selected client
    this.loadMessages(); // Load messages for the selected client
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
