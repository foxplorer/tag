export type ShowMoreGroupsButtonProps = {
  onClick: () => void;
  text: string;
};

export const ShowMoreGroupsButton = (props: ShowMoreGroupsButtonProps) => {
  const { onClick, text } = props;

  return (
    <button 
      // className="HoverButton" 
      onClick={onClick}
      style={{
        padding: "0.75rem 1.5rem",
        borderRadius: "0.5rem",
        margin: "10px",
        cursor: "pointer",
        fontSize: "0.875rem",
        fontWeight: 600,
        color: "#36bffa",
        backgroundColor: "#000000",
        border: "2px solid #36bffa",
        zIndex: "10",
        whiteSpace: "nowrap",
        transition: "all 0.2s ease",
        transform: "none"
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = "#36bffa";
        e.currentTarget.style.color = "#000000";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = "#000000";
        e.currentTarget.style.color = "#36bffa";
      }}
    >
      {text}
    </button>
  );
}; 