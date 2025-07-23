import myotherfox from "../assets/2fox.png";

// NOTE: Using inline styling demo but prefer styled-components or CSS classes in real app
export const MyOtherFox = () => {
 
  return (

      <img
        src={myotherfox}
        alt="My Fox"
        style={{
          position:"absolute",
          bottom: "0px",
          left: "20px",
          zIndex: "0",
          height:"12vh",
        }}
      />
   
  
  );
};
