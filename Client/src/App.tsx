import { SocketContextProvider } from '@contexts/SocketContext'
import { DataContextProvider } from '@contexts/DataContext'

import { Panel } from '@components'

function App() {

  return (
    <SocketContextProvider>
      <DataContextProvider>
        <Panel />
      </DataContextProvider>
    </SocketContextProvider>
  )
}

export default App
