import tag from "../assets/tag75.png";


export type TagLogoProps = {
  onClick: () => void;
};

export const TagLogo = (props: TagLogoProps) => {
  const { onClick } = props;
  return (

      <img
      onClick={onClick}
        src={tag}
        alt="tag"
        
        style={{
          cursor: "pointer",
          width: "120px",
          padding: "15px",
          zIndex: "10",
        }}
      />
   
  
  );
};
