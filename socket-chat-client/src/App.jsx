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

    </>
  )
}

export default App
