import { useEffect, useState, useRef, useMemo, useReducer, useCallback } from 'react'
import { useSocket } from '@contexts/SocketContext';
import { useData } from '@contexts/DataContext';
import { LoginPanel, LoginPopup, SelectRoom, UserList, ChatPanel } from '@components';
import { State, Room, User, Message, SocketID, MessageContent, MessageID, UserName } from '@interfaces'

function App() {
    const loginPopup = useRef<any>()

    const [isSocketConnect, setIsSocketConnect] = useState<Boolean>(false)
    const { socketRef, socketFunction } = useSocket()
    const { passWordState, selfNameState } = useData()

    const [roomList, setRoomList] = useState<Room[]>([])
    const [userList, setUserList] = useState<User[]>([])
    const [currentUserIDList, setCurrentUserIDList] = useState<SocketID[]>([])

    const [currentMessageList, setCurrentMessageList] = useState<Message[]>([])
    const [currentRoom, setCurrentRoom] = useState<Room>('Room-List')

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
            socketFunction.connect(passWordState?.value)
            loginPopup.current.loginPopupControl({ state: true, string: loginMessages.login })

            socketRef.current.once('connect_error', (error: any) => {
                loginPopup.current.loginPopupControl({ state: true, string: `${loginMessages.error}${error}`, timeDown: 2000 })
            })

            socketRef.current.once('connect', () => {
                loginPopup.current.loginPopupControl({ state: true, string: loginMessages.success, timeDown: 2000 })
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

    return (
        <div className="m-4 px-4 md:m-10 border border-gray-400 md:px-10 py-5">

            <div className='flex flex-col items-start gap-3 md:gap-8 mb-3 md:mb-8'>
                <LoginPanel
                    isSocketConnect={isSocketConnect}
                    startSocket={startSocket}
                />

                <SelectRoom
                    isSocketConnect={isSocketConnect}
                    currentRoomState={{ value: currentRoom, set: setCurrentRoom }}
                    roomList={roomList}
                />
            </div>

            <div className="flex flex-wrap gap-3 md:gap-10">
                <UserList
                    isSocketConnect={isSocketConnect}
                    currentUserIDList={currentUserIDList}
                    userList={userList}
                    currentRoom={currentRoom}
                />
                <ChatPanel
                    isSocketConnect={isSocketConnect}
                    currentRoom={currentRoom}
                    currentMessageList={currentMessageList}
                    userList={userList}
                    setCurrentMessageList={setCurrentMessageList}
                />
            </div >

            <LoginPopup
                ref={loginPopup} />
        </div >
    )
}

export default App
