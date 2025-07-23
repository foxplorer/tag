import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShowMoreGroupsButton } from './ShowMoreGroupsButton';

interface BountyHistoryProps {
  bountyTransactions?: ActivityArray[];
}

interface ActivityArray {
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
  bountyFoxesMetadata?: {
    bountyFoxes: any[];
    totalBountyFoxes: number;
    taggerRewarded: boolean;
    // Enhanced bucket information for frontend display
    bucketType?: string;
    bucketName?: string;
    bucketImage?: string;
    groupName?: string;
    groupLink?: string;
    groupOutpoint?: string;
    groupFoxes?: Array<{
      outpoint: string;
      foxName: string;
      pixelFoxName: string;
      img: string;
    }>;
    // Individual fox information for 1x buckets
    foxName?: string;
    pixelFoxName?: string;
    originOutpoint?: string;
  };
}

export const BountyHistory: React.FC<BountyHistoryProps> = ({ bountyTransactions = [] }) => {
  // Helper function to get fox image from outpoint
  const getFoxImageFromOutpoint = (outpoint: string) => {
    return `https://ordinals.gorillapool.io/content/${outpoint}`;
  };

  // State for pagination
  const [displayCount, setDisplayCount] = useState(5);
  
  // State for blockchain data
  const [blockchainData, setBlockchainData] = useState<ActivityArray[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({});

  // Fetch existing bounty transactions from blockchain
  const fetchExistingBountyTransactions = useCallback(async (forceRefresh = false) => {
    // Prevent rapid re-fetching (minimum 30 seconds between fetches unless forced)
    const now = Date.now();
    if (!forceRefresh && isInitialized && (now - lastFetchTime) < 30000) {
      // console.log('Skipping fetch - too soon since last fetch');
      return;
    }

    try {
      setLoading(true);
      // console.log('Fetching existing bounty transactions from blockchain...');
      
      // Search for bounty fox metadata using GorillaPool API
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
            "name": "bounty foxes",
            "type": "ord"
          }
        })
      };
      
      const response = await fetch(url, options);
      const data = await response.json();
      
      // console.log('Existing bounty transactions found:', data.length);
      // console.log('First bounty transactions data:', data[0]);
      // console.log('Search query used:', JSON.stringify({
      //   "map": {
      //     "app": "foxplorer",
      //     "name": "bounty foxes",
      //     "type": "ord"
      //   }
      // }));
      
      // If no results found, try a broader search
      let searchData = data;
      if (data.length === 0) {
        // console.log('No results found with exact match, trying broader search...');
        const broaderOptions = {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          body: JSON.stringify({
            "map": {
              "app": "foxplorer",
              "name": "bounty foxes"
            }
          })
        };
        
        const broaderResponse = await fetch(url, broaderOptions);
        searchData = await broaderResponse.json();
        // console.log('Broader search results:', searchData.length);
        
              // If still no results, try searching for any foxplorer app transactions
      if (searchData.length === 0) {
        // console.log('No bounty fox results found, checking for any foxplorer transactions...');
        const foxplorerOptions = {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          body: JSON.stringify({
            "map": {
              "app": "foxplorer"
            }
          })
        };
        
        const foxplorerResponse = await fetch(url, foxplorerOptions);
        const foxplorerData = await foxplorerResponse.json();
        // console.log('All foxplorer transactions found:', foxplorerData.length);
        if (foxplorerData.length > 0) {
          // console.log('Sample foxplorer transaction:', foxplorerData[0]);
          // console.log('Sample foxplorer transaction metadata:', foxplorerData[0].data?.map || foxplorerData[0].map);
        }
        
        // Also try searching for any transactions with "bounty foxes" in the name
        // console.log('Trying search for any transactions with "bounty foxes" in name...');
        const bountyOptions = {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
                  body: JSON.stringify({
          "map": {
            "name": "bounty foxes"
          }
        })
        };
        
        const bountyResponse = await fetch(url, bountyOptions);
        const bountyData = await bountyResponse.json();
        // console.log('Transactions with "bounty foxes" in name found:', bountyData.length);
        if (bountyData.length > 0) {
          // console.log('Sample bounty transaction:', bountyData[0]);
          // console.log('Sample bounty transaction metadata:', bountyData[0].data?.map || bountyData[0].map);
        }
      }
      }
      
      // Convert blockchain data to ActivityArray format
      const existingBountyTransactions: ActivityArray[] = await Promise.all(searchData.map(async (item: any, index: number) => {
        // Fetch individual UTXO data to get full metadata
        try {
          const utxoResponse = await fetch(`https://ordinals.gorillapool.io/api/txos/${item.txid}_0`);
          const utxoData = await utxoResponse.json();
          // console.log('UTXO data for', item.txid, ':', utxoData);
          
          const metadata = utxoData.data?.map || utxoData.map || {};
          // console.log('Processing blockchain item:', item.txid, 'metadata:', metadata);
          
          // Parse the outpoints from metadata
          let outpoints = [];
          try {
            if (metadata.outpoints) {
              outpoints = JSON.parse(metadata.outpoints);
            }
          } catch (error) {
            // console.error('Error parsing outpoints:', error);
          }
          
          const bountyFoxesMetadata = {
            bountyFoxes: outpoints,
            totalBountyFoxes: outpoints.length,
            taggerRewarded: true, // Assume rewarded if it's on blockchain
            // Enhanced bucket information if available
            bucketType: metadata.bucketType,
            bucketName: metadata.bucketName,
            bucketImage: metadata.bucketImage,
            groupName: metadata.groupName,
            groupLink: metadata.groupLink,
            groupOutpoint: metadata.groupOutpoint,
            groupFoxes: metadata.groupFoxes,
            foxName: metadata.foxName,
            pixelFoxName: metadata.pixelFoxName,
            originOutpoint: metadata.originOutpoint
          };
          
          // console.log('Created bounty metadata for', item.txid, ':', bountyFoxesMetadata);
          // console.log('Full transaction data for', item.txid, ':', {
          //   txid: item.txid,
          //   outpoint: item.outpoint,
          //   address: utxoData.owner,
          //   metadata: metadata
          // });
          
          // Ensure we have a valid txid - use the actual txid from the blockchain
          const validTxid = item.txid || '';
          // console.log('Valid txid for transaction:', validTxid);
          
          // Generate fox images from outpoints
          const bountyOutpoints = bountyFoxesMetadata.bountyFoxes || [];
          const firstOutpoint = bountyOutpoints[0] || '';
          const foxImage = firstOutpoint ? getFoxImageFromOutpoint(firstOutpoint) : '';
          const foxImageLink = firstOutpoint ? `https://alpha.1satordinals.com/outpoint/${firstOutpoint}/inscription` : '';
          
          return {
            taggerowneraddress: metadata.address || utxoData.owner || 'Unknown',
            taggeroutpoint: firstOutpoint,
            taggerfoxname: 'Bounty Winner',
            taggerimage: foxImage,
            taggerimagelink: foxImageLink,
            taggeeowneraddress: metadata.address || utxoData.owner || 'Unknown',
            taggeeoutpoint: firstOutpoint,
            taggeefoxname: 'Bounty Winner',
            taggeeimage: foxImage,
            taggeeimagelink: foxImageLink,
            time: metadata.time ? metadata.time.toString() : Date.now().toString(),
            txid: validTxid,
            bountyFoxesMetadata: bountyFoxesMetadata
          };
        } catch (error) {
          // console.error('Error fetching UTXO data for', item.txid, ':', error);
          // Fallback with basic data
          return {
            taggerowneraddress: 'Unknown',
            taggeroutpoint: '',
            taggerfoxname: 'Bounty Winner',
            taggerimage: '',
            taggerimagelink: '',
            taggeeowneraddress: 'Unknown',
            taggeeoutpoint: '',
            taggeefoxname: 'Bounty Winner',
            taggeeimage: '',
            taggeeimagelink: '',
            time: Date.now().toString(),
            txid: item.txid || '',
            bountyFoxesMetadata: {
              bountyFoxes: [],
              totalBountyFoxes: 0,
              taggerRewarded: false
            }
          };
        }
      }));
      
      // Store blockchain data separately
      setBlockchainData(existingBountyTransactions);
      setLastFetchTime(Date.now());
      setIsInitialized(true);
      // console.log('Processed existing bounty transactions:', existingBountyTransactions.length);
      
    } catch (error) {
      // console.error('Error fetching existing bounty transactions:', error);
      setBlockchainData([]);
      setLastFetchTime(Date.now());
      setIsInitialized(true);
    } finally {
      setLoading(false);
    }
  }, [isInitialized, lastFetchTime]);

  // Combine blockchain data with real-time activities
  const combineBountyData = useCallback((blockchainData: ActivityArray[], activities: ActivityArray[]) => {
    // Create a map of existing bounty transactions by txid to avoid duplicates
    const bountyMap = new Map<string, ActivityArray>();
    
    // Add blockchain data first
    blockchainData.forEach(bounty => {
      if (bounty.txid) {
        bountyMap.set(bounty.txid, bounty);
      }
    });
    
    // Add or update with real-time activities
    activities.forEach(activity => {
      if (activity.txid && activity.bountyFoxesMetadata) {
        bountyMap.set(activity.txid, activity);
      }
    });
    
    // Convert map back to array and sort by time (newest first)
    const combinedData = Array.from(bountyMap.values()).sort((a, b) => {
      const aTime = parseInt(a.time) || 0;
      const bTime = parseInt(b.time) || 0;
      return bTime - aTime; // Reverse order - newest first
    });
    
    return combinedData;
  }, []);

  // Memoize combined data to prevent unnecessary re-renders
  const combinedData = useMemo(() => {
    return combineBountyData(blockchainData, bountyTransactions);
  }, [blockchainData, bountyTransactions, combineBountyData]);
  
  // Filter out placeholder data and memoize the transactions to prevent unnecessary re-renders
  const memoizedTransactions = useMemo(() => {
    return combinedData.filter(tx => 
      // Filter out placeholder data that has "string" values
      tx.txid !== "string" && 
      tx.taggerowneraddress !== "string" && 
      tx.taggeroutpoint !== "string" && 
      tx.taggerfoxname !== "string" &&
      tx.taggerimage !== "string" &&
      tx.taggerimagelink !== "string" &&
      tx.taggeeowneraddress !== "string" &&
      tx.taggeeoutpoint !== "string" &&
      tx.taggeefoxname !== "string" &&
      tx.taggeeimage !== "string" &&
      tx.taggeeimagelink !== "string" &&
      tx.time !== "string" &&
      // Ensure we have valid data
      tx.txid && 
      tx.taggerowneraddress && 
      tx.taggeroutpoint && 
      tx.taggerfoxname &&
      tx.taggerimage &&
      tx.taggerimagelink &&
      tx.taggeeowneraddress &&
      tx.taggeeoutpoint &&
      tx.taggeefoxname &&
      tx.taggeeimage &&
      tx.taggeeimagelink &&
      tx.time &&
      tx.bountyFoxesMetadata &&
      tx.bountyFoxesMetadata.totalBountyFoxes > 0
    );
  }, [combinedData]);



  // Image cycling effect for bounty fox images
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    
    memoizedTransactions.forEach((tx, index) => {
      const outpoints = tx.bountyFoxesMetadata?.bountyFoxes || [];
      if (outpoints.length > 1) {
        const interval = setInterval(() => {
          setImageIndices(prev => ({
            ...prev,
            [index]: ((prev[index] || 0) + 1) % outpoints.length
          }));
        }, 3000); // Change image every 3 seconds
        
        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [memoizedTransactions]);

  // Initial fetch on component mount (only once)
  useEffect(() => {
    if (!isInitialized) {
      fetchExistingBountyTransactions(true); // Force initial fetch
    }
  }, [fetchExistingBountyTransactions, isInitialized]);

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  // Helper function to safely format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown time';
      }
      return date.toLocaleString();
    } catch (error) {
      return 'Unknown time';
    }
  };
  
  if (loading) {
    return (
      <>
        <div className="H3Wrapper">
          <h3>Recent Bounty Foxes:</h3>
          <a 
            href="/bountyfoxes" 
            style={{ 
              color: '#808080', 
              textDecoration: 'underline', 
              fontSize: '0.9em',
              display: 'block',
              marginTop: '-15px',
              marginLeft: '15px'
            }}
          > 
            View All Bounty Foxes
          </a>
          <a 
            href="https://ordinals.gorillapool.io/content/7a85e1d3de33e43c3706ae21fe93e41a88ae08b58b7b6f124f6ccc4827d26cc3_0" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              color: '#808080', 
              textDecoration: 'underline', 
              fontSize: '0.9em',
              display: 'block',
              marginTop: '5px',
              marginLeft: '15px'
            }}
          > 
            Group for bounty foxes
          </a>
        </div>
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: '#000',
          color: '#666'
        }}>
          Loading bounty fox transactions from blockchain...
        </div>
      </>
    );
  }
  
  return (
    <>
    <div className="H3Wrapper">
      <h3>Recent Bounty Foxes: {memoizedTransactions.length}</h3>
      <a 
        href="/bountyfoxes" 
        style={{ 
          color: '#808080', 
          textDecoration: 'underline', 
          fontSize: '0.9em',
          display: 'block',
          marginTop: '-15px',
          marginLeft: '15px'
        }}
      > 
        View All Bounty Foxes
      </a>
      <a 
        href="https://ordinals.gorillapool.io/content/7a85e1d3de33e43c3706ae21fe93e41a88ae08b58b7b6f124f6ccc4827d26cc3_0" 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ 
          color: '#808080', 
          textDecoration: 'underline', 
          fontSize: '0.9em',
          display: 'block',
          marginTop: '5px',
          marginLeft: '15px'
        }}
      > 
        Group
      </a>
    </div>
    
    <div style={{ 
      padding: '20px', 
      textAlign: 'left', 
      backgroundColor: '#000',
      width: '100%',
      display: 'block'
    }}>

      {memoizedTransactions.length === 0 ? (
        <div style={{ color: '#666', textAlign: 'left', padding: '5px 20px', marginTop: '0' }}>
          <p>No recent Bounty Foxes transactions.</p>
        </div>
      ) : (
        <>
          {/* Spreadsheet Rows */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1px',
            backgroundColor: '#000'
          }}>
            {memoizedTransactions.slice(0, displayCount).map((tx, index) => (
              <div key={index} style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth < 768 ? '40px 80px 1fr' : '40px 80px 1fr 120px 150px',
                gap: '1px',
                backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : '#000'
              }}>
                {/* Row Number */}
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: 'transparent', 
                  color: '#ffd700',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  {index + 1}
                </div>

                {/* Tagger Image */}
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: 'transparent', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {(() => {
                    const outpoints = tx.bountyFoxesMetadata?.bountyFoxes || [];
                    const currentIndex = imageIndices[index] || 0;
                    const currentOutpoint = outpoints[currentIndex];
                    const currentImage = currentOutpoint ? getFoxImageFromOutpoint(currentOutpoint) : tx.taggerimage;
                    
                    return currentImage && currentImage !== "string" ? (
                      <div style={{ position: 'relative' }}>
                        <a 
                          href={`https://whatsonchain.com/tx/${tx.txid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}
                        >
                          <img 
                            src={currentImage} 
                            alt={tx.taggerfoxname}
                            style={{ 
                              width: '60px', 
                              height: '60px', 
                              borderRadius: '4px',
                              border: '2px solid #ffd700',
                              cursor: 'pointer',
                              transition: 'border-color 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.borderColor = '#ffffff';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.borderColor = '#ffd700';
                            }}
                          />
                        </a>
                        {outpoints.length > 1 && (
                          <div style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            backgroundColor: '#ffd700',
                            color: '#000',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}>
                            {currentIndex + 1}/{outpoints.length}
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Bounty Event Info */}
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: 'transparent', 
                  color: '#ffd700',
                  fontSize: '14px',
                  flex: 1
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    <span style={{ color: '#ffd700' }}>
                      {(() => {
                        const outpoints = tx.bountyFoxesMetadata?.bountyFoxes || [];
                        const currentIndex = imageIndices[index] || 0;
                        const currentOutpoint = outpoints[currentIndex];
                        
                        // For 1x buckets, show the individual fox name
                        if (tx.bountyFoxesMetadata?.bucketType === '1x' && tx.bountyFoxesMetadata?.foxName) {
                          return `Bounty Fox ${tx.bountyFoxesMetadata.foxName}`;
                        }
                        
                        // For group buckets, show the group name or cycling fox names
                        if (tx.bountyFoxesMetadata?.groupName) {
                          return tx.bountyFoxesMetadata.groupName;
                        }
                        
                        // Fallback to generic name
                        return `Bounty Fox ${currentIndex + 1}`;
                      })()}
                    </span>
                  </div>
                  <div style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>
                    Winner: {tx.taggerowneraddress.slice(0, 8)}...{tx.taggerowneraddress.slice(-8)}
                  </div>
                  <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
                    Found: {tx.bountyFoxesMetadata.totalBountyFoxes} Bounty Foxes
                  </div>
                  {/* Show pixel fox name if available */}
                  {(() => {
                    const outpoints = tx.bountyFoxesMetadata?.bountyFoxes || [];
                    const currentIndex = imageIndices[index] || 0;
                    const currentOutpoint = outpoints[currentIndex];
                    
                    // For 1x buckets, show the pixel fox name
                    if (tx.bountyFoxesMetadata?.bucketType === '1x' && tx.bountyFoxesMetadata?.pixelFoxName) {
                      return (
                        <div style={{ color: '#36bffa', fontSize: '11px', marginBottom: '2px' }}>
                          {tx.bountyFoxesMetadata.pixelFoxName}
                        </div>
                      );
                    }
                    
                    // For group buckets, show cycling pixel fox names
                    if (tx.bountyFoxesMetadata?.groupFoxes && tx.bountyFoxesMetadata.groupFoxes[currentIndex]) {
                      return (
                        <div style={{ color: '#36bffa', fontSize: '11px', marginBottom: '2px' }}>
                          {tx.bountyFoxesMetadata.groupFoxes[currentIndex].pixelFoxName}
                        </div>
                      );
                    }
                    
                    return null;
                  })()}
                  
                  {/* Transaction Link */}
                  <div>
                    {tx.txid && tx.txid.length > 10 ? (
                      <a 
                        href={`https://whatsonchain.com/tx/${tx.txid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#f5f5f5', textDecoration: 'underline', fontSize: '11px' }}
                      >
                        {tx.txid.slice(0, 6)}...{tx.txid.slice(-6)}
                      </a>
                    ) : (
                      <span style={{ color: '#888', fontStyle: 'italic', fontSize: '11px' }}>
                        Transaction ID not available
                      </span>
                    )}
                  </div>
                  
                  {/* Time */}
                  <div style={{ 
                    marginTop: '4px',
                    color: '#666',
                    fontSize: '11px'
                  }}>
                    {formatDate(tx.time)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {displayCount < memoizedTransactions.length && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <ShowMoreGroupsButton onClick={handleShowMore} text="Show More Bounty Transactions" />
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
}; 