export class userData {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  rename(name) {
    this.name = name;
  }
}
export class RoomData {
  constructor(name) {
    this.name = name;
  }
  users = [];
  messages = [];

  clear() {
    this.messages = [];
  }

  addMessage(message) {
    this.messages.push(message);
  }

  removeUser(id) {
    this.users = this.users.filter((user) => user != id);
  }

  addUser(user) {
    this.users.push(user);
  }
}

export class MessageDate {
  constructor(socketId, message) {
    this.socketId = socketId;
    this.message = message;
  }
}