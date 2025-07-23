import React, { useState, useEffect, useRef, useMemo } from "react";
import { TagLogo } from "../components/TagLogo";
import { MyFox } from "../components/MyFox";
import { MyOtherFox } from "../components/MyOtherFox";
import { ThreeCircles } from 'react-loader-spinner';
import { XLogoRight } from "../components/XLogoRight";
import FooterHome from "../components/FooterHome";
import TemporaryDrawer from "../components/Drawer";
import TaggedFoxes from "../components/TaggedFoxes";
import { MobileControls } from "../components/MobileControls";
import SpaceRocks from "../components/SpaceRocks";
import { BountyHistory } from "../components/BountyHistory";
import {
  usePandaWallet,
  Addresses
} from "panda-wallet-provider";
import { FaucetPandaConnectButton } from "../components/FaucetPandaConnectButton";
//socketio

import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
//sounds
import boom from "../assets/boom.mp3";
import rumble from "../assets/spacerumblesoundtrack.mp3";
import { ImVolumeMute2 } from "react-icons/im";
import { ImVolumeHigh } from "react-icons/im";

// SHUAllet mobile wallet integration
declare global {
  interface Window {
    setupWallet: () => Promise<void>;
    backupWallet: () => void;
    restoreWallet: (oPK: string, pPk: string, newWallet?: boolean, avatar?: string, displayName?: string) => void;
    getWalletBalance: (address?: string) => Promise<number>;
    bsv: any;
    newPK: () => string;
    getAddressFromPrivateKey: (pkWIF: string) => string;
  }
}

type TagProps = {

}

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
  spacerockMetadata?: {
    color: string;
    blockHeight: string;
    blockHash: string;
    spacerockName: string;
  };
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

type PlayersArray = {
  id: string,
  owneraddress: string,
  outpoint: string,
  currentoutpoint: string,
  foxname: string,
  image: string,
  imagelink: string,
  x: number,
  y: number,
  speed: number,
  height: number,
  width: number,
  dir: number,
  projectiles: Array<{ x: number, y: number, dir: number, speed: number }>
}

