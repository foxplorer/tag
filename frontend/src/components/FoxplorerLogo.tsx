import foxplorer from "../assets/foxplorer.png";


export type FoxplorerLogoProps = {
  onClick: () => void;
};

export const FoxplorerLogo = (props: FoxplorerLogoProps) => {
  const { onClick } = props;
  return (

      <img
      onClick={onClick}
        src={foxplorer}
        alt="foxplorer"
        
        style={{
          cursor: "pointer",
          width: "35%",
          padding: "15px",
          zIndex: "10",
        }}
      />
   
  
  );
};
