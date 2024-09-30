# Socket-Draw 多房間即時聊天通訊

![專案封面圖](https://resume.jinchengliang.com/assets/images/portfolio/socket-chat/cover.gif)

## 說明

此專案為聊天室功能實作，除了發送與接收聊天訊息外，還實作了Socket room功能，將對話訊息與使用者做頻道區分，但是使用者能夠自由切換當前的房間。</br>
前端以React.js來撰寫的Side Project，在此之前為我自己獨立撰寫的Vue專案。</br>
後端是使用Socket.io來實現即時通訊。</br>
此專案有搭配一套登入驗證的機制，在輸入使用者名稱時候，會要求打上登入密碼。登入密碼是設置在Socket Server並且有做加鹽處理。</br>
當Client嘗試登入的時候，會先進入Sever的Middlewares層做密碼驗證，當驗證成功後才能夠成功登入Server必做後續操作。</br>
當登入成功後，Server會回傳當前設置與狀態，例如房間數量、當前使用者、個房間的訊息紀錄，當Client接收到這些資料後就會進行初始化同步。整個專案的設置其實是寫在Server端，在由Client登入後發送給其作初始化。</br>
連線成功後，使用者可以選擇想要進入的房間，進入房間後會顯示該房間過往的訊息，側邊也會顯示當前房間的使用者名稱。玩家這時也可以發送訊息與其他使用者交流，也可以按下下拉選單，切換房間。</br>
有設置更換名稱的功能，使用者可以在任意時機更換自己的名稱，按下送出後，新名稱也會同步更改給其他使用者。當使用者斷線/離開後，其以往發送的訊息條上的使用者名稱也會變成'用戶已離開'</br>
為了處理訊息發送後，因為網速影響造成不同步的問題，有特別做處理。當使用者發送訊息後，自己的該訊息條會會是灰色的，當訊息事件成功打到Server上並且回傳200後才會以全黑的方式顯示出來，這代表該訊息已經到Server端，並且跟其他Client進行同步了。此項設計是參考Line的訊息發送機制設計的。</br>

## 功能

- Socket.io多人連線
- 房間選擇與切換
- 訊息發送
- 查看當前使用名單

## 使用工具

- React.js
- Socket.io
- Tailwind css
- Vite
- TypeScript
- Material UI

## 安裝

以下將會引導你如何安裝此專案到你的電腦上。

Node.js 版本建議為：`v18.19.0` 以上...

### 取得專案

```bash
git clone https://github.com/cs2338139/socket-chat.git
```

## Client端

### 移動到專案Client內

```bash
cd Client
```

### 安裝套件

```bash
yarn install
```

or

```bash
npm install
```

### 環境變數設定

請在終端機輸入 `cp .env.template .env` 來複製 .env.example 檔案，並依據 `.env.local` 內容調整相關欄位。

### 運行專案

```bash
yarn dev
```

### 開啟專案

在瀏覽器網址列輸入以下即可看到畫面

```bash
http://localhost:3000/
```

## 環境變數說明

```env
VITE_PORT=3000 #Port號
VITE_SOCKET_URL=http://localhost:3333 ＃Socket Server Url
```

## Server端

### 移動到專案Server內

```bash
cd Server
```

### 安裝套件

```bash
yarn install
```

or

```bash
npm install
```

### Server設定

Server的設定檔放置在./Server/Data/Setting.js裡面，可以開啟進行修改

### 運行專案

```bash
yarn start
```

## 設定檔變數說明

``` javascript
//靜態設定
export const setting = {
  //連線設定
  connect: {
    // corsUrl: "*",
    corsUrl: ["http://localhost:3000",'http://localhost:3001'],
    port: "3333",
  },
   main: {
    roomCount: 3, //房間數量
    password: "$2y$10$nRlKPkmBEpTRQV/./R9j5OmS4I.id5hJt9rm4FC6IDnpae681Yfdi", //jin-chat
  },
};
```

## 聯絡作者

你可以透過以下方式與我聯絡

- [Github](https://github.com/cs2338139)
