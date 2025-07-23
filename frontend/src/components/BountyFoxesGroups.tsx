import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import bounty2xjson from "../assets/500BountyFoxes2xGroups.json";
import bounty5xjson from "../assets/500BountyFoxes5xGroups.json";
import bounty10xjson from "../assets/500BountyFoxes10xGroups.json";
import { Button } from "@mui/material";
import { ShowMoreButton } from "./ShowMoreButton";
import { ShowMoreGroupsButton } from "./ShowMoreGroupsButton";
import { PulseLoader } from 'react-spinners';

type FoxGroup = {
  foxGroup: string;
  description: string;
  type: string;
  outpoint: string;
  link: string;
  group: Array<{
    "origin.outpoint": string;
    foxData: {
      foxName: string;
      pixelFoxName: string;
    };
  }>;
};

// Type assertions for JSON imports
const bounty2xGroups = bounty2xjson as FoxGroup[];
const bounty5xGroups = bounty5xjson as FoxGroup[];
const bounty10xGroups = bounty10xjson as FoxGroup[];

type BountyFoxesGroupsProps = {
  myordinalsaddress: string;
  handleConnect: () => void;
  newOutpoints: string[];
  available?: string[];
  connectLoading?: boolean;
  allUtxos?: string;
}

const BountyFoxesGroups: React.FC<BountyFoxesGroupsProps> = ({ 
  myordinalsaddress, 
  handleConnect,
  newOutpoints,
  available,
  connectLoading = false,
  allUtxos
}) => {
  const [ownedGroups, setOwnedGroups] = useState<{
    '2x': number;
    '5x': number;
    '10x': number;
  }>({
    '2x': 0,
    '5x': 0,
    '10x': 0
  });

  const [ownedFoxes, setOwnedFoxes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  // Add pagination state for each group type
  const [visibleGroups, setVisibleGroups] = useState({
    '2x': 2,
    '5x': 2,
    '10x': 2
  });

  // Add effect to track window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track owned groups
  useEffect(() => {
    if (!myordinalsaddress || myordinalsaddress.trim() === '' || myordinalsaddress.length < 26 || connectLoading) {
      setIsLoading(false);
      setOwnedFoxes([]);
      setOwnedGroups({
        '2x': 0,
        '5x': 0,
        '10x': 0
      });
      return;
    }
    setIsLoading(true);

    // Use the allUtxos prop instead of making a new API call
    if (allUtxos) {
      try {
        const data = JSON.parse(allUtxos);
        setOwnedFoxes(data);

        // Count owned foxes in each group
        const counts = {
          '2x': 0,
          '5x': 0,
          '10x': 0
        };

        // Check 2x groups
        bounty2xGroups.forEach(group => {
          const ownedInGroup = group.group.filter(fox => 
            data.some(ownedFox => 
              (ownedFox.origin?.outpoint === fox["origin.outpoint"]) || 
              (ownedFox.outpoint === fox["origin.outpoint"])
            )
          ).length;
          if (ownedInGroup === group.group.length) {
            counts['2x']++;
          }
        });

        // Check 5x groups
        bounty5xGroups.forEach(group => {
          const ownedInGroup = group.group.filter(fox => 
            data.some(ownedFox => 
              (ownedFox.origin?.outpoint === fox["origin.outpoint"]) || 
              (ownedFox.outpoint === fox["origin.outpoint"])
            )
          ).length;
          if (ownedInGroup === group.group.length) {
            counts['5x']++;
          }
        });

        // Check 10x groups
        bounty10xGroups.forEach(group => {
          const ownedInGroup = group.group.filter(fox => 
            data.some(ownedFox => 
              (ownedFox.origin?.outpoint === fox["origin.outpoint"]) || 
              (ownedFox.outpoint === fox["origin.outpoint"])
            )
          ).length;
          if (ownedInGroup === group.group.length) {
            counts['10x']++;
          }
        });

        setOwnedGroups(counts);
        setIsLoading(false);
      } catch (error) {
        // console.error('Error processing owned foxes:', error);
        setIsLoading(false);
      }
    } else {
      // Fallback to API call if allUtxos is not provided
      const fetchOwnedGroups = async () => {
        try {
          const response = await fetch(`https://ordinals.gorillapool.io/api/txos/address/${myordinalsaddress}/unspent?limit=300000`);
          const data = await response.json();
          setOwnedFoxes(data);

          // Count owned foxes in each group
          const counts = {
            '2x': 0,
            '5x': 0,
            '10x': 0
          };

          // Check 2x groups
          bounty2xGroups.forEach(group => {
            const ownedInGroup = group.group.filter(fox => 
              data.some(ownedFox => 
                (ownedFox.origin?.outpoint === fox["origin.outpoint"]) || 
                (ownedFox.outpoint === fox["origin.outpoint"])
              )
            ).length;
            if (ownedInGroup === group.group.length) {
              counts['2x']++;
            }
          });

          // Check 5x groups
          bounty5xGroups.forEach(group => {
            const ownedInGroup = group.group.filter(fox => 
              data.some(ownedFox => 
                (ownedFox.origin?.outpoint === fox["origin.outpoint"]) || 
                (ownedFox.outpoint === fox["origin.outpoint"])
              )
            ).length;
            if (ownedInGroup === group.group.length) {
              counts['5x']++;
            }
          });

          // Check 10x groups
          bounty10xGroups.forEach(group => {
            const ownedInGroup = group.group.filter(fox => 
              data.some(ownedFox => 
                (ownedFox.origin?.outpoint === fox["origin.outpoint"]) || 
                (ownedFox.outpoint === fox["origin.outpoint"])
              )
            ).length;
            if (ownedInGroup === group.group.length) {
              counts['10x']++;
            }
          });

          setOwnedGroups(counts);
          setIsLoading(false);
        } catch (error) {
          // console.error('Error fetching owned foxes:', error);
          setIsLoading(false);
        }
      };

      fetchOwnedGroups();
    }
  }, [myordinalsaddress, allUtxos, connectLoading]);

  // Listen for new foxes owned
  useEffect(() => {
    const handleNewFoxesOwned = (event: CustomEvent) => {
      const { outpoints } = event.detail;
      
      const recalculateGroups = () => {
        if (!myordinalsaddress || !allUtxos) return;
        
        try {
          const data = JSON.parse(allUtxos);
          const updatedData = [...data, ...outpoints.map(outpoint => ({ origin: { outpoint } }))];
          setOwnedFoxes(updatedData);

          // Recalculate owned groups
          const counts = {
            '2x': 0,
            '5x': 0,
            '10x': 0
          };

          // Check 2x groups
          bounty2xGroups.forEach(group => {
            const ownedInGroup = group.group.filter(fox => 
              updatedData.some(ownedFox => 
                (ownedFox.origin?.outpoint === fox["origin.outpoint"]) || 
                (ownedFox.outpoint === fox["origin.outpoint"])
              )
            ).length;
            if (ownedInGroup === group.group.length) {
              counts['2x']++;
            }
          });

          // Check 5x groups
          bounty5xGroups.forEach(group => {
            const ownedInGroup = group.group.filter(fox => 
              updatedData.some(ownedFox => 
                (ownedFox.origin?.outpoint === fox["origin.outpoint"]) || 
                (ownedFox.outpoint === fox["origin.outpoint"])
              )
            ).length;
            if (ownedInGroup === group.group.length) {
              counts['5x']++;
            }
          });

          // Check 10x groups
          bounty10xGroups.forEach(group => {
            const ownedInGroup = group.group.filter(fox => 
              updatedData.some(ownedFox => 
                (ownedFox.origin?.outpoint === fox["origin.outpoint"]) || 
                (ownedFox.outpoint === fox["origin.outpoint"])
              )
            ).length;
            if (ownedInGroup === group.group.length) {
              counts['10x']++;
            }
          });

          setOwnedGroups(counts);
        } catch (error) {
          // console.error('Error recalculating groups:', error);
        }
      };

      recalculateGroups();
    };

    window.addEventListener('newFoxesOwned', handleNewFoxesOwned as EventListener);
    
    return () => {
      window.removeEventListener('newFoxesOwned', handleNewFoxesOwned as EventListener);
    };
  }, [myordinalsaddress, allUtxos]);

  const checkUniqueOutpoints = () => {
    const allOutpoints = new Set();
    let duplicates = 0;

    // Check 2x groups
    bounty2xGroups.forEach(group => {
      group.group.forEach(fox => {
        if (allOutpoints.has(fox["origin.outpoint"])) {
          duplicates++;
        } else {
          allOutpoints.add(fox["origin.outpoint"]);
        }
      });
    });

    // Check 5x groups
    bounty5xGroups.forEach(group => {
      group.group.forEach(fox => {
        if (allOutpoints.has(fox["origin.outpoint"])) {
          duplicates++;
        } else {
          allOutpoints.add(fox["origin.outpoint"]);
        }
      });
    });

    // Check 10x groups
    bounty10xGroups.forEach(group => {
      group.group.forEach(fox => {
        if (allOutpoints.has(fox["origin.outpoint"])) {
          duplicates++;
        } else {
          allOutpoints.add(fox["origin.outpoint"]);
        }
      });
    });

    // console.log(`Total unique outpoints: ${allOutpoints.size}`);
    // console.log(`Duplicate outpoints found: ${duplicates}`);
  };

  const handleShowMore = (groupType: '2x' | '5x' | '10x') => {
    setVisibleGroups(prev => ({
      ...prev,
      [groupType]: prev[groupType] + 2
    }));
  };

  return (
    <div className="LuckyFoxesGroups" style={{ backgroundColor: 'black' }}>

      {/* 2x Groups */}
      <div>
        <div className="H3Wrapper">
          <h3>
            Bounty Foxes 2x Groups ({bounty2xGroups.length})
          </h3>
        </div>
        {bounty2xGroups.slice(0, visibleGroups['2x']).map((group, groupIndex) => (
          <div key={groupIndex} style={{
            backgroundColor: 'rgba(54, 191, 250, 0.1)',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h4 style={{ color: '#36bffa', fontWeight: 600, fontSize: '1.2rem', marginBottom: '4px', textAlign: 'center' }}>
              {group.foxGroup}
            </h4>
            {group.link && (
              <div style={{ textAlign: 'center', marginBottom: '3px' }}>
                <a href={group.link} target="_blank" rel="noopener noreferrer" style={{ color: '#808080', textDecoration: 'underline', fontWeight: 500 }}>
                  Group
                </a>
              </div>
            )}
            <div style={{ color: '#808080', textAlign: 'center', marginBottom: '6px' }}>
              <span style={{ color: '#808080' }}>You own: </span>
              {myordinalsaddress ? (
                isLoading ? (
                  <span style={{ display: 'inline-flex', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', position: 'relative', top: '-5px' }}>
                    <PulseLoader color="#808080" size={4} />
                  </span>
                ) : (
                  <span style={{ color: '#808080' }}>
                    {group.group.filter(fox => ownedFoxes.some(ownedFox => 
                      (ownedFox.origin?.outpoint === fox["origin.outpoint"]) || 
                      (ownedFox.outpoint === fox["origin.outpoint"])
                    )).length}
                  </span>
                )
              ) : (
                <span>
                  <a 
                    onClick={() => handleConnect && handleConnect()}
                    style={{ color: '#808080', textDecoration: 'underline', cursor: 'pointer' }}
                  >Connect to view</a>
                </span>
              )}
              <span style={{ color: '#808080' }}> / {group.group.length}</span>
            </div>
            <ul className="image-container" style={{ 
              margin: 0,
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '0'
            }}>
              {group.group.map((fox, foxIndex) => {
                const isOwned = ownedFoxes.some(ownedFox => 
                  (ownedFox.origin?.outpoint === fox["origin.outpoint"]) || 
                  (ownedFox.outpoint === fox["origin.outpoint"])
                );
                return (
                  <li key={`${group.foxGroup}-${foxIndex}-${fox["origin.outpoint"]}`} style={{ 
                    border: '4px solid transparent',
                    transition: 'border-color 0.2s ease',
                    position: 'relative'
                  }} onMouseEnter={(e) => {
                    if (isOwned) {
                      e.currentTarget.style.borderColor = '#4CAF50';
                    } else if (available && available.includes(fox["origin.outpoint"])) {
                      e.currentTarget.style.borderColor = '#36bffa';
                    } else {
                      e.currentTarget.style.borderColor = '#f44336';
                    }
                  }} onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                  }}>
                    {/* Yours Badge */}
                    {isOwned && (
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        zIndex: 10,
                        transition: 'background-color 0.2s ease',
                        cursor: 'pointer'
                      }} onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2E7D32';
                      }} onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#4CAF50';
                      }}>
                        Yours
                      </div>
                    )}
                    
                    {/* Available Badge */}
                    {!isOwned && available && available.includes(fox["origin.outpoint"]) && (
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        backgroundColor: '#36bffa',
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        zIndex: 10,
                        transition: 'background-color 0.2s ease',
                        cursor: 'pointer'
                      }} onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1976d2';
                      }} onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#36bffa';
                      }}>
                        Available
                      </div>
                    )}
                    
                    {/* Taken Badge */}
                    {!isOwned && (!available || !available.includes(fox["origin.outpoint"])) && (
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        zIndex: 10,
                        transition: 'background-color 0.2s ease',
                        cursor: 'pointer'
                      }} onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#d32f2f';
                      }} onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f44336';
                      }}>
                        Taken
                      </div>
                    )}
                    <a href={`https://alpha.1satordinals.com/outpoint/${fox["origin.outpoint"].replace(':', '_')}/inscription`} target="_blank" rel="noopener noreferrer">
                      <img 
                        src={`https://ordinals.gorillapool.io/content/${fox["origin.outpoint"]}`}
                        alt={fox.foxData.foxName}
                        className="seventraitfoxes"
                      />
                    </a>
                    <span className="FoxTitle" style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minHeight: '50px',
                      justifyContent: 'center',
                      marginBottom: '2px',
                      fontSize: isMobile ? '13px' : '15px'
                    }}>
                      <a href={`https://alpha.1satordinals.com/outpoint/${fox["origin.outpoint"].replace(':', '_')}/inscription`} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: isMobile ? '13px' : '15px'
                      }}>
                        {fox.foxData.foxName}
                      </a>
                    </span>
                    <div className="ResultsTraits" style={{ 
                      fontSize: isMobile ? '13px' : '15px',
                      marginTop: '2px',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                      maxWidth: '100%',
                      lineHeight: '1.2',
                      minHeight: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}>{fox.foxData.pixelFoxName}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {visibleGroups['2x'] < bounty2xGroups.length && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <ShowMoreGroupsButton onClick={() => handleShowMore('2x')} text="Show More 2x Groups" />
          </div>
        )}
      </div>

      {/* 5x Groups */}
      <div>
        <div className="H3Wrapper">
          <h3>
            Bounty Foxes 5x Groups ({bounty5xGroups.length})
          </h3>
        </div>
        {bounty5xGroups.slice(0, visibleGroups['5x']).map((group, groupIndex) => (
          <div key={groupIndex} style={{
            backgroundColor: 'rgba(54, 191, 250, 0.1)',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h4 style={{ color: '#36bffa', fontWeight: 600, fontSize: '1.2rem', marginBottom: '4px', textAlign: 'center' }}>
              {group.foxGroup}
            </h4>
            {group.link && (
              <div style={{ textAlign: 'center', marginBottom: '3px' }}>
                <a href={group.link} target="_blank" rel="noopener noreferrer" style={{ color: '#808080', textDecoration: 'underline', fontWeight: 500 }}>
                  Group
                </a>
              </div>
            )}
            <div style={{ color: '#808080', textAlign: 'center', marginBottom: '6px' }}>
              <span style={{ color: '#808080' }}>You own: </span>
              {myordinalsaddress ? (
                isLoading ? (
                  <span style={{ display: 'inline-flex', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', position: 'relative', top: '-5px' }}>
                    <PulseLoader color="#808080" size={4} />
                  </span>
                ) : (
                  <span style={{ color: '#808080' }}>
                    {group.group.filter(fox => ownedFoxes.some(ownedFox => 
                      (ownedFox.origin?.outpoint === fox["origin.outpoint"]) || 
                      (ownedFox.outpoint === fox["origin.outpoint"])
                    )).length}
                  </span>
                )
              ) : (
                <span>
                  <a 
                    onClick={() => handleConnect && handleConnect()}
                    style={{ color: '#808080', textDecoration: 'underline', cursor: 'pointer' }}
                  >Connect to view</a>
                </span>
              )}
              <span style={{ color: '#808080' }}> / {group.group.length}</span>
            </div>
            <ul className="image-container" style={{ 
              margin: 0,
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '0'
            }}>
              {group.group.map((fox, foxIndex) => {
                const isOwned = ownedFoxes.some(ownedFox => 
                  (ownedFox.origin?.outpoint === fox["origin.outpoint"]) || 
                  (ownedFox.outpoint === fox["origin.outpoint"])
                );
                return (
                  <li key={`${group.foxGroup}-${foxIndex}-${fox["origin.outpoint"]}`} style={{ 
                    border: '4px solid transparent',
                    transition: 'border-color 0.2s ease',
                    position: 'relative'
                  }} onMouseEnter={(e) => {
                    if (isOwned) {
                      e.currentTarget.style.borderColor = '#4CAF50';
                    } else if (available && available.includes(fox["origin.outpoint"])) {
                      e.currentTarget.style.borderColor = '#36bffa';
                    } else {
                      e.currentTarget.style.borderColor = '#f44336';
                    }
                  }} onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                  }}>
                    {/* Yours Badge */}
                    {isOwned && (
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        zIndex: 10,
                        transition: 'background-color 0.2s ease',
                        cursor: 'pointer'
                      }} onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2E7D32';
                      }} onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#4CAF50';
                      }}>
                        Yours
                      </div>
                    )}
                    
                    {/* Available Badge */}
                    {!isOwned && available && available.includes(fox["origin.outpoint"]) && (
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        backgroundColor: '#36bffa',
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        zIndex: 10,
                        transition: 'background-color 0.2s ease',
                        cursor: 'pointer'
                      }} onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1976d2';
                      }} onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#36bffa';
                      }}>
                        Available
                      </div>
                    )}
                    
                    {/* Taken Badge */}
                    {!isOwned && (!available || !available.includes(fox["origin.outpoint"])) && (
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        zIndex: 10,
                        transition: 'background-color 0.2s ease',
                        cursor: 'pointer'
                      }} onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#d32f2f';
                      }} onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f44336';
                      }}>
                        Taken
                      </div>
                    )}
                    <a href={`https://alpha.1satordinals.com/outpoint/${fox["origin.outpoint"].replace(':', '_')}/inscription`} target="_blank" rel="noopener noreferrer">
                      <img 
                        src={`https://ordinals.gorillapool.io/content/${fox["origin.outpoint"]}`}
                        alt={fox.foxData.foxName}
                        className="seventraitfoxes"
                      />
                    </a>
                    <span className="FoxTitle" style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minHeight: '50px',
                      justifyContent: 'center',
                      marginBottom: '2px',
                      fontSize: isMobile ? '13px' : '15px'
                    }}>
                      <a href={`https://alpha.1satordinals.com/outpoint/${fox["origin.outpoint"].replace(':', '_')}/inscription`} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: isMobile ? '13px' : '15px'
                      }}>
                        {fox.foxData.foxName}
                      </a>
                    </span>
                    <div className="ResultsTraits" style={{ 
                      fontSize: isMobile ? '13px' : '15px',
                      marginTop: '2px',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                      maxWidth: '100%',
                      lineHeight: '1.2',
                      minHeight: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}>{fox.foxData.pixelFoxName}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {visibleGroups['5x'] < bounty5xGroups.length && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <ShowMoreGroupsButton onClick={() => handleShowMore('5x')} text="Show More 5x Groups" />
          </div>
        )}
      </div>

      {/* 10x Groups */}
      <div>
        <div className="H3Wrapper">
          <h3>
            Bounty Foxes 10x Groups ({bounty10xGroups.length})
          </h3>
        </div>
        {bounty10xGroups.slice(0, visibleGroups['10x']).map((group, groupIndex) => (
          <div key={groupIndex} style={{
            backgroundColor: 'rgba(54, 191, 250, 0.1)',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h4 style={{ color: '#36bffa', fontWeight: 600, fontSize: '1.2rem', marginBottom: '4px', textAlign: 'center' }}>
              {group.foxGroup}
            </h4>
            {group.link && (
              <div style={{ textAlign: 'center', marginBottom: '3px' }}>
                <a href={group.link} target="_blank" rel="noopener noreferrer" style={{ color: '#808080', textDecoration: 'underline', fontWeight: 500 }}>
                  Group
                </a>
              </div>
            )}
            <div style={{ color: '#808080', textAlign: 'center', marginBottom: '6px' }}>
              <span style={{ color: '#808080' }}>You own: </span>
              {myordinalsaddress ? (
                isLoading ? (
                  <span style={{ display: 'inline-flex', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', position: 'relative', top: '-5px' }}>
                    <PulseLoader color="#808080" size={4} />
                  </span>
                ) : (
                  <span style={{ color: '#808080' }}>
                    {group.group.filter(fox => ownedFoxes.some(ownedFox => 
                      (ownedFox.origin?.outpoint === fox["origin.outpoint"]) || 
                      (ownedFox.outpoint === fox["origin.outpoint"])
                    )).length}
                  </span>
                )
              ) : (
                <span>
                  <a 
                    onClick={() => handleConnect && handleConnect()}
                    style={{ color: '#808080', textDecoration: 'underline', cursor: 'pointer' }}
                  >Connect to view</a>
                </span>
              )}
              <span style={{ color: '#808080' }}> / {group.group.length}</span>
            </div>
            <ul className="image-container" style={{ 
              margin: 0,
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '0'
            }}>
              {group.group.map((fox, foxIndex) => {
                const isOwned = ownedFoxes.some(ownedFox => 
                  (ownedFox.origin?.outpoint === fox["origin.outpoint"]) || 
                  (ownedFox.outpoint === fox["origin.outpoint"])
                );
                return (
                  <li key={`${group.foxGroup}-${foxIndex}-${fox["origin.outpoint"]}`} style={{ 
                    border: '4px solid transparent',
                    transition: 'border-color 0.2s ease',
                    position: 'relative'
                  }} onMouseEnter={(e) => {
                    if (isOwned) {
                      e.currentTarget.style.borderColor = '#4CAF50';
                    } else if (available && available.includes(fox["origin.outpoint"])) {
                      e.currentTarget.style.borderColor = '#36bffa';
                    } else {
                      e.currentTarget.style.borderColor = '#f44336';
                    }
                  }} onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                  }}>
                    {/* Yours Badge */}
                    {isOwned && (
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        zIndex: 10,
                        transition: 'background-color 0.2s ease',
                        cursor: 'pointer'
                      }} onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2E7D32';
                      }} onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#4CAF50';
                      }}>
                        Yours
                      </div>
                    )}
                    
                    {/* Available Badge */}
                    {!isOwned && available && available.includes(fox["origin.outpoint"]) && (
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        backgroundColor: '#36bffa',
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        zIndex: 10,
                        transition: 'background-color 0.2s ease',
                        cursor: 'pointer'
                      }} onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1976d2';
                      }} onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#36bffa';
                      }}>
                        Available
                      </div>
                    )}
                    
                    {/* Taken Badge */}
                    {!isOwned && (!available || !available.includes(fox["origin.outpoint"])) && (
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        zIndex: 10,
                        transition: 'background-color 0.2s ease',
                        cursor: 'pointer'
                      }} onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#d32f2f';
                      }} onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f44336';
                      }}>
                        Taken
                      </div>
                    )}
                    <a href={`https://alpha.1satordinals.com/outpoint/${fox["origin.outpoint"].replace(':', '_')}/inscription`} target="_blank" rel="noopener noreferrer">
                      <img 
                        src={`https://ordinals.gorillapool.io/content/${fox["origin.outpoint"]}`}
                        alt={fox.foxData.foxName}
                        className="seventraitfoxes"
                      />
                    </a>
                    <span className="FoxTitle" style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minHeight: '50px',
                      justifyContent: 'center',
                      marginBottom: '2px',
                      fontSize: isMobile ? '13px' : '15px'
                    }}>
                      <a href={`https://alpha.1satordinals.com/outpoint/${fox["origin.outpoint"].replace(':', '_')}/inscription`} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: isMobile ? '13px' : '15px'
                      }}>
                        {fox.foxData.foxName}
                      </a>
                    </span>
                    <div className="ResultsTraits" style={{ 
                      fontSize: isMobile ? '13px' : '15px',
                      marginTop: '2px',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                      maxWidth: '100%',
                      lineHeight: '1.2',
                      minHeight: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}>{fox.foxData.pixelFoxName}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {visibleGroups['10x'] < bounty10xGroups.length && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <ShowMoreGroupsButton onClick={() => handleShowMore('10x')} text="Show More 10x Groups" />
          </div>
        )}
      </div>
    </div>
  );
};

export default BountyFoxesGroups; 