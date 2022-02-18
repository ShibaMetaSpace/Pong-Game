/**
 * Render the "No MetaMask" notice component.
 *
 * @returns The component.
 */
function NoMetaMask() {
  return (
    <div className="text-white">
      No MetaMask found. Please install MetaMask (
      <a className="underline" href="https://metamask.io/">
        https://metamask.io/
      </a>
      ). <br />
      You can play as guest also, but if you win the game, you can't get your
      tokens !
    </div>
  );
}

export default NoMetaMask;
