

export type ShowMoreTopOwnersButtonProps = {
  onClick: () => void;
};

// NOTE: Using inline styling demo but prefer styled-components or CSS classes in real app
export const ShowMoreTopOwnersButton = (props: ShowMoreTopOwnersButtonProps) => {
  const { onClick } = props;


  // function MouseOut(e){
  //   target.style.background="";
  // }
  return (
    
    <button 
    className="HoverActivityButton" 
    onClick={onClick}
      style={{
        padding: "1rem",
        borderRadius: "0.5rem",
        cursor: "pointer",
        fontSize: ".9rem",
        fontWeight: 700,
        color: "#36bffa",
        backgroundColor: "#000000",
        border: "3px solid #36bffa",
        zIndex: "10",
      }}
      >
More Top Owners</button>

  );
};
