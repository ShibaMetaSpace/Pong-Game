/**
 * The Connection status props.
 */
export interface ConnectionStatusProps {
  connected: boolean;
}

/**
 * Render the connection status component.
 *
 * @param props The component's props.
 * @returns The component.
 */
function ConnectionStatus(props: ConnectionStatusProps) {
  // Build the markers (red or blue)
  // based on the connection status
  const marker = props.connected ? (
    <div className="w-5 h-5 bg-green-500 rounded-full"></div>
  ) : (
    <div className="w-5 h-5 bg-red-500 rounded-full"></div>
  );

  return (
    <div className="status">
      <div className="status">Server status:</div>
      {marker}
    </div>
  );
}

export default ConnectionStatus;
