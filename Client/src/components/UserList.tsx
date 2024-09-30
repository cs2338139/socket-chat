import { useMemo } from 'react';
import { SocketID, User, UserName, Room } from '@interfaces'

interface Props {
    isSocketConnect: Boolean;
    currentUserIDList: SocketID[];
    userList: User[];
    currentRoom: Room
}

function RoomList(props: Props) {
    const { isSocketConnect, currentUserIDList, userList, currentRoom } = props;

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

    return (
        <div className={`md:w-80 flex-col gap-1 w-full border border-dashed border-red-300 p-2 ${(isSocketConnect && currentRoom !== 'Room-List') ? 'inline-flex' : 'hidden'}`}>
            <span className="px-2 pt-0.5 text-lg">房間使用者：</span>
            <hr />
            <div className='overflow-auto h-[100px]'>
                <div className="px-2">
                    {currentUserList.map((user, index) => { return <div key={index}>{user}</div> })}
                </div>
            </div>
        </div>
    );
}

export default RoomList;