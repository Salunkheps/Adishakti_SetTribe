import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  reg_id: string | null = null;
  minutes: number | null = null;
  seconds: number = 0;
  countdownInterval: any;
  routeSubscription: Subscription = new Subscription();
  session_id: number | null = null; // Add session_id field

  selectedAstrologerData: any = null;

  notifications: any[] = [
    { type: 'Astrologer1', time: this.getCurrentTime(), isOnline: true, profileImage: 'back1.jpg' },
  ];

  constructor(private chatService: ChatService, private route: ActivatedRoute, private router: Router) { }
  canSendMessage: boolean = true;
  onlineAstrologers: string[] = [];
  showPopup = false;
  newMessage: string = '';
  selectedAstrologer: string = '';
  isTyping: boolean = false;
  searchTerm: string = '';
  filteredNotifications: any[] = [...this.notifications];
  messages = [
    { content: 'Hi there!', time: '3:40 pm', sender: 'sender', seen: true, seenTime: '' },
    { content: 'Hey, how are you?', time: '3:41 pm', sender: 'receiver', seen: false, seenTime: '' }
  ];

  ngOnInit() {
    this.showPopup = true;
    this.updateOnlineAstrologers();

    this.routeSubscription = this.route.queryParams.subscribe(params => {
      const minutesFromParams = +params['minutes'] || null;
      this.minutes = minutesFromParams;
      this.reg_id = params['reg_id'] || null;
      console.log('Minutes received from query params:', minutesFromParams);
      console.log('Reg ID received:', this.reg_id);

      if (this.minutes !== null) {
        const storedTime = localStorage.getItem('chatTimer');
        if (storedTime) {
          this.seconds = +storedTime;
          this.startCountdownFromSeconds();
        } else {
          this.startCountdown(this.minutes);
        }
      }
    });
    // Fetch the selected astrologer data from session storage
    const astrologerData = sessionStorage.getItem('selectedAstrologer');
    if (astrologerData) {
      this.selectedAstrologerData = JSON.parse(astrologerData);
    }

    // Make the call to the backend to generate the session_id
    if (this.selectedAstrologerData && this.reg_id) {
      this.createChatSession(this.selectedAstrologerData.reg_id, this.reg_id);
    }
    // Clean up the timer when the component is destroyed
    window.addEventListener('beforeunload', () => {
      localStorage.setItem('chatTimer', this.seconds.toString());
    });
  }
  ngOnDestroy() {
    // Clean up the interval when the component is destroyed
    clearInterval(this.countdownInterval);
    this.routeSubscription.unsubscribe();
  }

  // Call to the backend to create a new chat session
  createChatSession(astrologerRegId: string, userRegId: string) {
    const astrologerData = sessionStorage.getItem('selectedAstrologer');
    const currentUser = sessionStorage.getItem('currentUser');

    if (astrologerData && currentUser) {
      const currentUserData = JSON.parse(currentUser);
      const selectedAstrologer = JSON.parse(astrologerData);

      const sessionData = {
        astrologer_id: selectedAstrologer.reg_id, // Correctly assigning astrologer's ID
        user_id: currentUserData.reg_id // Correctly assigning user's ID
      };
      console.log(sessionData);
      

      // Make the call using chatService to create a session
      this.chatService.addChatSession(sessionData).subscribe(
        (response: any) => {
          this.session_id = response.session_id; // Store the returned session_id
          console.log('Session ID created:', this.session_id);
        },
        (error: any) => {
          console.error('Error creating chat session:', error);
        }
      );
    }
  }
  getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  startCountdown(minutes: number) {
    this.seconds = minutes * 60;
    this.canSendMessage = true;
    this.countdownInterval = setInterval(() => {
      if (this.seconds > 0) {
        this.seconds--;
        localStorage.setItem('chatTimer', this.seconds.toString());
      } else {
        clearInterval(this.countdownInterval);
        this.endChatSession();
      }
    }, 1000);
  }

  startCountdownFromSeconds() {
    this.canSendMessage = true;
    this.countdownInterval = setInterval(() => {
      if (this.seconds > 0) {
        this.seconds--;
        localStorage.setItem('chatTimer', this.seconds.toString());
      } else {
        clearInterval(this.countdownInterval);
        this.endChatSession();
      }
    }, 1000);
  }

  endChatSession() {
    console.log('Chat session ended due to timeout.');
    this.messages.push({
      content: `The chat session with ${this.selectedAstrologer} has ended.`,
      time: this.getCurrentTime(),
      sender: 'system',
      seen: true,
      seenTime: ''
    });
    this.newMessage = '';
    this.isTyping = false;
    this.canSendMessage = false;
    this.showPopup = false;
    localStorage.removeItem('chatTimer');
  }



  getFormattedTime() {
    const minutes = Math.floor(this.seconds / 60);
    const seconds = this.seconds % 60;
    return `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  padZero(value: number) {
    return value < 10 ? '0' + value : value.toString();
  }

  simulateAstrologerTyping() {
    this.isTyping = true;
    setTimeout(() => {
      this.isTyping = false;
    }, 2000);
  }

  selectAstrologer(notification: any) {
    this.selectedAstrologer = notification.type;
    this.showPopup = true;
    this.chatService.getChatHistory(this.selectedAstrologer).subscribe((history: any[]) => {
      this.messages = history.map(msg => ({
        content: msg.content,
        time: this.getCurrentTime(),
        sender: msg.sender === 'Receiver_Reg_id' ? 'receiver' : 'sender',
        seen: msg.seen,
        seenTime: msg.seenTime
      }));
    }, (error: any) => {
      console.error('Error fetching chat history', error);
    });
  }

  onSearch() {
    this.filteredNotifications = this.notifications.filter(notification =>
      notification.type.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      const astrologerData = sessionStorage.getItem('selectedAstrologer');
      const currentUser = sessionStorage.getItem('currentUser');

      if (astrologerData && currentUser) {
        const selectedAstrologer = JSON.parse(astrologerData);
        const currentUserData = JSON.parse(currentUser);

        const messageData = {
          senderRegId: this.reg_id,
          receiverRegId: this.selectedAstrologer,
          content: this.newMessage,
          timestamp: new Date(),
          sessionId: 1
        };

        if (astrologerData) {
          const selectedAstrologer = JSON.parse(astrologerData);

          // Prepare the message data
          const messageData = {
            senderRegId: currentUserData.reg_id, // The current user's reg_id
            receiverRegId: selectedAstrologer.reg_id, // The selected astrologer's reg_id from session storage
            content: this.newMessage,
            timestamp: new Date(),
            sessionId: 1 // Assuming a session id, you can adjust this logic as per your session tracking
          };

          // Send the message via the chat service
          this.chatService.createChatMessage(messageData).subscribe((response: any) => {
            console.log('Message sent successfully', response);
            // Update the UI by adding the new message to the messages array
            this.messages.push({
              content: this.newMessage,
              time: this.getCurrentTime(),
              sender: 'receiver', // You can set this as 'receiver' or 'sender' depending on the UI design
              seen: false,
              seenTime: ''
            });
            this.newMessage = ''; // Clear the input field
          }, (error: any) => {
            console.error('Error sending message', error);
          });
        } else {
          console.error('No astrologer selected');
        }
      }
    }
  }
  closePopup() {
    this.showPopup = false;
  }

  updateOnlineAstrologers() {
    setInterval(() => {
      this.notifications.forEach(notification => {
        if (notification.isOnline) {
          notification.time = this.getCurrentTime();
        }
      });
      this.onlineAstrologers = this.notifications.filter(n => n.isOnline).map(n => n.type);
    }, 60000);
  }
  navigateToFindAstrologers() {
    this.router.navigate(['/find-astrologers']);
  }
}