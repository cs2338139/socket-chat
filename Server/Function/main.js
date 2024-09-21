//主要邏輯程式,組合Function
import { Unit } from "../Class/Unit.js";
import { event } from "../Data/enum.js";


export function main() {
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