import myfaucet from "../assets/fire-hydrant.svg";

// NOTE: Using inline styling demo but prefer styled-components or CSS classes in real app
export const ActualFaucet = () => {
 
  return (

      <img
        src={myfaucet}
        alt="Faucet Foxes"
        style={{
          position:"absolute",
          bottom: "0px",
          right: "20px",
          zIndex: "0",
          height:"10vh",
        }}
      />
   
  
  );
};