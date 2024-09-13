import { useEffect, useState, useRef, useMemo } from 'react'
import { SocketFunction, socket } from './classes/Socket.js'

function App() {
  const [isSocketConnect, setIsSocketConnect] = useState(false)
  const socketFunction = new SocketFunction()
  const [password, setPassword] = useState('')
  const loginPopup = useRef()

  const [selfName, setSelfName] = useState('')
  const [roomList, setRoomList] = useState([])
  const [userList, setUserList] = useState([])

  const [currentUserIDList, setCurrentUserIDList] = useState([])
  const [currentMessageList, setCurrentMessageList] = useState([])
  const [currentRoom, setCurrentRoom] = useState('Room-List')
  const [currentSelfMessage, setCurrentSelfMessage] = useState('')
  const [isStartReName, setIsStartReName] = useState(false)

  const loginMessages = { login: '快馬加鞭登入中...', success: '登入成功 =)', error: '連線失敗：<br/>' }
  const [currentLoginMessage, setCurrentLoginMessage] = useState('')

  useEffect(() => {
    changeRoom()
  }, [currentRoom])

  useEffect(() => {
    if (isSocketConnect) return
    setRoomList([])
    setCurrentUserIDList([])
    setCurrentMessageList([])
    setUserList([])
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
          console.log('join', response)
          setRoomList(response.roomList)
          setUserList(response.userList)
        })
      })

      socket.on('disconnect', () => {
        setIsSocketConnect(false)
      })

      socket.on('add', (object) => {
        console.log('add', object)
        setUserList((prev) => [...prev, object])
      })

      socket.on('remove', (object) => {
        console.log('remove', object)
        setUserList((prev) => prev.filter(obj => obj.id !== object.id))
      })

      socket.on('add-user', (object) => {
        console.log('add-user', object)
        setCurrentUserIDList((prev) => [...prev, object.id])
      })

      socket.on('add-message', (object) => {
        console.log('add-message', object)
        setCurrentMessageList((prev) => [...prev, object])
      })

      socket.on('remove-user', (object) => {
        console.log('remove-user', object)
        setCurrentUserIDList((prev) => prev.filter(obj => obj !== object.id))
      })

      socket.on('user-reName', (object) => {
        console.log('user-reName', object)

        setUserList((prev) => {
          const updatedList = prev.map((user) =>
            user.id === object.id ? { ...user, name: object.name } : user
          )

          return updatedList
        })
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
        console.log('join-room-response', response)
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
    if (currentSelfMessage == '') { return }

    const currentTime = new Date().getTime()
    const newMessage = { socketId: socket.id, message: currentSelfMessage, isSending: true, messageId: currentTime }

    setCurrentMessageList((prev) => [...prev, newMessage])
    socket.emit('add-message', { message: currentSelfMessage, messageId: currentTime }, (response) => {
      if (response.status === 200) {
        const messageId = response.messageId

        setCurrentMessageList((prevMessages) => {
          const updatedMessages = prevMessages.map((message) =>
            message.messageId === messageId ? { ...message, isSending: false } : message
          );

          console.log(updatedMessages, response.messageId);
          return updatedMessages;
        });
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

  const isCanName = useMemo(() => {
    if (isStartReName) { return true }
    if (isSocketConnect) { return false }

    return true

  }, [isSocketConnect, isStartReName])

  const isCanConnect = useMemo(() => {
    return (password !== '' && selfName !== '')
  }, [password, selfName])

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

  const reNameBtnAction = () => {
    if (isStartReName) {
      setIsStartReName(false)
      reName()
    }
    else {
      setIsStartReName(true)
    }
  }

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
    <div className="m-10 border border-gray-400 px-10 py-5">

      <div className='flex flex-col items-start gap-8 mb-8'>

        <div className="flex flex-wrap gap-10 items-center">
          <div className="inline-flex items-center gap-1 border border-dashed border-gray-300 p-2">
            <span className="px-2 pt-0.5 text-lg">使用者名稱：</span>
            <input disabled={!isCanName} value={selfName} onInput={(e) => setSelfName(e.target.value)} type="text" className="h-10 border border-black px-1 py-0.5 text-lg" />
            <button className={`ml-3 border border-black py-1 px-3 ${isSocketConnect ? 'block' : 'hidden'}`} onClick={reNameBtnAction}>
              {(isStartReName) ? '確定' : '重新命名'}
            </button>
          </div>

          <button disabled={!isCanConnect} className={`border border-black px-4 py-2 rounded-m`} onClick={startSocket}>
            {isSocketConnect ? 'Disconnect' : 'Connect'}
          </button>
        </div >

        <div className="flex items-center gap-1 border border-dashed border-gray-300 p-2 ">
          <span className="px-2 pt-0.5 text-lg">登入密碼：</span>
          <input value={password} onInput={(e) => setPassword(e.target.value)} type="password" className="h-10 border border-black px-1 py-0.5 text-lg" />
        </div>

        <div className={`items-center gap-1 border border-dashed border-gray-300 p-2 ${isSocketConnect ? '' : 'hidden'}`}>
          <span className="px-2 pt-0.5 text-lg">選擇房間：</span>
          <select value={currentRoom} onChange={(e) => { setCurrentRoom(e.target.value) }} className="h-10 w-40 border border-black px-1 py-0.5 text-center text-black">
            <option disabled value={null}>
              Room-List
            </option>
            {roomList.map((item, index) => { return <option key={index} value={item}>{item}</option> })}
          </select>
        </div >
      </div>

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
            {
              currentMessageList.map((message, index) => {
                return (
                  <div key={index} className={isSelfMessage(message.socketId) ? 'flex flex-row-reverse' : 'flex justify-start'}>
                    <div className={`rounded-md px-4 py-2 text-white duration-300 ${(message?.isSending) ? 'bg-gray-500' : 'bg-black'}`}>
                      <span className="font-bold">{isSelfMessage(message.socketId) ? '' : userName(message.socketId)} : </span>
                      <span>{message.message}</span>
                    </div>
                  </div>
                )
              })
            }
          </div >
          <div className="mt-3 flex gap-5 px-2">
            <input value={currentSelfMessage}
              onKeyDown={(e) => { if (e.key === 'Enter') { sendMessage() } }}
              onInput={(e) => setCurrentSelfMessage(e.target.value)}
              type="text" className="h-10 w-full border border-black px-1 py-0.5 text-lg" />
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
  )
}

export default App
