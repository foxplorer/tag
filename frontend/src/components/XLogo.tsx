import xlogo from "../assets/x.png";

// NOTE: Using inline styling demo but prefer styled-components or CSS classes in real app
export const XLogo = () => {
 
  return (

      <img
        src={xlogo}
        alt="x"
        style={{
          width: "50px",
          cursor:"pointer",
          padding: "10px",
          zIndex: "10",
        }}
      />
   
  
  );
};
