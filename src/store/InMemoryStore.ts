import { Store, UserId } from "./Store";
import { Chat } from "./Store";
let globalChatId = 0;
export interface Room {
    roomId: string;
    chats: Chat[];
}

export class InMemoryStore implements Store {
    private store: Map<string, Room>;
    constructor() {
        this.store = new Map<string, Room>();
    }

    initRoom(roomId: string) {
        this.store.set(roomId, {
            roomId,
            chats: [],
        });
    }

    //limit = 50, offset = 0
    // limit = 50, offset = 50
    getChats(roomId: string, limit: number, offset: number) {
        const room = this.store.get(roomId);
        if (!room) {
            return [];
        }

        return room.chats
            .reverse()
            .slice(0, offset)
            .slice(-1 * limit);
    }

    addChat(userId: UserId, roomId: string, name: string, message: string) {
        const room = this.store.get(roomId);
        if (!room) {
            return [];
        }

        room.chats.push({
            id: (globalChatId++).toString(),
            userId,
            name,
            message,
            upvotes: [],
        });
    }

    upvote(userId: string, roomId: string, chatId: string) {
        const room = this.store.get(roomId);
        if (!room) {
            return [];
        }

        //make this faster
        const chat = room.chats.find(({ id }) => id == chatId);

        if (chat) {
            chat.upvotes.push(userId);
        }
    }
}