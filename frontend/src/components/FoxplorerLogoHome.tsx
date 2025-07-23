import foxplorer from "../assets/foxplorer.png";


export type FoxplorerLogoHomeProps = {
  onClick: () => void;
};

export const FoxplorerLogoHome = (props: FoxplorerLogoHomeProps) => {
  const { onClick } = props;
  return (

      <img
      onClick={onClick}
        src={foxplorer}
        alt="foxplorer"
        
        style={{
          cursor: "pointer",
          width: "55%",
          padding: "20px",
          zIndex: "10",
        }}
      />
   
  
  );
};
