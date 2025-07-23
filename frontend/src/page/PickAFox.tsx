import React, { useState, useEffect, useRef, useCallback } from "react";
import { FoxplorerLogoHome } from "../components/FoxplorerLogoHome";
import pickAFoxLogo from "../assets/pick_a_fox.png";
import { MyFox } from "../components/MyFox";
import { MyOtherFox } from "../components/MyOtherFox";
import { ThreeCircles } from 'react-loader-spinner';
import { XLogoRight } from "../components/XLogoRight";
import TemporaryDrawer from "../components/Drawer";
import FooterHome from "../components/FooterHome";
import { useLocation } from "react-router-dom";
import {
  usePandaWallet,
  Addresses
} from "panda-wallet-provider";
import mobileFriendlyFoxesData from "../assets/500MobileFriendlyFoxes.json";
import FriendlyFaucetFilters from "../components/FriendlyFaucetFilters";
import { LatestBountyTransaction } from "../components/LatestBountyTransaction";

type ActivityArray = {
  taggerowneraddress: string,
  taggeroutpoint: string,
  taggerfoxname: string,
  taggerimage: string,
  taggerimagelink: string,
  taggeeowneraddress: string,
  taggeeoutpoint: string,
  taggeefoxname: string,
  taggeeimage: string,
  taggeeimagelink: string,
  time: string,
  txid: string,
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


export const PickAFox = () => {

  const [ordaddress, setOrdAddress] = useState<string>();
  const [addresses, setAddresses] = useState<Addresses | undefined>();
  const [myordaddress, setMyOrdAddress] = useState<string | undefined>(undefined);

  //show actions menu
  const [showactions, setShowActions] = useState<boolean>(false);

  //loading
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  //ordinalsstring for Foxes Child Component
  const [ordinalsstring, setOrdinalsString] = useState<string | undefined>();

  //filters var => search results
  const [faucetvar, setFaucetVar] = useState<boolean>(true);
  const [myvar, setMyVar] = useState<boolean>(false);
  const [demovar, setDemoVar] = useState<boolean>(false);
  const [pickvar, setPickVar] = useState<boolean>(false);

  //useRefs
  const didMount1 = useRef(false);
  //get bstate from search results
  const state = useLocation();

  //tag var
  const [tag, setTag] = useState<boolean>(false);

  //activity
  const [tempactivity, setTempActivity] = useState<ActivityArray>();
  const [txidlink, setTxidLink] = useState<string>();
  const [inscriptionlink, setInscriptionLink] = useState<string>();
  const [tagdate, setTagDate] = useState<string>();
  const [txid, setTxid] = useState<string>();

  //bounty foxes
  const [bountyTransactions, setBountyTransactions] = useState<ActivityArray[]>([]);
  const [bountyLoading, setBountyLoading] = useState<boolean>(false);

  // Function to refresh user's foxes from blockchain
  const refreshUserFoxes = useCallback(async () => {
    if (!myordaddress) return;
    
   // console.log('PickAFox: Refreshing user foxes for address:', myordaddress);
    setBountyLoading(true);
    
    try {
      let result = myordaddress.trim();
      const response = await fetch("https://ordinals.gorillapool.io/api/txos/address/" + result + "/unspent?limit=300000", {
        method: "GET",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
    //  console.log('PickAFox: Refreshed fox data:', data.length, 'foxes');
      setOrdinalsString(JSON.stringify(data));
    } catch (error) {
     // console.error('PickAFox: Error refreshing foxes:', error);
    } finally {
      setBountyLoading(false);
    }
  }, [myordaddress]);

  React.useEffect(() => {
    //(state.state.owneraddress)
    setMyOrdAddress(state.state.owneraddress)
    setOrdAddress(state.state.owneraddress)
    setTag(state.state.tag)

    //if activity, load top section
    if (state.state.activity) {
      setTempActivity(state.state.activity)
      let txidlinktemp = "https://whatsonchain.com/tx/" + state.state.txid;
      let inscriptionlinktemp = "https://alpha.1satordinals.com/outpoint/" + state.state.txid + "_0/inscription";
    
      let ggg: number = state.state.date;
     // console.log(ggg)
      let hhh = new Date(ggg).toLocaleString();
     //  console.log(hhh)
      setTxidLink(txidlinktemp)
      setInscriptionLink(inscriptionlinktemp)
      setTagDate(hhh)
      setTxid(state.state.txid)
      
      // Convert time to string for consistency
      if (state.state.activity) {
        state.state.activity.time = state.state.activity.time.toString();
      }
    }
    //temp
    // setOrdinalsString(JSON.stringify(demojson))
    // setLoaded(true)
    //end temp
  }, [])

  useEffect(() => {
    if (tag === true) {
      setPickVar(false)
      setMyVar(true) // Keep showing user's foxes after being tagged
    }
  }, [tag]);


  // get mobile friendly foxes still available to apply "TAKEN" buttons
  useEffect(() => {
    // if (!didMount1.current) {
    //   didMount1.current = true;
    //   return;
    // }
    // let result;
    // if (ordaddress) {
    //   result = ordaddress.trim();
    // }

    // //fetch
    // fetch("https://ordinals.gorillapool.io/api/txos/address/1FW75Wkv5zK6twHjuwGeEpGZ4AJPZEz4ED/unspent?limit=300000", {
    //   method: "GET",
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     // console.log(data)
    //       setOrdinalsString(JSON.stringify(mobileFriendlyFoxesData))
    //       setLoaded(true)
    //   })
    //   .catch((error) => console.log(error));
    
    // Set the ordinals string immediately
    setOrdinalsString(JSON.stringify(mobileFriendlyFoxesData));
    
    // Ensure loading screen shows for at least 2 seconds
    const startTime = Date.now();
    const minimumLoadingTime = 2000; // 2 seconds in milliseconds
    
    const checkLoadingTime = () => {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime >= minimumLoadingTime) {
        setLoaded(true);
      } else {
        setTimeout(checkLoadingTime, minimumLoadingTime - elapsedTime);
      }
    };
    
    checkLoadingTime();
  }, [ordaddress]);








  //go home 
  const goToIndex = async () => {
    window.location.href = "/";
  };

  //return jsx
  return (
    <div className="App">

      {!loaded && (
        <>
          <header className="App-header">
            <FoxplorerLogoHome onClick={goToIndex} />
            <div className="LoaderHeight">
              <div id="error"></div>
              <ThreeCircles color="black" height="50"
                width="50" />
            </div>
            <MyOtherFox /><MyFox />
          </header>
        </>
      )}

      {loaded && (

        <>

          <div className="Topbar">
          <TemporaryDrawer />
            <img 
              src={pickAFoxLogo} 
              alt="Pick A Fox" 
              onClick={goToIndex}
              style={{
                height: 'clamp(20px, 6vw, 50px)',
                width: 'auto',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            />
            <a target="blank" href="https://twitter.com/yours_foxplorer"><XLogoRight /></a>
          </div>

          {/* Display connected address */}
          {myordaddress && (
            <div style={{
              margin: '20px 0',
              padding: '0 20px'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                maxWidth: 'fit-content'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <span style={{
                    color: '#36bffa',
                    fontSize: '14px',
                    fontWeight: '600',
                    letterSpacing: '0.5px'
                  }}>
                    {state.state?.walletType === 'mobile' ? 'SHUAllet' : 'Yours Wallet'} Connected
                  </span>
                  <span style={{
                    color: '#ffffff',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    letterSpacing: '0.5px'
                  }}>
                    Ord: {myordaddress}
                  </span>
                  {state.state?.walletType === 'mobile' && localStorage.getItem('walletAddress') && (
                    <span style={{
                      color: '#cccccc',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      letterSpacing: '0.5px'
                    }}>
                      Pay: {localStorage.getItem('walletAddress')}
                    </span>
                  )}
                  {/* Download backup link for mobile wallets */}
                  {state.state?.walletType === 'mobile' && (
                    <span style={{
                      marginTop: '8px',
                      display: 'block'
                    }}>
                      <button
                        onClick={() => {
                          if (window.backupWallet) {
                            window.backupWallet();
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#36bffa',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '0',
                          fontFamily: 'inherit'
                        }}
                      >
                        Download Backup
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}





          <div id="Faucet">
            <div style={{
              textAlign: 'center',
              margin: '20px 0'
            }}>
            <h3>Pick A Mobile-Friendly Fox</h3>
            </div>

            {tempactivity &&

              <div className="TaggedInfo">
                <h3>You Got Tagged</h3>
                {/* <h3>{tempactivity.taggerfoxname} tagged {tempactivity.taggeefoxname}</h3> */}
                <br />
                <div className="TaggedPlayers">
                  <a target="blank"
                    href={tempactivity.taggerimagelink}>
                    <img className="ActivityIt" src={tempactivity.taggerimage}
                      id={tempactivity.taggeroutpoint} />
                  </a>
                  <a target="blank"
                    href={tempactivity.taggeeimagelink}>
                    <img className="ActivityNotIt" src={tempactivity.taggeeimage}
                      id={tempactivity.taggeeoutpoint} />
                  </a>
                </div>
                <br />
                <span>
                            <a className="White" target="blank"
                              href={tempactivity.taggerimagelink}>{tempactivity.taggerfoxname}</a> tagged <a className="White" target="blank"
                                href={tempactivity.taggeeimagelink}>{tempactivity.taggeefoxname}</a>
                                </span>
                                <br />
                                {tagdate}<br /><br />
                              <a className="White" target="blank" href={txidlink}>  <u>View transaction</u></a>
                              <a className="White" target="blank" href={inscriptionlink}>  <u>View inscription</u></a><br />
                              
                              <br /><br />
                <h3>Pick Another Fox</h3>

              </div>
            }

            {/* Latest Bounty Transaction - moved here to be right after tagged activity */}
            <LatestBountyTransaction 
              bountyTransactions={bountyTransactions} 
              bountyLoading={bountyLoading} 
              userTagged={!!tempactivity}
            />

          </div>
          <FriendlyFaucetFilters ordinalsstring={ordinalsstring} myordinalsaddress={myordaddress} faucetvar={faucetvar} myvar={myvar} demovar={demovar} />
          
          <FooterHome />
          {/* <CreateGroupText groupordinalsstring={ordinalsstring} /> */}
          {/* <CreateJsonForAll groupordinalsstring={ordinalsstring} /> */}
        </>
      )}


    </div>
  );
};