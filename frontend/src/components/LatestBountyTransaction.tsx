import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ThreeCircles } from 'react-loader-spinner';

interface LatestBountyTransactionProps {
  bountyTransactions?: ActivityArray[];
  bountyLoading?: boolean;
  userTagged?: boolean; // New prop to indicate if user has been tagged
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

export const LatestBountyTransaction: React.FC<LatestBountyTransactionProps> = ({ bountyTransactions = [], bountyLoading = false, userTagged = false }) => {
  // State for blockchain data
  const [blockchainData, setBlockchainData] = useState<ActivityArray[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch existing bounty transactions from blockchain
  const fetchExistingBountyTransactions = useCallback(async (forceRefresh = false) => {
    // Prevent rapid re-fetching (minimum 30 seconds between fetches unless forced)
    const now = Date.now();
    if (!forceRefresh && isInitialized && (now - lastFetchTime) < 30000) {
      // // console.log('Skipping fetch - too soon since last fetch');
      return;
    }

    try {
      setLoading(true);
      // // console.log('Fetching existing bounty transactions from blockchain...');
      
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
      
      // // console.log('Existing bounty transactions found:', data.length);
      // // console.log('First bounty transactions data:', data[0]);
      
      // Convert blockchain data to ActivityArray format
      const existingBountyTransactions: ActivityArray[] = await Promise.all(data.map(async (item: any, index: number) => {
        // Fetch individual UTXO data to get full metadata
        try {
          const utxoResponse = await fetch(`https://ordinals.gorillapool.io/api/txos/${item.txid}_0`);
          const utxoData = await utxoResponse.json();
          // // console.log('UTXO data for', item.txid, ':', utxoData);
          
          const metadata = utxoData.data?.map || utxoData.map || {};
          // // console.log('Processing blockchain item:', item.txid, 'metadata:', metadata);
          
          // Parse the outpoints from metadata
          let outpoints = [];
          try {
            if (metadata.outpoints) {
              outpoints = JSON.parse(metadata.outpoints);
            }
          } catch (error) {
            // // console.error('Error parsing outpoints:', error);
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
          
          // // console.log('Created bounty metadata for', item.txid, ':', bountyFoxesMetadata);
          
          return {
            taggerowneraddress: metadata.address || utxoData.owner || 'Unknown',
            taggeroutpoint: '',
            taggerfoxname: 'Bounty Winner',
            taggerimage: '',
            taggerimagelink: '',
            taggeeowneraddress: metadata.address || utxoData.owner || 'Unknown',
            taggeeoutpoint: '',
            taggeefoxname: 'Bounty Winner',
            taggeeimage: '',
            taggeeimagelink: '',
            time: metadata.time ? metadata.time.toString() : Date.now().toString(),
            txid: item.txid || '',
            bountyFoxesMetadata: bountyFoxesMetadata
          };
        } catch (error) {
          // // console.error('Error fetching UTXO data for', item.txid, ':', error);
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
      // // console.log('Processed existing bounty transactions:', existingBountyTransactions.length);
      
    } catch (error) {
      // // console.error('Error fetching existing bounty transactions:', error);
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
  
  // Filter out placeholder data and get only the latest transaction
  const latestTransaction = useMemo(() => {
    // // console.log('LatestBountyTransaction: Combined data length:', combinedData.length);
    // // console.log('LatestBountyTransaction: Combined data:', combinedData);
    
    const validTransactions = combinedData.filter(tx => 
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
      tx.taggeroutpoint !== undefined && 
      tx.taggerfoxname &&
      tx.taggerimage !== undefined &&
      tx.taggerimagelink !== undefined &&
      tx.taggeeowneraddress &&
      tx.taggeeoutpoint !== undefined &&
      tx.taggeefoxname &&
      tx.taggeeimage !== undefined &&
      tx.taggeeimagelink !== undefined &&
      tx.time &&
      tx.bountyFoxesMetadata &&
      tx.bountyFoxesMetadata.totalBountyFoxes > 0
    );
    
    // // console.log('LatestBountyTransaction: Valid transactions length:', validTransactions.length);
    // // console.log('LatestBountyTransaction: Latest transaction:', validTransactions[0]);
    
    return validTransactions[0]; // Return only the latest transaction
  }, [combinedData]);

  // Image cycling effect
  useEffect(() => {
    if (latestTransaction && latestTransaction.bountyFoxesMetadata?.bountyFoxes?.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => {
          const outpoints = latestTransaction.bountyFoxesMetadata?.bountyFoxes || [];
          return (prev + 1) % outpoints.length;
        });
      }, 2000); // Change image every 2 seconds

      return () => clearInterval(interval);
    }
  }, [latestTransaction]);



  // Initial fetch on component mount (only once)
  useEffect(() => {
    if (!isInitialized) {
      fetchExistingBountyTransactions(true); // Force initial fetch
    }
  }, [fetchExistingBountyTransactions, isInitialized]);

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

  // Helper function to get fox image from outpoint
  const getFoxImageFromOutpoint = (outpoint: string) => {
    // This would need to be implemented based on your fox image mapping
    // For now, return a placeholder or use a default image
    return `https://ordinals.gorillapool.io/content/${outpoint}`;
  };
  
  if (loading || bountyLoading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        backgroundColor: '#000',
        color: '#666'
      }}>
        {bountyLoading ? 'Processing bounty transaction...' : 'Loading latest bounty transaction...'}
      </div>
    );
  }

  if (!latestTransaction) {
    // Only show the waiting message if the user has been tagged
    if (userTagged) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: '#000',
          width: '100%',
          display: 'block'
        }}>
          <div className="H3Wrapper">
            <h3>Latest Bounty Transaction</h3>
          </div>
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            backgroundColor: '#000',
            color: '#666',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100px'
          }}>
            <ThreeCircles color="#ffd700" height="30" width="30" />
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              Waiting for bounty transactions...
            </div>
          </div>
        </div>
      );
    } else {
      // Don't show anything if user hasn't been tagged
      return null;
    }
  }
  
  const outpoints = latestTransaction.bountyFoxesMetadata?.bountyFoxes || [];
  const currentOutpoint = outpoints[currentImageIndex];
  const currentImage = currentOutpoint ? getFoxImageFromOutpoint(currentOutpoint) : '';
  
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      backgroundColor: '#000',
      width: '100%',
      display: 'block'
    }}>
      <div className="H3Wrapper">
        <h3>Latest Bounty Transaction</h3>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        padding: '20px',
        border: '2px solid #ffd700',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 215, 0, 0.05)'
      }}>
        {/* Bounty Fox Image */}
        {currentImage && (
          <div style={{ position: 'relative' }}>
            <a 
              href={`https://whatsonchain.com/tx/${latestTransaction.txid}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <img 
                src={currentImage} 
                alt={`Bounty Fox ${currentImageIndex + 1}`}
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '8px',
                  border: '3px solid #ffd700',
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
                top: '-10px',
                right: '-10px',
                backgroundColor: '#ffd700',
                color: '#000',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {currentImageIndex + 1}/{outpoints.length}
              </div>
            )}
          </div>
        )}

        {/* Transaction Info */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            color: '#ffd700', 
            fontSize: '18px', 
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>
            {(() => {
              const outpoints = latestTransaction.bountyFoxesMetadata?.bountyFoxes || [];
              const currentOutpoint = outpoints[currentImageIndex];
              
              // For 1x buckets, show the individual fox name
              if (latestTransaction.bountyFoxesMetadata?.bucketType === '1x' && latestTransaction.bountyFoxesMetadata?.foxName) {
                return `Bounty Fox ${latestTransaction.bountyFoxesMetadata.foxName}`;
              }
              
              // For group buckets, show the group name or cycling fox names
              if (latestTransaction.bountyFoxesMetadata?.groupName) {
                return latestTransaction.bountyFoxesMetadata.groupName;
              }
              
              // Fallback to generic name
              return `Bounty Fox ${currentImageIndex + 1}`;
            })()}
          </div>
          
          <div style={{ color: '#888', fontSize: '14px', marginBottom: '5px' }}>
            Winner: {latestTransaction.taggerowneraddress.slice(0, 8)}...{latestTransaction.taggerowneraddress.slice(-8)}
          </div>
          
          <div style={{ color: '#888', fontSize: '14px', marginBottom: '5px' }}>
            Bounty Foxes Found: {latestTransaction.bountyFoxesMetadata.totalBountyFoxes}
          </div>
          
          {/* Show pixel fox name if available */}
          {(() => {
            const outpoints = latestTransaction.bountyFoxesMetadata?.bountyFoxes || [];
            const currentOutpoint = outpoints[currentImageIndex];
            
            // For 1x buckets, show the pixel fox name
            if (latestTransaction.bountyFoxesMetadata?.bucketType === '1x' && latestTransaction.bountyFoxesMetadata?.pixelFoxName) {
              return (
                <div style={{ color: '#36bffa', fontSize: '14px', marginBottom: '5px' }}>
                  {latestTransaction.bountyFoxesMetadata.pixelFoxName}
                </div>
              );
            }
            
            // For group buckets, show cycling pixel fox names
            if (latestTransaction.bountyFoxesMetadata?.groupFoxes && latestTransaction.bountyFoxesMetadata.groupFoxes[currentImageIndex]) {
              return (
                <div style={{ color: '#36bffa', fontSize: '14px', marginBottom: '5px' }}>
                  {latestTransaction.bountyFoxesMetadata.groupFoxes[currentImageIndex].pixelFoxName}
                </div>
              );
            }
            
            return null;
          })()}
          
          <div style={{ color: '#888', fontSize: '12px', marginBottom: '10px' }}>
            {formatDate(latestTransaction.time)}
          </div>
          
          <div style={{ marginTop: '10px' }}>
            <a 
              href={`https://whatsonchain.com/tx/${latestTransaction.txid}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: '#ffd700', 
                textDecoration: 'underline',
                fontSize: '14px'
              }}
            >
              View Transaction: {latestTransaction.txid.slice(0, 6)}...{latestTransaction.txid.slice(-6)}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}; 