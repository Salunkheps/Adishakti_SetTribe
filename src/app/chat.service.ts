import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = 'http://localhost:8081/api/chatmessages'; // Adjust base URL accordingly
  constructor(private http: HttpClient) {}


  // Method to create a new chat message
  createChatMessage(messageData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, messageData);
  }
  getChatHistory(astrologerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/history/${astrologerId}`);
  }
  // Method to call the add session endpoint
  addChatSession(sessionData: any): Observable<any> {    
    console.log(sessionData);
    return this.http.post(`http://localhost:8081/api/chatsessions/addsession`, sessionData);
  }

}
