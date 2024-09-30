import { State, Room } from '@interfaces'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'

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

            <FormControl sx={{ display: (isSocketConnect) ? 'block' : 'none' }}>
                <Select
                    value={currentRoomState.value}
                    onChange={(e) => { currentRoomState.set(e.target.value) }}
                    sx={{ padding: '0 30px', height: '40px', width: { xs: '100%', sm: '200px' } }}
                >
                    <MenuItem value={'Room-List'}>
                        Room-List
                    </MenuItem>
                    {roomList.map((item, index) => { return <MenuItem key={index} value={item}>{item}</MenuItem> })}
                </Select>
            </FormControl>
        </div >
    );
}

export default SelectRoom;