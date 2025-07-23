

export type GetAnotherButtonProps = {
  onClick: () => void;
};

// NOTE: Using inline styling demo but prefer styled-components or CSS classes in real app
export const GetAnotherButton = (props: GetAnotherButtonProps) => {
  const { onClick } = props;


  // function MouseOut(e){
  //   target.style.background="";
  // }
  return (
    
    <button 
    className="HoverButton" 
    onClick={onClick}
      style={{
        padding: "1rem",
        borderRadius: "0.5rem",
        margin: "5px",
        cursor: "pointer",
        fontSize: ".8rem",
        width: "175px",
        fontWeight: 700,
        color: "#000000",
        backgroundColor: "#36bffa",
        border: "3px solid #000000",
        zIndex: "10",
      }}
      >
Go Get Another Fox</button>

  );
};
