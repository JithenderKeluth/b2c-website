import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage } from 'firebase/messaging'; 
import { initializeApp } from 'firebase/app';
import { environment } from '@env/environment';
@Injectable({ providedIn: 'root' })
export class MessagingService {
  messaging: any;

  constructor() {
    const app = initializeApp(environment.firebase);
    this.messaging = getMessaging(app);
  }

  async requestPermissionAndGetToken(): Promise<string | null> {
    try {
      const token = await getToken(this.messaging, {
        vapidKey: environment.firebase.vapidKey
      }); 
      return token;
    } catch (error) { 
      return null;
    }
  }

  listenForMessages() {
    onMessage(this.messaging, (payload) => {
      console.log('Message received in foreground:');
    });
  }
}
