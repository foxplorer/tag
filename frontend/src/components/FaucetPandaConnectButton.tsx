import pandaIcon from "../assets/yours-icon.png";

export type FaucetPandaConnectButtonProps = {
  onClick: () => void;
};

// NOTE: Using inline styling demo but prefer styled-components or CSS classes in real app
export const FaucetPandaConnectButton = (props: FaucetPandaConnectButtonProps) => {
  const { onClick } = props;
  return (
    <button
      className="FaucetButtonHover"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        paddingRight: "1rem",
        // width: "125px",
        height: "40px",
        borderRadius: "0.5rem",
        border: "2px solid #ffffff",
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: 700,
        color: "#ffffff",
        backgroundColor: "#000000",
        zIndex: "10",
        marginTop: "5px",
      }}
    >
      <img
        src={pandaIcon}
        alt="icon"
        style={{ marginRight: ".5rem", width: "1.7rem", height: "1.7rem"}}
      />
      Connect
    </button>
  );
};
