import { useState, useRef, useCallback } from 'react'
import { useSocket } from '@contexts/SocketContext';
import { Room, User, Message, SocketID, MessageContent, MessageID, UserName } from '@interfaces'
interface Props {
    isSocketConnect: Boolean;
    currentRoom: Room;
    currentMessageList: Message[];
    userList: User[];
    setCurrentMessageList: React.Dispatch<React.SetStateAction<Message[]>>;
}

function ChatPanel(props: Props) {
    const { isSocketConnect, currentRoom, currentMessageList, userList, setCurrentMessageList } = props
    const { socketRef } = useSocket()
    const chatPanel = useRef<any>()
    const [currentSelfMessage, setCurrentSelfMessage] = useState<MessageContent>('')

    const isSelfMessage = useCallback((id: SocketID) => {
        return (id === socketRef.current.id)
    }, [])

    const userName = useCallback((id: SocketID) => {
        const user = userList.find((x: User) => x.id === id)

        return (user) ? user.name : '用戶已離開'
    }, [userList])

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



    return (
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
    );
}

export default ChatPanel;