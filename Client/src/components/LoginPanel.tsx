import { useEffect, useState, useRef, useMemo, useReducer, useCallback } from 'react'
import { useSocket } from '@contexts/SocketContext';
import { useData } from '@contexts/DataContext';
import { Box, TextField, FormControl, Button, Select, MenuItem, InputLabel } from '@mui/material'
interface Props {
    isSocketConnect: Boolean;
    startSocket: () => void;
}

function LoginPanel(props: Props) {
    const { isSocketConnect, startSocket } = props;
    const { socketRef } = useSocket()
    const { passWordState, selfNameState } = useData()
    const [isStartReName, setIsStartReName] = useState<Boolean>(false)

    const isCanConnect = useMemo(() => {
        return (passWordState?.value !== '' && selfNameState?.value !== '')
    }, [passWordState?.value, selfNameState?.value])

    const isCanName = useMemo(() => {
        if (isStartReName) { return true }
        if (isSocketConnect) { return false }

        return true

    }, [isSocketConnect, isStartReName])


    const reName = useCallback(() => {
        if (!isSocketConnect) { return }

        socketRef.current.emit('user-reName', { name: selfNameState?.value })
    }, [selfNameState?.value, isSocketConnect])

    const reNameBtnAction = useCallback(() => {
        setIsStartReName((prev) => {
            if (prev) { reName() }
            return !prev
        })
    }, [reName])



    return (
        <>
            <Box className="flex w-full md:w-auto flex-col-reverse md:flex-row flex-wrap gap-3 md:gap-10 md:items-center">
                <div className="inline-flex md:flex-row flex-col md:items-center gap-3 md:gap-1 border border-dashed border-gray-300 p-2">
                    <span className="px-2 pt-0.5 text-lg">使用者名稱：</span>
                    <TextField size="small" sx={{}} variant="outlined" disabled={!isCanName} value={selfNameState?.value} onInput={(e) => selfNameState?.set((e.target as HTMLInputElement).value)} />
                    <Button
                        variant='outlined'
                        sx={{ display: (isSocketConnect) ? 'block' : 'none' }}
                        onClick={reNameBtnAction}>
                        {(isStartReName) ? '確定' : '重新命名'}
                    </Button>
                </div>

                <Button
                    variant='contained'
                    disabled={!isCanConnect}
                    onClick={startSocket}>
                    {isSocketConnect ? 'Disconnect' : 'Connect'}
                </Button>
            </Box >

            <div className="flex flex-col gap-3 md:gap-1 border w-full md:w-auto border-dashed border-gray-300 p-2 ">
                <div className='flex md:items-center flex-col md:flex-row gap-3 md:gap-1'>
                    <span className="px-2 pt-0.5 text-lg">登入密碼：</span>
                    <TextField size="small" sx={{}} variant="outlined" value={passWordState?.value} onInput={(e) => passWordState?.set((e.target as HTMLInputElement).value)} type="password" />
                </div>
                <div className='flex items-center gap-1 text-gray-500 italic md:self-end'>
                    <span className="px-2 pt-0.5 text-lg">密碼：</span>
                    <div className=''>jin-chat</div>
                </div>
            </div>
        </>
    );
}

export default LoginPanel;