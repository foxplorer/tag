

export type DemoButtonProps = {
  onClick: () => void;
};

// NOTE: Using inline styling demo but prefer styled-components or CSS classes in real app
export const DemoButton = (props: DemoButtonProps) => {
  const { onClick } = props;
  return (
    <button 
    className="DemoButtonHover" 
    onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "1rem",
        borderRadius: "0.5rem",
        margin: "15px",
        cursor: "pointer",
        height: "50px",
        fontSize: ".8rem",
        fontWeight: 700,
        color: "#000000",
        backgroundColor: "#36bffa",
        border: "3px solid #000000",
        zIndex: "10",
      
        
      }}
      >
      Live Demo
    </button>
  );
};
