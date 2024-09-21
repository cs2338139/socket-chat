//Unit function,中控入口
import { setting } from "../Data/setting.js";
import { Socket } from "./Socket.js";
import { store } from "../Data/store.js";
import { userData, RoomData, MessageDate } from "./Object.js";
import { main as mainStart } from "../Function/main.js";
import { event } from "../Data/enum.js";
import { Log } from "./Log.js";
import { Tool } from "./Tool.js";

export class Unit {
  static mainStart = mainStart;

  static Socket = Socket;

  static Log = Log;

  static Tool = Tool;

  static setting = setting;

  static store = store;

  static getCurrentDate() {
    var currentDate = new Date();

    var taiwanTime = currentDate.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });

    return taiwanTime;
  }

  static createUserData(id, name) {
    return new userData(id, name);
  }

  static createRooms(count) {
    for (let i = 0; i < count; i++) {
      store.roomList.push(new RoomData(`room_${i}`));
    }
  }

  static createMessage(id, message) {
    return new MessageDate(id, message);
  }

  static getAllRoomNames() {
    return store.roomList.map((room) => room.name);
  }

  static getNameToRoom(roomName) {
    return store.roomList.find((room) => room.name === roomName);
  }

  static getUser(id, action = null) {
    const user = store.clientList.find((x) => x.id === id);

    if (!user) return null;
    if (typeof action === "function") action(user);
    return user;
  }

}
