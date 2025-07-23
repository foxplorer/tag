import { useState, useEffect, useRef, memo } from "react";
import { ShowMoreButton } from "../components/ShowMoreButton";
import { PulseLoader } from 'react-spinners';
import { Button } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";
import { ThreeCircles } from 'react-loader-spinner';

type DisplayPlayersArrayProps = {
  playersarray: PlayersArray[],
  chaserid: string,
  followedPlayerId?: string,
  isUsingJoystick?: boolean,
  onFollowPlayer?: (playerId: string) => void
}

type PlayersArray = {
  id: string,
  owneraddress: string,
  outpoint: string,
  foxname: string,
  image: string,
  imagelink: string,
  x: number,
  y: number,
  speed: number,
  height: number,
  width: number,
  dir: number
}



const DisplayPlayersArray = memo(function DisplayPlayersArray({ 
  playersarray, 
  chaserid, 
  followedPlayerId = "", 
  isUsingJoystick = false,
  onFollowPlayer 
}: DisplayPlayersArrayProps) {

    //useRefs
    const didMount = useRef(false);
    
    // Function to shorten address for mobile display
    const shortenAddress = (address: string) => {
      if (address.length <= 20) return address;
      // Make addresses even shorter for mobile
      return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };
    
    // get tagged foxes
    useEffect(() => {
    }, []);

  return (
    <>
    {!playersarray &&

      <>
        <div className="activity-left">
          There are no players!
        </div>
      </>
    }
    {playersarray &&

      <>
        <div className="PlayersList" style={{ 
          margin: '0',
          padding: '0'
        }}>
          {playersarray.map(function (data) {
           // console.log("map players array")
            return (
              <div key={uuidv4()} className="PlayerItem" style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                margin: '10px 0',
                padding: '15px',
                border: data.id === chaserid ? '2px solid #FFEA00' : '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: data.id === chaserid ? 'rgba(255, 234, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                minHeight: '80px', // Ensure consistent height
                transition: 'all 0.2s ease'
              }}>
                <div style={{ marginRight: '15px', flexShrink: 0 }}>
                  <a target="blank" href={data.imagelink}>
                    <img 
                      src={data.image} 
                      alt={data.foxname}
                      style={{ width: '50px', height: '50px', borderRadius: '5px' }}
                    />
                  </a>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: data.id === chaserid ? '#FFEA00' : '#fff', lineHeight: '1.2' }}>
                    <a target="blank" href={data.imagelink} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {data.foxname}
                    </a>
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#ccc', 
                    lineHeight: '1.2',
                    wordBreak: 'break-all',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                  }}>
                    {shortenAddress(data.owneraddress)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.2' }}>
                    {data.id === chaserid ? '🔥 CHASER' : 'Runner'}
                  </div>
                </div>
                {onFollowPlayer && (
                  <div style={{ marginLeft: '15px', display: 'flex', alignItems: 'center' }}>
                    <button
                      onClick={() => onFollowPlayer(data.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: data.id === followedPlayerId && !isUsingJoystick ? '#4CAF50' : '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease'
                      }}
                      disabled={data.id === followedPlayerId && !isUsingJoystick}
                    >
                      {data.id === followedPlayerId && !isUsingJoystick ? 'Following' : 'Follow'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>
    }
    </>
  )
});

export default DisplayPlayersArray;