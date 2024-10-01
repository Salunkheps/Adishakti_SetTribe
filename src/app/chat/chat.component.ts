import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  clients = [
    { id: 1, firstName: 'Alice', lastName: 'Smith', image: 'path/to/alice.png', lastMessage: 'Hello!' },
    { id: 2, firstName: 'Bob', lastName: 'Johnson', image: 'path/to/bob.png', lastMessage: 'Hey there!' },
    { id: 3, firstName: 'Charlie', lastName: 'Brown', image: 'path/to/charlie.png', lastMessage: 'How’s it going?' },
    { id: 4, firstName: 'Diana', lastName: 'Prince', image: 'path/to/diana.png', lastMessage: 'Goodbye!' },
    { id: 5, firstName: 'Eve', lastName: 'Davis', image: 'path/to/eve.png', lastMessage: 'See you soon!' }
  ];

  selectedClient: any = this.clients[0];
  messages: any[] = [];
  newMessage: string = '';
  isTyping: boolean = false;

  ngOnInit(): void {
    this.loadMessages(); // Load initial messages
  }

  loadMessages() {
    this.messages = [
      { content: 'Hello', time: '10:30 AM', isSender: true },
      { content: 'Hi there!', time: '10:32 AM', isSender: false },
      { content: 'How are you?', time: '10:33 AM', isSender: true },
    ].reverse(); // Display latest message first
  }

  getFormattedTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.unshift({
        content: this.newMessage,
        time: this.getFormattedTime(),
        isSender: true
      });
      this.newMessage = ''; // Clear input after sending
    }
  }

  selectClient(client: any) {
    this.selectedClient = client;
    this.loadMessages(); // Load messages for the selected client
  }
}
