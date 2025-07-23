import { useState, useEffect, useRef } from "react";
import { ShowMoreButton } from "../components/ShowMoreButton";
import { ShowMoreGroupsButton } from "../components/ShowMoreGroupsButton";
import { GetAnotherButton } from "../components/GetAnotherButton";
import { PulseLoader } from 'react-spinners';
import { Button } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";
import _ from 'lodash';
import friendlygroup from "../assets/500MobileFriendlyFoxesGroup.json";



// Add FoxPopup component for modern popup style
interface FoxPopupProps {
  fox?: {
    img: string;
    name: string;
    outpoint: string;
    imgid: string;
    traits: string[];
    pixelFoxName?: string;
  };
  onClose: () => void;
  transactionId?: string;
  transactionTime?: number;
  errorMessage?: string | null;
  onRefresh: () => void;
  myordinalsaddress: string;
  ownedOutpoints: string[];
  taggedFoxes: string[];
}

const FoxPopup: React.FC<FoxPopupProps> = ({ fox, onClose, transactionId, transactionTime, errorMessage, onRefresh, myordinalsaddress, ownedOutpoints, taggedFoxes }) => {
  const [isLoading, setIsLoading] = useState(!transactionId);
  const navigate = useNavigate();

  useEffect(() => {
    if (transactionId) {
      setIsLoading(false);
    }
  }, [transactionId]);

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        touchAction: 'none'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid #36bffa',
          color: '#fff',
          width: window.innerWidth < 768 ? '70%' : '90%',
          maxWidth: '400px',
          textAlign: 'center'
        }}
      >
        {errorMessage ? (
          <div style={{ padding: '20px' }}>
            <div style={{ color: '#ff4444', marginBottom: '20px' }}>{errorMessage}</div>
            <button 
              onClick={onRefresh}
              style={{
                backgroundColor: 'transparent',
                color: '#36bffa',
                border: '2px solid #36bffa',
                padding: '8px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '700',
                width: '100%',
                maxWidth: '120px',
                transition: 'all 0.2s ease',
                textTransform: 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#36bffa';
                e.currentTarget.style.color = '#000000';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#36bffa';
              }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ color: '#36bffa', marginBottom: '20px' }}>
              {transactionId ? 'You got a fox!' : 'Getting fox...'}
            </h2>
            <img 
              src={fox?.img}
              alt="Fox"
              style={{ 
                width: '100%', 
                height: 'auto',
                maxHeight: '300px',
                objectFit: 'contain',
                marginBottom: '20px'
              }}
            />
            <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#36bffa', marginBottom: '10px' }}>
              {fox?.name}
            </div>
            <div style={{ marginBottom: '20px' }}>
              <a 
                href={`https://alpha.1satordinals.com/outpoint/${fox?.outpoint}/inscription`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#fff', 
                  textDecoration: 'underline',
                  fontSize: '14px',
                  display: 'block',
                  marginBottom: '20px'
                }}
              >
                View on 1Sat Ordinals
              </a>
            </div>
            {!transactionId ? (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                  <PulseLoader color="#ffffff" size={8} />
                </div>
                <p style={{ color: '#fff', marginTop: '10px' }}>Waiting for transaction...</p>
              </div>
            ) : (
              <div style={{ marginBottom: '20px' }}>
                <a 
                  href={`https://whatsonchain.com/tx/${transactionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#fff', 
                    textDecoration: 'underline',
                    wordBreak: 'break-all',
                    fontSize: '14px',
                    display: 'block',
                    marginBottom: '20px'
                  }}
                >
                  {transactionId.slice(0, 8)}...{transactionId.slice(-8)}
                </a>
                <button 
                  onClick={() => {
                    // Navigate to TagWithFox page with fox data
                    navigate("/tagwithfox", { 
                      state: { 
                        tags: 0, // Will be calculated on the tag page
                        taggedfoxes: taggedFoxes.filter(fox => ownedOutpoints.includes(fox)).length,
                        outpoint: fox?.outpoint,
                        originoutpoint: fox?.imgid,
                        owneraddress: myordinalsaddress,
                        foxes: ownedOutpoints.length,
                        foxname: fox?.name,
                        pixelFoxName: fox?.pixelFoxName || 'Unknown Pixel Fox'
                      } 
                    });
                  }}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '700',
                    width: '100%',
                    maxWidth: '120px',
                    transition: 'background-color 0.2s ease',
                    textTransform: 'none',
                    marginBottom: '10px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#45a049';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#4CAF50';
                  }}
                >
                  Play Tag
                </button>
                <a 
                  onClick={onClose}
                  style={{
                    color: '#36bffa',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'block'
                  }}
                >
                  Close
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

type FriendlyFaucetSearchResultsProps = {
  foxesonly: string;
  ordinalsstring: string;
  myordinalsaddress: string;
  faucetvar: boolean;
  myvar: boolean;
  demovar: boolean;
  handleConnect: () => void;
  newOutpoints: string[];
  ownedOutpoints?: string[];
  todisplay: string,
  background: string,
  name: string,
  body: string,
  mouth: string,
  head: string,
  eyes: string,
  item: string,
  totalresults: number,
  clearFilters: () => void,
  passedFunctionFromFilters: () => void,
  passedFunctionFoxLoadingScreen: (boolean) => void,
  setsearchloading: boolean,
  allUtxos?: string;
  foxType?: 'lucky' | 'disappearing' | 'rolling' | 'falling' | 'mobile-friendly';
  onNewFoxClaimed?: (outpoint: string) => void;
}

type ToDisplay = {
  title: string;
  name: string;
  link: string;
  img: string;
  imgid: string;
  outpoint: string;
  owner: string;
  ownertrimmed: string;
  ownerlink: string;
  trait1: string;
  trait2: string;
  trait3: string;
  trait4: string;
  trait5: string;
  trait6: string;
  trait7: string;
  foxData?: {
    foxName: string;
    pixelFoxName: string;
  };
}

const FriendlyFaucetSearchResults: React.FC<FriendlyFaucetSearchResultsProps> = ({
  foxesonly,
  ordinalsstring,
  myordinalsaddress,
  faucetvar,
  myvar,
  demovar,
  handleConnect,
  newOutpoints,
  ownedOutpoints = [],
  todisplay,
  background,
  name,
  body,
  mouth,
  head,
  eyes,
  item,
  totalresults,
  clearFilters,
  passedFunctionFromFilters,
  passedFunctionFoxLoadingScreen,
  setsearchloading,
  allUtxos,
  foxType = 'mobile-friendly',
  onNewFoxClaimed
}) => {

  const navigate = useNavigate();

  //loading for results
  const [loading, setLoading] = useState<boolean>(true);
  const [availableLoading, setAvailableLoading] = useState<boolean>(true);
  const [numAvailable, setNumAvailable] = useState<number>(0);
  const [numOwned, setNumOwned] = useState<number>(0);
  const [connectLoading, setConnectLoading] = useState<boolean>(false);
  const [countLoading, setCountLoading] = useState<boolean>(true);

  //pass loading function to child
  const passedFunction = () => {
    setLoading(false);
    passedFunctionFromFilters();
  }


  // Modern popup state management
  const [showFoxPopup, setShowFoxPopup] = useState<boolean>(false);
  const [selectedFox, setSelectedFox] = useState<{
    img: string;
    name: string;
    outpoint: string;
    imgid: string;
    traits: string[];
    pixelFoxName?: string;
  } | undefined>();
  const [transactionId, setTransactionId] = useState<string | undefined>();
  const [transactionTime, setTransactionTime] = useState<number | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessingFox, setIsProcessingFox] = useState<boolean>(false);

  //display show more
  const [displayshowmore, setDisplayShowMore] = useState<boolean>(true);

  //set get fox buttons
  const [getfoxbuttons, setGetFoxButtons] = useState<string>("");
  const [available, setAvailable] = useState<string[]>([]);
  const [justtaken, setJustTaken] = useState<string[]>([]);
  const [foxesremaining, setFoxesRemaining] = useState<number>();
  //fox container
  const container = document.getElementById('error-container');

  //setnumresults
  const [foxresults, setFoxResults] = useState<number>(100);
  const [numresults, setNumResults] = useState<number | string>("?");

  // foxes to map
  const [displayfaucetfoxes, setDisplayFaucetFoxes] = useState<ToDisplay[]>([]);
  const [allProcessedFoxes, setAllProcessedFoxes] = useState<ToDisplay[]>([]);
  const [allFaucetFoxes, setAllFaucetFoxes] = useState<ToDisplay[]>([]);
  const [foxesDisplayed, setFoxesDisplayed] = useState<number>(50);

  // Your Lucky Foxes pagination
  const [ownedFoxesDisplayed, setOwnedFoxesDisplayed] = useState<number>(10);
  const [showMoreOwned, setShowMoreOwned] = useState<boolean>(false);

  // Add state for fading foxes
  const [fadingFoxes, setFadingFoxes] = useState<Set<string>>(new Set());
  const [fadeOutFoxes, setFadeOutFoxes] = useState<Set<string>>(new Set());
  const [fadeProgress, setFadeProgress] = useState<number>(0); // 0-1 for smooth transitions

  // Helper function to calculate fade opacity
  const getFadeOpacity = (imgid: string) => {
    if (fadeOutFoxes.has(imgid)) {
      // Smooth fade out: 1 -> 0
      return 1 - fadeProgress;
    }
    if (fadingFoxes.has(imgid)) {
      // Smooth fade in: 0 -> 1
      return fadeProgress;
    }
    return 1;
  };

  const addElement = (newElement) => {
    let c = [...displayfaucetfoxes, ...newElement];
    
    // Sort the combined array to display owned foxes first
    c.sort((a, b) => {
      const aIsOwned = ownedOutpoints.includes(a.imgid);
      const bIsOwned = ownedOutpoints.includes(b.imgid);
      
      if (aIsOwned && !bIsOwned) {
        return -1; // a comes first (owned)
      } else if (!aIsOwned && bIsOwned) {
        return 1; // b comes first (owned)
      } else {
        return 0; // both owned or both not owned, maintain original order
      }
    });
    
    setDisplayFaucetFoxes(c);
  };

  //showtwins
  const [showtwins, setShowTwins] = useState<boolean>(false);

  //useRefs
  const didMount = useRef(false);
  const didMount1 = useRef(false);

  // Update ownedOutpoints when newOutpoints changes
  useEffect(() => {
    if (newOutpoints.length > 0) {
      // The parent component will handle updating the ownedOutpoints
      // This effect ensures the UI updates when newOutpoints changes
      // console.log('New outpoints received:', newOutpoints);
      // console.log('Current ownedOutpoints:', ownedOutpoints);
    }
  }, [newOutpoints, ownedOutpoints]);

  // Re-sort foxes when ownedOutpoints changes
  useEffect(() => {
    if (allProcessedFoxes.length > 0) {
      // Display foxes in their original order without reordering
      // Only the button and badge will change, not the position
      setDisplayFaucetFoxes(allProcessedFoxes.slice(0, foxesDisplayed));
     // console.log('Displaying foxes in original order - positions unchanged.');
    }
  }, [ownedOutpoints, allProcessedFoxes, foxesDisplayed]);

  // Recalculate counts when ownedOutpoints changes
  useEffect(() => {
   // console.log('Recalculating counts. ownedOutpoints:', ownedOutpoints);
   // console.log('Total foxes:', totalresults);
    
    // Check which owned outpoints match foxes in allProcessedFoxes
    if (allProcessedFoxes.length > 0) {
      const matchingOwnedFoxes = allProcessedFoxes.filter(fox => ownedOutpoints.includes(fox.imgid));
    //  console.log('Matching owned foxes:', matchingOwnedFoxes.map(fox => fox.foxData?.foxName));
    //  console.log('Owned outpoints that match foxes:', ownedOutpoints.filter(outpoint => 
       // allProcessedFoxes.some(fox => fox.imgid === outpoint)
     // ));
    }
    
    // Update owned count based on ownedOutpoints length
    setNumOwned(ownedOutpoints.length);
    
    // Update available count (total - owned foxes)
    const newAvailableCount = Math.max(0, totalresults - ownedOutpoints.length);
   // console.log('New available count:', newAvailableCount);
   // console.log('Total foxes:', totalresults);
    //console.log('Owned foxes:', ownedOutpoints.length);
    //console.log('Available calculation: total - owned =', totalresults, '-', ownedOutpoints.length, '=', newAvailableCount);
    setNumAvailable(newAvailableCount);
    
    // Also update the available array to remove owned foxes
    if (allProcessedFoxes.length > 0) {
      const newAvailable = allProcessedFoxes
        .filter(fox => !ownedOutpoints.includes(fox.imgid))
        .map(fox => fox.imgid);
      setAvailable(newAvailable);
      console.log('Updated available array:', newAvailable);
    }
  }, [ownedOutpoints, totalresults, allProcessedFoxes, newOutpoints]);
  //resetLoading
  const resetLoading = () => {
    clearFilters()
  };







  // get inscriptions by faucet address to apply to getfox buttons
  useEffect(() => {
    //run immediately and on every page load
    //faucet address
    let result = "1FW75Wkv5zK6twHjuwGeEpGZ4AJPZEz4ED";

    //fetch
    fetch("https://ordinals.gorillapool.io/api/txos/address/" + result + "/unspent?limit=300000", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {        
        // Filter for foxes that are in both the faucet and friendlygroup
        const availableFoxes = data.filter(fox => 
          fox.origin?.data?.map?.subTypeData?.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0" &&
          friendlygroup.group.some(groupFox => groupFox["origin.outpoint"] === fox.origin.outpoint)
        );
        
        console.log('Initial available foxes count:', availableFoxes.length);
        console.log('Total foxes in faucet:', data.length);
        console.log('Friendly group foxes:', friendlygroup.group.length);
        
        // Only set initial available count if we don't have owned foxes yet
        // This prevents overriding the calculated count when foxes are claimed
        if (ownedOutpoints.length === 0) {
          setNumAvailable(availableFoxes.length);
        }
        setGetFoxButtons(JSON.stringify(data));
        setAvailableLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setAvailableLoading(false);
      });
  }, []);

  //get fox for fox screen
  const setResponseData = (data: string, claimedOutpoint?: string) => {
    console.log('setResponseData called with:', data);
    setIsProcessingFox(false);
    let hhh = JSON.parse(data);
    const result1 = String(data).includes('conflict');
    console.log('Parsed response:', hhh);
    console.log('Message check:', hhh.message);
    
    if (hhh.message != "broadcast successful") {
      console.log('Transaction failed, setting error message');
      setErrorMessage("Mempool conflict. Wait for a new block to be mined and then try again.")
      // setErrorMessage("Someone already got this fox. Refresh your browser to update available foxes.")
    } else {
      console.log('Transaction successful, processing...');
      // Use the transaction ID from the simulated response
      const txid = hhh.txid;
      setTransactionId(txid);
      setTransactionTime(Date.now());
      setErrorMessage(null);
      
      // Add the fox to newOutpoints so it appears in "Your Mobile-Friendly Foxes"
      if (claimedOutpoint) {
        console.log('Claiming fox with outpoint:', claimedOutpoint);
        
        // Find the fox data from the outpoint
        const foxData = allProcessedFoxes.find(fox => fox.outpoint === claimedOutpoint);
        if (foxData) {
          const newImgid = foxData.imgid;
          console.log('Found fox data:', foxData);
          console.log('Using imgid for claiming:', newImgid);
          
          // Call the parent function to update newOutpoints
          if (onNewFoxClaimed) {
            console.log('Calling onNewFoxClaimed with:', newImgid);
            onNewFoxClaimed(newImgid);
            console.log('onNewFoxClaimed called successfully');
          } else {
            console.log('onNewFoxClaimed function is not available');
          }
          
          // The useEffect will handle updating available array and counts
          console.log('Fox claimed successfully. useEffect will update counts and arrays.');
          
          console.log('After claiming - newOutpoints should be updated by parent');
          console.log('Current ownedOutpoints after claiming:', ownedOutpoints);
        } else {
          console.log('Fox data not found for outpoint:', claimedOutpoint);
        }
      } else {
        console.log('No claimedOutpoint provided for claiming');
      }
    }
  };

  //fox taken alert
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string>("");
  const [popupTitle, setPopupTitle] = useState<string>("");

  const taken = () => {
    setPopupTitle("Fox Taken");
    setPopupMessage("Someone already got this fox.");
    setShowPopup(true);
  };

    const isavailable = () => {
      setPopupTitle("Fox Available");
      setPopupMessage("This fox is still available.");
      setShowPopup(true);
    };

  const isyours = () => {
    setPopupTitle("Fox Is Yours");
    setPopupMessage("This fox is yours.");
    setShowPopup(true);
  };

  // get ord address
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    let buttonids = [];
    let dat = JSON.parse(getfoxbuttons || '[]');

    // Just collect the outpoints for available buttons
    for (let i = 0; i < dat.length; i++) {
      if (dat[i]?.origin?.outpoint) {
        buttonids.push(dat[i].origin.outpoint);
      }
    }

    // Filter out any foxes that are already owned
    const filteredButtonids = buttonids.filter(outpoint => !ownedOutpoints.includes(outpoint));
    
    setAvailable(filteredButtonids);
    // Don't set loading to false here as it interferes with the main fox processing
  }, [getfoxbuttons, ownedOutpoints]);


  const backToResults = () => {
    setShowFoxPopup(false);
    setSelectedFox(undefined);
    setTransactionId(undefined);
    setTransactionTime(undefined);
    setErrorMessage(null);
    setIsProcessingFox(false);
  };


  const getScript = async (myordinalsaddress: string, id: string, outpoint: string) => {
    //temp
    sendVarsToServer(myordinalsaddress, id, outpoint)
    // sendVarsToServer(myordinalsaddress, id, outpoint, data.script)
    //fetch
    //https://ordinals.gorillapool.io/api/txos/4b270882720d956b59364d581e43b36d854064760d6920e2d3e278f4f9cc546f_27?script=true
    // fetch("https://ordinals.gorillapool.io/api/txos/" + outpoint + "?script=true", {
    //   method: "GET",
    // })
    //   .then((response) => response.json())
    //   .then((data) => {

    //     // console.log(data + " = data")
    //     // set get fox buttons
    //     sendVarsToServer(myordinalsaddress, id, outpoint, data.script)
    //   }
    //   )
    //   .catch((error) => console.log(error));

  }

  //back to search results
  //sendvarstoserver
  //send addresses and avatar to server
  const sendVarsToServer = async (myordinalsaddress: string, id: string, outpoint: string) => {
 //   console.log("Sending request to server:", { id, address: myordinalsaddress, outpoint });
    
    // const url = "https://[your_server]/getfriendlyfaucetfox";
    const url = "http://localhost:9000/getfriendlyfaucetfox";
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({ 
        "id": id, 
        "address": myordinalsaddress, 
        "outpoint": outpoint,
        "outpoints": [outpoint] // Add outpoints array as expected by the endpoint
      })
    };
    
    try {
   //   console.log("Making fetch request to:", url);
      const response = await fetch(url, options);
    //  console.log("Fetch response status:", response.status);
      const data = await response.json();
    //  console.log("Server response:", data);
    //  console.log("About to call setResponseData with:", JSON.stringify(data));
      
      // Pass the outpoint to setResponseData so we can use it for claiming
      setResponseData(JSON.stringify(data), outpoint);
     // console.log("setResponseData called successfully");
    } catch (error) {
      // console.or("Error calling server:", error);
      // Fallback to simulated response if server is unavailable
      const simulatedResponse = {
        message: "broadcast successful",
        txid: "simulated_" + Date.now().toString(36) + Math.random().toString(36).substr(2),
        outpoints: [outpoint]
      };
     // console.log("Using fallback response:", simulatedResponse);
      setResponseData(JSON.stringify(simulatedResponse), outpoint);
    }
  };

  //handle demo connect
  const showMore = () => {
    const newCount = foxesDisplayed + 50;
    setFoxesDisplayed(newCount);
    setDisplayFaucetFoxes(allProcessedFoxes.slice(0, newCount));
    
    if (newCount >= allProcessedFoxes.length) {
      setDisplayShowMore(false);
    }
  };

  const showMoreOwnedFoxes = () => {
    const newCount = ownedFoxesDisplayed + 5;
    setOwnedFoxesDisplayed(newCount);
    
    if (newCount >= allFaucetFoxes.filter(data => ownedOutpoints.includes(data.imgid)).length) {
      setShowMoreOwned(false);
    }
  };

  useEffect(
    () => {
      if (!didMount.current) {
        didMount.current = true;
        return;
      }
      
      // Clear any existing error messages
      if (container) {
        container.innerHTML = "";
      }
      let ggg;
      ggg = friendlygroup;
      let rrr = todisplay;
      if (rrr && rrr !== "[]" && rrr !== "") {
        let ppp = JSON.parse(rrr)!;
        let foxcount = 0;
        let foxlength = ppp.length;
        //get total length
        for (let i = 0; i < foxlength; i++) {
          if (ppp[i]?.origin?.data?.map?.subTypeData?.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0") {
            foxcount++;
          }
        }

        setNumResults(foxcount);
        let d = 0;
        let allFoxesTemp = [];
        
        // Process ALL foxes at once
        for (let i = 0; i < foxlength; i++) {
          if (ppp[i]?.origin?.data?.map?.subTypeData?.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0") {
            // fox
            const foxData: ToDisplay = { 
              title: "",
              img: "", 
              name: "",
              link: "",
              imgid: "",
              outpoint: "",
              owner: "",
              ownertrimmed: "",
              ownerlink: "",
              trait1: "",
              trait2: "",
              trait3: "",
              trait4: "",
              trait5: "",
              trait6: "",
              trait7: ""
            };
            foxData.img = "https://ordfs.network/content/" + ppp[i].origin.outpoint;
            foxData.name = ppp[i].origin.data.map.name;
            foxData.link = "https://alpha.1satordinals.com/outpoint/" + ppp[i].origin.outpoint + "/inscription";
            foxData.imgid = ppp[i].origin.outpoint;
            foxData.outpoint = ppp[i].outpoint;
            foxData.trait1 = ppp[i].origin.data.map.subTypeData.traits[0].value;
            foxData.trait2 = ppp[i].origin.data.map.subTypeData.traits[1].value;
            foxData.trait3 = ppp[i].origin.data.map.subTypeData.traits[2].value;
            foxData.trait4 = ppp[i].origin.data.map.subTypeData.traits[3].value;
            foxData.trait5 = ppp[i].origin.data.map.subTypeData.traits[4].value;
            foxData.trait6 = ppp[i].origin.data.map.subTypeData.traits[5].value;
            foxData.trait7 = ppp[i].origin.data.map.subTypeData.traits[6].value;
            foxData.owner = ppp[i].owner;
            // Try to find the fox data in the disappearing foxes group first
            let foundFoxData = false;
            for (let k = 0; k < ggg.group.length; k++) {
              if (ggg.group[k]["origin.outpoint"] === ppp[i].origin.outpoint) {
                foxData.foxData = {
                  foxName: ggg.group[k].foxData.foxName,
                  pixelFoxName: ggg.group[k].foxData.pixelFoxName
                };
                foundFoxData = true;
                break;
              }
            }
            // Fallback if not found in disappearing foxes group
            if (!foundFoxData) {
              foxData.foxData = ppp[i].foxData || {
                foxName: ppp[i].origin.data.map.name,
                pixelFoxName: 'Unknown Pixel Fox'
              };
            }
            let own = ppp[i].owner;
            foxData.ownerlink = "https://whatsonchain.com/address/" + own;
            foxData.ownertrimmed = own.substring(0, 10) + "...";

            //get group member title by image id in foxgroup 
            for (let k = 0; k < ggg.group.length; k++) {
              if (ggg.group[k]["origin.outpoint"] === ppp[i].origin.outpoint) {
                foxData.title = ggg.group[k].foxData.foxName;
              }
            }
            
            allFoxesTemp.push(foxData);
            d++;
          }
        }
        
        // Store all processed foxes
        setAllProcessedFoxes(allFoxesTemp);
        
        // Also store all foxes for "Your Lucky Foxes" section (unfiltered)
        setAllFaucetFoxes(allFoxesTemp);
        
        // Display first 50 foxes
        setDisplayFaucetFoxes(allFoxesTemp.slice(0, 50));
        setFoxesDisplayed(50);
        
        // Set loading to false
        setLoading(false);

        //show/hide display more as necessary
        if (allFoxesTemp.length > 50) {
          setDisplayShowMore(true)
        } else {
          setDisplayShowMore(false)
        }

        //no foxes message
        if (foxcount === 0) {
          if (container === null) {
            return
          }
          if ((background === "all") && (name === "all") && (body === "all") && (mouth === "all") && (head === "all") && (eyes === "all") && (item === "all")) {
            container.innerHTML = "<p>There are no foxes in the faucet!</p>";
          } else {
            container.innerHTML = "<h3>There aren't any foxes in the faucet with these attributes:</h3><p>Background:   " + background + "<br />Fox:   " + name + "<br />Body:   " + body + "<br />Mouth:   " + mouth + "<br />Head Item:   " + head + "<br />Eyes:   " + eyes + "<br />Item:   " + item + "</p>";
          }
        }
        
        // Call passedFunctionFromFilters when foxes are processed
        passedFunctionFromFilters();
      } else {
        // If todisplay is null/undefined/empty, set loading to false
        setLoading(false);
        passedFunctionFromFilters();
        setAllProcessedFoxes([]);
        setAllFaucetFoxes([]);
        setDisplayFaucetFoxes([]);
        setNumResults(0);
      }
    },
    [todisplay] // Only depend on todisplay to prevent infinite re-renders
  )

  // Additional useEffect to ensure loading is cleared
  useEffect(() => {
    if (todisplay && todisplay !== "[]" && todisplay !== "") {
      // If we have data, ensure loading is cleared after a short delay
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [todisplay]);

  // Force loading to false when foxes are displayed
  useEffect(() => {
    if (displayfaucetfoxes.length > 0) {
      setLoading(false);
    }
  }, [displayfaucetfoxes]);

  // Handle ownedOutpoints changes separately
  useEffect(() => {
    if (allProcessedFoxes.length > 0 && ownedOutpoints.length > 0) {
      // This sorting is now handled in the main useEffect above
      //console.log('Owned outpoints changed, main useEffect will handle sorting.');
    }
  }, [ownedOutpoints, allProcessedFoxes, foxesDisplayed]);



  // Add new useEffect to track owned Gold Grills
  useEffect(() => {
    if (!myordinalsaddress) return;
    setCountLoading(true);

    const fetchOwnedGoldGrills = async () => {
      try {
        // Fetch user's ordinals
        const response = await fetch(`https://ordinals.gorillapool.io/api/txos/address/${myordinalsaddress}/unspent?limit=300000`);
        const data = await response.json();

        // Filter for Gold Grills collection
        const ownedGoldGrills = data.filter(fox => 
          fox.origin?.data?.map?.subTypeData?.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0" &&
          friendlygroup.group.some(groupFox => groupFox["origin.outpoint"] === fox.origin.outpoint)
        );

      //  console.log('Initial owned foxes count:', ownedGoldGrills.length);
      //  console.log('User address:', myordinalsaddress);
        
        setNumOwned(ownedGoldGrills.length);

        // console.log('Owned Gold Grills:', ownedGoldGrills);
        const ownedOutpoints = ownedGoldGrills.map(fox => fox.origin.outpoint).filter(Boolean);
        // console.log('Owned outpoints array:', ownedOutpoints);

        // === Lucky Foxes Calculation (using myordinalsaddress UTXOs) ===
        const luckyFoxOutpoints = friendlygroup.group.map(fox => fox["origin.outpoint"]);
        const userOwnedOutpoints = data.map(utxo => utxo.origin?.outpoint).filter(Boolean);
        const matchingOutpoints = userOwnedOutpoints.filter(outpoint => luckyFoxOutpoints.includes(outpoint));
        const numLuckyFoxes = matchingOutpoints.length;
        // console.log('Number of lucky foxes you own:', numLuckyFoxes);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('luckyFoxesCount', { detail: { count: numLuckyFoxes } }));
        }
        // === End Lucky Foxes Calculation ===

        setCountLoading(false);
      } catch (error) {
        // console.or('Error fetching owned Gold Grills:', error);
        setCountLoading(false);
      }
    };

    fetchOwnedGoldGrills();
  }, [myordinalsaddress]);

  // Calculate lucky foxes count - moved outside of fetchOwnedGoldGrills function
  useEffect(() => {
    // console.log('=== LUCKY FOXES CALCULATION DEBUG ===');
    // console.log('allUtxos exists:', !!allUtxos);
    // console.log('allUtxos type:', typeof allUtxos);
    
    if (!allUtxos || allUtxos.trim() === '') {
      // console.log('No allUtxos data available');
      // Dispatch event with count 0 when no data is available
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('luckyFoxesCount', { 
          detail: { count: 0 } 
        }));
      }
      return;
    }

    try {
      // Extract all origin outpoints from the lucky foxes group
      const luckyFoxOutpoints = friendlygroup.group.map(fox => fox["origin.outpoint"]);
      // console.log('Total lucky fox outpoints from group file:', luckyFoxOutpoints.length);
      // console.log('First 5 lucky fox outpoints:', luckyFoxOutpoints.slice(0, 5));

      // Get user's owned outpoints from allUtxos
      const parsedUtxos = JSON.parse(allUtxos);
      // console.log('Parsed UTXOs count:', parsedUtxos.length);
      // console.log('First UTXO sample:', parsedUtxos[0]);
      
      const userOwnedOutpoints = parsedUtxos.map(utxo => utxo.origin?.outpoint).filter(Boolean);
      // console.log('User owned outpoints count:', userOwnedOutpoints.length);
      // console.log('First 5 user owned outpoints:', userOwnedOutpoints.slice(0, 5));

      // Count how many owned outpoints are in the lucky foxes group
      const matchingOutpoints = userOwnedOutpoints.filter(outpoint => 
        luckyFoxOutpoints.includes(outpoint)
      );
      const numLuckyFoxes = matchingOutpoints.length;
      
      // console.log('Matching outpoints (lucky foxes):', matchingOutpoints);
      // console.log('Number of lucky foxes found:', numLuckyFoxes);

      // Debug logging
      // console.log('Lucky foxes calculation summary:', {
      //   totalLuckyFoxOutpoints: luckyFoxOutpoints.length,
      //   userOwnedOutpointsCount: userOwnedOutpoints.length,
      //   numLuckyFoxes: numLuckyFoxes,
      //   userOwnedOutpoints: userOwnedOutpoints.slice(0, 5), // First 5 for debugging
      //   luckyFoxOutpoints: luckyFoxOutpoints.slice(0, 5) // First 5 for debugging
      // });

      // Pass this information up to parent component
      if (typeof window !== 'undefined') {
        // console.log('Dispatching luckyFoxesCount event with count:', numLuckyFoxes);
        window.dispatchEvent(new CustomEvent('luckyFoxesCount', { 
          detail: { count: numLuckyFoxes } 
        }));
      }
      // console.log('=== END LUCKY FOXES CALCULATION DEBUG ===');
    } catch (error) {
      // // console.or('Error calculating lucky foxes count:', error);
      // // console.or('Error details:', error.message);
      // // console.or('allUtxos content:', allUtxos);
      // Dispatch event with count 0 on error
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('luckyFoxesCount', { 
          detail: { count: 0 } 
        }));
      }
    }
  }, [allUtxos]);

  // Add new useEffect to check SHUAllet address and fetch owned Mobile-Friendly Foxes
  useEffect(() => {
    if (!myordinalsaddress) {
      //console.log('No SHUAllet address available yet');
      return;
    }

    //console.log('SHUAllet address detected:', myordinalsaddress);
   // console.log('Fetching owned Mobile-Friendly Foxes from GorillaPool...');

    const fetchOwnedMobileFriendlyFoxes = async () => {
      try {
        // Fetch user's ordinals from GorillaPool
        const response = await fetch(`https://ordinals.gorillapool.io/api/txos/address/${myordinalsaddress}/unspent?limit=300000`);
        const data = await response.json();

       // console.log('Total UTXOs fetched from GorillaPool:', data.length);

        // Filter for Mobile-Friendly Foxes collection
        const ownedMobileFriendlyFoxes = data.filter(fox => 
          fox.origin?.data?.map?.subTypeData?.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0" &&
          friendlygroup.group.some(groupFox => groupFox["origin.outpoint"] === fox.origin.outpoint)
        );

        // console.log('=== MOBILE-FRIENDLY FOXES OWNERSHIP CHECK ===');
        // console.log('SHUAllet address:', myordinalsaddress);
        // console.log('Total Mobile-Friendly Foxes owned:', ownedMobileFriendlyFoxes.length);
        // console.log('Owned Mobile-Friendly Fox outpoints:', ownedMobileFriendlyFoxes.map(fox => fox.origin.outpoint));
        
        // Update the owned outpoints if we found any
        if (ownedMobileFriendlyFoxes.length > 0) {
          const ownedOutpoints = ownedMobileFriendlyFoxes.map(fox => fox.origin.outpoint).filter(Boolean);
         // console.log('Setting initial owned outpoints:', ownedOutpoints);
          
          // Call the parent function to update ownedOutpoints
          if (onNewFoxClaimed) {
            // For each owned fox, call onNewFoxClaimed to add it to the owned list
            ownedOutpoints.forEach(outpoint => {
            //  console.log('Adding existing owned fox:', outpoint);
              onNewFoxClaimed(outpoint);
            });
          }
        }

       // console.log('=== END MOBILE-FRIENDLY FOXES OWNERSHIP CHECK ===');

      } catch (error) {
        // console.or('Error fetching owned Mobile-Friendly Foxes from GorillaPool:', error);
      }
    };

    fetchOwnedMobileFriendlyFoxes();
  }, [myordinalsaddress, onNewFoxClaimed]);

  // Add state for tagged foxes tracking
  const [taggedFoxes, setTaggedFoxes] = useState<string[]>([]);
  const [taggedFoxesLoading, setTaggedFoxesLoading] = useState<boolean>(true);

  // Fetch tagged foxes from tag address
  useEffect(() => {
    const fetchTaggedFoxes = async () => {
      try {
        // Fetch from tag address "1LrqkqTznmScsT6e198c12KNKhZ4KuyK35"
        const response = await fetch("https://ordinals.gorillapool.io/api/txos/address/1LrqkqTznmScsT6e198c12KNKhZ4KuyK35/unspent?limit=300000");
        const data = await response.json();
        
        // Extract tagged fox outpoints
        const taggedOutpoints = data
          .filter(item => item.data?.map?.taggeeoriginoutpoint)
          .map(item => item.data.map.taggeeoriginoutpoint);
        
        // console.log('Tagged foxes found:', taggedOutpoints.length);
        // console.log('Tagged fox outpoints:', taggedOutpoints);
        
        setTaggedFoxes(taggedOutpoints);
        setTaggedFoxesLoading(false);
      } catch (error) {
        // console.or('Error fetching tagged foxes:', error);
        setTaggedFoxesLoading(false);
      }
    };

    fetchTaggedFoxes();
  }, []);

  // Add styles
  const styles = {
    popupOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px',
      pointerEvents: 'auto' as const
    },
    popup: {
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      padding: '30px',
      borderRadius: '12px',
      maxWidth: '400px',
      width: '100%',
      textAlign: 'center' as const,
      color: '#ffffff',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '2px solid #2196f3',
      backdropFilter: 'blur(10px)',
      pointerEvents: 'auto' as const
    },
    popupTitle: {
      fontSize: '24px',
      marginBottom: '15px',
      fontWeight: 'bold',
      color: '#36bffa'
    },
    popupMessage: {
      fontSize: '16px',
      marginBottom: '25px',
      lineHeight: '1.5',
      color: '#ffffff'
    },
    popupButton: {
      backgroundColor: 'transparent',
      color: '#36bffa',
      border: '2px solid #36bffa',
      padding: '12px 30px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '700',
      width: '100%',
      maxWidth: '200px',
      transition: 'all 0.2s ease',
      textTransform: 'none' as const,
      pointerEvents: 'auto' as const
    }
  };

  const [ownedGoldGrills, setOwnedGoldGrills] = useState<ToDisplay[]>([]);
  const [ownedLuckyFoxOutpoints, setOwnedLuckyFoxOutpoints] = useState<string[]>([]);

  // Add useEffect to process allUtxos when it changes
  useEffect(() => {
    if (allUtxos) {
      try {
        const utxos = JSON.parse(allUtxos);
        // console.log('All UTXOs received:', utxos);
        const outpoints = utxos.map(utxo => utxo.origin?.outpoint).filter(Boolean);
        // console.log('Owned outpoints:', outpoints);
      } catch (error) {
        // // console.or('Error processing allUtxos:', error);
      }
    }
  }, [allUtxos]);

  // Add useEffect to process allUtxos when it changes
  useEffect(() => {
    if (allUtxos) {
      try {
        // console.log('Raw allUtxos:', allUtxos);
        const utxos = JSON.parse(allUtxos);
        // console.log('Parsed UTXOs:', utxos);
        const luckyFoxOutpoints = utxos
          .filter(utxo => {
            // console.log('Checking UTXO:', utxo);
            return utxo.origin?.outpoint;
          })
          .map(utxo => utxo.origin.outpoint);
        // console.log('Final lucky fox outpoints:', luckyFoxOutpoints);
        setOwnedLuckyFoxOutpoints(luckyFoxOutpoints);
      } catch (error) {
        // console.or('Error processing allUtxos:', error);
      }
    }
  }, [allUtxos]);

  useEffect(() => {
    if (newOutpoints.length > 0) {
      // console.log('New outpoints in LuckyFaucetSearchResults:', newOutpoints);
      
      // Only increment if these outpoints are not already counted
      // This prevents double-counting when the initial fetch already includes new outpoints
      setNumOwned(prev => {
        // Check if any of the new outpoints are already in the owned outpoints
        const alreadyCounted = newOutpoints.some(outpoint => 
          ownedLuckyFoxOutpoints.includes(outpoint)
        );
        
        if (alreadyCounted) {
          // console.log('Some outpoints already counted, not incrementing');
          return prev;
        } else {
          // console.log('Incrementing count by:', newOutpoints.length);
          return prev + newOutpoints.length;
        }
      });

      //remove the new outpoints from the available array
      setAvailable(prev => prev.filter(outpoint => !newOutpoints.includes(outpoint)));
      setNumAvailable(prev => prev - newOutpoints.length);
    }
  }, [newOutpoints, ownedLuckyFoxOutpoints]);

  // Effect to manage show more button for owned foxes
  useEffect(() => {
    const ownedFoxesCount = allFaucetFoxes.filter(data => ownedOutpoints.includes(data.imgid)).length;
    setShowMoreOwned(ownedFoxesCount > 10);
  }, [allFaucetFoxes, ownedOutpoints]);


  return (
    <>
      {showPopup && (
        <div 
          style={styles.popupOverlay}
          onClick={(e) => {
            // Only close if clicking the overlay, not the popup content
            if (e.target === e.currentTarget) {
              setShowPopup(false);
            }
          }}
        >
          <div style={styles.popup}>
            <h3 style={styles.popupTitle}>{popupTitle}</h3>
            <p style={styles.popupMessage}>{popupMessage}</p>
            <button 
              style={styles.popupButton} 
              onClick={() => setShowPopup(false)}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#36bffa';
                e.currentTarget.style.color = '#000000';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#36bffa';
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {!showFoxPopup && (
        <>
          <div className="H3Wrapper">
            <h3>Mobile-Friendly Foxes: {numresults} / {totalresults}</h3>
            <span className="RaiseLinks">
              <div className="WhiteGroupLinks"><a target="blank" href=""><u>Group</u></a></div>
              <br />
              <div className="WhiteGroupLinks" style={{ textAlign: 'left', width: '100%', margin: '' }}>
                <span style={{ color: '#808080', display: 'inline-block', width: '105px' }}>Available:</span>
                {availableLoading ? (
                  <span style={{ display: 'inline-flex', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', position: 'relative', top: '-5px' }}>
                    <PulseLoader color="#808080" size={4} />
                  </span>
                ) : (
          
                  <span style={{ color: '#808080' }}>{numAvailable}</span>
                )} <span style={{ color: '#808080' }}>/</span> <span style={{ color: '#808080' }}>{totalresults}</span>
              </div>
              <div className="WhiteGroupLinks" style={{ textAlign: 'left', width: '100%', margin: '' }}>
                <span style={{ color: '#808080', display: 'inline-block', width: '105px' }}>You own:</span>
                {!myordinalsaddress ? (
                  <span>
                    <a 
                      onClick={() => handleConnect && handleConnect()}
                      style={{ color: '#808080', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      {connectLoading ? (
                        <span style={{ display: 'inline-flex', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', position: 'relative', top: '-5px' }}>
                          <PulseLoader color="#808080" size={4} />
                        </span>
                      ) : (
                        'Connect to view'
                      )}
                    </a>
                  </span>
                ) : (
                  countLoading ? (
                    <span style={{ display: 'inline-flex', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', position: 'relative', top: '-5px' }}>
                      <PulseLoader color="#808080" size={4} />
                    </span>
                  ) : (
                    <span style={{ color: '#808080' }}>{ownedOutpoints.length}</span>
                  )
                )} <span style={{ color: '#808080' }}>/</span> <span style={{ color: '#808080' }}>{totalresults}</span>
              </div>
            </span>
          </div>
          <div className="Foxplorer" style={{ padding: '0 15px', boxSizing: 'border-box' }}>
            <br />
            {loading && displayfaucetfoxes.length === 0 && (
              <div className="CenterLoader">
                <PulseLoader color="#ffffff" />
              </div>
            )}

            <ul id="image-container" style={{ padding: '0', margin: '0', boxSizing: 'border-box' }}>
              {/* Your Mobile-Friendly Foxes Section */}
              {(myordinalsaddress || ownedOutpoints.length > 0) && (
                <>
                  <div style={{ 
                    width: '100%', 
                    maxWidth: '100%',
                    textAlign: 'center', 
                    margin: '20px 0 10px 0',
                    padding: '10px 10px',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid #4CAF50',
                    boxSizing: 'border-box'
                  }}>
                    {(() => {
                      const ownedFoxes = allFaucetFoxes.filter(data => ownedOutpoints.includes(data.imgid));
                      // console.log('Your Mobile-Friendly Foxes section - ownedFoxes:', ownedFoxes.map(fox => fox.foxData?.foxName));
                      // console.log('Your Mobile-Friendly Foxes section - ownedOutpoints:', ownedOutpoints);
                      return (
                        <h3 style={{ color: '#32CD32', margin: '0', fontSize: '18px' }}>Your Mobile-Friendly Foxes: {ownedFoxes.length} / {totalresults}</h3>
                      );
                    })()}
                  </div>
                  {allFaucetFoxes.filter(data => ownedOutpoints.includes(data.imgid)).slice(0, ownedFoxesDisplayed).map(function (data) {
                    return (
                      <li key={uuidv4()} style={{ 
                        border: '4px solid #000000',
                        transition: 'border-color 0.2s ease, opacity 0.1s ease',
                        position: 'relative',
                        opacity: getFadeOpacity(data.imgid)
                      }} onMouseEnter={(e) => {
                        if (ownedOutpoints.includes(data.imgid)) {
                          e.currentTarget.style.borderColor = '#4CAF50';
                        } else if (available.includes(data.imgid)) {
                          e.currentTarget.style.borderColor = '#36bffa';
                        } else {
                          e.currentTarget.style.borderColor = '#f44336';
                        }
                      }} onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#000000';
                      }}>
                        {/* Yours Badge */}
                        {ownedOutpoints.includes(data.imgid) && (
                          <a 
                            target="blank" 
                            href={data.link}
                            style={{
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
                              textDecoration: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Yours
                          </a>
                        )}
                        
                        {/* Available Badge */}
                        {!ownedOutpoints.includes(data.imgid) && available.includes(data.imgid) && (
                          <a 
                            target="blank" 
                            href={data.link}
                            style={{
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
                              textDecoration: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Available
                          </a>
                        )}
                        
                        {/* Taken Badge */}
                        {!ownedOutpoints.includes(data.imgid) && !available.includes(data.imgid) && (
                          <a 
                            target="blank" 
                            href={data.link}
                            style={{
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
                              textDecoration: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Taken
                          </a>
                        )}
                        
                        <a target="blank"
                          href={data.link}>
                          <img src={data.img}
                            className="seventraitfoxes"
                            id={data.imgid} />
                        </a>
                        <span className="FoxTitle" style={{ 
                          minHeight: '50px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%'
                        }}>
                          <a target="blank" href={data.link} style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%',
                            width: '100%',
                            display: 'block',
                            whiteSpace: 'nowrap',
                            wordBreak: 'keep-all',
                            wordWrap: 'normal',
                            overflowWrap: 'normal'
                          }}>{data.foxData?.foxName || 'Unknown Fox'}</a><br />
                          {data.foxData?.pixelFoxName || 'Unknown Pixel Fox'}
                        </span>
                        <div className="BlueTraits">{data.trait1}<br />{data.trait2}<br />{data.trait3}<br />{data.trait4}<br />{data.trait5}<br />{data.trait6}<br />{data.trait7}</div>
                        
                        {/* Button States - Below traits for Your Mobile-Friendly Foxes */}
                        {(() => {
                          const isTagged = taggedFoxes.includes(data.imgid);
                          if (isTagged) {
                            // TAGGED Button (Disabled)
                            return (
                              <button
                                style={{
                                  width: '100%',
                                  backgroundColor: '#ff9800',
                                  color: 'white',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  marginTop: '8px',
                                  opacity: 0.7,
                                  cursor: 'not-allowed'
                                }}
                                disabled
                              >
                                TAGGED
                              </button>
                            );
                          } else {
                            // Play Tag Button (Active)
                            return (
                              <button
                                onClick={() => {
                                  // Navigate to TagWithFox page with fox data
                                  navigate("/tagwithfox", { 
                                    state: { 
                                      tags: 0, // Will be calculated on the tag page
                                      taggedfoxes: taggedFoxes.filter(fox => ownedOutpoints.includes(fox)).length,
                                      outpoint: data.outpoint,
                                      originoutpoint: data.imgid,
                                      owneraddress: myordinalsaddress,
                                      foxes: ownedOutpoints.length,
                                      foxname: data.foxData?.pixelFoxName || data.name,
                                      pixelFoxName: data.foxData?.pixelFoxName || 'Unknown Pixel Fox'
                                    } 
                                  });
                                }}
                                style={{
                                  width: '100%',
                                  backgroundColor: '#4CAF50',
                                  color: 'white',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  marginTop: '8px',
                                  transition: 'background-color 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = '#45a049';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = '#4CAF50';
                                }}
                              >
                                Play Tag
                              </button>
                            );
                          }
                        })()}
                      </li>
                    )
                  })}
                  {showMoreOwned && (
                    <>
                      <div id="ShowMore">
                        <button 
                          onClick={showMoreOwnedFoxes}
                          style={{
                            padding: "0.75rem 1.5rem",
                            borderRadius: "0.5rem",
                            margin: "10px",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#4CAF50",
                            backgroundColor: "#000000",
                            border: "2px solid #4CAF50",
                            zIndex: "10",
                            whiteSpace: "nowrap",
                            transition: "all 0.2s ease",
                            transform: "none"
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#4CAF50";
                            e.currentTarget.style.color = "#ffffff";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "#000000";
                            e.currentTarget.style.color = "#4CAF50";
                          }}
                        >
                          Show More
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* All Mobile-Friendly Foxes Section */}
              <div style={{ 
                width: '100%', 
                maxWidth: '100%',
                textAlign: 'center', 
                margin: '20px 0 10px 0',
                padding: '10px 10px',
                backgroundColor: 'rgba(54, 191, 250, 0.1)',
                borderRadius: '8px',
                border: '1px solid #36bffa',
                boxSizing: 'border-box'
              }}>
                <h3 style={{ color: '#36bffa', margin: '0', fontSize: '18px' }}>All Mobile-Friendly Foxes: {allProcessedFoxes.length} / {totalresults}</h3>
              </div>
              {displayfaucetfoxes &&
                <>
                  {displayfaucetfoxes.map(function (data) {
                    return (
                      <li key={uuidv4()} style={{ 
                        border: '4px solid #000000',
                        transition: 'border-color 0.2s ease, opacity 0.1s ease',
                        position: 'relative',
                        opacity: getFadeOpacity(data.imgid)
                      }} onMouseEnter={(e) => {
                        if (ownedOutpoints.includes(data.imgid)) {
                          e.currentTarget.style.borderColor = '#4CAF50';
                        } else if (available.includes(data.imgid)) {
                          e.currentTarget.style.borderColor = '#36bffa';
                        } else {
                          e.currentTarget.style.borderColor = '#f44336';
                        }
                      }} onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#000000';
                      }}>
                        {/* Yours Badge */}
                        {ownedOutpoints.includes(data.imgid) && (
                          <a 
                            target="blank" 
                            href={data.link}
                            style={{
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
                              textDecoration: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Yours
                          </a>
                        )}
                        
                        {/* Available Badge */}
                        {!ownedOutpoints.includes(data.imgid) && available.includes(data.imgid) && (
                          <a 
                            target="blank" 
                            href={data.link}
                            style={{
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
                              textDecoration: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Available
                          </a>
                        )}
                        
                        {/* Taken Badge */}
                        {!ownedOutpoints.includes(data.imgid) && !available.includes(data.imgid) && (
                          <a 
                            target="blank" 
                            href={data.link}
                            style={{
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
                              textDecoration: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Taken
                          </a>
                        )}
                        
                        <a target="blank"
                          href={data.link}>
                          <img src={data.img}
                            className="seventraitfoxes"
                            id={data.imgid} />
                        </a>
                        <span className="FoxTitle" style={{ 
                          minHeight: '50px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%'
                        }}>
                          <a target="blank" href={data.link} style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%',
                            width: '100%',
                            display: 'block',
                            whiteSpace: 'nowrap',
                            wordBreak: 'keep-all',
                            wordWrap: 'normal',
                            overflowWrap: 'normal'
                          }}>{data.foxData?.foxName || 'Unknown Fox'}</a><br />
                          {data.foxData?.pixelFoxName || 'Unknown Pixel Fox'}
                        </span>
                        <div className="BlueTraits">{data.trait1}<br />{data.trait2}<br />{data.trait3}<br />{data.trait4}<br />{data.trait5}<br />{data.trait6}<br />{data.trait7}</div>
                        
                        {/* Button States - Below traits */}
                        {ownedOutpoints.includes(data.imgid) ? (
                          // Button for owned foxes - Play Tag or TAGGED
                          (() => {
                            const isTagged = taggedFoxes.includes(data.imgid);
                            if (isTagged) {
                              // TAGGED Button (Disabled)
                              return (
                                <button
                                  style={{
                                    width: '100%',
                                    backgroundColor: '#ff9800',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    marginTop: '8px',
                                    opacity: 0.7,
                                    cursor: 'not-allowed'
                                  }}
                                  disabled
                                >
                                  TAGGED
                                </button>
                              );
                            } else {
                              // Play Tag Button (Active)
                              return (
                                <button
                                  onClick={() => {
                                    // Navigate to TagWithFox page with fox data
                                    navigate("/tagwithfox", { 
                                      state: { 
                                        tags: 0, // Will be calculated on the tag page
                                        taggedfoxes: taggedFoxes.filter(fox => ownedOutpoints.includes(fox)).length,
                                        outpoint: data.outpoint,
                                        originoutpoint: data.imgid,
                                        owneraddress: myordinalsaddress,
                                        foxes: ownedOutpoints.length,
                                        foxname: data.foxData?.pixelFoxName || data.name,
                                        pixelFoxName: data.foxData?.pixelFoxName || 'Unknown Pixel Fox'
                                      } 
                                    });
                                  }}
                                  style={{
                                    width: '100%',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    marginTop: '8px',
                                    transition: 'background-color 0.2s ease'
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#45a049';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#4CAF50';
                                  }}
                                >
                                  Play Tag
                                </button>
                              );
                            }
                          })()
                        ) : !available.includes(data.imgid) ? (
                          // Taken Button (Enabled, shows popup)
                          <button
                            onClick={taken}
                            style={{
                              width: '100%',
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              marginTop: '8px',
                              opacity: 0.7
                            }}
                          >
                            TAKEN
                          </button>
                        ) : (
                          // GET FOX Button (Active)
                          <button
                            onClick={() => {
                              // Check if user already has untagged Mobile-Friendly Foxes
                              const ownedUntaggedFoxes = allFaucetFoxes.filter(fox => 
                                ownedOutpoints.includes(fox.imgid) && !taggedFoxes.includes(fox.imgid)
                              );
                              
                              if (ownedUntaggedFoxes.length > 0) {
                                // Show popup warning
                                setPopupTitle("Not So Fast!");
                                setPopupMessage(`You already have ${ownedUntaggedFoxes.length} untagged Mobile-Friendly Fox${ownedUntaggedFoxes.length > 1 ? 'es' : ''}. Play Tag with your existing fox${ownedUntaggedFoxes.length > 1 ? 'es' : ''} first!`);
                                setShowPopup(true);
                                return;
                              }

                              // console.log('GET FOX clicked for fox:', data.imgid);
                              // console.log('Current ownedOutpoints:', ownedOutpoints);
                              
                              // Set the fox data for the modern popup
                              setSelectedFox({
                                img: data.img,
                                name: data.foxData?.pixelFoxName || data.name,
                                outpoint: data.outpoint,
                                imgid: data.imgid, // Add imgid to selectedFox
                                traits: [data.trait1, data.trait2, data.trait3, data.trait4, data.trait5, data.trait6, data.trait7],
                                pixelFoxName: data.foxData?.pixelFoxName || 'Unknown Pixel Fox'
                              });
                              setTransactionId(undefined);
                              setTransactionTime(undefined);
                              setErrorMessage(null);
                              setIsProcessingFox(true);
                              setShowFoxPopup(true);

                              // Call the server
                              getScript(myordinalsaddress, data.title, data.outpoint);
                              
                              // Update buttons if taken
                              let temp = justtaken;
                              temp.push(data.imgid);
                              setJustTaken(temp);
                            }}
                            style={{
                              width: '100%',
                              backgroundColor: '#36bffa',
                              color: 'white',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              marginTop: '8px',
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#1976d2';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = '#36bffa';
                            }}
                          >
                            GET FOX
                          </button>
                        )}
                      </li>
                    )
                  })}
                </>
              }
            </ul>
            <p id="error-container"></p>
            {displayshowmore && (
              <>
                <div id="ShowMore">
                  <ShowMoreGroupsButton onClick={showMore} text="Show More" />
                </div>
              </>
            )}

            <a className="WhiteClear" onClick={resetLoading}><u>Reset Filters</u></a>
            {setsearchloading && (
              <>
                <span className="ResetLoaderCenter">
                  <PulseLoader color="#ffffff" />
                </span>
              </>
            )}
            <br />

   

          </div>

          {/* Add LuckyFoxesGroups component */}
          {/* <LuckyFoxesGroups myordinalsaddress={myordinalsaddress} /> */}

          {/* commenting out for now until we have a way to display twins */}
          {/* <TwinFinderFaucet available={available} faucetvar={faucetvar} todisplay={todisplay} totalresults={totalresults} passedFunction={passedFunction} getFox={getFox} /> */}
        </>
      )}
      

      
      {/* Modern Fox Popup */}
      {showFoxPopup && (
        <FoxPopup
          fox={selectedFox}
          onClose={backToResults}
          transactionId={transactionId}
          transactionTime={transactionTime}
          errorMessage={errorMessage}
          onRefresh={() => {
            if (selectedFox) {
              getScript(myordinalsaddress, selectedFox.name, selectedFox.outpoint);
            }
          }}
          myordinalsaddress={myordinalsaddress}
          ownedOutpoints={ownedOutpoints}
          taggedFoxes={taggedFoxes}
        />
      )}

      {/* <div style={{ 
        backgroundColor: '#000000', 
        padding: '20px', 
        marginTop: '20px',
        borderRadius: '8px',
        color: '#000000'
      }}>
        <h3 style={{ 
          textAlign: 'center', 
          color: '#000000',
          marginBottom: '20px',
          fontSize: '1.2em',
          fontWeight: 'normal'
        }}>Lucky Foxes Groups</h3>
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          Your Groups: {numOwned} 2x, {numOwned} 5x, {numOwned} 10x
        </div>
        <div className="WhiteGroupLinks" style={{ textAlign: 'center' }}>
          <a target="blank" href="https://ordinals.gorillapool.io/content/feff68eb89dfb650b80d6ac02e80edc97bb0749569f5a05921eda1505b01edd1_0"><u>Group Inscription</u></a>
        </div>
      </div> */}

      {/* <div style={{ 
        backgroundColor: '#000000', 
        padding: '20px', 
        marginTop: '20px',
        borderRadius: '8px',
        color: '#ffffff'
      }}>
        <h3 style={{ 
          textAlign: 'center', 
          color: '#ffffff',
          marginBottom: '20px',
          fontSize: '1.2em',
          fontWeight: 'normal'
        }}>Gold Grill Groups</h3>
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          Your Groups: {numOwned} 2x, {numOwned} 5x, {numOwned} 10x
        </div>
        <div className="WhiteGroupLinks" style={{ textAlign: 'center' }}>
          <a target="blank" href="https://ordinals.gorillapool.io/content/feff68eb89dfb650b80d6ac02e80edc97bb0749569f5a05921eda1505b01edd1_0"><u>Group Inscription</u></a>
        </div>
      </div> */}
    </>
  )
};

export default FriendlyFaucetSearchResults;