export const Tag = ({ }: TagProps) => {

  //use yours
  const wallet = usePandaWallet();
  const [pubKey, setPubKey] = useState<string | undefined>();
  const [addresses, setAddresses] = useState<Addresses | undefined>();
  const [myordaddress, setMyOrdAddress] = useState<string>("");
  const [ordaddress, setOrdAddress] = useState<string>();

  // Mobile wallet state
  const [mobileWalletAddress, setMobileWalletAddress] = useState<string>("");
  const [mobileWalletLoading, setMobileWalletLoading] = useState<boolean>(false);
  const [mobileWalletConnected, setMobileWalletConnected] = useState<boolean>(false);
  const [mobileWalletBackupPrompted, setMobileWalletBackupPrompted] = useState<boolean>(false);

  // Popup state for custom alerts
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string>("");
  const [popupTitle, setPopupTitle] = useState<string>("");
  const [popupType, setPopupType] = useState<'info' | 'success' | 'error' | 'confirm' | 'wallet-connected' | 'wallet-created'>('info');
  const [popupCallback, setPopupCallback] = useState<(() => void) | null>(null);
  const [popupSecondaryCallback, setPopupSecondaryCallback] = useState<(() => void) | null>(null);

  //loading for twins
  const [loading, setLoading] = useState<boolean>(true);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [preloaded, setPreLoaded] = useState<boolean>(true);
  // const [myordaddress, setMyOrdAddress] = useState<string>("");

  //owns a fox
  const [ownsfox, setOwnsFox] = useState<boolean>(false);
  const [foxesowned, setFoxesOwned] = useState<number | string>("?");
  const [foxname, setFoxName] = useState<string>("");
  const [foximagesrc, setFoxImageSrc] = useState<string>();
  const [foximageurl, setFoxImageUrl] = useState<string>();
  const [foximageinfo, setFoxImageInfo] = useState<string>();


  //useRefs
  const didMount = useRef(false);
  const didMount1 = useRef(false);
  const didMount2 = useRef(false);
  const didMount3 = useRef(false);
  const didMount4 = useRef(false);
  const didMount5 = useRef(false);
  const didMount6 = useRef(false);
  //tag vars
  const [igottagged, setIGotTagged] = useState<boolean>(false);
  const [showinfo, setShowInfo] = useState<boolean>(true);
  const [showmuted, setShowMuted] = useState<boolean>(true);
  const [hidemuted, setHideMuted] = useState<boolean>(false);
  const [showleaving, setShowLeaving] = useState<boolean>(false);
  const [viewingtaggedinfo, setViewingTaggedInfo] = useState<boolean>(false);
  const [viewers, setViewers] = useState<number | string>('')
  const [players, setPlayers] = useState<number | string>(0)
  const [playersarray, setPlayersArray] = useState<PlayersArray[]>([])
  const [showtxidloading, setShowTxidLoading] = useState<boolean>(true);
  const [tagordaddress, setTagOrdAddress] = useState<string>()
  const [activitymessage, setActivityMessage] = useState<string>("")
  const [txid, setTxid] = useState<string>()
  const [txidlink, setTxidLink] = useState<string>()
  const [tempactivity, setTempActivity] = useState<ActivityArray>()
  const [tempactivitywithtxid, setTempActivityWithTxid] = useState<ActivityArray>()
  // const [finalactivity, setFinalActivity] = useState<ActivityArray>()
  const [activityarray, setActivityArray] = useState<ActivityArray[]>([{
    taggerowneraddress: "string",
    taggeroutpoint: "string",
    taggerfoxname: "string",
    taggerimage: "string",
    taggerimagelink: "string",
    taggeeowneraddress: "string",
    taggeeoutpoint: "string",
    taggeefoxname: "string",
    taggeeimage: "string",
    taggeeimagelink: "string",
    time: "string",
    txid: "string"
  }])
  const [chaserid, setChaserId] = useState<string>()
  const [whosit, setWhosIt] = useState<string>("NotIt")

  // State for tracking which player the spectator is following
  const [followedPlayerId, setFollowedPlayerId] = useState<string>("")
  const followedPlayerIdRef = useRef<string>("")

  // State for spectator camera control
  const [isUsingJoystick, setIsUsingJoystick] = useState<boolean>(false)
  const [spectatorCameraX, setSpectatorCameraX] = useState<number>(0)
  const [spectatorCameraY, setSpectatorCameraY] = useState<number>(0)

  // Refs to make spectator state accessible to camera update
  const isUsingJoystickRef = useRef<boolean>(false)
  const spectatorCameraXRef = useRef<number>(0)
  const spectatorCameraYRef = useRef<number>(0)

  // Add spectator player state and refs
  const [spectatorPlayer, setSpectatorPlayer] = useState<any>(null)
  const spectatorPlayerRef = useRef<any>(null)

  // Mobile controls state
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [cameraZoom, setCameraZoom] = useState<number>(0.5)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  // Add state for game number
  const [gameNumber, setGameNumber] = useState<number | null>(null)
  const cameraRef = useRef<any>(null)

  // Bucket foxes data state
  const [bucketFoxes, setBucketFoxes] = useState<any[]>([])
  const [playerBucketAssignments, setPlayerBucketAssignments] = useState<{ [key: string]: any }>({})

  // Refs to make bucket data accessible to rendering context
  const bucketFoxesRef = useRef<any[]>([])
  const playerBucketAssignmentsRef = useRef<{ [key: string]: any }>({})

  // Cycling image state for group buckets
  const [cyclingImages, setCyclingImages] = useState<{ [key: string]: { currentIndex: number, lastChange: number } }>({})
  const cyclingImagesRef = useRef<{ [key: string]: { currentIndex: number, lastChange: number } }>({})

  // Image cache for bucket foxes
  const bucketFoxImageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map())

  // Spacerock state
  const [spaceRocks, setSpaceRocks] = useState<any[]>([])
  const [spaceRocksCount, setSpaceRocksCount] = useState<number>(0)
  const [latestBlockHash, setLatestBlockHash] = useState<string>('')

  // Refs to make spacerock data accessible to rendering context
  const spaceRocksRef = useRef<any[]>([])

  // Store the original SVG as a string
  const spaceRockSvgString = `<svg width="800px" height="800px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="#000000">
<g id="spaceRock_bg" stroke-width="0"/>
<g id="spaceRock_tracer" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="10.24">
<path fill="#000000" d="M228.813 23L68.75 72.28 39.5 182.095l47.53-21.22 10.44-4.655 2.5 11.155 8.75 39.125 6.405 28.53-21.75-19.53-15.72-14.125-28.218 32.344 140.657 136 9.656-40.69 7.53-31.874 10.407 31.063 54.72 163.592L432.343 465.5l45.75-202.938-84.563-148.718L228.814 23zm-57.688 49.875l-27.813 39.906-3.25 73.44-27.187-88.94 58.25-24.405zm17.844 93.406l113.124 155.25L407 355.407l-107.375-.844-110.656-128v-60.28zM79.312 330.25l140.125 153.125-5.563-65.875-134.563-87.25z"/>
</g>
<g id="spaceRock_icon">
<path fill="#36bffa" d="M228.813 23L68.75 72.28 39.5 182.095l47.53-21.22 10.44-4.655 2.5 11.155 8.75 39.125 6.405 28.53-21.75-19.53-15.72-14.125-28.218 32.344 140.657 136 9.656-40.69 7.53-31.874 10.407 31.063 54.72 163.592L432.343 465.5l45.75-202.938-84.563-148.718L228.814 23zm-57.688 49.875l-27.813 39.906-3.25 73.44-27.187-88.94 58.25-24.405zm17.844 93.406l113.124 155.25L407 355.407l-107.375-.844-110.656-128v-60.28zM79.312 330.25l140.125 153.125-5.563-65.875-134.563-87.25z"/>
</g>
</svg>`;

  // Cache for dynamic spacerock SVG images
  const dynamicSpaceRockCacheRef = useRef<Map<string, HTMLImageElement>>(new Map())

  // const [message, setMessage] = useState<string>("awaiting reactions")
  // const [time, setTime] = React.useState('fetching')
  const [width, setWidth] = useState<number>(window.innerWidth)
  const [height, setHeight] = useState<number>(window.innerHeight)

  // Mobile performance optimization: limit canvas size on mobile
  const getOptimizedCanvasSize = () => {
    if (window.innerWidth <= 768) {
      // Use actual window dimensions for mobile to prevent blur at edges
      return {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  };
  // const [width, setWidth] = useState<number>(1280)
  // const [height, setHeight] = useState<number>(720)

  // use navigate
  const navigate = useNavigate();
  //get bstate from search results
  const state = useLocation();

  const [sock, setSock] = useState<Socket>();

  // Set minimum loading time
  useEffect(() => {
    setTimeout(() => {
      setPreLoaded(false)
    }, 2000);
  }, []); // Empty dependency array so it runs once on mount


  // Check if SHUAllet is already connected on component mount
  useEffect(() => {
    const checkExistingWallet = () => {
      const ordAddress = localStorage.getItem('ownerAddress');
      const payAddress = localStorage.getItem('walletAddress');

      if (ordAddress && payAddress) {
        // console.log('SHUAllet already connected:', { ordAddress, payAddress });
        setMobileWalletAddress(ordAddress);
        setMobileWalletConnected(true);
      } else {
        // console.log('No existing SHUAllet found');
        setMobileWalletConnected(false);
      }
    };

    checkExistingWallet();
  }, []); // Empty dependency array so it runs once on mount

  // Check if SHUAllet is loaded and override functions
  useEffect(() => {
    const checkSHUAllet = () => {
      // console.log('=== SHUAllet Loading Check ===');
      // console.log('window.bsv:', typeof window.bsv);
      // console.log('window.setupWallet:', typeof window.setupWallet);
      // console.log('window.backupWallet:', typeof window.backupWallet);
      // console.log('window.restoreWallet:', typeof window.restoreWallet);
      // console.log('window.newPK:', typeof window.newPK);
      // console.log('=== End SHUAllet Check ===');
    };

    // Check immediately
    checkSHUAllet();

    // Check again after a delay to see if scripts load
    setTimeout(() => {
      checkSHUAllet();

      // Override SHUAllet functions to use custom popups
      if (typeof window.setupWallet === 'function') {
        const originalSetupWallet = window.setupWallet;
        window.setupWallet = async () => {
          if (!localStorage.walletKey) {
            showCustomConfirm(
              'Import Wallet?',
              'Do you want to import an existing wallet?',
              () => {
                // User clicked OK - trigger file upload
                const fileInput = document.getElementById('uploadFile') as HTMLInputElement;
                if (fileInput) {
                  fileInput.click();
                }
              }
            );
          } else {
            showCustomAlert(
              'Backup Required',
              'Please backup your wallet before logging out.',
              'info'
            );
          }
        };
      }

      // Override restoreWallet function
      if (typeof window.restoreWallet === 'function') {
        const originalRestoreWallet = window.restoreWallet;
        window.restoreWallet = (oPK: string, pPk: string, newWallet?: boolean, avatar?: string, displayName?: string) => {
          const pk = window.bsv.PrivateKey.fromWIF(pPk);
          const pkWif = pk.toString();
          const address = window.bsv.Address.fromPrivateKey(pk);
          const ownerPk = window.bsv.PrivateKey.fromWIF(oPK);
          localStorage.ownerKey = ownerPk.toWIF();
          const ownerAddress = window.bsv.Address.fromPrivateKey(ownerPk);
          localStorage.ownerAddress = ownerAddress.toString();
          localStorage.walletAddress = address.toString();
          localStorage.walletKey = pkWif;
          if (displayName) localStorage.displayName = displayName;
          if (avatar) localStorage.avatar = avatar;
          localStorage.ownerPublicKey = ownerPk.toPublicKey().toHex();

          // Use custom popup instead of alert
          if (newWallet) {
            showCustomAlert(
              'Wallet Created!',
              `Wallet ${address} created!\n\nOrd Address: ${ownerAddress.toString()}\nPay Address: ${address.toString()}`,
              'success'
            );
          } else {
            showCustomAlert(
              'Wallet Restored!',
              `Wallet ${address} restored!\n\nOrd Address: ${ownerAddress.toString()}\nPay Address: ${address.toString()}`,
              'success'
            );
          }

          if (!newWallet) {
            // Don't reload immediately, let user see the popup first
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        };
      }

      // Override global alert function to use custom popups
      const originalAlert = window.alert;
      window.alert = (message: string) => {
        // Check if it's a SHUAllet-related message
        if (message.includes('Please backup your wallet') ||
          message.includes('Wallet') ||
          message.includes('created') ||
          message.includes('restored')) {
          showCustomAlert('SHUAllet', message, 'info');
        } else {
          // For other alerts, use the original alert
          originalAlert(message);
        }
      };
    }, 3000);
  }, []);

  // Mobile detection and viewport size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const updateViewport = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);

      // Update canvas size to prevent blur at edges
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      // Update camera viewport if camera exists
      if (cameraRef.current) {
        const camera = cameraRef.current;
        camera.wView = Math.min(6000, window.innerWidth);
        camera.hView = Math.min(4000, window.innerHeight);
      }
    };

    checkMobile();
    updateViewport();

    window.addEventListener('resize', checkMobile);
    window.addEventListener('resize', updateViewport);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  //sounds
  const audio = useMemo(() => new Audio(rumble), [rumble]);
  //sounds
  const soundRef = useRef(false)


  function playboom() {
    // console.log("enterplayboom")
    // console.log(soundRef.current + " = soundref current")
    if (soundRef.current === true) {
      // console.log(showmuted + " = showmuted in conditional")
      // console.log("shouldplayboom")
      new Audio(boom).play()
    }
  }
  function playrumble() {
    audio.play()
    soundRef.current = true;
    audio.addEventListener('ended', function () {
      return playrumble();
    })
    setShowMuted(false)
    setHideMuted(true)
  }

  function muterumble() {
    audio.pause()
    soundRef.current = false;
    setShowMuted(true)
    setHideMuted(false)
  }



  //playerpos
  const [rand1, setRand1] = useState<number>(Math.round((Math.floor(Math.random() * 5999) + 1) / 10) * 10);
  const [rand2, setRand2] = useState<number>(Math.round((Math.floor(Math.random() * 3999) + 1) / 10) * 10);
  const canvasRef = useRef(null);
  const [canvascontext, setCanvasContext] = useState(null);

  useEffect(() => {
    if (preloaded) return; // Don't set up canvas during loading screen

    const canvas = canvasRef.current;
    if (!canvas) return; // Safety check

    const context = canvas.getContext('2d');
    // Use actual window dimensions to prevent blur at edges
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    setCanvasContext(context)
  }, [preloaded, width, height]);

  // Cleanup socket on component unmount
  useEffect(() => {
    return () => {
      if (sock) {
        // console.log('Tag: Cleaning up socket connection on unmount');
        sock.close();
      }
      // Clean up dynamic spacerock cache
      if (dynamicSpaceRockCacheRef.current) {
        dynamicSpaceRockCacheRef.current.clear();
        //  console.log('Cleaned up dynamic spacerock cache');
      }
    };
  }, [sock]);






  //view
  // const [viewwidth, setViewWidth] = useState<number>(window.innerWidth);
  // const [viewheight, setViewHeight] = useState<number>(window.innerHeight);
  // const [viewwidth, setViewWidth] = useState<number>(1280);
  // const [viewheight, setViewHeight] = useState<number>(720);

  // get ord address
  useEffect(() => {
    if (!didMount1.current) {
      didMount1.current = true;
      return;
    }


  }, [tempactivity]);

  // get ord address
  useEffect(() => {
    if (!didMount3.current) {
      didMount3.current = true;
      return;
    }
    setTimeout(() => {
      setLoading(false)
      setLoaded(true)
    }, 2000);

  }, [foximageurl]);

  // handle action after txid 
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    if (tempactivity) {
      //adding to activity
      let jjj = tempactivity;
      jjj.txid = txid;
      setTempActivityWithTxid(jjj);
      let link = "https://whatsonchain.com/tx/" + txid;
      setTxidLink(link);
      // setShowTxidLoading(false)

      if (jjj.taggeeoutpoint === foximagesrc) {
        sock.close();

        // Determine wallet type based on localStorage
        const walletType = localStorage.getItem('walletKey') ? 'mobile' : 'yours';

        // Route based on wallet type:
        // SHUAllet users (mobile) -> /pickafox
        // Yours Wallet users -> /pickafoxyours
        const targetRoute = walletType === 'mobile' ? "/pickafox" : "/pickafoxyours";

        navigate(targetRoute, {
          state: {
            owneraddress: state.state.owneraddress,
            tag: true,
            activity: tempactivity,
            txid: txid,
            date: tempactivity.time,
            walletType: walletType
          }
        });
      }
    }
    setActivityMessage("Restarting Game...")
    setTimeout(() => {
      // if (tempactivity.taggeeoutpoint === foximagesrc) {
      //   // sock.close()
      //   setViewingTaggedInfo(false)
      //   setShowLeaving(true)
      // }
      if (tempactivity && tempactivity.taggeeoutpoint != foximagesrc) {
        setShowInfo(true)
        setViewingTaggedInfo(false)
      }
      //clear txid
      setActivityMessage("")
      setTxid("")
      setTxidLink("")
      setShowTxidLoading(true)
    }, 10000);

  }, [txid]);

  useEffect(() => {
    setLoaded(true)
    // window.scrollTo(0, 0);
    // setMyOrdAddress(state.state.owneraddress)
    // setFoxesOwned(state.state.foxes)
    // setFoxName(state.state.foxname)
    // setFoxImageSrc(state.state.originoutpoint)
    // setFoxImageUrl("https://ordfs.network/content/" + state.state.originoutpoint)
    // setFoxImageInfo("https://alpha.1satordinals.com/outpoint/" + state.state.originoutpoint + "/inscription")
    // setTagOrdAddress("13m9K5GrXvLoyRaFoj6ooFWWm6kBHVHmgF")
  }, []);

  //disable arrow keys
  window.addEventListener("keydown", function (e) {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
      e.preventDefault();
    }
  }, false);


  let playersArray = [];
  var chaserId;
  var newchaser = false;
  var latestactivity;

  //tag code

  useEffect(() => {
    if (!didMount2.current) {
      didMount2.current = true;
      return;
    }

    //draw bg to canvas context

    //assign background - use mobile-optimized version on mobile devices
    const background = new Image();
    const isMobileDevice = window.innerWidth <= 768;
    background.src = isMobileDevice ? "tagbg_mobile.jpg" : "tagbg.jpg";
    // assign spaceship right
    const img2 = new Image();
    img2.src = "spaceship3.png";
    const img3 = new Image();
    img3.src = "spaceship3fast.png";


    // Make sure the image is loaded first otherwise nothing will draw.
    // background.onload = function(){
    //     canvasContext.drawImage(background,0,0);   
    // }




    //online
    // const socket = io('', { path: '/tag' })
    //offline  
    const socket = io('http://localhost:5000', { path: '/tag' })
    setSock(socket)
    // socket.on('connect', () => console.log(socket.id))
    socket.on('connect_error', () => {
      setTimeout(() => socket.connect(), 1000)
    })

    //declare game variable
    var Game: any = {};



    socket.on('connect', function () {
      setSock(socket)

      // Listen for wall collision broadcasts from server
      socket.on('projectileHitWallBroadcast', function () {
        playboom();
      });

      //tag code
      //initialize my player variable
      let thisPlayer: PlayersArray = {
        id: socket.id,
        owneraddress: "",
        outpoint: "",
        currentoutpoint: "",
        foxname: "",
        image: "",
        imagelink: "",
        x: rand1,
        y: rand2,
        speed: 400,
        height: 50,
        width: 50,
        dir: 1,
        projectiles: []
      };
      // // console.log(thisPlayer);
      // socket.emit('playing', thisPlayer);

      // let thisPlayer=playersarray[0];
      //new player update playersArray
      socket.on('newPlayer', function (data) {
        //setplayersarray if changed
        setPlayersArray(data);

        // If this is the first player and we don't have a followed player yet, follow them
        if (data.length === 1 && !followedPlayerIdRef.current) {
          setFollowedPlayerId(data[0].id);
          followedPlayerIdRef.current = data[0].id;
          // console.log('Setting initial follow player:', data[0].id);
        }
      });
      socket.on('awaitingActivity', function (data) {
        console.log("=== TAG.TSX (SPECTATOR) RECEIVED AWAITING ACTIVITY EVENT ===");
        console.log("Activity data received:", data);
        console.log("Activity data type:", typeof data);

        playboom()

        // Validate data before setting temp activity
        if (data && typeof data === 'object') {
          let temp: ActivityArray = data;
          setTempActivity(data);

          setShowInfo(false)
          setViewingTaggedInfo(true)
          setActivityMessage("Getting Transaction Id...")
          //get new position
          newchaser = true;
        } else {
          console.error('Invalid awaiting activity data received:', data);
        }
        console.log("=== END TAG.TSX AWAITING ACTIVITY EVENT HANDLING ===");
      });

      socket.on('txid', function (data) {
        console.log("=== TAG.TSX (SPECTATOR) RECEIVED TXID EVENT ===");
        console.log("Raw data received:", data);
        console.log("Data type:", typeof data);

        let result;
        try {
          result = JSON.parse(data);
          console.log("Parsed result:", result);
          console.log("Has txid:", !!result.txid);
          console.log("Txid value:", result.txid);
        } catch (parseError) {
          console.error("Error parsing txid data:", parseError);
          console.log("Data that failed to parse:", data);
          return;
        }

        if (result.txid) {
          console.log("Setting txid to:", result.txid);
          setShowTxidLoading(false)
          setTxid(result.txid)
        } else {
          console.log("No txid in result, setting message:", result.message);
          setTxid(result.message)
        }
        console.log("=== END TAG.TSX TXID EVENT HANDLING ===");
      });

      socket.on('alreadytagged', function () {
        //  console.log("already tagged, going home...")
        //see if next two lines work
        socket.close();
        goToIndex();
      });


      //new chaser
      socket.on('newChaser', function (id) {
        chaserId = id;
        setChaserId(chaserId)

        if (thisPlayer.id === chaserId) {
          setWhosIt("It")
        } else {
          setWhosIt("NotIt")
        }
      });

      //update players
      socket.on('updatePlayers', function (updatedPlayers) {
        // Check if the followed player left
        if (followedPlayerIdRef.current) {
          const followedPlayerStillExists = updatedPlayers.find(p => p.id === followedPlayerIdRef.current);
          if (!followedPlayerStillExists) {
            // console.log('Followed player left, clearing follow state');
            setFollowedPlayerId("");
            followedPlayerIdRef.current = "";
          }
        }

        playersArray = updatedPlayers;
        setPlayers(updatedPlayers.length);

        // Check for projectile removals by comparing with previous state
        updatedPlayers.forEach(player => {
          const localPlayer = playersArray.find(p => p.id === player.id);
          if (localPlayer && localPlayer.projectiles) {
            // Check if any projectiles were removed
            localPlayer.projectiles.forEach(oldProjectile => {
              // If an old projectile is not in the new projectiles array, it was removed
              const stillExists = player.projectiles.some(newProjectile =>
                newProjectile.x === oldProjectile.x &&
                newProjectile.y === oldProjectile.y
              );

              if (!stillExists) {
                // Check if it was near a wall when it disappeared
                const walls = [
                  { x: 1000, y: 800, width: 50, height: 800 },
                  { x: 2000, y: 1500, width: 50, height: 600 },
                  { x: 3500, y: 2000, width: 50, height: 700 },
                  { x: 4500, y: 1000, width: 50, height: 600 },
                  { x: 4000, y: 3000, width: 50, height: 500 },
                  { x: 500, y: 2000, width: 50, height: 800 }
                ];

                walls.forEach(wall => {
                  if (oldProjectile.x >= wall.x - 10 &&
                    oldProjectile.x <= wall.x + wall.width + 10 &&
                    oldProjectile.y >= wall.y - 10 &&
                    oldProjectile.y <= wall.y + wall.height + 10) {
                    playboom(); // Play boom sound when projectile disappears near a wall
                  }
                });
              }
            });
          }
          // Update local player's projectiles
          if (localPlayer) {
            localPlayer.projectiles = player.projectiles;
          }
        });
      });

      // Listen for bucket foxes data from server (spectators receive this)
      socket.on('bucketFoxesData', function (data) {
        // Store bucket foxes data
        setBucketFoxes(data.bucketFoxes);
        bucketFoxesRef.current = data.bucketFoxes;
      });

      // Listen for spacerock data from server
      socket.on('spaceRocksData', function (data) {
        // Store spacerock data
        setSpaceRocks(data.spaceRocks);
        setSpaceRocksCount(data.spaceRocksCount);
        setLatestBlockHash(data.latestBlockHash);
        spaceRocksRef.current = data.spaceRocks;
        // console.log('Received spacerock data:', data.spaceRocks.length, 'spacerocks');
        // console.log('First spacerock:', data.spaceRocks[0]);
        // console.log('Block hash:', data.latestBlockHash);
      });

      // Listen for spacerock activities to add to Latest Transactions
      socket.on('spacerockActivity', function (data) {
        // console.log('Received spacerock activity:', data);

        // Validate data before adding to activity array
        if (data && typeof data === 'object') {
          // Add spacerock activity to activity array for Latest Transactions
          setActivityArray(prevArray => {
            // Remove the initial placeholder activity if it exists
            const filteredArray = prevArray.filter(activity =>
              activity.taggerowneraddress !== "string" ||
              activity.taggeroutpoint !== "string"
            );

            // Add the new spacerock activity
            return [...filteredArray, data];
          });
        } else {
          //  console.error('Invalid spacerock activity data received:', data);
        }
      });

      // Listen for bounty fox activities to add to Latest Transactions
      socket.on('bountyFoxActivity', function (data) {
        // console.log('Received bounty fox activity:', data);

        // Validate data before adding to activity array
        if (data && typeof data === 'object') {
          // Add bounty fox activity to activity array for Latest Transactions
          setActivityArray(prevArray => {
            // Remove the initial placeholder activity if it exists
            const filteredArray = prevArray.filter(activity =>
              activity.taggerowneraddress !== "string" ||
              activity.taggeroutpoint !== "string"
            );

            // Add the new bounty fox activity
            return [...filteredArray, data];
          });
        } else {
          // console.error('Invalid bounty fox activity data received:', data);
        }
      });

      // Listen for when other players get assigned buckets (spectators can see this)
      socket.on('playerBucketAssigned', function (data) {
        // Get bucket fox data from local array
        const bucketFox = bucketFoxesRef.current[data.bucketIndex];

        // Store player bucket assignment
        setPlayerBucketAssignments(prev => ({
          ...prev,
          [data.playerId]: {
            bucketIndex: data.bucketIndex,
            bucketFox: bucketFox,
            playerOutpoint: data.playerOutpoint
          }
        }));

        // Update ref for rendering context
        playerBucketAssignmentsRef.current = {
          ...playerBucketAssignmentsRef.current,
          [data.playerId]: {
            bucketIndex: data.bucketIndex,
            bucketFox: bucketFox,
            playerOutpoint: data.playerOutpoint
          }
        };
      });

      // Listen for game number updates
      socket.on('tagGameNumber', (data) => {
        setGameNumber(data.gameNumber);
      });

      // wrapper for "class" Rectangle
      (function () {
        function Rectangle(left, top, width, height) {
          this.left = left || 0;
          this.top = top || 0;
          this.width = width || 0;
          this.height = height || 0;
          this.right = this.left + this.width;
          this.bottom = this.top + this.height;
        }

        Rectangle.prototype.set = function (left, top, /*optional*/ width, /*optional*/ height) {
          this.left = left;
          this.top = top;
          this.width = width || this.width;
          this.height = height || this.height
          this.right = (this.left + this.width);
          this.bottom = (this.top + this.height);
        }

        Rectangle.prototype.within = function (r) {
          return (r.left <= this.left &&
            r.right >= this.right &&
            r.top <= this.top &&
            r.bottom >= this.bottom);
        }

        Rectangle.prototype.overlaps = function (r) {
          return (this.left < r.right &&
            r.left < this.right &&
            this.top < r.bottom &&
            r.top < this.bottom);
        }

        // add "class" Rectangle to our Game object
        Game.Rectangle = Rectangle;

      })();


      // wrapper for "class" Camera (avoid global objects)
      (function () {

        // possibles axis to move the camera
        var AXIS = {
          NONE: 1,
          HORIZONTAL: 2,
          VERTICAL: 3,
          BOTH: 4
        };

        // Camera constructor
        function Camera(xView, yView, viewportWidth, viewportHeight, worldWidth, worldHeight) {
          // position of camera (left-top coordinate)
          this.xView = xView || 0;
          this.yView = yView || 0;

          // distance from followed object to border before camera starts move
          this.xDeadZone = 0; // min distance to horizontal borders
          this.yDeadZone = 0; // min distance to vertical borders

          // viewport dimensions
          this.wView = viewportWidth;
          this.hView = viewportHeight;

          // allow camera to move in vertical and horizontal axis
          this.axis = AXIS.BOTH;

          // object that should be followed
          this.followed = null;

          // zoom level
          this.zoom = 1;

          // rectangle that represents the viewport
          this.viewportRect = new Game.Rectangle(this.xView, this.yView, this.wView, this.hView);

          // rectangle that represents the world's boundary (room's boundary)
          this.worldRect = new Game.Rectangle(0, 0, worldWidth, worldHeight);

        }

        // gameObject needs to have "x" and "y" properties (as world(or room) position)
        Camera.prototype.follow = function (gameObject, xDeadZone, yDeadZone) {
          this.followed = gameObject;
          this.xDeadZone = xDeadZone;
          this.yDeadZone = yDeadZone;
        }

        Camera.prototype.update = function () {
          // keep following the player (or other desired object)
          if (this.followed != null) {
            // Calculate zoom-adjusted dead zones
            const zoomedDeadZoneX = this.xDeadZone / this.zoom;
            const zoomedDeadZoneY = this.yDeadZone / this.zoom;

            if (this.axis == AXIS.HORIZONTAL || this.axis == AXIS.BOTH) {
              // moves camera on horizontal axis based on followed object position
              // Use zoom-adjusted viewport width for proper centering
              const zoomedViewWidth = this.wView / this.zoom;
              if (this.followed.x - this.xView + zoomedDeadZoneX > zoomedViewWidth)
                this.xView = this.followed.x - (zoomedViewWidth - zoomedDeadZoneX);
              else if (this.followed.x - zoomedDeadZoneX < this.xView)
                this.xView = this.followed.x - zoomedDeadZoneX;
            }
            if (this.axis == AXIS.VERTICAL || this.axis == AXIS.BOTH) {
              // moves camera on vertical axis based on followed object position
              // Use zoom-adjusted viewport height for proper centering
              const zoomedViewHeight = this.hView / this.zoom;
              if (this.followed.y - this.yView + zoomedDeadZoneY > zoomedViewHeight)
                this.yView = this.followed.y - (zoomedViewHeight - zoomedDeadZoneY);
              else if (this.followed.y - zoomedDeadZoneY < this.yView)
                this.yView = this.followed.y - zoomedDeadZoneY;
            }
          }

          // update viewportRect with zoom-adjusted dimensions
          this.viewportRect.set(this.xView, this.yView, this.wView / this.zoom, this.hView / this.zoom);

          // don't let camera leaves the world's boundary (accounting for zoom)
          if (!this.viewportRect.within(this.worldRect)) {
            if (this.viewportRect.left < this.worldRect.left)
              this.xView = this.worldRect.left;
            if (this.viewportRect.top < this.worldRect.top)
              this.yView = this.worldRect.top;
            if (this.viewportRect.right > this.worldRect.right)
              this.xView = this.worldRect.right - (this.wView / this.zoom);
            if (this.viewportRect.bottom > this.worldRect.bottom)
              this.yView = this.worldRect.bottom - (this.hView / this.zoom);
          }
        }

        Camera.prototype.setZoom = function (zoom) {
          this.zoom = Math.max(0.25, Math.min(3, zoom));
        }

        // add "class" Camera to our Game object
        Game.Camera = Camera;

      })();

      // wrapper for "class" Player
      (function () {
        function Player(x, y) {
          // (x, y) = center of object
          // ATTENTION:
          // it represents the player position on the world(room), not the canvas position
          this.x = x;
          this.y = y;

          // move speed in pixels per second
          this.speed = 300;

          // render properties
          this.width = 50;
          this.height = 50;

          // For spectator player: joystick input and velocity for smooth movement
          this.joystickX = 0;
          this.joystickY = 0;
          this.joystickDistance = 0;
          this.velocityX = 0;
          this.velocityY = 0;
          this.targetVelocityX = 0;
          this.targetVelocityY = 0;
        }

        Player.prototype.update = function (step, worldWidth, worldHeight) {
          // Handle spectator player joystick movement
          if (this.isSpectator) {
            const moveSpeed = 400; // pixels per second - slower than regular players
            const margin = 100; // Allow some buffer beyond world edges

            // Use direct movement like the regular player for instant response
            if (this.joystickDistance > 0.1) {
              const speedMultiplier = Math.min(this.joystickDistance, 1.0); // Cap at 1.0 for max speed

              // Calculate movement amounts
              let deltaX = this.joystickX * moveSpeed * speedMultiplier * step;
              let deltaY = this.joystickY * moveSpeed * speedMultiplier * step;

              // Check boundaries and prevent movement in blocked directions
              // Use strict boundary checking for instant response
              if (this.x <= -margin && this.joystickX < 0) deltaX = 0;
              if (this.x >= worldWidth + margin && this.joystickX > 0) deltaX = 0;
              if (this.y <= -margin && this.joystickY < 0) deltaY = 0;
              if (this.y >= worldHeight + margin && this.joystickY > 0) deltaY = 0;

              // Apply movement directly (no velocity interpolation)
              this.x += deltaX;
              this.y += deltaY;

              // Debug logging (only log occasionally to avoid spam)
              if (Math.random() < 0.01) { // 1% chance to log
                // console.log('Spectator moving:', {
                //   joystickX: this.joystickX,
                //   joystickY: this.joystickY,
                //   deltaX: deltaX,
                //   deltaY: deltaY,
                //   newX: this.x,
                //   newY: this.y
                // });
              }
            }

            // Keep spectator within world boundaries
            if (this.x < -margin) {
              this.x = -margin;
            }
            if (this.y < -margin) {
              this.y = -margin;
            }
            if (this.x > worldWidth + margin) {
              this.x = worldWidth + margin;
            }
            if (this.y > worldHeight + margin) {
              this.y = worldHeight + margin;
            }

            return;
          }

          // parameter step is the time between frames ( in seconds )
          // double speed if space
          if (newchaser === true) {
            this.x = (Math.round((Math.floor(Math.random() * 3999) + 1) / 10) * 10);
            this.y = (Math.round((Math.floor(Math.random() * 3999) + 1) / 10) * 10);
            //  console.log(this.x, this.y)
            newchaser = false;
          }

          if (Game.controls.b === true) {
            this.speed = 800;
            thisPlayer.speed = 800;
          } else {
            this.speed = 300;
            thisPlayer.speed = 300;
          }

          // check controls and move the player accordingly
          if (Game.controls.left) {
            //face left
            thisPlayer.dir = -1;
            this.x -= this.speed * step;
          }

          if (Game.controls.up)
            this.y -= this.speed * step;
          if (Game.controls.right) {
            //face right
            thisPlayer.dir = 1;
            this.x += this.speed * step;
          }

          if (Game.controls.down)
            this.y += this.speed * step;

          // don't let player leaves the world's boundary
          if (this.x - this.width / 2 < 0) {
            this.x = this.width / 2;
          }
          if (this.y - this.height / 2 < 0) {
            this.y = this.height / 2;
          }
          if (this.x + this.width / 2 > worldWidth) {
            this.x = worldWidth - this.width / 2;
          }
          if (this.y + this.height / 2 > worldHeight) {
            this.y = worldHeight - this.height / 2;
          }

          // Update projectiles
          if (thisPlayer.projectiles) {
            thisPlayer.projectiles.forEach((projectile, index) => {
              projectile.x += projectile.dir * projectile.speed * step;

              // Remove projectile if it goes off screen
              if (projectile.x < 0 || projectile.x > worldWidth) {
                thisPlayer.projectiles.splice(index, 1);
              }
            });
          }

          //update player
          thisPlayer.x = this.x;
          thisPlayer.y = this.y;


          //not updating
          // socket.emit('updatePlayer', thisPlayer);


        }

        Player.prototype.draw = function (context, xView, yView, zoom) {
          // Skip drawing for spectator player
          if (this.isSpectator) {
            return;
          }

          // Apply zoom transformation
          context.save();
          context.scale(zoom, zoom);
          // draw a simple rectangle shape as our player model
          // context.save();
          // before draw we need to convert player world's position to canvas position			
          // context.fillRect((this.x - this.width / 2) - xView, (this.y - this.height / 2) - yView, this.width, this.height);

          // img.src = "android-chrome-192x192.png";


          //should not be creating new image eact time, store locally outside this function


          //rocket
          let rocket;
          if (thisPlayer.speed === 300) {
            rocket = img2;
          } else {
            rocket = img3;
          }
          // const img = new Image();
          // img.src = "https://ordfs.network/content/" + thisPlayer.outpoint;
          // if (thisPlayer.id === chaserId) {

          // context.strokeStyle = '#f00';  // some color/style
          // context.lineWidth = 3;         // thickness

          //   if (thisPlayer.dir === -1) {
          //     context.save();
          //     context.scale(-1, 1)
          //     context.shadowColor = '#FFEA00';
          //     context.shadowBlur = 50;
          //     context.shadowOffsetX = 0;
          //     context.shadowOffsetY = 0;
          //     context.drawImage(img, -(this.x - this.width / 2) + xView - 50, (this.y - this.height / 2) - yView, 50, 50);
          //     // context.strokeRect(-(this.x - this.width / 2) + xView-50, (this.y - this.height / 2) - yView, 50, 50);
          //     context.drawImage(rocket, -(this.x - this.width / 2) + xView - 150, (this.y - this.height / 2) - yView, 220, 110);
          //     context.restore();
          //   } else {
          //     context.save();
          //     context.shadowColor = '#FFEA00';
          //     context.shadowBlur = 50;
          //     context.shadowOffsetX = 0;
          //     context.shadowOffsetY = 0;
          //     context.drawImage(img, (this.x - this.width / 2) - xView, (this.y - this.height / 2) - yView, 50, 50);
          //     // context.strokeRect((this.x - this.width / 2) - xView, (this.y - this.height / 2) - yView, 50, 50);
          //     context.drawImage(rocket, (this.x - this.width / 2) - xView - 100, (this.y - this.height / 2) - yView, 220, 110);
          //     context.restore();
          //   }
          // } else {
          //   if (thisPlayer.dir === -1) {
          //     context.save();
          //     context.scale(-1, 1)
          //     context.drawImage(img, -(this.x - this.width / 2) + xView - 50, (this.y - this.height / 2) - yView, 50, 50);
          //     context.drawImage(rocket, -(this.x - this.width / 2) + xView - 150, (this.y - this.height / 2) - yView, 220, 110);
          //     context.restore();
          //   } else {
          //     context.drawImage(img, (this.x - this.width / 2) - xView, (this.y - this.height / 2) - yView, 50, 50);
          //     context.drawImage(rocket, (this.x - this.width / 2) - xView - 100, (this.y - this.height / 2) - yView, 220, 110);
          //   }


          // }
          // context.restore();

          //add other players
          playersArray.forEach(function (opponent) {

            const img = new Image();
            img.src = "https://ordfs.network/content/" + opponent.outpoint;

            // img.src = "android-chrome-192x192.png";
            let opprocket;
            if (opponent.speed === 300) {
              opprocket = img2;
            } else {
              opprocket = img3;
            }

            //temp
            // img.src = "android-chrome-192x192.png";

            if (opponent.id != thisPlayer.id) {


              if (opponent.id === chaserId) {
                context.strokeStyle = '#f00';  // some color/style
                context.lineWidth = 3;         // thickness


                // context.save();
                // context.scale(opponent.dir,1)
                if (opponent.dir === -1) {
                  context.save();
                  context.scale(-1, 1)
                  context.shadowColor = '#FFEA00';
                  context.shadowBlur = 50;
                  context.shadowOffsetX = 0;
                  context.shadowOffsetY = 0;
                  context.drawImage(img, -opponent.x + xView - 25, opponent.y - yView - 25, 50, 50);
                  // context.strokeRect(-opponent.x+xView-25, opponent.y-yView-25, 50, 50);
                  context.drawImage(opprocket, -opponent.x + xView - 125, opponent.y - yView - 45, 220, 110);
                  context.restore();

                } else {
                  context.save();
                  context.shadowColor = '#FFEA00';
                  context.shadowBlur = 50;
                  context.shadowOffsetX = 0;
                  context.shadowOffsetY = 0;
                  context.drawImage(img, opponent.x - xView - 25, opponent.y - yView - 25, 50, 50);
                  // context.strokeRect(opponent.x-xView-25, opponent.y-yView-25, 50, 50);
                  context.drawImage(opprocket, opponent.x - xView - 100 - 25, opponent.y - yView - 45, 220, 110);
                  context.restore();

                }

                // Draw fox name or group name below the player
                const playerAssignment = playerBucketAssignmentsRef.current[opponent.id];



                // Always draw a name - either from bucket data or fallback to player's fox name
                let displayName = 'Unknown Fox';
                let hasBucketData = false;

                if (playerAssignment && playerAssignment.bucketFox) {
                  const bucketFox = playerAssignment.bucketFox;
                  hasBucketData = true;

                  if (bucketFox.bucket === '1x') {
                    // For 1x foxes, show the individual fox name
                    displayName = bucketFox.foxName || bucketFox.name || 'Falling Fox';
                  } else {
                    // For group foxes, show the group name
                    displayName = bucketFox.groupName || bucketFox.name || 'Group Fox';
                  }
                } else {
                  // Fallback: show the player's fox name if no bucket data
                  displayName = opponent.foxname || 'Unknown Fox';
                }

                // Set text style
                context.fillStyle = '#FFFFFF';
                context.font = 'bold 14px Arial';
                context.textAlign = 'center';
                context.strokeStyle = '#000000';
                context.lineWidth = 3;

                // Draw text with outline for better visibility
                const textX = opponent.x - xView;
                const textY = opponent.y - yView + 40; // Position below the fox

                // Draw outline
                context.strokeText(displayName, textX, textY);
                // Draw main text
                context.fillText(displayName, textX, textY);

                // Only draw bucket fox images if we have bucket data
                if (hasBucketData && playerAssignment && playerAssignment.bucketFox) {
                  const bucketFox = playerAssignment.bucketFox;

                  // Draw fox images for 1x buckets
                  if (bucketFox.bucket === '1x') {
                    const foxImageUrl = bucketFox.img || bucketFox.image;
                    if (foxImageUrl) {
                      // Use cached image if available, otherwise load it
                      let foxImage = bucketFoxImageCacheRef.current?.get(foxImageUrl);
                      if (!foxImage) {
                        foxImage = new Image();
                        foxImage.crossOrigin = 'anonymous';
                        foxImage.onload = () => {
                          if (!bucketFoxImageCacheRef.current) {
                            bucketFoxImageCacheRef.current = new Map();
                          }
                          bucketFoxImageCacheRef.current.set(foxImageUrl, foxImage);
                        };
                        foxImage.src = foxImageUrl;
                      }

                      // Only draw if image is loaded
                      if (foxImage && foxImage.complete && foxImage.naturalWidth > 0) {
                        // Draw the fox image with rounded corners and border
                        const foxSize = 40;
                        const borderRadius = 4;
                        const borderWidth = 1;
                        const borderColor = '#ffffff';
                        const foxX = textX - foxSize / 2;
                        const foxY = textY + 10; // 10px below the text

                        // Save the current context state
                        context.save();

                        // Create rounded rectangle path for clipping
                        context.beginPath();
                        context.moveTo(foxX + borderRadius, foxY);
                        context.lineTo(foxX + foxSize - borderRadius, foxY);
                        context.quadraticCurveTo(foxX + foxSize, foxY, foxX + foxSize, foxY + borderRadius);
                        context.lineTo(foxX + foxSize, foxY + foxSize - borderRadius);
                        context.quadraticCurveTo(foxX + foxSize, foxY + foxSize, foxX + foxSize - borderRadius, foxY + foxSize);
                        context.lineTo(foxX + borderRadius, foxY + foxSize);
                        context.quadraticCurveTo(foxX, foxY + foxSize, foxX, foxY + foxSize - borderRadius);
                        context.lineTo(foxX, foxY + borderRadius);
                        context.quadraticCurveTo(foxX, foxY, foxX + borderRadius, foxY);
                        context.closePath();
                        context.clip();

                        // Draw the fox image
                        context.drawImage(foxImage, foxX, foxY, foxSize, foxSize);

                        // Restore context to remove clipping
                        context.restore();

                        // Draw border
                        context.strokeStyle = borderColor;
                        context.lineWidth = borderWidth;
                        context.beginPath();
                        context.moveTo(foxX + borderRadius, foxY);
                        context.lineTo(foxX + foxSize - borderRadius, foxY);
                        context.quadraticCurveTo(foxX + foxSize, foxY, foxX + foxSize, foxY + borderRadius);
                        context.lineTo(foxX + foxSize, foxY + foxSize - borderRadius);
                        context.quadraticCurveTo(foxX + foxSize, foxY + foxSize, foxX + foxSize - borderRadius, foxY + foxSize);
                        context.lineTo(foxX + borderRadius, foxY + foxSize);
                        context.quadraticCurveTo(foxX, foxY + foxSize, foxX, foxY + foxSize - borderRadius);
                        context.lineTo(foxX, foxY + borderRadius);
                        context.quadraticCurveTo(foxX, foxY, foxX + borderRadius, foxY);
                        context.closePath();
                        context.stroke();
                      }
                    }
                  }

                  // Draw cycling fox images below the name for group buckets
                  if (bucketFox.bucket !== '1x' && bucketFox.groupFoxes) {
                    const playerKey = `player_${opponent.id}`;
                    const currentCycling = cyclingImagesRef.current[playerKey] || { currentIndex: 0, lastChange: Date.now() };
                    const currentGroupFox = bucketFox.groupFoxes[currentCycling.currentIndex];

                    if (currentGroupFox) {
                      // Use cached image if available, otherwise load it
                      let foxImage = bucketFoxImageCacheRef.current?.get(currentGroupFox.outpoint);
                      if (!foxImage) {
                        foxImage = new Image();
                        foxImage.crossOrigin = 'anonymous';
                        foxImage.onload = () => {
                          if (!bucketFoxImageCacheRef.current) {
                            bucketFoxImageCacheRef.current = new Map();
                          }
                          bucketFoxImageCacheRef.current.set(currentGroupFox.outpoint, foxImage);
                        };
                        foxImage.src = currentGroupFox.img;
                      }
                      // Only draw if image is loaded
                      if (foxImage && foxImage.complete && foxImage.naturalWidth > 0) {
                        // Draw the fox image with rounded corners and border
                        const foxSize = 40;
                        const borderRadius = 4;
                        const borderWidth = 1;
                        const borderColor = '#ffffff';
                        const foxX = textX - foxSize / 2;
                        const foxY = textY + 10; // 10px below the text
                        // Save the current context state
                        context.save();
                        // Create rounded rectangle path for clipping
                        context.beginPath();
                        context.moveTo(foxX + borderRadius, foxY);
                        context.lineTo(foxX + foxSize - borderRadius, foxY);
                        context.quadraticCurveTo(foxX + foxSize, foxY, foxX + foxSize, foxY + borderRadius);
                        context.lineTo(foxX + foxSize, foxY + foxSize - borderRadius);
                        context.quadraticCurveTo(foxX + foxSize, foxY + foxSize, foxX + foxSize - borderRadius, foxY + foxSize);
                        context.lineTo(foxX + borderRadius, foxY + foxSize);
                        context.quadraticCurveTo(foxX, foxY + foxSize, foxX, foxY + foxSize - borderRadius);
                        context.lineTo(foxX, foxY + borderRadius);
                        context.quadraticCurveTo(foxX, foxY, foxX + borderRadius, foxY);
                        context.closePath();
                        context.clip();
                        // Draw the fox image
                        context.drawImage(foxImage, foxX, foxY, foxSize, foxSize);
                        // Restore context to remove clipping
                        context.restore();
                        // Draw border
                        context.strokeStyle = borderColor;
                        context.lineWidth = borderWidth;
                        context.beginPath();
                        context.moveTo(foxX + borderRadius, foxY);
                        context.lineTo(foxX + foxSize - borderRadius, foxY);
                        context.quadraticCurveTo(foxX + foxSize, foxY, foxX + foxSize, foxY + borderRadius);
                        context.lineTo(foxX + foxSize, foxY + foxSize - borderRadius);
                        context.quadraticCurveTo(foxX + foxSize, foxY + foxSize, foxX + foxSize - borderRadius, foxY + foxSize);
                        context.lineTo(foxX + borderRadius, foxY + foxSize);
                        context.quadraticCurveTo(foxX, foxY + foxSize, foxX, foxY + foxSize - borderRadius);
                        context.lineTo(foxX, foxY + borderRadius);
                        context.quadraticCurveTo(foxX, foxY, foxX + borderRadius, foxY);
                        context.closePath();
                        context.stroke();
                      }
                    }
                  }
                }

                // context.restore();
                //   context.drawImage(img2, opponent.x - xView-90, opponent.y - yView+10, 220, 110);
                //   canvascontext.strokeRect(opponent.x - xView, opponent.y - yView, 50, 50);
              } else {

                if (opponent.dir === -1) {
                  context.save();
                  context.scale(-1, 1)
                  context.drawImage(img, -opponent.x + xView - 25, opponent.y - yView - 25, 50, 50);
                  context.drawImage(opprocket, -opponent.x + xView - 125, opponent.y - yView - 45, 220, 110);
                  context.restore();

                } else {

                  context.drawImage(img, opponent.x - xView - 25, opponent.y - yView - 25, 50, 50);
                  context.drawImage(opprocket, opponent.x - xView - 100 - 25, opponent.y - yView - 45, 220, 110);


                }

                // Draw fox name or group name below the player (non-chaser case)
                const playerAssignment = playerBucketAssignmentsRef.current[opponent.id];

                // Always draw a name - either from bucket data or fallback to player's fox name
                let displayName = 'Unknown Fox';
                let hasBucketData = false;

                if (playerAssignment && playerAssignment.bucketFox) {
                  const bucketFox = playerAssignment.bucketFox;
                  hasBucketData = true;

                  if (bucketFox.bucket === '1x') {
                    // For 1x foxes, show the individual fox name
                    displayName = bucketFox.foxName || bucketFox.name || 'Falling Fox';
                  } else {
                    // For group foxes, show the group name
                    displayName = bucketFox.groupName || bucketFox.name || 'Group Fox';
                  }
                } else {
                  // Fallback: show the player's fox name if no bucket data
                  displayName = opponent.foxname || 'Unknown Fox';
                }

                // Set text style
                context.fillStyle = '#FFFFFF';
                context.font = 'bold 14px Arial';
                context.textAlign = 'center';
                context.strokeStyle = '#000000';
                context.lineWidth = 3;

                // Draw text with outline for better visibility
                const textX = opponent.x - xView;
                const textY = opponent.y - yView + 40; // Position below the fox

                // Draw outline
                context.strokeText(displayName, textX, textY);
                // Draw main text
                context.fillText(displayName, textX, textY);

                // Only draw bucket fox images if we have bucket data
                if (hasBucketData && playerAssignment && playerAssignment.bucketFox) {
                  const bucketFox = playerAssignment.bucketFox;

                  // Draw fox images for 1x buckets
                  if (bucketFox.bucket === '1x') {
                    const foxImageUrl = bucketFox.img || bucketFox.image;
                    if (foxImageUrl) {
                      // Use cached image if available, otherwise load it
                      let foxImage = bucketFoxImageCacheRef.current?.get(foxImageUrl);
                      if (!foxImage) {
                        foxImage = new Image();
                        foxImage.crossOrigin = 'anonymous';
                        foxImage.onload = () => {
                          if (!bucketFoxImageCacheRef.current) {
                            bucketFoxImageCacheRef.current = new Map();
                          }
                          bucketFoxImageCacheRef.current.set(foxImageUrl, foxImage);
                        };
                        foxImage.src = foxImageUrl;
                      }

                      // Only draw if image is loaded
                      if (foxImage && foxImage.complete && foxImage.naturalWidth > 0) {
                        // Draw the fox image with rounded corners and border
                        const foxSize = 40;
                        const borderRadius = 4;
                        const borderWidth = 1;
                        const borderColor = '#ffffff';
                        const foxX = textX - foxSize / 2;
                        const foxY = textY + 10; // 10px below the text

                        // Save the current context state
                        context.save();

                        // Create rounded rectangle path for clipping
                        context.beginPath();
                        context.moveTo(foxX + borderRadius, foxY);
                        context.lineTo(foxX + foxSize - borderRadius, foxY);
                        context.quadraticCurveTo(foxX + foxSize, foxY, foxX + foxSize, foxY + borderRadius);
                        context.lineTo(foxX + foxSize, foxY + foxSize - borderRadius);
                        context.quadraticCurveTo(foxX + foxSize, foxY + foxSize, foxX + foxSize - borderRadius, foxY + foxSize);
                        context.lineTo(foxX + borderRadius, foxY + foxSize);
                        context.quadraticCurveTo(foxX, foxY + foxSize, foxX, foxY + foxSize - borderRadius);
                        context.lineTo(foxX, foxY + borderRadius);
                        context.quadraticCurveTo(foxX, foxY, foxX + borderRadius, foxY);
                        context.closePath();
                        context.clip();

                        // Draw the fox image
                        context.drawImage(foxImage, foxX, foxY, foxSize, foxSize);

                        // Restore context to remove clipping
                        context.restore();

                        // Draw border
                        context.strokeStyle = borderColor;
                        context.lineWidth = borderWidth;
                        context.beginPath();
                        context.moveTo(foxX + borderRadius, foxY);
                        context.lineTo(foxX + foxSize - borderRadius, foxY);
                        context.quadraticCurveTo(foxX + foxSize, foxY, foxX + foxSize, foxY + borderRadius);
                        context.lineTo(foxX + foxSize, foxY + foxSize - borderRadius);
                        context.quadraticCurveTo(foxX + foxSize, foxY + foxSize, foxX + foxSize - borderRadius, foxY + foxSize);
                        context.lineTo(foxX + borderRadius, foxY + foxSize);
                        context.quadraticCurveTo(foxX, foxY + foxSize, foxX, foxY + foxSize - borderRadius);
                        context.lineTo(foxX, foxY + borderRadius);
                        context.quadraticCurveTo(foxX, foxY, foxX + borderRadius, foxY);
                        context.closePath();
                        context.stroke();
                      }
                    }
                  }

                  // Draw cycling fox images below the name for group buckets
                  if (bucketFox.bucket !== '1x' && bucketFox.groupFoxes) {
                    const playerKey = `player_${opponent.id}`;
                    const currentCycling = cyclingImagesRef.current[playerKey] || { currentIndex: 0, lastChange: Date.now() };
                    const currentGroupFox = bucketFox.groupFoxes[currentCycling.currentIndex];

                    if (currentGroupFox) {
                      // Use cached image if available, otherwise load it
                      let foxImage = bucketFoxImageCacheRef.current?.get(currentGroupFox.outpoint);
                      if (!foxImage) {
                        foxImage = new Image();
                        foxImage.crossOrigin = 'anonymous';
                        foxImage.onload = () => {
                          if (!bucketFoxImageCacheRef.current) {
                            bucketFoxImageCacheRef.current = new Map();
                          }
                          bucketFoxImageCacheRef.current.set(currentGroupFox.outpoint, foxImage);
                        };
                        foxImage.src = currentGroupFox.img;
                      }
                      // Only draw if image is loaded
                      if (foxImage && foxImage.complete && foxImage.naturalWidth > 0) {
                        // Draw the fox image with rounded corners and border
                        const foxSize = 40;
                        const borderRadius = 4;
                        const borderWidth = 1;
                        const borderColor = '#ffffff';
                        const foxX = textX - foxSize / 2;
                        const foxY = textY + 10; // 10px below the text
                        // Save the current context state
                        context.save();
                        // Create rounded rectangle path for clipping
                        context.beginPath();
                        context.moveTo(foxX + borderRadius, foxY);
                        context.lineTo(foxX + foxSize - borderRadius, foxY);
                        context.quadraticCurveTo(foxX + foxSize, foxY, foxX + foxSize, foxY + borderRadius);
                        context.lineTo(foxX + foxSize, foxY + foxSize - borderRadius);
                        context.quadraticCurveTo(foxX + foxSize, foxY + foxSize, foxX + foxSize - borderRadius, foxY + foxSize);
                        context.lineTo(foxX + borderRadius, foxY + foxSize);
                        context.quadraticCurveTo(foxX, foxY + foxSize, foxX, foxY + foxSize - borderRadius);
                        context.lineTo(foxX, foxY + borderRadius);
                        context.quadraticCurveTo(foxX, foxY, foxX + borderRadius, foxY);
                        context.closePath();
                        context.clip();
                        // Draw the fox image
                        context.drawImage(foxImage, foxX, foxY, foxSize, foxSize);
                        // Restore context to remove clipping
                        context.restore();
                        // Draw border
                        context.strokeStyle = borderColor;
                        context.lineWidth = borderWidth;
                        context.beginPath();
                        context.moveTo(foxX + borderRadius, foxY);
                        context.lineTo(foxX + foxSize - borderRadius, foxY);
                        context.quadraticCurveTo(foxX + foxSize, foxY, foxX + foxSize, foxY + borderRadius);
                        context.lineTo(foxX + foxSize, foxY + foxSize - borderRadius);
                        context.quadraticCurveTo(foxX + foxSize, foxY + foxSize, foxX + foxSize - borderRadius, foxY + foxSize);
                        context.lineTo(foxX + borderRadius, foxY + foxSize);
                        context.quadraticCurveTo(foxX, foxY + foxSize, foxX, foxY + foxSize - borderRadius);
                        context.lineTo(foxX, foxY + borderRadius);
                        context.quadraticCurveTo(foxX, foxY, foxX + borderRadius, foxY);
                        context.closePath();
                        context.stroke();
                      }
                    }
                  }
                }
                //   context.drawImage(img2, opponent.x - xView-90, opponent.y - yView+10, 220, 110);
              }
            }



          })

          // Draw projectiles for all players
          playersArray.forEach(function (player) {
            if (player.projectiles) {
              player.projectiles.forEach(function (projectile) {
                // Check wall collisions before drawing
                const walls = [
                  { x: 1000, y: 800, width: 50, height: 800 },
                  { x: 2000, y: 1500, width: 50, height: 600 },
                  { x: 3500, y: 2000, width: 50, height: 700 },
                  { x: 4500, y: 1000, width: 50, height: 600 },
                  { x: 4000, y: 3000, width: 50, height: 500 },
                  { x: 500, y: 2000, width: 50, height: 800 }
                ];

                walls.forEach(wall => {
                  if (projectile.x >= wall.x &&
                    projectile.x <= wall.x + wall.width &&
                    projectile.y >= wall.y &&
                    projectile.y <= wall.y + wall.height) {
                    playboom(); // Play boom sound for everyone when any projectile hits a wall
                  }
                });

                context.save();

                // Add strong glow effect
                context.shadowColor = '#FFFF00';
                context.shadowBlur = 30;
                context.shadowOffsetX = 0;
                context.shadowOffsetY = 0;

                // Draw outer glow
                context.beginPath();
                context.arc(
                  projectile.x - xView,
                  projectile.y - yView,
                  12, // Larger radius for glow
                  0,
                  Math.PI * 2
                );
                context.fillStyle = 'rgba(255, 255, 0, 0.3)'; // Semi-transparent yellow
                context.fill();

                // Draw solid inner circle
                context.beginPath();
                context.arc(
                  projectile.x - xView,
                  projectile.y - yView,
                  8, // Inner radius
                  0,
                  Math.PI * 2
                );
                context.fillStyle = '#FFFF00'; // Solid yellow
                context.fill();

                context.restore();
              });
            }
          });

          context.restore();
        }

        // add "class" Player to our Game object
        Game.Player = Player;

      })();

      // wrapper for "class" Map
      (function () {
        function Map(width, height) {
          // map dimensions
          this.width = width;
          this.height = height;

          // map texture
          this.image = background;
        }

        // creates a prodedural generated map (you can use an image instead)
        Map.prototype.generate = function () {
          var ctx = document.createElement("canvas").getContext("2d");
          ctx.canvas.width = this.width;
          ctx.canvas.height = this.height;

          // var rows = ~~(this.width / 44) + 1;
          // var columns = ~~(this.height / 44) + 1;

          // store the generate map as this image texture
          // this.image = new Image();
          // this.image.src = ctx.canvas.toDataURL("tagbg.png");

          // clear context
          ctx = null;
        }

        // draw the map adjusted to camera
        Map.prototype.draw = function (context, xView, yView, zoom) {
          // Apply zoom transformation
          context.save();
          context.scale(zoom, zoom);

          // Improved viewport calculations to prevent blur at edges
          var sx = Math.max(0, xView);
          var sy = Math.max(0, yView);
          var sWidth = Math.min(context.canvas.width / zoom, this.width - sx);
          var sHeight = Math.min(context.canvas.height / zoom, this.height - sy);

          // Ensure we don't draw beyond the world boundaries
          if (sx >= this.width || sy >= this.height) {
            context.restore();
            return;
          }

          var dx = 0;
          var dy = 0;
          var dWidth = sWidth;
          var dHeight = sHeight;

          // Check if we're on mobile and should use gradient background
          if (window.innerWidth <= 768) {
            // Mobile gradient background - use pre-made gradient image for better performance
            if (!this.gradientImage) {
              this.gradientImage = new Image();
              // Create a simple blue gradient using canvas and data URL
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = 100;
              tempCanvas.height = 600;
              const tempCtx = tempCanvas.getContext('2d');
              const gradient = tempCtx.createLinearGradient(0, 0, 0, 600);
              gradient.addColorStop(0, '#1e3a8a');   // Dark blue at top
              gradient.addColorStop(0.5, '#1e40af'); // Medium dark blue in middle
              gradient.addColorStop(1, '#3b82f6');   // Blue at bottom
              tempCtx.fillStyle = gradient;
              tempCtx.fillRect(0, 0, 100, 600);
              this.gradientImage.src = tempCanvas.toDataURL();
            }

            // Draw the gradient image to fill the viewport
            context.drawImage(this.gradientImage, 0, 0, sWidth, sHeight);

            // Add random stars for better movement visibility on mobile
            if (!this.starsGenerated) {
              this.stars = [];
              const numStars = Math.floor((sWidth * sHeight) / 3000); // Much higher density - 1 star per 3000 pixels
              for (let i = 0; i < numStars; i++) {
                this.stars.push({
                  x: Math.random() * 6000, // Full world width
                  y: Math.random() * 4000, // Full world height
                  size: Math.random() * 4 + 2, // 2-6px stars (bigger)
                  brightness: Math.random() * 0.6 + 0.4 // 0.4-1.0 opacity (brighter)
                });
              }
              this.starsGenerated = true;
            }

            // Draw stars
            context.fillStyle = '#FFFFFF';
            this.stars.forEach(star => {
              const starX = star.x - xView;
              const starY = star.y - yView;

              // Only draw stars that are visible in the current view
              if (starX >= -5 && starX <= sWidth + 5 && starY >= -5 && starY <= sHeight + 5) {
                context.globalAlpha = star.brightness;
                context.beginPath();
                context.arc(starX, starY, star.size, 0, Math.PI * 2);
                context.fill();
              }
            });
            context.globalAlpha = 1.0; // Reset alpha
          } else {
            // Desktop - use the background image
            context.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
          }

          // Draw walls - same configuration as TagWithFox.tsx
          const walls = [
            { x: 1000, y: 800, width: 50, height: 800 },
            { x: 2000, y: 1500, width: 50, height: 600 },
            { x: 3500, y: 2000, width: 50, height: 700 },
            { x: 4500, y: 1000, width: 50, height: 600 },
            { x: 4000, y: 3000, width: 50, height: 500 },
            { x: 500, y: 2000, width: 50, height: 800 }
          ];

          context.fillStyle = '#000000';  // Black color
          walls.forEach(wall => {
            context.fillRect(
              wall.x - xView,
              wall.y - yView,
              wall.width,
              wall.height
            );
          });

          // Draw spacerocks
          const spacerocks = spaceRocksRef.current || [];

          // Only log very occasionally to avoid spam
          if (spacerocks.length > 0 && Math.random() < 0.001) {
            // console.log('Drawing spacerocks:', spacerocks.length, 'spacerocks');
          }

          spacerocks.forEach(spacerock => {
            // Only draw spacerocks that are visible in the current view
            const spacerockScreenX = spacerock.x - xView;
            const spacerockScreenY = spacerock.y - yView;

            if (spacerockScreenX >= -50 && spacerockScreenX <= sWidth + 50 &&
              spacerockScreenY >= -50 && spacerockScreenY <= sHeight + 50) {

              context.save();

              // Add glow effect
              context.shadowColor = spacerock.color;
              context.shadowBlur = 15;
              context.shadowOffsetX = 0;
              context.shadowOffsetY = 0;

              // Check if we have a cached version of this colored spacerock
              let dynamicImage = dynamicSpaceRockCacheRef.current.get(spacerock.color);

              if (!dynamicImage) {
                // Create dynamic SVG with the correct color
                const dynamicSvg = spaceRockSvgString.replace(/#36bffa/g, spacerock.color);
                // console.log('Creating new dynamic SVG for spacerock', spacerock.number, 'with color', spacerock.color);

                // Create a data URL from the SVG content
                const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(dynamicSvg)));

                // Create a new image with the dynamic color
                dynamicImage = new Image();
                dynamicImage.onload = () => {
                  // Cache the successfully loaded image
                  dynamicSpaceRockCacheRef.current.set(spacerock.color, dynamicImage);
                  // console.log('Cached dynamic spacerock SVG for color:', spacerock.color);
                };
                dynamicImage.onerror = (error) => {
                  // console.error('Failed to load dynamic spacerock SVG:', spacerock.color, error);
                  // Don't cache failed images
                  dynamicImage = null;
                };
                dynamicImage.src = svgDataUrl;
              }

              // Draw the spacerock if we have a valid image
              if (dynamicImage && dynamicImage.complete && dynamicImage.naturalWidth > 0) {
                const spacerockSize = 100;
                const spacerockX = spacerockScreenX - spacerockSize / 2;
                const spacerockY = spacerockScreenY - spacerockSize / 2;
                context.drawImage(dynamicImage, spacerockX, spacerockY, spacerockSize, spacerockSize);
              } else {
                // Fallback to colored circle if image isn't ready
                const spacerockSize = 100;
                const centerX = spacerockScreenX;
                const centerY = spacerockScreenY;
                const radius = spacerockSize / 2;

                context.beginPath();
                context.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
                context.fillStyle = spacerock.color;
                context.fill();
              }

              // Draw spacerock title
              context.fillStyle = '#FFFFFF';
              context.font = 'bold 14px Arial';
              context.textAlign = 'center';
              context.textBaseline = 'middle';
              context.shadowColor = '#000000';
              context.shadowBlur = 3;
              context.shadowOffsetX = 1;
              context.shadowOffsetY = 1;
              context.fillText(`Space Rock #${spacerock.number}`, spacerockScreenX, spacerockScreenY + 65);

              context.restore();
            }
          });

          context.restore();
        }

        // add "class" Map to our Game object
        Game.Map = Map;

      })();

      // Game Script
      (function () {
        // prepaire our game canvas
        // var canvas = document.getElementById("gameCanvas");
        // var canvas = canvasRef.current;

        // var context = canvascontext;


        // game settings:	
        var FPS = window.innerWidth <= 768 ? 20 : 30; // Lower FPS on mobile for better performance
        var INTERVAL = 1000 / FPS; // milliseconds
        var STEP = INTERVAL / 1000 // seconds

        // setup an object that represents the room
        var room = {
          width: 6000,
          height: 4000,
          map: new Game.Map(6000, 4000)
        };

        // generate a large image texture for the room
        room.map.generate();

        // setup player
        var player = new Game.Player(rand1, rand2);

        // Setup spectator player (invisible player for joystick control)
        var spectatorPlayer = new Game.Player(rand1, rand2);
        spectatorPlayer.isSpectator = true; // Mark as spectator player
        spectatorPlayerRef.current = spectatorPlayer;
        setSpectatorPlayer(spectatorPlayer);

        // Old camera setup. It not works with maps smaller than canvas. Keeping the code deactivated here as reference.
        /* var camera = new Game.Camera(0, 0, canvas.width, canvas.height, room.width, room.height);*/
        /* camera.follow(player, canvas.width / 2, canvas.height / 2); */

        // Set the right viewport size for the camera
        // Use actual canvas dimensions to prevent blur at edges
        var vWidth = Math.min(room.width, window.innerWidth);
        var vHeight = Math.min(room.height, window.innerHeight);

        // Setup the camera
        var camera = new Game.Camera(0, 0, vWidth, vHeight, room.width, room.height);
        cameraRef.current = camera;

        // Set initial zoom to 0.5
        camera.setZoom(0.5);

        // For spectators, follow the first player in the players array initially
        if (playersArray.length > 0) {
          camera.follow(playersArray[0], vWidth / 2, vHeight / 2);
          setFollowedPlayerId(playersArray[0].id);
          followedPlayerIdRef.current = playersArray[0].id;
        } else {
          camera.follow(player, vWidth / 2, vHeight / 2);
        }

        // Game update function
        var update = function () {
          player.update(STEP, room.width, room.height);
          // Update spectator player for joystick movement
          spectatorPlayer.update(STEP, room.width, room.height);

          // Check if spectator is using joystick control
          if (isUsingJoystickRef.current && spectatorPlayerRef.current) {
            // Spectator is controlling an invisible player - keep following it
            camera.follow(spectatorPlayerRef.current, vWidth / 2, vHeight / 2);
            // Debug logging (only log occasionally to avoid spam)
            if (Math.random() < 0.005) { // 0.5% chance to log
              // console.log('Camera following spectator:', {
              //   spectatorX: spectatorPlayerRef.current.x,
              //   spectatorY: spectatorPlayerRef.current.y,
              //   cameraX: camera.xView,
              //   cameraY: camera.yView
              // });
            }
          } else if (followedPlayerIdRef.current) {
            // Follow the selected player
            const followedPlayer = playersArray.find(p => p.id === followedPlayerIdRef.current);
            if (followedPlayer) {
              camera.follow(followedPlayer, vWidth / 2, vHeight / 2);
              // Debug logging (only log occasionally to avoid spam)
              if (Math.random() < 0.005) { // 0.5% chance to log
                // console.log('Camera following player:', {
                //   playerId: followedPlayerIdRef.current,
                //   playerX: followedPlayer.x,
                //   playerY: followedPlayer.y,
                //   cameraX: camera.xView,
                //   cameraY: camera.yView
                // });
              }
            } else {
              // If followed player left, clear the follow state and stop following anyone
              setFollowedPlayerId("");
              followedPlayerIdRef.current = "";
              // Don't automatically follow anyone - let spectator be free
              camera.follow(spectatorPlayerRef.current, vWidth / 2, vHeight / 2);
            }
          } else {
            // No specific follow target - spectator is free to move around
            // Keep following the spectator player at their current position
            camera.follow(spectatorPlayerRef.current, vWidth / 2, vHeight / 2);
          }

          camera.update();
        }


        // Game draw function
        var draw = function () {
          // clear the entire canvas

          canvascontext.clearRect(0, 0, canvascontext.width, canvascontext.height);

          // redraw all objects
          room.map.draw(canvascontext, camera.xView, camera.yView, camera.zoom);
          player.draw(canvascontext, camera.xView, camera.yView, camera.zoom);
          // Note: spectatorPlayer.draw() is not called - it's invisible

        }

        // Game Loop
        var gameLoop = function () {
          update();
          draw();
        }

        // <-- configure play/pause capabilities:

        // Using setInterval instead of requestAnimationFrame for better cross browser support,
        // but it's easy to change to a requestAnimationFrame polyfill.
        var runningId = -1;


        Game.play = function () {
          if (runningId == -1) {
            runningId = window.setInterval(function () {
              gameLoop();
            }, INTERVAL);
            //    console.log("play");
          }
        }

        // Game.togglePause = function() {
        //   if (runningId == -1) {
        Game.play();
        //   } else {
        //     clearInterval(runningId);
        //     runningId = -1;
        //     console.log("paused");
        //   }
        // }

        // -->

      })();

      // <-- configure Game controls:
      Game.controls = {
        left: false,
        up: false,
        right: false,
        down: false,
        b: false,
        n: false
      };

      window.addEventListener('keydown', function (event) {
        var key = event.key;

        // For spectators, keyboard controls the spectator player movement
        if (spectatorPlayerRef.current && !followedPlayerIdRef.current) {
          const moveSpeed = 400; // Same speed as joystick
          const step = 1 / 30; // Approximate step for keyboard movement

          if (key === 'w' || key === 'ArrowUp') {
            // Move spectator up
            spectatorPlayerRef.current.y -= moveSpeed * step;
            // Clear any followed player state and enable joystick mode
            setFollowedPlayerId("");
            followedPlayerIdRef.current = "";
            setIsUsingJoystick(true);
            isUsingJoystickRef.current = true;
          } else if (key === 's' || key === 'ArrowDown') {
            // Move spectator down
            spectatorPlayerRef.current.y += moveSpeed * step;
            setFollowedPlayerId("");
            followedPlayerIdRef.current = "";
            setIsUsingJoystick(true);
            isUsingJoystickRef.current = true;
          } else if (key === 'a' || key === 'ArrowLeft') {
            // Move spectator left
            spectatorPlayerRef.current.x -= moveSpeed * step;
            setFollowedPlayerId("");
            followedPlayerIdRef.current = "";
            setIsUsingJoystick(true);
            isUsingJoystickRef.current = true;
          } else if (key === 'd' || key === 'ArrowRight') {
            // Move spectator right
            spectatorPlayerRef.current.x += moveSpeed * step;
            setFollowedPlayerId("");
            followedPlayerIdRef.current = "";
            setIsUsingJoystick(true);
            isUsingJoystickRef.current = true;
          }

          // Keep spectator within world boundaries
          const margin = 100;
          const worldWidth = 6000;
          const worldHeight = 4000;

          if (spectatorPlayerRef.current.x < -margin) {
            spectatorPlayerRef.current.x = -margin;
          }
          if (spectatorPlayerRef.current.y < -margin) {
            spectatorPlayerRef.current.y = -margin;
          }
          if (spectatorPlayerRef.current.x > worldWidth + margin) {
            spectatorPlayerRef.current.x = worldWidth + margin;
          }
          if (spectatorPlayerRef.current.y > worldHeight + margin) {
            spectatorPlayerRef.current.y = worldHeight + margin;
          }

          return; // Don't process other controls for spectators
        }

        // Regular player controls (for actual players, not spectators)
        if (key === 'w' || key === 'ArrowUp') {
          Game.controls.up = true;
        } else if (key === 's' || key === 'ArrowDown') {
          Game.controls.down = true;
        } else if (key === 'a' || key === 'ArrowLeft') {
          Game.controls.left = true;
        } else if (key === 'd' || key === 'ArrowRight') {
          Game.controls.right = true;
        } else if (key === 'b') {
          Game.controls.b = true;
        } else if (key === 'n') {
          // Only allow chaser to shoot
          if (thisPlayer.id === chaserId) {
            // Create new projectile with offset from rocket tip
            const newProjectile = {
              x: thisPlayer.x + (thisPlayer.dir === 1 ? 120 : -120), // Offset to rocket tip
              y: thisPlayer.y + 30, // Align with rocket center
              dir: thisPlayer.dir,
              speed: 1200 // Increased speed for better feel
            };
            thisPlayer.projectiles = thisPlayer.projectiles || [];
            thisPlayer.projectiles.push(newProjectile);
            socket.emit('updatePlayer', thisPlayer);
          }
        }
      })

      window.addEventListener('keyup', function (event) {
        var key = event.key;

        // For spectators, we don't need to handle keyup for movement
        // since we're using direct position updates on keydown
        // But we can handle other keys if needed

        // Regular player controls (for actual players, not spectators)
        if (key === 'w' || key === 'ArrowUp') {
          Game.controls.up = false;
        } else if (key === 's' || key === 'ArrowDown') {
          Game.controls.down = false;
        } else if (key === 'a' || key === 'ArrowLeft') {
          Game.controls.left = false;
        } else if (key === 'd' || key === 'ArrowRight') {
          Game.controls.right = false;
        } else if (key === 'b') {
          Game.controls.b = false;
        } else if (key === 'n') {
          Game.controls.n = false;
        } else if (key === 'p') {
          Game.togglePause();
        }
      })


    }) //end socket on connect




    // socket.on('time', (data) => setTime(data))
    // socket.on('message', (data) => getMessage(data))
    // socket.on('viewers', (data) => setViewers(data))

    // Cleanup function for socket connection
    return () => {
      if (socket) {
        //console.log('Tag: Cleaning up socket connection from main useEffect');
        socket.close();
      }
    };

  }, [canvascontext]);

  //go home 
  const goToIndex = async () => {
    // Clean up socket before navigating
    if (sock) {
      // console.log('Tag: Cleaning up socket connection before going home');
      sock.close();
    }
    window.location.href = "https://foxplorer.org/";
  };

  // Function to handle following a specific player
  const handleFollowPlayer = (playerId: string) => {
    // console.log('Following player:', playerId);

    setFollowedPlayerId(playerId);
    followedPlayerIdRef.current = playerId;

    // Stop joystick control when switching to follow a player
    setIsUsingJoystick(false);
    isUsingJoystickRef.current = false;

    // Reset joystick input
    if (spectatorPlayerRef.current) {
      spectatorPlayerRef.current.joystickX = 0;
      spectatorPlayerRef.current.joystickY = 0;
      spectatorPlayerRef.current.joystickDistance = 0;
    }

    // Switch camera to follow the selected player
    if (cameraRef.current) {
      const selectedPlayer = playersArray.find(p => p.id === playerId);
      if (selectedPlayer) {
        // console.log('Jumping to player position:', selectedPlayer.x, selectedPlayer.y);
        // Jump spectator player to the selected player's position
        if (spectatorPlayerRef.current) {
          spectatorPlayerRef.current.x = selectedPlayer.x;
          spectatorPlayerRef.current.y = selectedPlayer.y;
        }
        // Immediately update camera to follow the selected player
        cameraRef.current.follow(selectedPlayer, width / 2, height / 2);
        // Force camera update
        cameraRef.current.update();
      }
    }
  };

  // Mobile controls handlers
  const handleJoystickMove = (x: number, y: number) => {
    // For spectators, joystick controls an invisible player that the camera follows
    const distance = Math.sqrt(x * x + y * y);

    if (distance > 0.1) { // Only move if joystick is moved significantly
      // If this is the first joystick movement after following a player, update spectator position
      if (!isUsingJoystickRef.current && spectatorPlayerRef.current && followedPlayerIdRef.current) {
        // Start spectator from the current camera center position, not the followed player's position
        if (cameraRef.current) {
          const cameraCenterX = cameraRef.current.xView + (width / 2) / cameraRef.current.zoom;
          const cameraCenterY = cameraRef.current.yView + (height / 2) / cameraRef.current.zoom;

          // console.log('Starting joystick from camera center position:', cameraCenterX, cameraCenterY);
          //   console.log('Camera view:', cameraRef.current.xView, cameraRef.current.yView);
          //   console.log('Screen dimensions:', width, height);
          //   console.log('Camera zoom:', cameraRef.current.zoom);

          // Move spectator player to the current camera center position
          spectatorPlayerRef.current.x = cameraCenterX;
          spectatorPlayerRef.current.y = cameraCenterY;
        }
        // Clear the followed player ID since we're now using joystick control
        setFollowedPlayerId("");
        followedPlayerIdRef.current = "";
      }

      setIsUsingJoystick(true);
      isUsingJoystickRef.current = true;

      // Store joystick input for the game loop to use
      if (spectatorPlayerRef.current) {
        spectatorPlayerRef.current.joystickX = x;
        spectatorPlayerRef.current.joystickY = y;
        spectatorPlayerRef.current.joystickDistance = distance;
      }
    } else {
      // Reset joystick input when not moving
      if (spectatorPlayerRef.current) {
        spectatorPlayerRef.current.joystickX = 0;
        spectatorPlayerRef.current.joystickY = 0;
        spectatorPlayerRef.current.joystickDistance = 0;
      }
    }
  };

  const handleJoystickEnd = () => {
    //console.log('Joystick end - keeping spectator at current position');
    setIsUsingJoystick(false);
    isUsingJoystickRef.current = false;

    // Reset joystick input and velocity
    if (spectatorPlayerRef.current) {
      spectatorPlayerRef.current.joystickX = 0;
      spectatorPlayerRef.current.joystickY = 0;
      spectatorPlayerRef.current.joystickDistance = 0;
      spectatorPlayerRef.current.targetVelocityX = 0;
      spectatorPlayerRef.current.targetVelocityY = 0;
    }

    // Don't reset camera position - keep spectator where they are
    // The camera will continue to follow the spectator player at their current position
    if (cameraRef.current && spectatorPlayerRef.current) {
      // Keep following the spectator player at their current position
      cameraRef.current.follow(spectatorPlayerRef.current, width / 2, height / 2);
    }
  };

  const handleZoomChange = (scale: number) => {
    setCameraZoom(scale);
    // Update camera zoom in the game
    if (cameraRef.current) {
      cameraRef.current.setZoom(scale);
    }
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleShoot = () => {
    // For spectators, this could trigger a camera shake or effect
    //  console.log('Shoot button pressed');
  };

  const handleBoost = () => {
    // For spectators, this could trigger a camera effect
    // console.log('Boost button pressed');
  };


  const container = document.getElementById('circlesid');

  //launch fox
  const launchFox = (fox: string, src: string) => {
    let div = document.getElementById("circles");
    let li = document.createElement("li");
    li.innerHTML = `
    <li><img src='fox.png' /><br />` + fox + `</li>
    `
    div.append(li);
  };


  const getMessage = (data) => {
    if (data.reaction === "fox") {
      launchFox(data.fox, data.src);
    }
  };


  // const submitFox = () => {

  //   if (myordaddress === "") {
  //     alert('You must connect Yours Wallet and own a fox to react')
  //     return
  //   }
  //   if (myordaddress !== "" && ownsfox === false) {

  //     alert('You must own a fox to react')
  //     return
  //   }
  //   if (myordaddress !== "" && ownsfox === true) {
  //     sock.emit('message', { reaction: 'fox', fox: { foxname } })
  //   }

  // };
  // get ord address
  useEffect(() => {
    if (!didMount4.current) {
      didMount4.current = true;
      return;
    }

    // Check if addresses is defined before accessing ordAddress
    if (addresses && addresses.ordAddress) {
      setMyOrdAddress(addresses.ordAddress)
      navigate("/pickafoxyours", { state: { owneraddress: addresses.ordAddress, tag: true } });
    }

  }, [addresses]);


  //handle get adresses
  const handleGetAddresses = async () => {
    const addrs = await wallet.getAddresses();
    if (addrs) setAddresses(addrs);
  };

  //handle connect
  const handleConnect = async () => {
    setLoading(true);
    setMyOrdAddress("")
    if (!wallet.connect) {
      window.open(
        "https://github.com/Panda-Wallet/panda-wallet#getting-started-alpha",
        "_blank"
      );
      setLoading(false);
      return;
    }

    const key = await wallet.connect();
    if (key) {
      setPubKey(key);
      setTimeout(() => {
        handleGetAddresses()
      }, 1000);

    }
    if (!key) {
      wallet.disconnect()
      showCustomAlert("Connection Error", "Make sure you are signed-in to Yours Wallet and try again.", "error");
      setLoading(false);
      return
    }
  };

  // Mobile wallet connection functions
  const handleMobileWalletConnect = async () => {
    setMobileWalletLoading(true);
    try {
      // Debug: Check what's available on window
      // console.log('Debug - window.setupWallet:', typeof window.setupWallet);
      // console.log('Debug - window.bsv:', typeof window.bsv);
      // console.log('Debug - window.backupWallet:', typeof window.backupWallet);
      // console.log('Debug - window.restoreWallet:', typeof window.restoreWallet);

      // Check if SHUAllet functions are available
      if (typeof window.setupWallet !== 'function') {
        // console.error('SHUAllet functions not found on window object');
        showCustomAlert("SHUAllet Error", "SHUAllet wallet not loaded. Please refresh the page and try again.", "error");
        setMobileWalletLoading(false);
        return;
      }

      // Check if wallet already exists
      if (localStorage.getItem('walletKey')) {
        // Wallet exists, show connection success and ask if they want to backup
        const ordAddress = localStorage.getItem('ownerAddress');
        if (ordAddress) {
          setMobileWalletAddress(ordAddress);
          setMobileWalletConnected(true);

          // Show wallet connected popup with clear options
          showWalletConnectedPopup(
            'Wallet Connected!',
            `Your existing SHUAllet wallet is connected (${ordAddress.substring(0, 8)}...${ordAddress.substring(ordAddress.length - 8)}).`,
            () => {
              // Download backup callback
              window.backupWallet();
              closePopup();
              checkMobileWalletFoxOwnership(ordAddress);
            },
            () => {
              // Continue callback
              closePopup();
              checkMobileWalletFoxOwnership(ordAddress);
            }
          );

          return;
        }
      }

      // No wallet exists, create a new one manually to avoid page reload
      const paymentPk = window.newPK();
      const ownerPK = window.newPK();

      // Create wallet manually using our overridden restoreWallet
      window.restoreWallet(ownerPK, paymentPk, true);

      // Get all addresses from localStorage
      const ordAddress = localStorage.getItem('ownerAddress');
      const payAddress = localStorage.getItem('walletAddress');
      const identityAddress = localStorage.getItem('identityAddress');

      // If identity address is null, create it from the identity key
      let actualIdentityAddress = identityAddress;
      if (!actualIdentityAddress && window.bsv) {
        const identityKey = localStorage.getItem('identityKey');
        if (identityKey) {
          try {
            const identityPk = window.bsv.PrivateKey.fromWIF(identityKey);
            const identityAddr = window.bsv.Address.fromPrivateKey(identityPk);
            actualIdentityAddress = identityAddr.toString();
            localStorage.setItem('identityAddress', actualIdentityAddress);
            //  console.log('Created identity address from identity key:', actualIdentityAddress);
          } catch (error) {
            //   console.error('Error creating identity address:', error);
          }
        } else {
          // If no identity key exists, create one and derive the address
          try {
            const newIdentityKey = window.newPK();
            const identityPk = window.bsv.PrivateKey.fromWIF(newIdentityKey);
            const identityAddr = window.bsv.Address.fromPrivateKey(identityPk);
            actualIdentityAddress = identityAddr.toString();
            localStorage.setItem('identityKey', newIdentityKey);
            localStorage.setItem('identityAddress', actualIdentityAddress);
            //     console.log('Created new identity key and address:', actualIdentityAddress);
          } catch (error) {
            //    console.error('Error creating new identity key:', error);
          }
        }
      }

      // Log all addresses
      // console.log('=== SHUAllet Wallet Addresses ===');
      // console.log('Ord Address (ownerAddress):', ordAddress);
      // console.log('Pay Address (walletAddress):', payAddress);
      // console.log('Identity Address (identityAddress):', actualIdentityAddress);
      // console.log('=== End SHUAllet Addresses ===');

      if (ordAddress) {
        //  console.log('Mobile wallet ord address:', ordAddress);
        setMobileWalletAddress(ordAddress);
        setMobileWalletConnected(true);

        // Prompt for backup only
        showWalletCreatedPopup(
          'Wallet Created!',
          'Your wallet has been created! Please download your backup before continuing.',
          () => {
            // Download backup callback
            window.backupWallet();
            setMobileWalletBackupPrompted(true);
            closePopup();
            checkMobileWalletFoxOwnership(ordAddress);
          }
        );
      } else {
        showCustomAlert("Connection Error", "Failed to get wallet address. Please try again.", "error");
      }
    } catch (error) {
      //   console.error('Mobile wallet connection error:', error);
      showCustomAlert("Connection Error", "Failed to connect mobile wallet. Please try again.", "error");
    } finally {
      setMobileWalletLoading(false);
    }
  };

  const handleCreateNewWallet = async () => {
    setMobileWalletLoading(true);
    try {
      // Clear existing wallet data
      localStorage.removeItem('walletKey');
      localStorage.removeItem('ownerKey');
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('ownerAddress');
      localStorage.removeItem('ownerPublicKey');
      localStorage.removeItem('displayName');
      localStorage.removeItem('avatar');
      localStorage.removeItem('identityKey');
      localStorage.removeItem('identityAddress');

      //  console.log('Cleared existing wallet data');

      // Reset mobile wallet state
      setMobileWalletAddress("");
      setMobileWalletConnected(false);
      setMobileWalletBackupPrompted(false);

      // Create new wallet manually to avoid page reload
      const paymentPk = window.newPK();
      const ownerPK = window.newPK();

      // Create wallet manually using our overridden restoreWallet
      window.restoreWallet(ownerPK, paymentPk, true);

      // Get all addresses from localStorage
      const ordAddress = localStorage.getItem('ownerAddress');
      const payAddress = localStorage.getItem('walletAddress');
      const identityAddress = localStorage.getItem('identityAddress');

      // If identity address is null, create it from the identity key
      let actualIdentityAddress = identityAddress;
      if (!actualIdentityAddress && window.bsv) {
        const identityKey = localStorage.getItem('identityKey');
        if (identityKey) {
          try {
            const identityPk = window.bsv.PrivateKey.fromWIF(identityKey);
            const identityAddr = window.bsv.Address.fromPrivateKey(identityPk);
            actualIdentityAddress = identityAddr.toString();
            localStorage.setItem('identityAddress', actualIdentityAddress);
            // console.log('Created identity address from identity key:', actualIdentityAddress);
          } catch (error) {
            //   console.error('Error creating identity address:', error);
          }
        } else {
          // If no identity key exists, create one and derive the address
          try {
            const newIdentityKey = window.newPK();
            const identityPk = window.bsv.PrivateKey.fromWIF(newIdentityKey);
            const identityAddr = window.bsv.Address.fromPrivateKey(identityPk);
            actualIdentityAddress = identityAddr.toString();
            localStorage.setItem('identityKey', newIdentityKey);
            localStorage.setItem('identityAddress', actualIdentityAddress);
            //      console.log('Created new identity key and address:', actualIdentityAddress);
          } catch (error) {
            //     console.error('Error creating new identity key:', error);
          }
        }
      }

      // Log all addresses
      // console.log('=== NEW SHUAllet Wallet Addresses ===');
      // console.log('Ord Address (ownerAddress):', ordAddress);
      // console.log('Pay Address (walletAddress):', payAddress);
      // console.log('Identity Address (identityAddress):', actualIdentityAddress);
      // console.log('=== End NEW SHUAllet Addresses ===');

      if (ordAddress) {
        //  console.log('New mobile wallet ord address:', ordAddress);
        setMobileWalletAddress(ordAddress);
        setMobileWalletConnected(true);

        // Prompt for backup only
        showWalletCreatedPopup(
          'New Wallet Created!',
          'Your NEW wallet has been created! Please download your backup before continuing.',
          () => {
            // Download backup callback
            window.backupWallet();
            setMobileWalletBackupPrompted(true);
            closePopup();
            checkMobileWalletFoxOwnership(ordAddress);
          }
        );
      } else {
        showCustomAlert("Creation Error", "Failed to create new wallet address. Please try again.", "error");
      }
    } catch (error) {
      //   console.error('New wallet creation error:', error);
      showCustomAlert("Creation Error", "Failed to create new wallet. Please try again.", "error");
    } finally {
      setMobileWalletLoading(false);
    }
  };

  const checkMobileWalletFoxOwnership = async (ordAddress: string) => {
    try {
      // Check if user owns any PixelFoxes using gorillapool API
      const response = await fetch(`https://ordinals.gorillapool.io/api/txos/address/${ordAddress}/unspent?limit=300000`);
      const data = await response.json();

      // Filter for image inscriptions (potential foxes)
      const imageInscriptions = data.filter((utxo: any) => {
        return utxo.data && utxo.data.insc && utxo.data.insc.content_type?.startsWith('image/') &&
          utxo.data.insc.inscription_number &&
          utxo.data.insc.inscription_number < 1000000; // Adjust range as needed
      }) || [];

      //   console.log(`Found ${imageInscriptions.length} potential foxes for mobile wallet`);

      // Always navigate to pickafox with mobile wallet type
      navigate("/pickafox", {
        state: {
          owneraddress: ordAddress,
          tag: true,
          walletType: 'mobile',
          foxCount: imageInscriptions.length
        }
      });
    } catch (error) {
      //  console.error('Error checking fox ownership:', error);
      // If we can't check ownership, still go to pickafox
      navigate("/pickafox", {
        state: {
          owneraddress: ordAddress,
          tag: true,
          walletType: 'mobile',
          foxCount: 0
        }
      });
    }
  };

  const handleMobileWalletRestore = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          setMobileWalletLoading(true);
          const text = await file.text();
          const walletData = JSON.parse(text);

          if (walletData.ordPk && walletData.payPk) {
            // Store the wallet data manually to avoid the reload
            localStorage.setItem('ownerKey', walletData.ordPk);
            localStorage.setItem('walletKey', walletData.payPk);

            // Create addresses from the keys
            if (window.bsv) {
              const ownerPk = window.bsv.PrivateKey.fromWIF(walletData.ordPk);
              const payPk = window.bsv.PrivateKey.fromWIF(walletData.payPk);

              const ownerAddress = window.bsv.Address.fromPrivateKey(ownerPk);
              const payAddress = window.bsv.Address.fromPrivateKey(payPk);

              localStorage.setItem('ownerAddress', ownerAddress.toString());
              localStorage.setItem('walletAddress', payAddress.toString());
              localStorage.setItem('ownerPublicKey', ownerPk.toPublicKey().toHex());

              // Handle identity key if present
              if (walletData.identityPk) {
                localStorage.setItem('identityKey', walletData.identityPk);
                try {
                  const identityPk = window.bsv.PrivateKey.fromWIF(walletData.identityPk);
                  const identityAddr = window.bsv.Address.fromPrivateKey(identityPk);
                  localStorage.setItem('identityAddress', identityAddr.toString());
                  // console.log('Restored identity address:', identityAddr.toString());
                } catch (error) {
                  // console.error('Error creating identity address from restored key:', error);
                }
              }

              // Handle display name and avatar
              if (walletData.displayName) {
                localStorage.setItem('displayName', walletData.displayName);
              }
              if (walletData.avatar) {
                localStorage.setItem('avatar', walletData.avatar);
              }

              // console.log('Wallet restored successfully');
              // console.log('Owner Address:', ownerAddress.toString());
              // console.log('Pay Address:', payAddress.toString());

              const ordAddress = ownerAddress.toString();
              setMobileWalletAddress(ordAddress);
              setMobileWalletConnected(true);

              // Check for fox ownership and navigate
              await checkMobileWalletFoxOwnership(ordAddress);
            } else {
              showCustomAlert("Library Error", "BSV library not loaded. Please refresh the page and try again.", "error");
            }
          } else {
            showCustomAlert("Invalid File", "Invalid wallet backup file.", "error");
          }
        } catch (error) {
          // console.error('Error restoring wallet:', error);
          showCustomAlert("Restore Error", "Failed to restore wallet. Please check your backup file.", "error");
        } finally {
          setMobileWalletLoading(false);
        }
      }
    };
    fileInput.click();
  };

  const handleMobileWalletLogout = () => {
    // Clear all wallet data from localStorage
    localStorage.removeItem('walletKey');
    localStorage.removeItem('ownerKey');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('ownerAddress');
    localStorage.removeItem('ownerPublicKey');
    localStorage.removeItem('displayName');
    localStorage.removeItem('avatar');
    localStorage.removeItem('identityKey');
    localStorage.removeItem('identityAddress');

    // Reset mobile wallet state
    setMobileWalletAddress("");
    setMobileWalletConnected(false);
    setMobileWalletBackupPrompted(false);

    //   console.log('Mobile wallet logged out successfully');
  };

  // Popup helper functions
  const showCustomAlert = (title: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupType(type);
    setPopupCallback(null);
    setShowPopup(true);
  };

  const showCustomConfirm = (title: string, message: string, callback: () => void) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupType('confirm');
    setPopupCallback(() => callback);
    setShowPopup(true);
  };

  const showWalletConnectedPopup = (title: string, message: string, downloadCallback: () => void, continueCallback: () => void) => {
    // Get addresses from localStorage
    const ordAddress = localStorage.getItem('ownerAddress');
    const payAddress = localStorage.getItem('walletAddress');

    // Create enhanced message with addresses
    let enhancedMessage = message;
    if (ordAddress) {
      enhancedMessage += `\n\nOrd Address: ${ordAddress}`;
    }
    if (payAddress) {
      enhancedMessage += `\nPay Address: ${payAddress}`;
    }

    setPopupTitle(title);
    setPopupMessage(enhancedMessage);
    setPopupType('wallet-connected');
    setPopupCallback(() => downloadCallback);
    setPopupSecondaryCallback(() => continueCallback);
    setShowPopup(true);
  };

  const showWalletCreatedPopup = (title: string, message: string, downloadCallback: () => void) => {
    // Get addresses from localStorage
    const ordAddress = localStorage.getItem('ownerAddress');
    const payAddress = localStorage.getItem('walletAddress');

    // Create enhanced message with addresses
    let enhancedMessage = message;
    if (ordAddress) {
      enhancedMessage += `\n\nOrd Address: ${ordAddress}`;
    }
    if (payAddress) {
      enhancedMessage += `\nPay Address: ${payAddress}`;
    }

    setPopupTitle(title);
    setPopupMessage(enhancedMessage);
    setPopupType('wallet-created');
    setPopupCallback(() => downloadCallback);
    setPopupSecondaryCallback(null); // No continue callback for new wallets
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupMessage("");
    setPopupTitle("");
    setPopupType('info');
    setPopupCallback(null);
    setPopupSecondaryCallback(null);
  };

  // Popup styles
  const popupStyles = {
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
      padding: '10px',
      pointerEvents: 'auto' as const
    },
    popup: {
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      padding: isMobile ? '20px' : '30px',
      borderRadius: '12px',
      maxWidth: '400px',
      width: '100%',
      textAlign: 'center' as const,
      color: '#ffffff',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '2px solid #2196f3',
      backdropFilter: 'blur(10px)',
      pointerEvents: 'auto' as const,
      maxHeight: isMobile ? '80vh' : '90vh',
      overflowY: 'auto' as const
    },
    popupTitle: {
      fontSize: isMobile ? '24px' : '28px',
      marginBottom: isMobile ? '15px' : '20px',
      fontWeight: 'bold',
      color: '#36bffa',
      textAlign: 'center',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      letterSpacing: '0.5px'
    } as React.CSSProperties,
    popupMessage: {
      fontSize: isMobile ? '14px' : '16px',
      marginBottom: isMobile ? '20px' : '25px',
      lineHeight: '1.5',
      color: '#ffffff',
      textAlign: 'left' as const
    },
    popupButton: {
      backgroundColor: 'transparent',
      color: '#36bffa',
      border: '2px solid #36bffa',
      padding: isMobile ? '10px 20px' : '12px 30px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: '700',
      width: '100%',
      maxWidth: '200px',
      transition: 'all 0.2s ease',
      textTransform: 'none' as const,
      pointerEvents: 'auto' as const
    },
    popupButtonContainer: {
      display: 'flex',
      gap: isMobile ? '8px' : '10px',
      justifyContent: 'center',
      flexWrap: 'wrap' as const
    },
    popupButtonSecondary: {
      backgroundColor: 'transparent',
      color: '#f44336',
      border: '2px solid #f44336',
      padding: isMobile ? '10px 20px' : '12px 30px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: '700',
      width: '100%',
      maxWidth: '200px',
      transition: 'all 0.2s ease',
      textTransform: 'none' as const,
      pointerEvents: 'auto' as const
    }
  };

  // Preload fox images when bucket foxes data is received
  useEffect(() => {
    if (bucketFoxes.length > 0) {
      //    console.log('=== PRELOADING ALL BUCKET FOX IMAGES ===');
      //   console.log('Total buckets to preload:', bucketFoxes.length);

      bucketFoxes.forEach((bucketFox, bucketIndex) => {
        //  console.log(`Preloading bucket ${bucketIndex}: ${bucketFox.bucket} - ${bucketFox.name}`);

        if (bucketFox.bucket === '1x') {
          // Preload single fox image
          const foxImageUrl = bucketFox.img || bucketFox.image;
          if (foxImageUrl && !bucketFoxImageCacheRef.current?.get(foxImageUrl)) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              if (!bucketFoxImageCacheRef.current) {
                bucketFoxImageCacheRef.current = new Map();
              }
              bucketFoxImageCacheRef.current.set(foxImageUrl, img);
              //      console.log(`✅ Preloaded 1x fox image: ${foxImageUrl}`);
            };
            img.onerror = () => {
              // console.error(`❌ Failed to preload 1x fox image: ${foxImageUrl}`);
            };
            img.src = foxImageUrl;
          }
        } else if (bucketFox.groupFoxes) {
          // Preload all group fox images
          //    console.log(`Preloading ${bucketFox.groupFoxes.length} group fox images for bucket ${bucketIndex}`);
          bucketFox.groupFoxes.forEach((groupFox, groupIndex) => {
            if (!bucketFoxImageCacheRef.current?.get(groupFox.outpoint)) {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                if (!bucketFoxImageCacheRef.current) {
                  bucketFoxImageCacheRef.current = new Map();
                }
                bucketFoxImageCacheRef.current.set(groupFox.outpoint, img);
                //    console.log(`✅ Preloaded group fox image ${groupIndex + 1}/${bucketFox.groupFoxes.length}: ${groupFox.outpoint}`);
              };
              img.onerror = () => {
                //console.error(`❌ Failed to preload group fox image: ${groupFox.outpoint}`);
              };
              img.src = groupFox.img;
            }
          });
        }
      });

      //   console.log('=== FINISHED PRELOADING BUCKET FOX IMAGES ===');
    }
  }, [bucketFoxes]);

  // Preload fox images for players when their assignments are received
  useEffect(() => {
    Object.entries(playerBucketAssignments).forEach(([playerId, assignment]) => {
      if (assignment && assignment.bucketFox) {
        const bucketFox = assignment.bucketFox;
        //  console.log(`=== PRELOADING PLAYER BUCKET FOX IMAGES (Player ${playerId}, Bucket ${assignment.bucketIndex}) ===`);
        //   console.log(`Bucket type: ${bucketFox.bucket}, Name: ${bucketFox.name}`);

        if (bucketFox.bucket === '1x') {
          // Preload single fox image
          const foxImageUrl = bucketFox.img || bucketFox.image;
          if (foxImageUrl && !bucketFoxImageCacheRef.current?.get(foxImageUrl)) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              if (!bucketFoxImageCacheRef.current) {
                bucketFoxImageCacheRef.current = new Map();
              }
              bucketFoxImageCacheRef.current.set(foxImageUrl, img);
              //      console.log(`✅ Preloaded player 1x fox image: ${foxImageUrl}`);
            };
            img.onerror = () => {
              // console.error(`❌ Failed to preload player 1x fox image: ${foxImageUrl}`);
            };
            img.src = foxImageUrl;
          }
        } else if (bucketFox.groupFoxes) {
          // Preload all group fox images
          // console.log(`Preloading ${bucketFox.groupFoxes.length} group fox images for player bucket`);
          bucketFox.groupFoxes.forEach((groupFox, groupIndex) => {
            if (!bucketFoxImageCacheRef.current?.get(groupFox.outpoint)) {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                if (!bucketFoxImageCacheRef.current) {
                  bucketFoxImageCacheRef.current = new Map();
                }
                bucketFoxImageCacheRef.current.set(groupFox.outpoint, img);
                //  console.log(`✅ Preloaded player group fox image ${groupIndex + 1}/${bucketFox.groupFoxes.length}: ${groupFox.outpoint}`);
              };
              img.onerror = () => {
                // console.error(`❌ Failed to preload player group fox image: ${groupFox.outpoint}`);
              };
              img.src = groupFox.img;
            }
          });
        }

        // console.log(`=== FINISHED PRELOADING PLAYER BUCKET FOX IMAGES (Player ${playerId}) ===`);
      }
    });
  }, [playerBucketAssignments]);

  // Initialize cycling state when player bucket assignments are received
  useEffect(() => {
    Object.keys(playerBucketAssignments).forEach(playerId => {
      const assignment = playerBucketAssignments[playerId];
      if (assignment && assignment.bucketFox && assignment.bucketFox.bucket !== '1x') {
        const playerKey = `player_${playerId}`;
        if (!cyclingImagesRef.current[playerKey]) {
          cyclingImagesRef.current[playerKey] = { currentIndex: 0, lastChange: Date.now() };
          setCyclingImages(prev => ({ ...prev, [playerKey]: { currentIndex: 0, lastChange: Date.now() } }));
        }
      }
    });
  }, [playerBucketAssignments]);

  // Sync spectator state with refs
  useEffect(() => {
    isUsingJoystickRef.current = isUsingJoystick;
    spectatorCameraXRef.current = spectatorCameraX;
    spectatorCameraYRef.current = spectatorCameraY;
  }, [isUsingJoystick, spectatorCameraX, spectatorCameraY]);

  // Sync spacerock state with refs
  useEffect(() => {
    spaceRocksRef.current = spaceRocks;
  }, [spaceRocks]);

  // Set initial follow state when players are present but no follow state is set
  useEffect(() => {
    if (playersarray.length > 0 && !followedPlayerId && !isUsingJoystick) {
      // console.log('Setting initial follow state for first player:', playersarray[0].id);
      setFollowedPlayerId(playersarray[0].id);
      followedPlayerIdRef.current = playersarray[0].id;
    }
  }, [playersarray, followedPlayerId, isUsingJoystick]);

  // Cycling timer for group bucket images
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const imageChangeInterval = 1000; // Change every 1 second
      let hasChanges = false;

      // Update cycling for other players' bucket assignments
      Object.keys(playerBucketAssignmentsRef.current).forEach(playerId => {
        const assignment = playerBucketAssignmentsRef.current[playerId];
        if (assignment &&
          assignment.bucketFox &&
          assignment.bucketFox.bucket !== '1x' &&
          assignment.bucketFox.groupFoxes) {

          const playerKey = `player_${playerId}`;
          const currentCycling = cyclingImagesRef.current[playerKey] || { currentIndex: 0, lastChange: now };

          if (now - currentCycling.lastChange > imageChangeInterval) {
            const newIndex = (currentCycling.currentIndex + 1) % assignment.bucketFox.groupFoxes.length;
            cyclingImagesRef.current[playerKey] = { currentIndex: newIndex, lastChange: now };
            setCyclingImages(prev => ({ ...prev, [playerKey]: { currentIndex: newIndex, lastChange: now } }));
            hasChanges = true;
          }
        }
      });

      // Force re-render if there were changes
      if (hasChanges) {
        setCyclingImages(prev => ({ ...prev }));
      }
    }, 100); // Check every 100ms for smooth transitions

    return () => clearInterval(interval);
  }, []);

  return (

    <div className="App">
      <div id="Error"></div>

      {preloaded && (
        <>
          <header className="App-header">
            <TagLogo onClick={goToIndex} />
            <div className="LoaderHeight">
              <ThreeCircles color="black" height="50"
                width="50" />
            </div>
            <MyOtherFox /> <MyFox />
          </header>
        </>
      )}
      {!preloaded && (
        <>
          <div className="Topbar">
            <TemporaryDrawer />
            <TagLogo onClick={goToIndex} />
            <a target="blank" href="https://twitter.com/yours_foxplorer"><XLogoRight /></a>
          </div>

          <div id="Live">
            <br />

            {loaded && (
              <>
                <div className="Status">
                  <span className="StatusLeft">


                    <div className="MobileWallet" style={{ marginTop: '10px' }}>

                      <span className="Demo">Desktop</span>
                      <FaucetPandaConnectButton onClick={handleConnect} />
                    </div>

                    {/* Mobile Wallet Button */}
                    <div className="MobileWallet" style={{ marginTop: '10px' }}>
                      <span className="Demo">Mobile</span>
                      {mobileWalletConnected ? (
                        // Show connected wallet information and options
                        <div style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          padding: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          marginTop: '8px'
                        }}>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            marginBottom: '12px'
                          }}>
                            <div style={{
                              color: '#36bffa',
                              fontSize: '14px',
                              fontWeight: '600',
                              textAlign: 'center'
                            }}>
                              SHUAllet Connected
                            </div>
                            <div style={{
                              color: '#ffffff',
                              fontSize: '12px',
                              fontFamily: 'monospace',
                              textAlign: 'center',
                              wordBreak: 'break-all'
                            }}>
                              Ord: {mobileWalletAddress}
                            </div>
                            {localStorage.getItem('walletAddress') && (
                              <div style={{
                                color: '#cccccc',
                                fontSize: '11px',
                                fontFamily: 'monospace',
                                textAlign: 'center',
                                wordBreak: 'break-all'
                              }}>
                                Pay: {localStorage.getItem('walletAddress')}
                              </div>
                            )}
                          </div>

                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            <button
                              onClick={() => {
                                window.backupWallet();
                              }}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: 'transparent',
                                color: '#36bffa',
                                border: '1px solid #36bffa',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                width: '100%'
                              }}
                            >
                              Download Backup
                            </button>

                            <button
                              onClick={() => {
                                checkMobileWalletFoxOwnership(mobileWalletAddress);
                              }}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: '1px solid #4CAF50',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                width: '100%'
                              }}
                            >
                              Play Tag
                            </button>

                            <button
                              onClick={() => {
                                handleMobileWalletLogout();
                              }}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: 'transparent',
                                color: '#f44336',
                                border: '1px solid #f44336',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                width: '100%'
                              }}
                            >
                              Log out
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Show connect/restore buttons when no wallet is connected
                        <>
                          <button
                            onClick={handleMobileWalletConnect}
                            disabled={mobileWalletLoading}
                            style={{
                              padding: '12px 24px',
                              backgroundColor: mobileWalletConnected ? '#4CAF50' : '#2196F3',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: mobileWalletLoading ? 'not-allowed' : 'pointer',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              opacity: mobileWalletLoading ? 0.7 : 1
                            }}
                          >
                            {mobileWalletLoading ? (
                              <>
                                <ThreeCircles color="white" height="16" width="16" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                Create SHUAllet
                              </>
                            )}
                          </button>

                          {/* Restore Wallet Button */}
                          <button
                            onClick={handleMobileWalletRestore}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: 'transparent',
                              color: '#2196F3',
                              border: '1px solid #2196F3',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              marginTop: '8px',
                              width: '100%'
                            }}
                          >
                            Restore SHUAllet
                          </button>
                        </>
                      )}
                    </div>
                  </span>
                  <span className="StatusRight">

                    {/* <WeLive /> */}
                    <div className="TagPlayersContainer">
                      <div className="TagPlayers">

                        {/* <AiOutlineEye size={33} /> {viewers}<br /> */}
                        {/* <span><AiOutlineEye size={33} /> {viewers}<br /></span> */}


                        Players: {players}
                      </div></div>
                  </span>


                </div>

              </>
            )}


            {/* <div className="ViewersContainer">
            <div className="Viewers">
<AiOutlineEye size={33} /><span>  {viewers}</span>
</div></div> */}
            <div className="CenterCanvas">
              {/* <canvas id="gameCanvas" ref={canvasRef} width={width} height={height} className="Canvas"></canvas>
 */}



              {/* {showleaving &&
            <div className="TaggedInfo">
              <h3>You Got Tagged</h3>
              <br />
              <div className="TaggedPlayers">
                <a target="blank" href={foximageinfo}>
                  <img
                    src={foximageurl}
                    className={whosit}
                    alt="Your Fox"
                  />
                </a>
              </div>
              <br />
              <p className="White">{foxname} Is Out Of Tag Forver</p>
              <p className="White">10 Million Foxes Can Play, But Only One Can Win</p>
              <p className="White">Click 'Exit Game' To Pick Another Fox</p>
              <ExitButton onClick={goToIndex} />
            </div>

          } */}

              <ImVolumeMute2 style={{ color: "#36bffa", display: showmuted ? "block" : "none" }} size={33} onClick={playrumble} />
              <ImVolumeHigh style={{ color: "#36bffa", display: hidemuted ? "block" : "none" }} size={33} onClick={muterumble} />


              {viewingtaggedinfo && tempactivity &&


                <div className="TaggedInfo">



                  <h3>{tempactivity.taggerfoxname} tagged {tempactivity.taggeefoxname}</h3>
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
                  <br />  <br />  <br />


                  <p className="White">{activitymessage}</p>



                  <p className="White">
                    <a className="White" target="blank" href={txidlink}><u>{txid}</u></a>
                  </p>


                  {showtxidloading &&

                    <div className="LoaderHeight">
                      <ThreeCircles color="white" height="50"
                        width="50" />
                    </div>
                  }

                </div>

              }


              <div style={{ display: showinfo ? "block" : "none" }}>


                <p className="Blue" style={{ marginBottom: '5px' }}>Use arrow keys. Press 'b' to go fast.<br />Chaser can press 'n' to shoot.<br />New chaser every 30 seconds.</p>

                <canvas
                  id="gameCanvas"
                  ref={canvasRef}
                  width={width}
                  height={height}
                  className="Canvas"
                  style={{
                    position: isFullscreen ? 'fixed' : 'relative',
                    top: isFullscreen ? '0' : 'auto',
                    left: isFullscreen ? '0' : 'auto',
                    width: isFullscreen ? '100vw' : 'auto',
                    height: isFullscreen ? '100vh' : 'auto',
                    zIndex: isFullscreen ? 9999 : 'auto',
                    backgroundColor: isFullscreen ? '#000' : 'transparent'
                  }}
                ></canvas>

                {/* Fullscreen Controls Overlay */}
                {isFullscreen && (
                  <>
                    {/* Fullscreen Zoom Controls - Bottom right */}
                    <div style={{
                      position: 'fixed',
                      bottom: '20px',
                      right: '20px',
                      zIndex: 10000,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <MobileControls
                        onJoystickMove={() => { }} // Not used for zoom-only
                        onJoystickEnd={() => { }} // Not used for zoom-only
                        onZoomChange={handleZoomChange}
                        onShoot={() => { }} // Not used for zoom-only
                        isChaser={false} // Not used for zoom-only
                        showJoystick={false}
                        showShootButton={false}
                        showZoomControls={true}
                        onFullscreenToggle={handleFullscreenToggle}
                        isFullscreen={isFullscreen}
                      />
                    </div>
                  </>
                )}

                {/* Zoom Controls - Only shown when not in fullscreen */}
                {!isFullscreen && (
                  <MobileControls
                    onJoystickMove={() => { }} // Not used for zoom-only
                    onJoystickEnd={() => { }} // Not used for zoom-only
                    onZoomChange={handleZoomChange}
                    onShoot={() => { }} // Not used for zoom-only
                    isChaser={false} // Not used for zoom-only
                    showJoystick={false}
                    showShootButton={false}
                    showZoomControls={true}
                    onFullscreenToggle={handleFullscreenToggle}
                    isFullscreen={isFullscreen}
                  />
                )}

              </div>



            </div>
            <br /><br />

            <div id="PlayerInfo" style={{
              margin: '20px',
              padding: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ marginBottom: '15px', color: '#36bffa' }}>Players: {playersarray.length}</h3>
              {/* Epoch and Game Number display */}
              {gameNumber && (
                <h3 style={{ marginBottom: '15px', color: '#808080', fontWeight: 500, fontSize: '1em' }}>
                  Epoch 1, Game Number {gameNumber}
                </h3>
              )}
              <div className="PlayersList" style={{
                margin: '0',
                padding: '0'
              }}>
                {playersarray.map((player, index) => (
                  <div key={player.id} className="PlayerItem" style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    margin: '10px 0',
                    padding: '12px',
                    border: player.id === chaserid ? '2px solid #FFEA00' : '1px solid #ccc',
                    borderRadius: '8px',
                    backgroundColor: player.id === chaserid ? 'rgba(255, 234, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    minHeight: '80px', // Ensure consistent height
                    transition: 'all 0.2s ease',
                    overflow: 'hidden'
                  }}>
                    <div style={{ marginRight: '12px', flexShrink: 0 }}>
                      <a target="blank" href={player.imagelink}>
                        <img
                          src={player.image}
                          alt={player.foxname}
                          style={{ width: '45px', height: '45px', borderRadius: '5px' }}
                        />
                      </a>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: player.id === chaserid ? '#FFEA00' : '#fff', lineHeight: '1.2' }}>
                        <a target="blank" href={player.imagelink} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {player.foxname}
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
                        {player.owneraddress.length > 20 ? `${player.owneraddress.slice(0, 6)}...${player.owneraddress.slice(-6)}` : player.owneraddress}
                      </div>
                      <div style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.2' }}>
                        {player.id === chaserid ? '🔥 CHASER' : 'Runner'}
                      </div>
                    </div>
                    <div style={{
                      marginLeft: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0
                    }}>
                      <button
                        onClick={() => handleFollowPlayer(player.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: player.id === followedPlayerId && !isUsingJoystick ? '#4CAF50' : '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap'
                        }}
                        disabled={player.id === followedPlayerId && !isUsingJoystick}
                      >
                        {player.id === followedPlayerId && !isUsingJoystick ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SpaceRocks
              spaceRocks={spaceRocks}
              spaceRocksCount={spaceRocksCount}
              latestBlockHash={latestBlockHash}
              spacerockActivities={activityarray.filter(activity =>
                activity.txid !== "string" &&
                activity.taggerowneraddress !== "string"
              )}
            />

            <BountyHistory
              bountyTransactions={activityarray.filter(activity =>
                activity.txid !== "string" &&
                activity.taggerowneraddress !== "string" &&
                activity.bountyFoxesMetadata &&
                activity.bountyFoxesMetadata.totalBountyFoxes > 0
              )}
            />

            <TaggedFoxes latestactivity={tempactivitywithtxid} />

            <ul id='circles'>
            </ul>
          </div>
          {/* OPTIMIZED: RollingFoxesFilters - only loads once before game starts */}
          {/* <BountyFoxesFilters
              complete={complete}
              ordinalsstring={ordinalsstring}
              myordinalsaddress={myordaddress}
              faucetvar={faucetvar}
              myvar={myvar}
              demovar={demovar}
              handleConnect={handleConnect}
              newOutpoints={newOutpoints}
              ownedOutpoints={ownedOutpoints}
              allUtxos={allUtxos}
              isGameStarted={gameStarted}
              isGameOver={isGameOver}
            />
            */}
          <FooterHome />
        </>
      )}

      {/* Custom Popup */}
      {showPopup && (
        <div
          style={popupStyles.popupOverlay}
        >
          <div style={popupStyles.popup}>
            {popupType === 'wallet-created' && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '15px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#4CAF50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '30px',
                  color: 'white',
                  boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)'
                }}>
                  ✓
                </div>
              </div>
            )}
            <h3 style={popupStyles.popupTitle}>{popupTitle}</h3>
            <div style={popupStyles.popupMessage}>
              {popupType === 'wallet-created' ? (
                <>
                  {/* Main message */}
                  <p style={{
                    margin: '0 0 20px 0',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    color: '#ffffff',
                    textAlign: 'center'
                  }}>
                    {popupMessage.split('\n')[0]}
                  </p>

                  {/* Addresses section */}
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: isMobile ? '12px' : '16px',
                    margin: isMobile ? '12px 0' : '16px 0',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    {popupMessage.split('\n').slice(1).map((line, index) => {
                      if (line.startsWith('Ord Address:') || line.startsWith('Pay Address:')) {
                        const [label, address] = line.split(': ');
                        return (
                          <div key={index} style={{
                            margin: isMobile ? '8px 0' : '12px 0',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                          }}>
                            <div style={{
                              fontSize: isMobile ? '11px' : '12px',
                              color: '#36bffa',
                              fontWeight: '600',
                              marginBottom: isMobile ? '2px' : '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              {label}
                            </div>
                            <div style={{
                              fontSize: isMobile ? '12px' : '14px',
                              fontFamily: 'monospace',
                              color: '#ffffff',
                              backgroundColor: 'rgba(0, 0, 0, 0.3)',
                              padding: isMobile ? '6px 8px' : '8px 12px',
                              borderRadius: '4px',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              wordBreak: 'break-all',
                              textAlign: 'center',
                              maxWidth: '100%'
                            }}>
                              {address}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </>
              ) : (
                popupMessage.split('\n').map((line, index) => (
                  <p key={index} style={{ margin: index > 0 ? '8px 0 0 0' : '0' }}>
                    {line}
                  </p>
                ))
              )}
            </div>
            <div style={popupStyles.popupButtonContainer}>
              {popupType === 'confirm' ? (
                <>
                  <button
                    style={popupStyles.popupButton}
                    onClick={() => {
                      if (popupCallback) {
                        popupCallback();
                      }
                      closePopup();
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
                    OK
                  </button>
                  <button
                    style={popupStyles.popupButtonSecondary}
                    onClick={closePopup}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f44336';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#f44336';
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : popupType === 'wallet-connected' ? (
                <>
                  <button
                    style={{
                      ...popupStyles.popupButton,
                      backgroundColor: '#4CAF50',
                      color: '#ffffff',
                      border: '2px solid #4CAF50',
                      fontSize: '16px',
                      padding: '14px 24px',
                      fontWeight: 'bold'
                    }}
                    onClick={() => {
                      if (popupCallback) {
                        popupCallback();
                      }
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#45a049';
                      e.currentTarget.style.borderColor = '#45a049';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#4CAF50';
                      e.currentTarget.style.borderColor = '#4CAF50';
                    }}
                  >
                    📥 Download Backup
                  </button>
                  {popupSecondaryCallback && (
                    <button
                      style={{
                        ...popupStyles.popupButton,
                        backgroundColor: '#4CAF50',
                        color: '#ffffff',
                        border: '2px solid #4CAF50'
                      }}
                      onClick={() => {
                        if (popupSecondaryCallback) {
                          popupSecondaryCallback();
                        }
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#45a049';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#4CAF50';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                    >
                      Continue
                    </button>
                  )}
                  {popupSecondaryCallback && (
                    <div style={{
                      marginTop: '15px',
                      textAlign: 'center',
                      width: '100%'
                    }}>
                      <br />
                      <button
                        onClick={() => {
                          handleMobileWalletLogout();
                          closePopup();
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2196F3',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          fontSize: '14px',
                          padding: '0',
                          display: 'inline-block',
                          textAlign: 'center'
                        }}
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </>
              ) : popupType === 'wallet-created' ? (
                <>
                  {popupSecondaryCallback && (
                    <button
                      style={{
                        ...popupStyles.popupButton,
                        backgroundColor: '#4CAF50',
                        color: '#ffffff',
                        border: '2px solid #4CAF50',
                        fontSize: isMobile ? '14px' : '16px',
                        padding: isMobile ? '12px 20px' : '14px 24px',
                        fontWeight: 'bold',
                        marginBottom: isMobile ? '8px' : '10px'
                      }}
                      onClick={() => {
                        if (popupSecondaryCallback) {
                          popupSecondaryCallback();
                        }
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#45a049';
                        e.currentTarget.style.borderColor = '#45a049';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#4CAF50';
                        e.currentTarget.style.borderColor = '#4CAF50';
                      }}
                    >
                      Continue
                    </button>
                  )}
                  <button
                    style={popupStyles.popupButton}
                    onClick={() => {
                      if (popupCallback) {
                        popupCallback();
                      }
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
                    Download Backup
                  </button>
                  <div style={{
                    marginTop: isMobile ? '10px' : '15px',
                    textAlign: 'center',
                    width: '100%'
                  }}>
                    {!isMobile && <br />}
                    <button
                      onClick={() => {
                        handleMobileWalletLogout();
                        closePopup();
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2196F3',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontSize: isMobile ? '12px' : '14px',
                        padding: '0',
                        display: 'inline-block',
                        textAlign: 'center'
                      }}
                    >
                      Log out
                    </button>
                  </div>
                </>
              ) : (
                <button
                  style={popupStyles.popupButton}
                  onClick={closePopup}
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>


  )
};