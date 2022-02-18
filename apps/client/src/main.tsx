import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import detectEthereumProvider from '@metamask/detect-provider';

import App from './app/app';
import { provider } from 'web3-core';
import Web3 from 'web3';
import { ERC20 } from './utils/erc20';

declare global {
  interface Window {
    Web3: typeof Web3;
  }
}

(async () => {
  const provider = (await detectEthereumProvider()) as provider;

  const erc20 = new ERC20(new window.Web3(provider));

  ReactDOM.render(
    <StrictMode>
      <App provider={provider} erc20={erc20} />
    </StrictMode>,
    document.getElementById('root')
  );
})();
