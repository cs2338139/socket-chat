//物件Class

// #region for default
export class ClientData {
  constructor(id, color, pos) {
    this.id = id;
    this.color = color;
    this.pos = pos;
  }
  setPos(x, y) {
    this.pos = new Vector2(x, y);
  }
}

export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}
// #endregion

// #region for room

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
// #endregion

// #region for canvas
export class PathData {
  constructor(color = "#000000", id = null) {
    this.color = color;
    this.id = id;
  }

  path = [];
}

export class ImageBase64 {
  constructor(base64, pos, id) {
    this.base64 = base64;
    this.pos = pos;
    this.id = id;
  }
  selectColor = "";
}
// #endregion
