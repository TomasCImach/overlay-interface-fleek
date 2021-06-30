import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import { NetworkContextName } from './constants/misc';
import ApplicationUpdater from './state/application/updater';
import ThemeProvider from "./theme/theme";
import store from './state/state';
import getLibrary from './utils/getLibrary'
import "./index.css";
import App from "./pages/App";
import reportWebVitals from "./reportWebVitals";

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

function Updaters() {
  return (
    <>
      <ApplicationUpdater />
    </>
  )
}

ReactDOM.render(
  <StrictMode>
    <Provider store={store}>
      <HashRouter>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Web3ProviderNetwork getLibrary={getLibrary}>
            <Updaters />
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </Web3ProviderNetwork>
        </Web3ReactProvider>
      </HashRouter>
    </Provider>
  </StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
