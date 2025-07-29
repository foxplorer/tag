import { useState, useEffect, useRef } from "react";
import { ShowMoreButton } from "../components/ShowMoreButton";
import { ShowMoreGroupsButton } from "../components/ShowMoreGroupsButton";
import { GetAnotherButton } from "../components/GetAnotherButton";
import { PulseLoader } from 'react-spinners';
import { v4 as uuidv4 } from 'uuid';

import _ from 'lodash';

import bountyFoxesGroup from "../assets/500BountyFoxesGroup.json";
import mobileFriendlyFoxesGroup from "../assets/500MobileFriendlyFoxesGroup.json";

import BountyFoxesGroups from "./BountyFoxesGroups";


type FoxSearchResultsProps = {
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
  complete: boolean,
  allUtxos?: string;
  foxType?: 'lucky' | 'disappearing' | 'rolling' | 'falling' | 'bounty' | 'mobile-friendly';
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

const FoxSearchResults: React.FC<FoxSearchResultsProps> = ({
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
  complete,
  allUtxos,
  foxType = 'disappearing' // Default to disappearing for backward compatibility
}) => {

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


  //get fox screen
  const [showgetfoxscreen, setShowGetFoxScreen] = useState<boolean>(false);

  //display show more
  const [displayshowmore, setDisplayShowMore] = useState<boolean>(true);

  //set get fox buttons
  const [getfoxbuttons, setGetFoxButtons] = useState<string>("");
  const [available, setAvailable] = useState<string[]>([]);
  const [justtaken, setJustTaken] = useState<string[]>([]);
  const [foxesremaining, setFoxesRemaining] = useState<number>();
  //get fox screen
  const [foxloading, setFoxLoading] = useState<boolean>(false);
  const [getanother, setGetAnother] = useState<boolean>(false);
  //fox container
  const container = document.getElementById('error-container');

  //send fox server response
  const [txidurl, setTxidUrl] = useState<string>("");
  const [statusword, setStatusWord] = useState<string>("");
  const [foxserverresponse, setFoxServerResponse] = useState<string>("");
  const [errormessage, setErrorMessage] = useState<string>("");
  const [trait1, setTrait1] = useState<string>("");
  const [trait2, setTrait2] = useState<string>("");
  const [trait3, setTrait3] = useState<string>("");
  const [trait4, setTrait4] = useState<string>("");
  const [trait5, setTrait5] = useState<string>("");
  const [trait6, setTrait6] = useState<string>("");
  const [trait7, setTrait7] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [ownertrimmed, setOwnerTrimmed] = useState<string>("");
  const [ownerlink, setOwnerLink] = useState<string>("");
  const [getfoxlink, setGetFoxLink] = useState<string>("");
  const [getfoximg, setGetFoxImg] = useState<string>("");
  const [getfoxtitle, setFoxTitle] = useState<string>("");
  const [getfoxname, setGetFoxName] = useState<string>("");
  const [getfoximgid, setGetFoxImgId] = useState<string>("");

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
  //resetLoading
  const resetLoading = () => {
    clearFilters()
  };



  const [showPlinkoGame, setShowPlinkoGame] = useState<boolean>(false);
  const [selectedFox, setSelectedFox] = useState<any>(null);

  const handlePlinkoComplete = (result: number) => {
    setShowPlinkoGame(false);
    
    // Set the fox data from the selected fox
    setFoxTitle(selectedFox.title);
    setTrait1(selectedFox.trait1);
    setTrait2(selectedFox.trait2);
    setTrait3(selectedFox.trait3);
    setTrait4(selectedFox.trait4);
    setTrait5(selectedFox.trait5);
    setTrait6(selectedFox.trait6);
    setTrait7(selectedFox.trait7);
    setOwner(selectedFox.owner);
    setOwnerLink(selectedFox.ownerLink);
    setOwnerTrimmed(selectedFox.ownerTrimmed);
    setGetFoxLink(selectedFox.link);
    setGetFoxImg(selectedFox.img);
    setGetFoxName(selectedFox.name);
    setGetFoxImgId(selectedFox.imgid);

    setFoxLoading(true);
    setFoxServerResponse("");
    getScript(myordinalsaddress, selectedFox.title, selectedFox.outpoint);
    
    // Update buttons if taken
    let temp = justtaken;
    temp.push(selectedFox.imgid);
    setJustTaken(temp);
    setShowGetFoxScreen(true);
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
        // Filter for foxes that are in both the faucet and the appropriate group based on foxType
        let groupData;
       if (foxType === 'bounty') {
          groupData = bountyFoxesGroup.group;
        } else if (foxType === 'mobile-friendly') {
          groupData = mobileFriendlyFoxesGroup.group;
        } 
        
        const availableFoxes = data.filter(fox => 
          fox.origin?.data?.map?.subTypeData?.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0" &&
          groupData.some(groupFox => groupFox["origin.outpoint"] === fox.origin.outpoint)
        );
        
        setNumAvailable(availableFoxes.length);
        setGetFoxButtons(JSON.stringify(data));
      })
      .catch((error) => console.log(error));
  }, []);

  //get fox for fox screen
  const setResponseData = (data: string) => {
    setFoxLoading(false)
    let hhh = JSON.parse(data);
    const result1 = String(data).includes('conflict');
    // console.log(result1)
  if (hhh.message != "broadcast successful") {
      setErrorMessage("Mempool conflict. Wait for a new block to be mined and then try again.")
     // setErrorMessage("Someone already got this fox. Refresh your browser to update available foxes.")
      // setStatusWord("Error")
    } else {
      //add outside scope fox error as else if
      //success
      let uuu = hhh.txid;
      setTxidUrl("https://whatsonchain.com/tx/" + uuu)
      setFoxServerResponse(uuu)
      setStatusWord("Fox Sent")
      
      // Extract outpoints from server response and add to newOutpoints
      if (hhh.outpoints && Array.isArray(hhh.outpoints)) {
        // console.log('Server response outpoints:', hhh.outpoints);
        // Add the new outpoints to the newOutpoints array
        // This will trigger the group components to update their "Yours" badges
        const updatedOutpoints = [...newOutpoints, ...hhh.outpoints];
        // Note: We need to call a function to update the parent component's newOutpoints
        // This should be passed down as a prop from the parent component
        if (typeof window !== 'undefined') {
          // Dispatch a custom event to notify group components
          window.dispatchEvent(new CustomEvent('newFoxesOwned', { 
            detail: { outpoints: hhh.outpoints } 
          }));
        }
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

    setAvailable(buttonids);
    setAvailableLoading(false);
    setLoading(false);
  }, [getfoxbuttons]);


  const backToResults = () => {
    setShowGetFoxScreen(false)
    setGetAnother(false)
    setStatusWord("")
    setErrorMessage("")
    setTxidUrl("")
    setFoxServerResponse("")
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

    // console.log(script)
    const url = "";
    // console.log(myordinalsaddress + "=addresses in sendvars")
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({ "id": id, "address": myordinalsaddress, "outpoint": outpoint })
      // body: JSON.stringify({ addresses, "avatar": avatar }),
    };
    fetch(url, options)
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        setGetAnother(true)
        setResponseData(JSON.stringify(data))
      });
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
      // Set loading to true when todisplay changes
      setLoading(true);
      
      // Use setTimeout to ensure the foxes are displayed immediately
      setTimeout(() => {
        if (container)
          container.innerHTML = "";
        let ggg;
       if (foxType === 'bounty') {
          ggg = bountyFoxesGroup;
        } else if (foxType === 'mobile-friendly') {
          ggg = mobileFriendlyFoxesGroup;
        }
        let rrr = todisplay;
        if (rrr) {
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
              const traits = ppp[i].origin.data.map.subTypeData.traits;
              // Check if traits exist and have proper structure with all 7 traits
              if (traits && Array.isArray(traits) && traits.length >= 6) {
                foxData.trait1 = traits[0] && traits[0].value ? traits[0].value : " ";
                foxData.trait2 = traits[1] && traits[1].value ? traits[1].value : " ";
                foxData.trait3 = traits[2] && traits[2].value ? traits[2].value : " ";
                foxData.trait4 = traits[3] && traits[3].value ? traits[3].value : " ";
                foxData.trait5 = traits[4] && traits[4].value ? traits[4].value : " ";
                foxData.trait6 = traits[5] && traits[5].value ? traits[5].value : " ";
                foxData.trait7 = traits[6] && traits[6].value ? traits[6].value : "none";
              } else {
                // If no traits, invalid structure, or fewer than 6 traits, set all to non-breaking spaces
                foxData.trait1 = "\u00A0";
                foxData.trait2 = "\u00A0";
                foxData.trait3 = "\u00A0";
                foxData.trait4 = "\u00A0";
                foxData.trait5 = "\u00A0";
                foxData.trait6 = "\u00A0";
                foxData.trait7 = "\u00A0";
                // Modify the name for foxes with incomplete traits
                if (foxData.name && foxData.name.startsWith("Fox #")) {
                  foxData.name = "Pixel Foxes " + foxData.name.substring(4);
                }
              }
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
          
          // Store all processed foxes (unsorted for "All Lucky Foxes" section)
          setAllProcessedFoxes(allFoxesTemp);
          
          // Also store all foxes for "Your Lucky Foxes" section (unfiltered)
          setAllFaucetFoxes(allFoxesTemp);
          
          // Create a sorted version for "Your Lucky Foxes" section
          const sortedFoxes = [...allFoxesTemp].sort((a, b) => {
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
          
          // Display first 50 foxes in original order for "All Lucky Foxes" section
          setDisplayFaucetFoxes(allFoxesTemp.slice(0, 50));
          setFoxesDisplayed(50);

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
          
          // Always set loading to false and call passedFunctionFromFilters when foxes are processed
          setLoading(false);
          passedFunctionFromFilters();
        } else {
          // If todisplay is null/undefined, still set loading to false
          setLoading(false);
          passedFunctionFromFilters();
        }
      }, 0); // Use setTimeout with 0ms delay to ensure this runs after the current execution context
    },
    [todisplay, ownedOutpoints] // with dependency: run every time variable changes
  )

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
        let groupData;
        if (foxType === 'bounty') {
          groupData = bountyFoxesGroup.group;
        } else if (foxType === 'mobile-friendly') {
          groupData = mobileFriendlyFoxesGroup.group;
        } else {
          groupData = []; // Default empty array for other fox types
        }
        
        const ownedGoldGrills = data.filter(fox => 
          fox.origin?.data?.map?.subTypeData?.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0" &&
          groupData.some(groupFox => groupFox["origin.outpoint"] === fox.origin.outpoint)
        );

        setNumOwned(ownedGoldGrills.length);

        // console.log('Owned Gold Grills:', ownedGoldGrills);
        const ownedOutpoints = ownedGoldGrills.map(fox => fox.origin.outpoint).filter(Boolean);
        // console.log('Owned outpoints array:', ownedOutpoints);

        // === Lucky Foxes Calculation (using myordinalsaddress UTXOs) ===
        const luckyFoxOutpoints = groupData.map(fox => fox["origin.outpoint"]);
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
        console.error('Error fetching owned Gold Grills:', error);
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
      let groupData;
      if (foxType === 'bounty') {
        groupData = bountyFoxesGroup.group;
      } else if (foxType === 'mobile-friendly') {
        groupData = mobileFriendlyFoxesGroup.group;
      } else {
        groupData = []; // Default empty array for other fox types
      }
      
      const luckyFoxOutpoints = groupData.map(fox => fox["origin.outpoint"]);
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
      // console.error('Error calculating lucky foxes count:', error);
      // console.error('Error details:', error.message);
      // console.error('allUtxos content:', allUtxos);
      // Dispatch event with count 0 on error
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('luckyFoxesCount', { 
          detail: { count: 0 } 
        }));
      }
    }
  }, [allUtxos]);

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
        // console.error('Error processing allUtxos:', error);
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
        console.error('Error processing allUtxos:', error);
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

  // Add effect for random fade animation
  useEffect(() => {
    // Only run disappearing animation for disappearing foxes
    if (foxType !== 'disappearing' || displayfaucetfoxes.length === 0) return;

    let isAnimating = false; // Prevent multiple animations from running simultaneously

    const triggerRandomFade = () => {
      if (isAnimating) return; // Skip if already animating
      
      // Get all available foxes (both owned and unowned)
      const allFoxes = [...displayfaucetfoxes];
      
      if (allFoxes.length === 0) return;

      isAnimating = true;

      // Randomly select 50% of foxes to disappear
      const foxesToDisappear = allFoxes.filter(() => Math.random() < 0.5);
      
      if (foxesToDisappear.length === 0) {
        isAnimating = false;
        return;
      }

      // Clear any existing fade state to prevent conflicts
      setFadeOutFoxes(new Set());
      setFadingFoxes(new Set());
      setFadeProgress(0);

      // Add selected foxes to fading set (start fade out)
      const foxIdsToDisappear = foxesToDisappear.map(fox => fox.imgid);
      setFadeOutFoxes(new Set(foxIdsToDisappear));

      // Make foxes disappear (fade out)
      setFadeProgress(1);

      // After 3 seconds, make them reappear
      setTimeout(() => {
        setFadeOutFoxes(new Set());
        setFadingFoxes(new Set(foxIdsToDisappear));
        setFadeProgress(0);
        
        // Fade them back in
        setTimeout(() => {
          setFadeProgress(1);
          
          // Clean up after fade in complete
          setTimeout(() => {
            setFadingFoxes(new Set());
            setFadeProgress(0);
            isAnimating = false;
          }, 100);
        }, 50);
      }, 3000); // 3 seconds disappear time
    };

    // Trigger fade every 6 seconds
    const interval = setInterval(() => {
      triggerRandomFade();
    }, 6000); // Every 6 seconds

    return () => {
      clearInterval(interval);
      // Clean up state on unmount
      setFadeOutFoxes(new Set());
      setFadingFoxes(new Set());
      setFadeProgress(0);
    };
  }, [displayfaucetfoxes]);

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
      {!showgetfoxscreen && !showPlinkoGame && (
        <>
          <div className="H3Wrapper">
            <h3>Results: {numresults} / {totalresults}</h3>
          </div>
          <div className="Foxplorer">
            <div className="CenterLoader">
              {loading && (
                <>
                  <PulseLoader color="#ffffff" />
                </>
              )}
            </div>

            <ul id="image-container">
              {displayfaucetfoxes &&
                <>
                  {displayfaucetfoxes.map(function (data) {
                    return (
                      <li key={uuidv4()}>
                        <a target="blank"
                          href={data.link}>
                          <img src={data.img}
                            className="seventraitfoxes"
                            id={data.imgid} />
                        </a>
                        <br />
                        <span className="TwinName">
                          <a target="blank" href={data.link}>{data.foxData?.foxName || data.name}</a>
                        </span>
                        <div className="ResultsTraits">{data.trait1}<br />{data.trait2}<br />{data.trait3}<br />{data.trait4}<br />{data.trait5}<br />{data.trait6}<br />{data.trait7}</div>
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

            {/* Add group components here so they have access to the available array */}

            {foxType === 'bounty' && (
              <BountyFoxesGroups 
                myordinalsaddress={myordinalsaddress} 
                handleConnect={handleConnect}
                newOutpoints={newOutpoints}
                available={available}
                connectLoading={connectLoading}
                allUtxos={allUtxos}
              />
            )}
          </div>
        </>
      )}
      
      {showPlinkoGame && (
        <div className="GettingFox">
          <div className="Foxplorer">
            <div className="CenterLoader">
<p>plinko game placeholder</p>
            </div>
          </div>
        </div>
      )}
      
      {showgetfoxscreen && !showPlinkoGame && (
        <>
          <br /><br /><br />
          <div className="GettingFox">
            <div className="Foxplorer">
              <div className="CenterLoader">
                <ul id="get-fox-image-container">
                  <li><a target="blank"
                    href={getfoxlink}>
                    <img src={getfoximg}
                      id={getfoximgid} />
                  </a>

                    <span className="TwinName"><a target="blank"
                      href={getfoxlink}>{getfoxname}</a><br />
                    </span>
                    <div className="twintraitslabels">Background:<br />Fox:<br />Body:<br />Mouth:<br />Head:<br />Eyes:<br />Item:
                    </div>
                    <div className="twintraits">{trait1}<br />{trait2}<br />{trait3}<br />{trait4}<br />{trait5}<br />{trait6}<br />{trait7}</div>
                  </li>
                </ul>

                {foxloading && (
                  <>
                    <h3>Getting Fox</h3>
                    <PulseLoader color="#ffffff" />
                  </>
                )}
                <div id="get-fox-status-container"><h3>{statusword}</h3>{errormessage}<br /><a className="White" target="blank" href={txidurl}>{foxserverresponse}</a></div>
                {getanother && foxserverresponse && (
                  <>
                    <GetAnotherButton onClick={backToResults} />
                  </>
                )}

              </div>

              <br />


                          </div>

          </div>
        </>
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

export default FoxSearchResults;