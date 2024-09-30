import { createContext, useContext, useState } from "react";

interface State {
    value: any;
    set: React.Dispatch<React.SetStateAction<any>>;
}

const DataContext = createContext<{ passWordState: State | null, selfNameState: State | null }>({ passWordState: null, selfNameState: null });

export const useData = () => {
    return useContext(DataContext)
}

export function DataContextProvider({ children }: { children: React.ReactNode }) {
    const [password, setPassword] = useState<string>('')
    const [selfName, setSelfName] = useState<string>('')

    const passWordState: State = { value: password, set: setPassword }
    const selfNameState: State = { value: selfName, set: setSelfName }

    return (
        <DataContext.Provider value={{ passWordState, selfNameState }} >
            {children}
        </DataContext.Provider >
    )
}
