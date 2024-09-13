import { useEffect, useState, useRef, useMemo } from 'react'
import { SocketFunction, socket } from './classes/Socket.js'
import './App.css'

function App() {

  const [isSocketConnect, setIsSocketConnect] = useState(false)
  const socketFunction = new SocketFunction()
  const startBtn = useRef()
  const [password, setPassword] = useState('')
  const loginPopup = useRef()

  const [selfName, setSelfName] = useState('')
  const [roomList, setRoomList] = useState([])
  const [userList, setUserList] = useState([])
  const [currentUserIDList, setCurrentUserIDList] = useState([])
  const [currentMessageList, setCurrentMessageList] = useState([])
  const [currentRoom, setCurrentRoom] = useState('Room-List')
  const [currentSelfMessage, setCurrentSelfMessage] = useState('')

  const [loginMessages, setLoginMessages] = useState({ login: '快馬加鞭登入中...', success: '登入成功 =)', error: '連線失敗：<br/>' })
  const [currentLoginMessage, setCurrentLoginMessage] = useState('')

  useEffect(() => {
    console.log(currentRoom)
    changeRoom()
  }, [currentRoom])

  useEffect(() => {
    if (isSocketConnect) {
      startBtn.current.innerHTML = 'disconnect'
    } else {
      startBtn.current.innerHTML = 'connect'
      setRoomList([])
      setCurrentUserIDList([])
      setCurrentMessageList([])
      setUserList([])
    }
  }, [isSocketConnect])

  function startSocket() {
    if (!isSocketConnect) {
      socketFunction.startSocket(password)
      loginPopupControl(true, loginMessages.login)

      socket.on('connect_error', (error) => {
        loginPopupControl(true, `${loginMessages.error}${error}`, 2000)
      })

      socket.on('connect', () => {
        loginPopupControl(true, loginMessages.success, 2000)
        setIsSocketConnect(true)
        socket.emit('join', { name: selfName }, (response) => {
          console.log(response)
          setRoomList(response.roomList)
          setUserList(response.userList)
        })
      })

      socket.on('disconnect', () => {
        setIsSocketConnect(false)
      })

      socket.on('add', (object) => {
        console.log(object)
        userList.push(object)
      })

      socket.on('remove', (object) => {
        console.log(object)
        setUserList(() => { return userList.filter(obj => obj.id !== object.id) })
      })

      socket.on('add-user', (object) => {
        console.log(object)
        currentUserIDList.push(object.id)
      })

      socket.on('add-message', (object) => {
        console.log(object)
        currentMessageList.push(object)
      })

      socket.on('remove-user', (object) => {
        console.log(object)
        setCurrentUserIDList(() => { return currentUserIDList.filter(obj => obj !== object.id) })
      })

      socket.on('user-reName', (object) => {
        const user = userList.find(x =>
          x.id === object.id
        )

        if (user) {
          user.name = object.name
        }
      })
    } else {
      socketFunction.disConnect()
      setIsSocketConnect(false)
    }
  }

  function changeRoom() {
    if (!isSocketConnect) { return }

    if (currentRoom !== 'Room-List') {
      socket.emit('join-room', { room: currentRoom }, (response) => {
        console.log(response)
        setCurrentUserIDList(response.users)
        setCurrentMessageList(response.messages)
      })
    }
  }

  function reName() {
    if (!isSocketConnect) { return }

    socket.emit('user-reName', { name: selfName })
  }

  function sendMessage() {
    if (!isSocketConnect) { return }

    const currentTime = new Date().getTime()

    currentMessageList.push({ socketId: socket.id, message: currentSelfMessage, isSending: true, messageId: currentTime })
    socket.emit('add-message', { message: currentSelfMessage, messageId: currentTime }, (response) => {
      if (response.status === 200) {
        const messageId = response.messageId
        const message = currentMessageList.find(x => x?.messageId === messageId)

        message.isSending = false
      }
    })
    setTimeout(() => {
      setCurrentSelfMessage('')
    }, 100)
  }

  const userName = (id) => {
    const user = userList.find(x => x.id === id)

    return (user) ? user.name : '用戶已離開'
  }

  const isSelfMessage = (id) => {
    return (id === socket.id)
  }

  const isSendingStyle = (value) => {
    return (value) ? 'bg-gray-500' : 'bg-black'
  }

  const currentUserList = useMemo(() => {
    const list = []

    currentUserIDList.forEach((id) => {
      const user = userList.find(x => x.id === id)

      if (user) {
        list.push(user.name)
      }
    })

    return list
  }, [currentUserIDList, userList])

  // const currentUserList = computed(() => {
  //   const list = []

  //   currentUserIDList.forEach((id) => {
  //     const user = userList.find(x => x.id === id)

  //     if (user) {
  //       list.push(user.name)
  //     }
  //   })

  //   return list
  // })

  function loginPopupControl(state, string, timeDown = 0) {
    if (!state) {
      loginPopup.current.style.display = 'none'

      return
    }

    loginPopup.current.style.display = 'flex'
    setCurrentLoginMessage(string)

    if (timeDown !== 0) {
      setTimeout(() => {
        loginPopup.current.style.display = 'none'
      }, timeDown)
    }
  }


  return (
    <>
      <div className="m-10 border border-gray-400 px-10 py-5">
        <button ref={startBtn} className="border border-black px-3 py-1" onClick={startSocket}>
          connect
        </button>

        <div className="ml-10 inline-flex items-center gap-1 border border-dashed border-gray-300 p-2">
          <span className="px-2 pt-0.5 text-lg">登入密碼：</span>
          <input v-model="password" type="password" className="h-10 border border-black px-1 py-0.5 text-lg" />
        </div>
        <br />
        <br />

        <div className="flex flex-wrap gap-10">
          <div className="inline-flex items-center gap-1 border border-dashed border-gray-300 p-2">
            <span className="px-2 pt-0.5 text-lg">使用者名稱：</span>
            <input v-model="selfName" type="text" className="h-10 border border-black px-1 py-0.5 text-lg" />
            <button className={`ml-3 border border-black py-1 px-3 ${isSocketConnect ? 'block' : 'hidden'}`} onClick={reName}>
              重新命名
            </button>
          </div>
          <div className={`items-center gap-1 border border-dashed border-gray-300 p-2 ${isSocketConnect ? '' : 'hidden'}`}>
            <span className="px-2 pt-0.5 text-lg">選擇房間：</span>
            <select v-model="currentRoom" className="h-10 w-40 border border-black px-1 py-0.5 text-center text-black">
              <option disabled selected>
                Room-List
              </option>
              {roomList.map((item, index) => { return <option key={index} value={item}>{item}</option> })}
            </select>
          </div >
        </div >

        <br />
        <br />
        <br />
        <div className="flex flex-wrap gap-10">
          <div className={`w-80 flex-col gap-1 border border-dashed border-red-300 p-2 ${(isSocketConnect && currentRoom !== 'Room-List') ? 'inline-flex' : 'hidden'}`}>
            <span className="px-2 pt-0.5 text-lg">房間使用者：</span>
            <hr />
            <div className="min-h-[100px] px-2">
              {currentUserList.map((user, index) => { return <div key={index}>{user}</div> })}
            </div>
          </div>

          <div className={`inline-flex w-3/5 min-w-[600px] flex-col gap-1 border border-dashed border-blue-500 p-2 ${(isSocketConnect && currentRoom !== 'Room-List') ? 'inline-flex' : 'hidden'}`}>
            <span className="px-2 pt-0.5 text-lg">對話：</span>
            <hr />
            <div className="flex min-h-[100px] flex-col gap-3 px-2">
              {/* <template v-for="(message, index) in currentMessageList" :key="index">
              <div v-if="isSelfMessage(message.socketId)" className="flex flex-row-reverse">
                <div className="rounded-md px-4  py-2 text-white duration-300" :className="[isSendingStyle(message?.isSending)]">
                <span className="font-bold"> : </span><span>{{ message.message }}</span>
              </div>
            </div>
            <div v-else className="flex justify-start">
              <div className="rounded-md bg-black px-4 py-2 text-white">
                <span className="font-bold">{{ userName(message.socketId) }} : </span><span>{{ message.message }}</span>
              </div>
            </div>
          </template> */}
              {
                currentMessageList.map((message, index) => {
                  return (
                    <div key={index} className={isSelfMessage(message.socketId) ? 'flex flex-row-reverse' : 'flex justify-start'}>
                      <div className={`rounded-md px-4 py-2 text-white duration-300 ${isSendingStyle(message?.isSending)}`}>
                        <span className="font-bold">{userName(message.socketId)} : </span><span>{message.message}</span>
                      </div>
                    </div>
                  )
                })
              }
            </div >
            <div className="mt-3 flex gap-5 px-2">
              <input v-model="currentSelfMessage" type="text" className="h-10 w-full border border-black px-1 py-0.5 text-lg" />
              <button className="w-20 border border-black py-1 px-3" onClick={sendMessage}>
                發送
              </button>
            </div >
          </div >
        </div >

        <div ref={loginPopup} className="fixed top-0 left-0 hidden h-screen w-full flex-col items-center justify-center bg-black/30">
          <div className="flex aspect-video h-[200px] flex-col items-center justify-center rounded-md border border-black bg-white text-xl">
            <div className="text-center" dangerouslySetInnerHTML={{ __html: currentLoginMessage }}></div>
          </div>
        </div>
      </div >
    </>
  )
}

export default App
