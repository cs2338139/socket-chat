import { State, Room } from '@interfaces'

interface Props {
    isSocketConnect: Boolean;
    currentRoomState: State
    roomList: Room[]
}

function SelectRoom(props: Props) {
    const { isSocketConnect, currentRoomState, roomList } = props;
    return (
        <div className={`md:items-center gap-3 md:gap-1 w-full md:w-auto border border-dashed flex-col md:flex-row border-gray-300 p-2 ${isSocketConnect ? 'flex' : 'hidden'}`}>
            <span className="px-2 pt-0.5 text-lg">選擇房間：</span>
            <select value={currentRoomState.value}
                onChange={(e) => { currentRoomState.set(e.target.value) }}
                className="h-10 w-full md:w-40 border border-black px-1 py-0.5 text-center text-black">
                <option value={null}>
                    Room-List
                </option>
                {roomList.map((item, index) => { return <option key={index} value={item}>{item}</option> })}
            </select>
        </div >
    );
}

export default SelectRoom;