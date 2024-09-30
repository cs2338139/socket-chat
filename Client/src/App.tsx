import { SocketContextProvider } from '@contexts/SocketContext'
import { Panel } from '@components'

function App() {

  return (
    <SocketContextProvider>
      <Panel />
    </SocketContextProvider>
  )
}

export default App
