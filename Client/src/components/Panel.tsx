import { useEffect, useState, useRef, useMemo, useReducer, useCallback } from 'react'
import { useSocket } from '@contexts/SocketContext';
import { useData } from '@contexts/DataContext';
import { LoginPanel } from '@components';

function App() {
    const loginPopup = useRef<HTMLDivElement>()
    const chatPanel = useRef<HTMLDivElement>()

    const [isSocketConnect, setIsSocketConnect] = useState<Boolean>(false)
    const { socketRef, socketFunction } = useSocket()
    const { passWordState, selfNameState } = useData()

    const [roomList, setRoomList] = useState<Room[]>([])
    const [userList, setUserList] = useState<User[]>([])
    const [currentUserIDList, setCurrentUserIDList] = useState<SocketID[]>([])

    const [currentMessageList, setCurrentMessageList] = useState<Message[]>([])
    const [currentRoom, setCurrentRoom] = useState<Room>('Room-List')

    const [currentSelfMessage, setCurrentSelfMessage] = useState<MessageContent>('')

    const [currentLoginMessage, setCurrentLoginMessage] = useState<string>('')
    const loginMessages = { login: '快馬加鞭登入中...', success: '登入成功 =)', error: '連線失敗：<br/>' }

    type SocketID = string
    type Room = string
    type MessageID = number
    type MessageContent = string
    type UserName = string
    interface Message {
        socketId: SocketID;
        message: MessageContent;
        isSending?: boolean;
        messageId?: MessageID;
    }
    interface User {
        id: SocketID;
        name: UserName;
    }

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
            socketFunction.connect(passWordState?.value)
            loginPopupControl({ state: true, string: loginMessages.login })

            socketRef.current.once('connect_error', (error: any) => {
                loginPopupControl({ state: true, string: `${loginMessages.error}${error}`, timeDown: 2000 })
            })

            socketRef.current.once('connect', () => {
                loginPopupControl({ state: true, string: loginMessages.success, timeDown: 2000 })
                setIsSocketConnect(true)
                socketRef.current.emit('join', { name: selfNameState?.value }, (response: { roomList: Room[], userList: User[] }) => {
                    setRoomList(response.roomList)
                    setUserList(response.userList)
                })
            })

            socketRef.current.on('disconnect', () => {
                setIsSocketConnect(false)
            })

            setupSocketEventListeners()
        } else {
            socketFunction.disConnect()
            setIsSocketConnect(false)
        }
    }, [isSocketConnect, passWordState?.value, selfNameState?.value])

    const setupSocketEventListeners = useCallback(() => {
        const listeners = {
            'add': (object: User) => {
                setUserList((prev: User[]) => [...prev, object])
            },
            'remove': (object: User) => {
                setUserList((prev) => prev.filter(obj => obj.id !== object.id))
            },
            'add-user': (object: User) => {
                setCurrentUserIDList((prev) => [...prev, object.id])
            },
            'add-message': (object: Message) => {
                setCurrentMessageList((prev) => [...prev, object])
            },
            'remove-user': (object: User) => {
                setCurrentUserIDList((prev) => prev.filter(obj => obj !== object.id))
            },
            'user-reName': (object: User) => {
                setUserList((prev) => prev.map((user) =>
                    user.id === object.id ? { ...user, name: object.name } : user
                ))
            }
        }

        Object.entries(listeners).forEach(([event, handle]) => {
            socketRef.current.on(event, handle)
        })

        return () => {
            Object.entries(listeners).forEach(([event, handle]) => {
                socketRef.current.off(event, handle)
            })
        }
    }, [])

    const changeRoom = useCallback(() => {
        if (!isSocketConnect || currentRoom === 'Room-List') { return }

        socketRef.current.emit('join-room', { room: currentRoom }, (response: { users: SocketID[], messages: Message[] }) => {
            setCurrentUserIDList(response.users)
            setCurrentMessageList(response.messages)
        })
    }, [currentRoom, isSocketConnect])

    const sendMessage = useCallback(() => {
        if (!isSocketConnect || currentSelfMessage == '') { return }

        const currentTime = new Date().getTime()
        const newMessage: Message = { socketId: socketRef.current.id, message: currentSelfMessage, isSending: true, messageId: currentTime }

        setCurrentMessageList((prev) => [...prev, newMessage])
        socketRef.current.emit('add-message', { message: currentSelfMessage, messageId: currentTime }, (response: { status: number, messageId: MessageID }) => {
            if (response.status === 200) {
                const messageId: number = response.messageId

                setCurrentMessageList((prevMessages: Message[]) => {
                    const updatedMessages = prevMessages.map((message: Message) =>
                        message.messageId === messageId ? { ...message, isSending: false } : message
                    );

                    return updatedMessages;
                });
            }
        })

        setTimeout(() => {
            setCurrentSelfMessage('')
            if (chatPanel.current) {
                chatPanel.current.scrollTop = chatPanel.current.scrollHeight
            }
        }, 100)
    }, [currentSelfMessage, isSocketConnect])

    const userName = useCallback((id: SocketID) => {
        const user = userList.find((x: User) => x.id === id)

        return (user) ? user.name : '用戶已離開'
    }, [userList])

    const isSelfMessage = useCallback((id: SocketID) => {
        return (id === socketRef.current.id)
    }, [])





    const currentUserList = useMemo(() => {
        const list: UserName[] = []

        currentUserIDList.forEach((id) => {
            const user = userList.find(x => x.id === id)

            if (user) {
                list.push(user.name)
            }
        })

        return list
    }, [currentUserIDList, userList])



    interface LoginPopupControlProps {
        state: boolean;
        string: string;
        timeDown?: number;
    }

    const loginPopupControl = useCallback(({ state, string, timeDown = 0 }: LoginPopupControlProps) => {
        if (!loginPopup.current) return;
        if (!state) {
            loginPopup.current.style.display = 'none';
            return;
        }

        loginPopup.current.style.display = 'flex';
        setCurrentLoginMessage(string);

        if (timeDown !== 0) {
            setTimeout(() => {
                if (!loginPopup.current) return;
                loginPopup.current.style.display = 'none';
            }, timeDown);
        }
    }, []);


    return (
        <div className="m-4 px-4 md:m-10 border border-gray-400 md:px-10 py-5">

            <div className='flex flex-col items-start gap-3 md:gap-8 mb-3 md:mb-8'>
                <LoginPanel
                    isSocketConnect={isSocketConnect}
                    startSocket={startSocket}
                />

                <div className={`md:items-center gap-3 md:gap-1 w-full md:w-auto border border-dashed flex-col md:flex-row border-gray-300 p-2 ${isSocketConnect ? 'flex' : 'hidden'}`}>
                    <span className="px-2 pt-0.5 text-lg">選擇房間：</span>
                    <select value={currentRoom} onChange={(e) => { setCurrentRoom(e.target.value) }} className="h-10 w-full md:w-40 border border-black px-1 py-0.5 text-center text-black">
                        <option value={null}>
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
                            onInput={(e) => setCurrentSelfMessage((e.target as HTMLInputElement).value)}
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
