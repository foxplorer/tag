import myfox from "../assets/1fox.png";

// NOTE: Using inline styling demo but prefer styled-components or CSS classes in real app
export const MyFox = () => {
 
  return (

      <img
        src={myfox}
        alt="My Fox"
        style={{
          position:"absolute",
          bottom: "0px",
          right: "20px",
          zIndex: "0",
          height:"12vh",
        }}
      />
   
  
  );
};