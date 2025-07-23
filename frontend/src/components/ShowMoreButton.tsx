export type ShowMoreButtonProps = {
  onClick: () => void;
  text?: string;
};

// NOTE: Using inline styling demo but prefer styled-components or CSS classes in real app
export const ShowMoreButton = (props: ShowMoreButtonProps) => {
  const { onClick, text = "Show More" } = props;

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
        margin: "15px",
        cursor: "pointer",
        fontSize: "1rem",
        width: "150px",
        fontWeight: 700,
        color: "#000000",
        backgroundColor: "#36bffa",
        border: "3px solid #000000",
        zIndex: "10",
      }}
      >
      {text}
    </button>

  );
};
