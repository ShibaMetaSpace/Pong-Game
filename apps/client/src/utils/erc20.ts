import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import humanStandardTokenAbi from './human-standard-token-abi';

export interface ERC20Info {
  address: string;
  name: string;
  symbol: string;
  balance: number;
}

export class ERC20 {
  /**
   * The smart contract address.
   */
  readonly SMART_CONTRACT_ADDRESS =
    '0x4dA9ac8d9727049Db92Df9969f763447F29d4d4d';

  /**
   * ETH contract.
   */
  contract: Contract;

  /**
   * ERC20 Constructor.
   *
   * @param web3 The Web3 instance.
   */
  constructor(private web3: Web3) {
    this.contract = new web3.eth.Contract(
      humanStandardTokenAbi,
      this.SMART_CONTRACT_ADDRESS
    );
  }

  /**
   * Get info.
   *
   * @returns The ERC20 info.
   */
  async getInfo() {
    let accounts: string[] = [];
    try {
      accounts = await this.web3.eth.getAccounts();
    } catch (e) {
      throw new Error('MetaMask is not connected.');
    }

    if (accounts.length === 0) {
      throw new Error('Hello guest! You are not connected !');
    }

    try {
      const symbol: string = await this.contract.methods.symbol().call();
      const name: string = await this.contract.methods.name().call();
      const decimals: number = await this.contract.methods.decimals().call();
      const balance: number = await this.contract.methods
        .balanceOf(accounts[0])
        .call();
      return {
        address: accounts[0],
        name,
        symbol,
        balance: balance / Math.pow(10, decimals),
      } as ERC20Info;
    } catch (e) {
      throw new Error('Hello Guest. You are not connected');
    }
  }

  async transfer(from: string, to: string, value: number) {
    const transaction = this.contract.methods.transfer(to, value);
    await this.web3.eth.sendTransaction({
      from,
      to,
      data: transaction.encodeABI(),
    });
  }
}
