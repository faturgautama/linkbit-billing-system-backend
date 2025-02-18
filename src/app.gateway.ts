import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
    cors: { origin: "*" }
})
export class AppGateway {

    @WebSocketServer() server: Server

    @SubscribeMessage('payment-notification')
    sendPaymentNotification(@MessageBody() token: string): void {
        this.server.emit('payment-notification', token);
    }
}