import candle from "../assets/candle.png";

export type CandleProps = {
  onClick: () => void;
};

// NOTE: Using inline styling demo but prefer styled-components or CSS classes in real app
export const Candle = (props: CandleProps) => {
  const { onClick } = props;

    
  return (

      <img
            onClick={onClick}
        src={candle}
        alt="Rolling Icebergs"
        style={{
          cursor: "pointer",
          position:"absolute",
          top: "0px",
          left: "110px",
          zIndex: "0", 
          height:"20vh"
        }}
      />
   
  
  );
};