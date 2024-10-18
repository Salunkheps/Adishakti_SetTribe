import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-chat-app-for-astrologer',
  templateUrl: './chat-app-for-astrologer.component.html',
  styleUrl: './chat-app-for-astrologer.component.css'
})
export class ChatAppForAstrologerComponent implements OnInit, OnDestroy {


  clients: any[] = [];
  selectedClient: any;  messages: any[] = [];
  newMessage: string = '';
  isTyping: boolean = false;
  userDetails: any;
  loading: boolean = true; // Track loading state

  chatSessionId: string | null = null; // Store sessionId from session storage
  userRegId: string = ''; // User's regId, fetched from the backend using chat session ID
  astrologerRegId: string  | null = null; // Astrologer's regId from session storage
  countdown: number = 0;
  countdownInterval: any;
  selectedMinutes: number = 0;

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
    });

    this.webSocketService.getStopChatSubject().subscribe(() => {
      this.stopTimer();
    });

    this.webSocketService.getStopChatSubject().subscribe(() => {
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
          // this.startCountdown();
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

    // Fetch chat messages between the selected client (user) and the astrologer
    this.fetchChatMessages(client.regId);  // Assuming `regId` is the userRegId

    // Call this if you need to load messages in the UI after fetching them
    this.loadMessages(); 
  }
  startCountdown() {
    if (this.countdownInterval) return;

    this.countdownInterval = setInterval(() => {
      const stopChat = sessionStorage.getItem('stopChat');
      if (stopChat === 'true') {
        this.stopCountdown(); // Stop the countdown
        console.log('Countdown stopped because stopChat is true.');
        return; // Exit the interval if stopChat is true
      }
      if (this.countdown > 0) {
        this.countdown--;
        sessionStorage.setItem('countdown', this.countdown.toString());
      } else {
        this.stopCountdown();
        this.showChatFinishedAlert();
      }
    }, 1000);
  }

  // stopCountdown() {
  //   if (this.countdownInterval) {
  //     clearInterval(this.countdownInterval);
  //     this.countdownInterval = null;
  //     // sessionStorage.removeItem('countdown');
  //   }
  // }
  //   // Method to stop the countdown
    stopCountdown() {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval); // Clear the interval to stop the countdown
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
  }

  fetchClients() {
    // Replace 'Devraj_052557' with the astrologer's regId dynamically if necessary
    const astrologerRegId = 'Devraj_052557'; 
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

  fetchChatMessages(userRegId: string) {
    const astrologerRegId = 'Devraj_052557';  // Use astrologer's regId dynamically if needed
    const url = `http://localhost:8075/api/chatmessages/messages?userRegId=${userRegId}&astrologerRegId=${astrologerRegId}`;

    this.http.get<any[]>(url).subscribe(
      (response) => {
        // Assign the response (chat messages) to `chatMessages` array
        this.messages = response;
        console.log('Chat messages:', this.messages);
      },
      (error) => {
        console.error('Error fetching chat messages:', error);
        Swal.fire('Error', 'Failed to load chat messages', 'error');
      }
    );
  }
}