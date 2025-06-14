import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as Stomp from '@stomp/stompjs'
import SockJS from 'sockjs-client';
import { Message } from '../models/message';

@Component({
  selector: 'app-chat',
  // Para formularios y para otras directivas @if @for
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.html',

})
export class Chat implements OnInit {
  client!: Stomp.Client;
  connected: boolean = false;

  messages: Message[] = [];
  message: Message = new Message();

  ngOnInit(): void {
      this.client = new Stomp.Client({
        brokerURL: undefined,
        webSocketFactory: () => new SockJS('http://localhost:8080/chat-websocket'),
        debug: str => console.log(str),
        reconnectDelay: 5000
      }
    );

    this.client.onConnect = (frame) => {
        this.connected = true;
        console.log(`Conectados: ${this.client.connected} : ${frame}`)
        this.client.subscribe('/chat/message', e =>{
          console.log(e.body)
          let message: Message = JSON.parse(e.body) as Message;
          message.date = new Date(message.date)
          this.messages.push(message);
        })
      }
    
    this.client.onDisconnect = (frame) => {
      this.connected = false;
      this.message = new Message();
      this.messages = [];
      console.log(`Desconectados: ${this.client.connected} : ${frame}`)

    }
  }

  connect(): void{
    this.client.activate();
  }

  deconnect(): void{
    this.client.deactivate();
  }

  onSendMessage(){
    this.client.publish({
      destination: '/app/message',
      body: JSON.stringify(this.message)
    });
    this.message.text = '';
  }
}
