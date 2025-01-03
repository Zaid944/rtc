export type UserId = string;

export interface Chat {
    id: string;
    userId: UserId;
    name: string;
    message: string;
    upvotes: UserId[]; // who has upvoted what
}

export abstract class Store {
    constructor() {}

    initRoom(roomId: string) {}

    getChats(room: string, limit: number, offset: number) {}

    addChat(userId: UserId, roomId: string, name: string, nmessage: string) {}

    upvote(userId: UserId, roomId: string, chatId: string) {}
}
