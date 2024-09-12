//Unit function,中控入口
import { setting } from "../Data/setting.js";
import { Socket } from "./Socket.js";
import { store } from "../Data/store.js";
import { ClientData, Vector2, userData, RoomData, MessageDate, PathData, ImageBase64 } from "./Object.js";
import { mainStart, roomStart, canvasStart } from "../Function/main.js";
import { event } from "../Data/enum.js";
import { Log } from "./Log.js";
import { Tool } from "./Tool.js";

export class Unit {
  static mainStart = mainStart;

  static roomStart = roomStart;

  static canvasStart = canvasStart;

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

  //#region for default
  static createClientData(id, color, x, y) {
    return new ClientData(id, color, new Vector2(x, y));
  }

  static getClient(id, action = null) {
    const client = store.clientList.find((x) => x.id === id);

    if (!client) return null;
    if (typeof action === "function") action(client);
    return client;
  }

  static isCanJoin = () => {
    if (store.clientList.length < Unit.setting.main.maxClient) return true;

    return false;
  };
  //#endregion

  //#region for room
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

  //#endregion

  // #region for room
  static createPath(color, id) {
    return new PathData(color, id);
  }

  static createImageBase64(base64, pos, id) {
    return new ImageBase64(base64, pos, id);
  }

  static getPath(id, action = null) {
    const path = Unit.store.paths.find((x) => x?.id === id);

    if (!path) return null;
    if (typeof action === "function") action(path);
    return path;
  }

  static getImageBase64(id, action = null) {
    const imageBase64 = store.imageBase64s.find((x) => x?.id === id);

    if (!imageBase64) return null;
    if (typeof action === "function") action(imageBase64);
    return imageBase64;
  }

  // #endregion
}
