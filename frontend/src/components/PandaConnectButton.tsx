import pandaIcon from "../assets/yours-icon.png";

export type PandaConnectButtonProps = {
  onClick: () => void;
};

// NOTE: Using inline styling demo but prefer styled-components or CSS classes in real app
export const PandaConnectButton = (props: PandaConnectButtonProps) => {
  const { onClick } = props;
  return (
    <button
      className="YoursButtonHover"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "1rem",
        // width: "220px",
        height: "50px",
        borderRadius: "0.5rem",
        border: "3px solid #000000",
        cursor: "pointer",
        fontSize: ".8rem",
        fontWeight: 700,
        color: "#ffffff",
        backgroundColor: "#000000",
        zIndex: "10",
      }}
    >
      <img
        src={pandaIcon}
        alt="icon"
        style={{ marginRight: ".5rem", width: "2rem", height: "2rem"}}
      />
      Connect Yours Wallet
    </button>
  );
};
