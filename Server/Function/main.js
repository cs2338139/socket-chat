//主要邏輯程式,組合Function
import { Unit } from "../Class/Unit.js";
import { event } from "../Data/enum.js";

// default
export function mainStart() {
  //中間件
  Unit.Socket.io.use((socket, next) => {
    //人數控管
    if (Unit.isCanJoin()) {
      next();
    } else {
      Unit.Log.info(`client is max ,${socket.id} will disConnect`);
      next(new Error("Client is max"));
    }
  });
  //主要邏輯
  Unit.Socket.io.on(event.on.connection, (socket) => {
    Unit.Log.connect(`${socket.id} is connect`);

    socket.once(event.on.join, (object) => {
      const client = Unit.createClientData(socket.id, object.color, object?.pos.x, object?.pos.y);
      socket.broadcast.emit(event.emit.add, client);
      socket.emit(event.emit.init, { clientList: Unit.store.clientList });

      Unit.store.clientList.push(client);
    });

    socket.on(event.on.updatePos, (object) => {
      socket.broadcast.emit(event.emit.updatePos, { id: socket.id, pos: object?.pos });

      Unit.getClient(socket.id, (client) => {
        client.setPos(object.pos.x, object.pos.y);
      });
    });

    socket.once(event.on.disconnect, () => {
      Unit.Log.disconnect(`${socket.id} is disconnect`);
      socket.broadcast.emit(event.emit.remove, { id: socket.id });

      Unit.store.clientList = Unit.store.clientList.filter((x) => x.id !== socket.id);
    });
  });
}

// room
export function roomStart() {
  (function init() {
    Unit.createRooms(Unit.setting.main.roomCount);
    Unit.Log.info(`create rooms: ${Unit.setting.main.roomCount}`);
    Unit.Log.info("---------------------------------------");
    for (let i = 0; i < Unit.store.roomList.length; i++) {
      Unit.Log.info(Unit.store.roomList[i].name);
    }
    Unit.Log.info("---------------------------------------");
  })();

  //中間件
  Unit.Socket.io.use(async (socket, next) => {
    //密碼驗證
    const clientPassword = socket.handshake.auth.password;
    if (await Unit.Tool.getCompareHash(clientPassword, Unit.setting.main.password)) {
      next();
    } else {
      next(new Error("Authentication error"));
    }
  });

  Unit.Socket.io.on(event.on.connection, (socket) => {
    Unit.Log.connect(`${socket.id} is connect`);

    socket.once(event.on.join, (object, callback) => {
      const userData = Unit.createUserData(socket.id, object.name);
      Unit.store.clientList.push(userData);
      socket.broadcast.emit(event.emit.add, userData);
      Unit.Log.info(`${socket.id} add chat`);
      callback({ roomList: Unit.getAllRoomNames(), userList: Unit.store.clientList });
    });

    socket.on(event.on.joinRoom, (object, callback) => {
      const room = Unit.getNameToRoom(object.room);
      if (!room) return;

      const oldRoom = socket.data.room;

      if (oldRoom) {
        socket.leave(oldRoom.name);
        oldRoom.removeUser(socket.id);
        Unit.Socket.io.to(oldRoom.name).emit(event.emit.removeUser, { id: socket.id });
        Unit.Log.info(`${socket.id} leave ${oldRoom.name}`);
      }

      socket.join(object.room);
      room.addUser(socket.id);

      socket.data.room = room;
      Unit.Socket.io.to(room.name).emit(event.emit.addUser, { id: socket.id });

      Unit.Log.info(`${socket.id} join ${object.room}`);
      callback({
        users: room.users,
        messages: room.messages,
      });
    });

    socket.on(event.on.userReName, (object) => {
      Unit.getUser(socket.id, (user) => {
        user.rename(object.name);
        Unit.Socket.io.emit(event.emit.userReName, { id: socket.id, name: object.name });
        Unit.Log.info(`${socket.id} rename ${object.name}`);
      });
    });

    socket.on(event.on.addMessage, (object, callback) => {
      const message = Unit.createMessage(socket.id, object.message);
      const room = socket.data.room;
      if (!room) return;

      room.addMessage(message);
      socket.broadcast.to(room.name).emit(event.emit.addMessage, message);

      callback({
        messageId: object.messageId,
        status: 200,
      });
    });

    socket.once(event.on.disconnect, () => {
      const room = socket.data.room;
      if (room) {
        room.removeUser(socket.id);
        Unit.Socket.io.to(room.name).emit(event.emit.removeUser, { id: socket.id });
        Unit.Log.info(`${socket.id} leave ${room.name}`);
      }

      Unit.store.clientList = Unit.store.clientList.filter((x) => x.id !== socket.id);
      Unit.Socket.io.emit(event.emit.remove, { id: socket.id });
      Unit.Log.info(`${socket.id} remove chat`);

      Unit.Log.disconnect(`${socket.id} is disconnect`);
    });
  });
}

// canvas
export function canvasStart() {
  Unit.Socket.io.on(event.on.connection, (socket) => {
    Unit.Log.connect(`${socket.id} is connect`);

    socket.emit(event.emit.init, { paths: Unit.store.paths, imageBase64s: Unit.store.imageBase64s });

    socket.on(event.on.canvasDrawStart, (object) => {
      object.id = socket.id;
      socket.broadcast.volatile.emit(event.emit.canvasDrawStart, object);
      const path = Unit.createPath(object.color, object.id);
      Unit.store.paths.push(path);
    });

    socket.on(event.on.canvasDrawing, (object) => {
      object.id = socket.id;
      socket.broadcast.volatile.emit(event.emit.canvasDrawing, object);

      Unit.getPath(socket.id, (path) => {
        path.path.push(object.point);
      });
    });

    socket.on(event.on.canvasDrawEnd, () => {
      socket.broadcast.volatile.emit(event.emit.canvasDrawEnd, { id: socket.id });

      Unit.getPath(socket.id, (path) => {
        delete path.id;
      });
    });

    socket.on(event.on.canvasImage, (object) => {
      socket.broadcast.emit(event.emit.canvasImage, object);
      const imageBase64 = Unit.createImageBase64(object.base64, object.pos, object.id);
      Unit.store.imageBase64s.push(imageBase64);
    });

    socket.on(event.on.canvasSelectStart, (object) => {
      socket.broadcast.emit(event.emit.canvasSelectStart, object);

      Unit.getImageBase64(object.id, (imageBase64) => {
        imageBase64.selectColor = object.selectColor;
      });
    });

    socket.on(event.on.canvasSelectDragged, (object) => {
      socket.broadcast.volatile.emit(event.emit.canvasSelectDragged, object);

      Unit.getImageBase64(object.id, (imageBase64) => {
        imageBase64.pos = object.pos;
      });
    });

    socket.on(event.on.canvasSelectEnd, (object) => {
      socket.broadcast.emit(event.emit.canvasSelectEnd, object);

      Unit.getImageBase64(object.id, (imageBase64) => {
        imageBase64.selectColor = "";
      });
    });

    socket.once(event.on.disconnect, () => {
      Unit.Log.disconnect(`${socket.id} is disconnect`);
    });
  });
}
