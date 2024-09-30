import { useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
interface Props {

}

const LoginPopup = forwardRef((props: Props, ref) => {
    const [currentLoginMessage, setCurrentLoginMessage] = useState<string>('')
    const loginPopup = useRef<any>()

    useImperativeHandle(ref, () => ({
        loginPopupControl
    }))

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
        <div ref={loginPopup} className="fixed top-0 left-0 hidden h-screen w-full flex-col items-center justify-center bg-black/30">
            <div className="flex aspect-video h-[200px] flex-col items-center justify-center rounded-md border border-black bg-white text-xl">
                <div className="text-center" dangerouslySetInnerHTML={{ __html: currentLoginMessage }}></div>
            </div>
        </div>
    );
})

export default LoginPopup;