import { useEffect, useState, useRef, useMemo, useReducer, useCallback } from 'react'
import { SocketFunction, socket } from '../classes/Socket'


function App() {
    const loginPopup = useRef()
    const chatPanel = useRef()
    const socketFunction = new SocketFunction()
    const [isSocketConnect, setIsSocketConnect] = useState(false)

    const [password, setPassword] = useState('')
    const [selfName, setSelfName] = useState('')

    const [roomList, setRoomList] = useState([])
    const [userList, setUserList] = useState([])
    const [currentUserIDList, setCurrentUserIDList] = useState([])

    const [currentMessageList, setCurrentMessageList] = useState([])
    const [currentRoom, setCurrentRoom] = useState('Room-List')

    const [currentSelfMessage, setCurrentSelfMessage] = useState('')
    const [isStartReName, setIsStartReName] = useState(false)


    const [currentLoginMessage, setCurrentLoginMessage] = useState('')
    const loginMessages = { login: '快馬加鞭登入中...', success: '登入成功 =)', error: '連線失敗：<br/>' }

    useEffect(() => {
        changeRoom()
    }, [currentRoom])

    useEffect(() => {
        if (isSocketConnect) return
        resetState()
    }, [isSocketConnect])

    const resetState = useCallback(() => {
        setRoomList([])
        setCurrentUserIDList([])
        setCurrentMessageList([])
        setUserList([])
    }, [])

    const startSocket = useCallback(() => {
        if (!isSocketConnect) {
            socketFunction.startSocket(password)
            loginPopupControl(true, loginMessages.login)

            socket.once('connect_error', (error) => {
                loginPopupControl(true, `${loginMessages.error}${error}`, 2000)
            })

            socket.once('connect', () => {
                loginPopupControl(true, loginMessages.success, 2000)
                setIsSocketConnect(true)
                socket.emit('join', { name: selfName }, (response) => {
                    setRoomList(response.roomList)
                    setUserList(response.userList)
                })
            })

            socket.on('disconnect', () => {
                setIsSocketConnect(false)
            })

            setupSocketEventListeners()
        } else {
            socketFunction.disConnect()
            setIsSocketConnect(false)
        }
    }, [isSocketConnect, password, selfName])

    const setupSocketEventListeners = useCallback(() => {
        const listeners = {
            'add': (object) => {
                setUserList((prev) => [...prev, object])
            },
            'remove': (object) => {
                setUserList((prev) => prev.filter(obj => obj.id !== object.id))
            },
            'add-user': (object) => {
                setCurrentUserIDList((prev) => [...prev, object.id])
            },
            'add-message': (object) => {
                setCurrentMessageList((prev) => [...prev, object])
            },
            'remove-user': (object) => {
                setCurrentUserIDList((prev) => prev.filter(obj => obj !== object.id))
            },
            'user-reName': (object) => {
                setUserList((prev) => prev.map((user) =>
                    user.id === object.id ? { ...user, name: object.name } : user
                ))
            }
        }

        Object.entries(listeners).forEach(([event, handle]) => {
            socket.on(event, handle)
        })

        return () => {
            Object.entries(listeners).forEach(([event, handle]) => {
                socket.off(event, handle)
            })
        }
    }, [])

    const changeRoom = useCallback(() => {
        if (!isSocketConnect || currentRoom === 'Room-List') { return }

        socket.emit('join-room', { room: currentRoom }, (response) => {
            setCurrentUserIDList(response.users)
            setCurrentMessageList(response.messages)
        })
    }, [currentRoom, isSocketConnect])

    const reName = useCallback(() => {
        if (!isSocketConnect) { return }

        socket.emit('user-reName', { name: selfName })
    }, [selfName, isSocketConnect])

    const sendMessage = useCallback(() => {
        if (!isSocketConnect || currentSelfMessage == '') { return }

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

                    return updatedMessages;
                });
            }
        })

        setTimeout(() => {
            setCurrentSelfMessage('')
            chatPanel.current.scrollTop = chatPanel.current.scrollHeight
        }, 100)
    }, [currentSelfMessage, isSocketConnect])

    const userName = useCallback((id) => {
        const user = userList.find(x => x.id === id)

        return (user) ? user.name : '用戶已離開'
    }, [userList])

    const isSelfMessage = useCallback((id) => {
        return (id === socket.id)
    }, [])

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

    const reNameBtnAction = useCallback(() => {
        setIsStartReName((prev) => {
            if (prev) { reName() }
            return !prev
        })
    }, [reName])

    const loginPopupControl = useCallback((state, string, timeDown = 0) => {
        if (!state) {
            loginPopup.current.style.display = 'none';
            return;
        }

        loginPopup.current.style.display = 'flex';
        setCurrentLoginMessage(string);

        if (timeDown !== 0) {
            setTimeout(() => {
                loginPopup.current.style.display = 'none';
            }, timeDown);
        }
    }, []);


    return (
        <div className="m-4 px-4 md:m-10 border border-gray-400 md:px-10 py-5">

            <div className='flex flex-col items-start gap-3 md:gap-8 mb-3 md:mb-8'>

                <div className="flex w-full md:w-auto flex-col-reverse md:flex-row flex-wrap gap-3 md:gap-10 md:items-center">
                    <div className="inline-flex md:flex-row flex-col md:items-center gap-3 md:gap-1 border border-dashed border-gray-300 p-2">
                        <span className="px-2 pt-0.5 text-lg">使用者名稱：</span>
                        <input disabled={!isCanName} value={selfName} onInput={(e) => setSelfName(e.target.value)} type="text" className="h-10 border border-black px-1 py-0.5 text-lg" />
                        <button className={`md:ml-3 border border-black py-1 px-3 ${isSocketConnect ? 'block' : 'hidden'}`} onClick={reNameBtnAction}>
                            {(isStartReName) ? '確定' : '重新命名'}
                        </button>
                    </div>

                    <button disabled={!isCanConnect} className={`border border-black px-4 py-2 rounded-m`} onClick={startSocket}>
                        {isSocketConnect ? 'Disconnect' : 'Connect'}
                    </button>
                </div >

                <div className="flex flex-col gap-3 md:gap-1 border w-full md:w-auto border-dashed border-gray-300 p-2 ">
                    <div className='flex md:items-center flex-col md:flex-row gap-3 md:gap-1'>
                        <span className="px-2 pt-0.5 text-lg">登入密碼：</span>
                        <input value={password} onInput={(e) => setPassword(e.target.value)} type="password" className="h-10 border border-black px-1 py-0.5 text-lg" />
                    </div>
                    <div className='flex items-center gap-1 text-gray-500 italic md:self-end'>
                        <span className="px-2 pt-0.5 text-lg">密碼：</span>
                        <div className=''>jin-chat</div>
                    </div>
                </div>

                <div className={`md:items-center gap-3 md:gap-1 w-full md:w-auto border border-dashed flex-col md:flex-row border-gray-300 p-2 ${isSocketConnect ? 'flex' : 'hidden'}`}>
                    <span className="px-2 pt-0.5 text-lg">選擇房間：</span>
                    <select value={currentRoom} onChange={(e) => { setCurrentRoom(e.target.value) }} className="h-10 w-full md:w-40 border border-black px-1 py-0.5 text-center text-black">
                        <option disabled value={null}>
                            Room-List
                        </option>
                        {roomList.map((item, index) => { return <option key={index} value={item}>{item}</option> })}
                    </select>
                </div >
            </div>

            <div className="flex flex-wrap gap-3 md:gap-10">
                <div className={`md:w-80 flex-col gap-1 w-full border border-dashed border-red-300 p-2 ${(isSocketConnect && currentRoom !== 'Room-List') ? 'inline-flex' : 'hidden'}`}>
                    <span className="px-2 pt-0.5 text-lg">房間使用者：</span>
                    <hr />
                    <div className='overflow-auto h-[100px]'>
                        <div className="px-2">
                            {currentUserList.map((user, index) => { return <div key={index}>{user}</div> })}
                        </div>
                    </div>
                </div>

                <div className={`inline-flex w-full lg:w-3/5 lg:min-w-[600px] flex-col gap-1 border border-dashed border-blue-500 p-2 ${(isSocketConnect && currentRoom !== 'Room-List') ? 'inline-flex' : 'hidden'}`}>
                    <span className="px-2 pt-0.5 text-lg">對話：</span>
                    <hr />
                    <div ref={chatPanel} className='overflow-auto scroll-smooth h-[300px]'>
                        <div className="flex flex-col gap-3 px-2">
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
                    </div>
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
