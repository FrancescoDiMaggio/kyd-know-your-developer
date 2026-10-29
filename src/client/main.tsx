import './utils/restore-array-from'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { system } from './theme'
import App from './app'

const rootElement = document.getElementById('root')
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <ChakraProvider value={system}>
                <App />
            </ChakraProvider>
        </React.StrictMode>
    )
}
