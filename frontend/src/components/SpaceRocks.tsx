import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CSSProperties } from 'react';
import { ShowMoreGroupsButton } from './ShowMoreGroupsButton';

interface SpaceRocksProps {
  spaceRocks?: SpaceRock[];
  spaceRocksCount?: number;
  latestBlockHash?: string;
  newSpaceRockTxid?: string;
  newSpaceRockTime?: number;
  spacerockActivities?: SpacerockActivity[];
  collectedSpaceRocks?: SpaceRock[];
}

interface SpacerockActivity {
  taggerowneraddress: string;
  taggeroutpoint: string;
  taggerfoxname: string;
  taggerimage: string;
  taggerimagelink: string;
  taggeeowneraddress: string;
  taggeeoutpoint: string;
  taggeefoxname: string;
  taggeeimage: string;
  taggeeimagelink: string;
  time: string;
  txid: string;
  spacerockMetadata?: {
    color: string;
    blockHeight: string;
    blockHash: string;
    spacerockName: string;
    ownerAddress?: string;
  };
}

interface SpaceRock {
  number: number;
  txid: string;
  outpoint: string;
  x: number;
  y: number;
  color: string;
  blockHeight: string;
  blockHash: string;
  time: string;
  spacerockName: string;
}

const SpaceRocks: React.FC<SpaceRocksProps> = ({ 
  spaceRocks = [], 
  spaceRocksCount = 0, 
  latestBlockHash = '',
  newSpaceRockTxid,
  newSpaceRockTime,
  spacerockActivities = [],
  collectedSpaceRocks = []
}) => {
  const [displayCount, setDisplayCount] = useState(5);
  const [allSpacerockData, setAllSpacerockData] = useState<SpacerockActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [blockchainData, setBlockchainData] = useState<SpacerockActivity[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Combine blockchain data with real-time activities
  const combineSpacerockData = useCallback((blockchainData: SpacerockActivity[], activities: SpacerockActivity[]) => {
    // Create a map of existing spacerocks by txid to avoid duplicates
    const spacerockMap = new Map<string, SpacerockActivity>();
    
    // Add blockchain data first
    blockchainData.forEach(spacerock => {
      if (spacerock.txid) {
        spacerockMap.set(spacerock.txid, spacerock);
      }
    });
    
    // Add or update with real-time activities
    activities.forEach(activity => {
      if (activity.txid && activity.spacerockMetadata) {
        spacerockMap.set(activity.txid, activity);
      }
    });
    
    // Convert map back to array and sort
    const combinedData = Array.from(spacerockMap.values()).sort((a, b) => {
      const aNum = parseInt(a.spacerockMetadata?.spacerockName?.replace('Space Rocks #', '') || '0');
      const bNum = parseInt(b.spacerockMetadata?.spacerockName?.replace('Space Rocks #', '') || '0');
      return bNum - aNum; // Reverse order - highest number first
    });
    
    return combinedData;
  }, []);

  // Fetch existing spacerocks from blockchain
  const fetchExistingSpacerocks = useCallback(async (forceRefresh = false) => {
    // Prevent rapid re-fetching (minimum 30 seconds between fetches unless forced)
    const now = Date.now();
    if (!forceRefresh && isInitialized && (now - lastFetchTime) < 30000) {
      // console.log('Skipping fetch - too soon since last fetch');
      return;
    }

    try {
      setLoading(true);
      // console.log('Fetching existing spacerocks from blockchain...');
      
      // Search for spacerock metadata using GorillaPool API
      const url = "https://ordinals.gorillapool.io/api/txos/search?limit=500";
      const options = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          "map": {
            "app": "foxplorer",
            "name": "Space Rocks",
            "type": "ord",
            "subType": "collectionItem"
          }
        })
      };
      
      const response = await fetch(url, options);
      const data = await response.json();
      
      // console.log('Existing spacerocks found:', data.length);
      // console.log('First spacerock data:', data[0]);
      
      // Convert blockchain data to SpacerockActivity format
      const existingSpacerocks: SpacerockActivity[] = await Promise.all(data.map(async (item: any, index: number) => {
        // Fetch individual UTXO data to get full metadata
        try {
          const utxoResponse = await fetch(`https://ordinals.gorillapool.io/api/txos/${item.txid}_0`);
          const utxoData = await utxoResponse.json();
          // console.log('UTXO data for', item.txid, ':', utxoData);
          
          const metadata = utxoData.data?.map || utxoData.map || {};
          // console.log('Processing blockchain item:', item.txid, 'metadata:', metadata);
          const number = metadata.spaceRocksName ? 
            parseInt(metadata.spaceRocksName.replace('Space Rocks #', '')) : 
            index + 1;
        
        const spacerockMetadata = {
          color: metadata.color || '#36bffa',
          blockHeight: metadata.latestBlockHeight?.toString() || 'Unknown',
          blockHash: metadata.latestBlockHash || 'Unknown',
          spacerockName: metadata.spaceRocksName || `Space Rocks #${number}`,
          ownerAddress: utxoData.owner || 'Unknown'
        };
        
        // console.log('Created spacerock metadata for', metadata.spaceRocksName, ':', spacerockMetadata);
        
        return {
          taggerowneraddress: utxoData.owner || 'Unknown',
          taggeroutpoint: utxoData.outpoint || '',
          taggerfoxname: `Space Rock #${number}`,
          taggerimage: '',
          taggerimagelink: '',
          taggeeowneraddress: utxoData.owner || 'Unknown',
          taggeeoutpoint: utxoData.outpoint || '',
          taggeefoxname: `Space Rock #${number}`,
          taggeeimage: '',
          taggeeimagelink: '',
          time: metadata.time ? metadata.time.toString() : Date.now().toString(),
          txid: item.txid || '',
          spacerockMetadata: spacerockMetadata
        };
      } catch (error) {
        // console.error('Error fetching UTXO data for', item.txid, ':', error);
        // Fallback with basic data
        const number = index + 1;
        return {
          taggerowneraddress: 'Unknown',
          taggeroutpoint: '',
          taggerfoxname: `Space Rock #${number}`,
          taggerimage: '',
          taggerimagelink: '',
          taggeeowneraddress: 'Unknown',
          taggeeoutpoint: '',
          taggeefoxname: `Space Rock #${number}`,
          taggeeimage: '',
          taggeeimagelink: '',
          time: Date.now().toString(),
          txid: item.txid || '',
          spacerockMetadata: {
            color: '#36bffa',
            blockHeight: 'Unknown',
            blockHash: 'Unknown',
            spacerockName: `Space Rocks #${number}`,
            ownerAddress: 'Unknown'
          }
        };
             }
       }));
      
      // Store blockchain data separately
      setBlockchainData(existingSpacerocks);
      setLastFetchTime(Date.now());
      setIsInitialized(true);
      // console.log('Processed existing spacerocks:', existingSpacerocks.length);
      
    } catch (error) {
      // console.error('Error fetching existing spacerocks:', error);
      setBlockchainData([]);
      setLastFetchTime(Date.now());
      setIsInitialized(true);
    } finally {
      setLoading(false);
    }
  }, [combineSpacerockData, isInitialized, lastFetchTime]);

  // Handle new spacerock
  const handleNewSpacerock = useCallback(async (txid: string, time: number) => {
    // Check if we already have this spacerock
    const existingSpacerock = blockchainData.find(spacerock => spacerock.txid === txid);
    if (existingSpacerock) {
      // console.log('Spacerock already exists:', txid);
      return;
    }

    try {
      // console.log('Fetching new spacerock data for txid:', txid);
      
      // Fetch the new spacerock data from the blockchain
      const response = await fetch(`https://ordinals.gorillapool.io/api/txos/${txid}_0`);
      const data = await response.json();
      
      if (data && data.map) {
        const metadata = data.map;
        const number = metadata.spaceRocksName ? 
          parseInt(metadata.spaceRocksName.replace('Space Rocks #', '')) : 
          blockchainData.length + 1;
        
        const newSpacerock: SpacerockActivity = {
          taggerowneraddress: data.address || 'Unknown',
          taggeroutpoint: data.outpoint || '',
          taggerfoxname: `Space Rock #${number}`,
          taggerimage: '',
          taggerimagelink: '',
          taggeeowneraddress: data.address || 'Unknown',
          taggeeoutpoint: data.outpoint || '',
          taggeefoxname: `Space Rock #${number}`,
          taggeeimage: '',
          taggeeimagelink: '',
          time: time.toString(),
          txid: txid,
          spacerockMetadata: {
            color: metadata.color || '#36bffa',
            blockHeight: metadata.latestBlockHeight?.toString() || 'Unknown',
            blockHash: metadata.latestBlockHash || 'Unknown',
            spacerockName: metadata.spaceRocksName || `Space Rocks #${number}`,
            ownerAddress: data.address || 'Unknown'
          }
        };
        
        // Add new spacerock to blockchain data
        setBlockchainData(prevData => {
          const updatedData = [...prevData, newSpacerock].sort((a, b) => {
            const aNum = parseInt(a.spacerockMetadata?.spacerockName?.replace('Space Rocks #', '') || '0');
            const bNum = parseInt(b.spacerockMetadata?.spacerockName?.replace('Space Rocks #', '') || '0');
            return bNum - aNum; // Reverse order - highest number first
          });
          return updatedData;
        });
        // console.log('Added new spacerock:', newSpacerock);
      }
    } catch (error) {
      // console.error('Error fetching new spacerock data:', error);
    }
  }, [blockchainData]);

  // Memoize combined data to prevent unnecessary re-renders
  const combinedData = useMemo(() => {
    return combineSpacerockData(blockchainData, spacerockActivities);
  }, [blockchainData, spacerockActivities, combineSpacerockData]);

  // Update allSpacerockData when combined data changes
  useEffect(() => {
    setAllSpacerockData(combinedData);
  }, [combinedData]);

  // Initial fetch on component mount (only once)
  useEffect(() => {
    if (!isInitialized) {
      fetchExistingSpacerocks(true); // Force initial fetch
    }
  }, [fetchExistingSpacerocks, isInitialized]);

  // Handle new spacerock transaction
  useEffect(() => {
    if (newSpaceRockTxid && newSpaceRockTime) {
      // console.log('New spacerock transaction:', newSpaceRockTxid, newSpaceRockTime);
      handleNewSpacerock(newSpaceRockTxid, newSpaceRockTime);
    }
  }, [newSpaceRockTxid, newSpaceRockTime, handleNewSpacerock]);

  const handleShowMore = useCallback(() => {
    setDisplayCount(prev => prev + 5);
  }, []);

  const hasData = allSpacerockData.length > 0;

  if (loading) {
    return (
      <div style={{ 
        width: '100%', 
        maxWidth: '100%', 
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        <div className="H3Wrapper">
          <h3>Space Rocks: Loading...</h3>
          <a 
            href="https://alpha.1satordinals.com/collection/5889aa0c3ec9736a49a30864cf700a9f7e9e6e422f8a720162c4bd350e1f9b00_0?tab=items" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              color: '#808080', 
              textDecoration: 'underline', 
              fontSize: '0.9em',
              display: 'block',
              marginTop: '-15px',
              marginLeft: '15px'
            }}
          > 
            View Collection
          </a>
        </div>
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: '#000',
          color: '#666'
        }}>
          Loading space rocks from blockchain...
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div style={{ 
        width: '100%', 
        maxWidth: '100%', 
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        <div className="H3Wrapper">
          <h3>Space Rocks: 0</h3>
          <a 
            href="https://alpha.1satordinals.com/collection/5889aa0c3ec9736a49a30864cf700a9f7e9e6e422f8a720162c4bd350e1f9b00_0?tab=items" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              color: '#808080', 
              textDecoration: 'underline', 
              fontSize: '0.9em',
              display: 'block',
              marginTop: '-15px',
              marginLeft: '15px'
            }}
          > 
            View Collection
          </a>
        </div>
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: '#000',
          color: '#666'
        }}>
          No space rocks have been collected yet.
        </div>
      </div>
    );
  }

  const visibleData = allSpacerockData.slice(0, displayCount);
  const hasMore = displayCount < allSpacerockData.length;

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '100%', 
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      <div className="H3Wrapper">
        <h3>Space Rocks: {allSpacerockData.length}</h3>
        <a 
          href="https://alpha.1satordinals.com/collection/5889aa0c3ec9736a49a30864cf700a9f7e9e6e422f8a720162c4bd350e1f9b00_0?tab=items" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ 
            color: '#808080', 
            textDecoration: 'underline', 
            fontSize: '0.9em',
            display: 'block',
            marginTop: '-15px',
            marginLeft: '15px'
          }}
        > 
          View Collection
        </a>
      </div>
      
      <div style={styles.activitiesGrid}>
        {visibleData.map((item, index) => {
          // Handle spacerock activities
          const activity = item as SpacerockActivity;
          const date = activity.time ? new Date(parseInt(activity.time)).toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }).replace(',', '') : 'Unknown time';
          
          const shortTxid = activity.txid ? `${activity.txid.slice(0, 6)}...${activity.txid.slice(-4)}` : 'Unknown';
          const txidLink = activity.txid ? `https://whatsonchain.com/tx/${activity.txid}` : '#';
          
          // Create dynamic SVG with the spacerock color
          const hexcolor = activity.spacerockMetadata?.color?.replace('#', '') || '36bffa';
          const dynamicSvg = `<svg width="800px" height="800px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="#000000">
<g id="spaceRock_bg" stroke-width="0"/>
<g id="spaceRock_tracer" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="10.24">
<path fill="#000000" d="M228.813 23L68.75 72.28 39.5 182.095l47.53-21.22 10.44-4.655 2.5 11.155 8.75 39.125 6.405 28.53-21.75-19.53-15.72-14.125-28.218 32.344 140.657 136 9.656-40.69 7.53-31.874 10.407 31.063 54.72 163.592L432.343 465.5l45.75-202.938-84.563-148.718L228.814 23zm-57.688 49.875l-27.813 39.906-3.25 73.44-27.187-88.94 58.25-24.405zm17.844 93.406l113.124 155.25L407 355.407l-107.375-.844-110.656-128v-60.28zM79.312 330.25l140.125 153.125-5.563-65.875-134.563-87.25z"/>
</g>
<g id="spaceRock_icon">
<path fill="#${hexcolor}" d="M228.813 23L68.75 72.28 39.5 182.095l47.53-21.22 10.44-4.655 2.5 11.155 8.75 39.125 6.405 28.53-21.75-19.53-15.72-14.125-28.218 32.344 140.657 136 9.656-40.69 7.53-31.874 10.407 31.063 54.72 163.592L432.343 465.5l45.75-202.938-84.563-148.718L228.814 23zm-57.688 49.875l-27.813 39.906-3.25 73.44-27.187-88.94 58.25-24.405zm17.844 93.406l113.124 155.25L407 355.407l-107.375-.844-110.656-128v-60.28zM79.312 330.25l140.125 153.125-5.563-65.875-134.563-87.25z"/>
</g>
</svg>`;
          
          const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(dynamicSvg)));

          return (
            <div 
              key={`activity-${index}`} 
              style={{
                ...styles.activityCard,
                border: '4px solid #000000',
                transition: 'border-color 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = activity.spacerockMetadata?.color || '#36bffa';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#000000';
              }}
            >
              <div style={styles.activityHeader}>
                <img 
                  src={svgDataUrl}
                  alt={`Space Rock Activity`}
                  style={styles.activitySpacerockImage}
                />
                <div style={{
                  ...styles.activityTitle,
                  fontSize: '1em',
                  color: activity.spacerockMetadata?.color || '#36bffa'
                }}>
                  {activity.spacerockMetadata?.spacerockName || 
                   (activity.taggeefoxname ? activity.taggeefoxname.replace(/^.*?#/, '') : 'Space Rock Collision')}
                </div>
              </div>
              
              <div style={styles.activityInfo}>
                
                <div style={styles.activityDetails}>
                  <div style={styles.activityBlock}>
                    Block: {activity.spacerockMetadata?.blockHeight || 'Unknown'}
                  </div>
                  <div style={styles.activityBlock}>
                    Hash: {activity.spacerockMetadata?.blockHash ? 
                      `${activity.spacerockMetadata.blockHash.slice(0, 8)}...` : 
                      'Unknown'}
                    {activity.spacerockMetadata?.blockHash && (
                      <span style={{ color: `#${activity.spacerockMetadata.blockHash.slice(-6)}` }}>
                        {activity.spacerockMetadata.blockHash.slice(-6)}
                      </span>
                    )}
                  </div>
                  <div style={styles.activityBlock}>
                    Color: <span style={{ color: activity.spacerockMetadata?.color || '#36bffa' }}>
                      #{(activity.spacerockMetadata?.color || '#36bffa').replace('#', '')}
                    </span>
                  </div>

                  <div style={{ ...styles.activityDate, fontSize: '0.8em' }}>{date}</div>
                  <div style={styles.activityLinks}>
                    <a href={txidLink} target="_blank" rel="noopener noreferrer" style={styles.activityLink}>
                      {shortTxid}
                    </a>
                    <a href={`https://alpha.1satordinals.com/outpoint/${activity.txid}_0/inscription`} target="_blank" rel="noopener noreferrer" style={styles.activityLink}>
                      Inscription
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {hasMore && (
        <div style={styles.showMoreContainer}>
          <ShowMoreGroupsButton onClick={handleShowMore} text="Show More Space Rocks" />
        </div>
      )}
    </div>
  );
};

const styles: Record<string, CSSProperties> = {
  grid: {
    background: '#000000',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '20px',
    padding: '20px',
    justifyContent: 'start',
    width: '100%',
    maxWidth: '100%',
    overflowX: 'hidden',
    boxSizing: 'border-box',
  },
  card: {
    background: '#000000',
    borderRadius: '0px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '0px',
    maxWidth: '100%',
  },
  info: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxWidth: '100%',
  },
  title: {
    color: '#36bffa',
    fontSize: '1em',
    textAlign: 'center',
    fontWeight: 'bold',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
  },
  date: {
    color: '#808080',
    fontSize: '0.9em',
    textAlign: 'center',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
  },
  coordinates: {
    color: '#ff6600',
    fontSize: '0.8em',
    textAlign: 'center',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
  },
  blockInfo: {
    color: '#888',
    fontSize: '0.8em',
    textAlign: 'center',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'center',
    maxWidth: '100%',
  },
  link: {
    color: '#808080',
    textDecoration: 'none',
    fontSize: '0.8em',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    textAlign: 'center',
  },
  showMoreContainer: {
    display: 'flex',
    justifyContent: 'start',
    padding: '20px',
    background: '#000000',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  activitiesGrid: {
    background: '#000000',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    padding: '20px',
    justifyContent: 'start',
    width: '100%',
    maxWidth: '100%',
    overflowX: 'hidden',
    boxSizing: 'border-box',
  },
  activityCard: {
    background: '#000000',
    borderRadius: '0px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  activityHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
  },
  activitySpacerockImage: {
    width: '100px',
    height: '100px',
    borderRadius: '0px',
  },
  activityTitle: {
    color: '#36bffa',
    fontSize: '1.2em',
    fontWeight: 'bold',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    textAlign: 'center',
  },
  activityInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  activityPlayer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  playerImage: {
    width: '40px',
    height: '40px',
    borderRadius: '5px',
  },
  playerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  playerName: {
    color: '#ffffff',
    fontSize: '0.9em',
    fontWeight: 'bold',
  },
  playerAddress: {
    color: '#888',
    fontSize: '0.8em',
    fontFamily: 'monospace',
  },
  activityDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  activityDate: {
    color: '#808080',
    fontSize: '0.9em',
  },
  activityBlock: {
    color: '#888',
    fontSize: '0.8em',
  },
  activityLinks: {
    display: 'flex',
    gap: '10px',
  },
  activityLink: {
    color: '#808080',
    textDecoration: 'underline',
    fontSize: '0.8em',
  },
};

export default SpaceRocks; 