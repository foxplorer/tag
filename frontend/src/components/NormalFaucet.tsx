import myfaucet from "../assets/fire-hydrant.svg";

export type NormalFaucetProps = {
  onClick: () => void;
};
// NOTE: Using inline styling demo but prefer styled-components or CSS classes in real app
export const NormalFaucet = (props: NormalFaucetProps) => {
  const { onClick } = props;
  return (
    <>
          <img
      onClick={onClick}
        src={myfaucet}
        alt="Faucet Foxes"
        style={{
          cursor: "pointer",
          position:"absolute",
          top: "0px",
          right: "20px",
          padding: "10px",
          zIndex: "0",
          height:"10vh",
        }}
      />
     </>
  );
};