import { SocketContextProvider } from '@contexts/SocketContext'
import { DataContextProvider } from '@contexts/DataContext'
import { ThemeProvider, createTheme } from '@mui/material';
import { theme } from '@themes/Theme'

import { Panel } from '@components'

function App() {

  return (
    <ThemeProvider theme={theme}>
      <SocketContextProvider>
        <DataContextProvider>
          <Panel />
        </DataContextProvider>
      </SocketContextProvider>
    </ThemeProvider>
  )
}

export default App
