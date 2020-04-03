import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import { ThemeProvider } from '@material-ui/styles'
import App from './components/App'
import * as serviceWorker from './serviceWorker'
import { LayoutProvider } from './context/LayoutContext'
import { CssBaseline } from '@material-ui/core'
import themes from './themes'

axios.defaults.headers.common['Content-Type'] = 'application/json'

ReactDOM.render(
    <LayoutProvider>
        <ThemeProvider theme={themes.default}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </LayoutProvider>,
    document.getElementById('root')
)

serviceWorker.register()
