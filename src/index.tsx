import React, {StrictMode} from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {HashRouter} from 'react-router-dom'
import {createWeb3ReactRoot, Web3ReactProvider} from '@web3-react/core'
import {NetworkContextName} from './constants/misc'
import {LanguageProvider} from './i18n'
import {SnackbarProvider} from 'notistack'
import {CookiesProvider} from 'react-cookie'
import {ThemeProvider as MUIThemeProvider} from '@material-ui/core'
import {muiTheme} from './theme/theme'
import SnackMessage from './components/SnackbarAlert/Snackbar'
import ApplicationUpdater from './state/application/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionsUpdater from './state/transactions/updater'
import ThemeProvider from './theme/theme'
import store from './state/state'
import getLibrary from './utils/getLibrary'
import './index.css'
import App from './pages/App'
import reportWebVitals from './reportWebVitals'
import '@reach/dialog/styles.css'
require('dotenv').config()

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

function Updaters() {
  return (
    <>
      <ApplicationUpdater />
      <MulticallUpdater />
      <TransactionsUpdater />
    </>
  )
}

ReactDOM.render(
  <StrictMode>
    <Provider store={store}>
      <HashRouter>
        <LanguageProvider>
          <CookiesProvider>
            <Web3ReactProvider getLibrary={getLibrary}>
              <Web3ProviderNetwork getLibrary={getLibrary}>
                <Updaters />
                <SnackbarProvider
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  content={(key, message) => <SnackMessage id={key} message={message} />}
                >
                  <ThemeProvider>
                    <MUIThemeProvider theme={muiTheme}>
                      <App />
                    </MUIThemeProvider>
                  </ThemeProvider>
                </SnackbarProvider>
              </Web3ProviderNetwork>
            </Web3ReactProvider>
          </CookiesProvider>
        </LanguageProvider>
      </HashRouter>
    </Provider>
  </StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
