#!/usr/bin/env node
import { connection, server as WebSocketServer } from "websocket";
import http from "http";
import { UserManager } from "./UserManager";
import {
    IncomingMessage,
    InitMessage,
    InitMessageType,
    SupportedMessage,
    UpvoteMessage,
    UpvoteMessageType,
    UserMessage,
    UserMessageType,
} from "./messages";
import { InMemoryStore } from "./store/InMemoryStore";

const userManager = new UserManager();
const store = new InMemoryStore();

const server = http.createServer(function (request: any, response: any) {
    console.log(new Date() + " Received request for " + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(8080, function () {
    console.log(new Date() + " Server is listening on port 8080");
});

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false,
});

function originIsAllowed(origin: string) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on("request", function (request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log(
            new Date() +
                " Connection from origin " +
                request.origin +
                " rejected."
        );
        return;
    }

    var connection = request.accept("echo-protocol", request.origin);
    console.log(new Date() + " Connection accepted.");
    connection.on("message", function (message) {
        //add rate limit
        if (message.type === "utf8") {
            try {
                messageHandler(connection, JSON.parse(message.utf8Data));
            } catch (e) {}
            console.log("Received Message: " + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
    });
    connection.on("close", function (reasonCode, description) {
        console.log(
            new Date() + " Peer " + connection.remoteAddress + " disconnected."
        );
    });
});

// type => JOIN_ROOM, message => InitMessage
function messageHandler(ws: connection, message: IncomingMessage) {
    if (message.type == SupportedMessage.JoinRoom) {
        const payload = message.payload;
        userManager.addUser(payload.name, payload.userId, payload.roomId, ws);
    }
    if (message.type == SupportedMessage.SendMessage) {
        const payload = message.payload;
        const user = userManager.getUser(payload.roomId, payload.userId);
        if (!user) {
            console.error("user not found");
            return;
        }
        store.addChat(
            payload.userId,
            user.name,
            payload.roomId,
            payload.message
        );
        //add broadcast logic
    }
    if (message.type == SupportedMessage.UpvoteMessage) {
        const payload = message.payload;
        store.upvote(payload.userId, payload.roomId, payload.chatId);
    }
}
