//靜態設定
export const setting = {
  //連線設定
  connect: {
    // corsUrl: "*",
    corsUrl: ["http://localhost:3000",'http://localhost:3001'],
    port: "3333",
  },
  //UI介面設定
  adminUI: {
    type: "basic",
    username: "admin",
    password: "$2y$10$DX09H25wYmwjoY6mQN7tGu7987UCkwHn2mz5Pnd3BzsW6feKkFeOe", //block
    // don't write real password in your script
    // need to change to hash code : https://www.bcrypt.fr/
  },
  //互動邏輯設定
  main: {
    roomCount: 3, //only room
    password: "$2y$10$nRlKPkmBEpTRQV/./R9j5OmS4I.id5hJt9rm4FC6IDnpae681Yfdi", //jin-chat
    // don't write real password in your script
    // need to change to hash code : https://www.bcrypt.fr/
  },
};
