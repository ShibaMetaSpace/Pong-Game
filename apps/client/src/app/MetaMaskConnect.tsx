/**
 * The MetaMask connect props.
 */
export interface MetaMaskConnectProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any;
  success: () => void;
  error: () => void;
  errorMessage: string | null;
}

/**
 * Render the connection status component.
 *
 * @param props The component's props.
 * @returns The component.
 */
function MetaMaskConnect(props: MetaMaskConnectProps) {
  const connect = async () => {
    props.provider
      .request({ method: 'eth_requestAccounts' })
      .then(props.success)
      .catch(props.error);
  };

  return (
    <div className="flex flex-row items-center gap-x-4">
      <div>{props.errorMessage}</div> <img src="https://i.imgur.com/5BQHIaN.png" height="44px" width="44px" />
      <button className="px-2 py-1 bg-green-500 rounded-sm" onClick={connect}>Connect to MetaMask
      </button>
    </div>
  );
}

export default MetaMaskConnect;
