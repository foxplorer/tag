import { useState, useEffect, useRef, useMemo } from "react";
import { TagLogo } from "../components/TagLogo";
import { ThreeCircles } from 'react-loader-spinner';
import { XLogoRight } from "../components/XLogoRight";
import FooterHome from "../components/FooterHome";
import { ExitButton } from "../components/ExitButton";
import TemporaryDrawer from "../components/Drawer";
import TaggedFoxes from "../components/TaggedFoxes";
import DisplayPlayersArray from "../components/DisplayPlayersArray";
import { MobileControls } from "../components/MobileControls";
import SpaceRocks from "../components/SpaceRocks";
import { BountyHistory } from "../components/BountyHistory";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
//sounds
import boom from "../assets/boom.mp3";
import rumble from "../assets/spacerumblesoundtrack.mp3";
import { ImVolumeMute2 } from "react-icons/im";
import { ImVolumeHigh } from "react-icons/im";

type TagWithFoxProps = {

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
  gamenumber?: number;
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
  projectiles: Array<{x: number, y: number, dir: number, speed: number}>
}

export const TagWithFox = ({ }: TagWithFoxProps) => {

  //loading for twins
  const [loading, setLoading] = useState<boolean>(true);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [myordaddress, setMyOrdAddress] = useState<string>("");

  //owns a fox
  const [ownsfox, setOwnsFox] = useState<boolean>(false);
  const [foxesowned, setFoxesOwned] = useState<number | string>("?");
  const [foxname, setFoxName] = useState<string>("");
  const [pixelFoxName, setPixelFoxName] = useState<string>("");
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
  const [showmuted, setShowMuted] = useState<boolean>(true);
  const [hidemuted, setHideMuted] = useState<boolean>(false);
  const [igottagged, setIGotTagged] = useState<boolean>(false);
  const [showinfo, setShowInfo] = useState<boolean>(true);

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

  // Mobile controls state
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [cameraZoom, setCameraZoom] = useState<number>(0.5)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const cameraRef = useRef<any>(null)
  const gameRef = useRef<any>(null)
  const thisPlayerRef = useRef<any>(null)

  // Bucket foxes data state
  const [bucketFoxes, setBucketFoxes] = useState<any[]>([])
  const [playerBucketAssignments, setPlayerBucketAssignments] = useState<{[key: string]: any}>({})
  const [myBucketAssignment, setMyBucketAssignment] = useState<any>(null)
  
  // Refs to make bucket data accessible to rendering context
  const bucketFoxesRef = useRef<any[]>([])
  const playerBucketAssignmentsRef = useRef<{[key: string]: any}>({})
  const myBucketAssignmentRef = useRef<any>(null)
  
  // Cycling image state for group buckets
  const [cyclingImages, setCyclingImages] = useState<{[key: string]: {currentIndex: number, lastChange: number}}>({})
  const cyclingImagesRef = useRef<{[key: string]: {currentIndex: number, lastChange: number}}>({})
  
  // Image cache for bucket foxes
  const bucketFoxImageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map())

  // Spacerock state
  const [spaceRocks, setSpaceRocks] = useState<any[]>([])
  const [spaceRocksCount, setSpaceRocksCount] = useState<number>(0)
  const [latestBlockHash, setLatestBlockHash] = useState<string>('')
  
  // Refs to make spacerock data accessible to rendering context
  const spaceRocksRef = useRef<any[]>([])

  // Rate limiting for shooting - max 1x per second
  const lastShootTimeRef = useRef<number>(0)

  // Function to shorten address for display
  const shortenAddress = (address: string) => {
    if (!address || address.length <= 20) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

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

    //sounds
    const audio = useMemo(() => new Audio(rumble), [rumble]);
    //sounds
    const soundRef = useRef(false)


    function playboom() {
      // console.log("enterplayboom")
      // console.log(soundRef.current + " = soundref current")
      if(soundRef.current === true){
        // console.log(showmuted + " = showmuted in conditional")
        // console.log("shouldplayboom")
        new Audio(boom).play()
      }
    }
    function playrumble() {
      audio.play()
      soundRef.current = true;
      audio.addEventListener('ended', function(){
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
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext('2d');
        // Use actual window dimensions to prevent blur at edges
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        setCanvasContext(context)
      }
    }, []);

    // Cleanup socket on component unmount
    useEffect(() => {
      return () => {
        if (sock) {
         // console.log('TagWithFox: Cleaning up socket connection on unmount');
          sock.close();
        }
        // Clean up dynamic spacerock cache
        if (dynamicSpaceRockCacheRef.current) {
          dynamicSpaceRockCacheRef.current.clear();
         // console.log('Cleaned up dynamic spacerock cache');
        }
      };
    }, []);






  //view
  // const [viewwidth, setViewWidth] = useState<number>(window.innerWidth);
  // const [viewheight, setViewHeight] = useState<number>(window.innerHeight);
  // const [viewwidth, setViewWidth] = useState<number>(1280);
  // const [viewheight, setViewHeight] = useState<number>(720);



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
    setMyOrdAddress(state.state.owneraddress)
    setFoxesOwned(state.state.foxes)
    setFoxName(state.state.foxname)
    setPixelFoxName(state.state.pixelFoxName || '')
    setFoxImageSrc(state.state.originoutpoint)
    setFoxImageUrl("https://ordfs.network/content/" + state.state.originoutpoint)
    setFoxImageInfo("https://alpha.1satordinals.com/outpoint/" + state.state.originoutpoint + "/inscription")
    setTagOrdAddress("13m9K5GrXvLoyRaFoj6ooFWWm6kBHVHmgF")
    
    // Cleanup function for when fox data changes or component unmounts
    return () => {
      if (sock) {
       // console.log('TagWithFox: Cleaning up socket connection due to fox data change');
        sock.close();
      }
    };
  }, [state.state.owneraddress, state.state.foxname, state.state.originoutpoint]);
  
  // Removed scroll to top logic to prevent page jumping

  // Handle cleanup when user navigates back to pick another fox
  useEffect(() => {
    const handlePopState = () => {
      if (sock) {
       // console.log('TagWithFox: Cleaning up socket connection on popstate (back button)');
        sock.close();
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [sock]);

  // Note: Scroll to top is now handled by the ScrollToTop component in App.tsx

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
    
    // Handle cleanup when user navigates away
    const handleBeforeUnload = () => {
      if (sock) {
      //  console.log('TagWithFox: Cleaning up socket connection on beforeunload');
        sock.close();
      }
    };
    
    checkMobile();
    updateViewport();
    
    window.addEventListener('resize', checkMobile);
    window.addEventListener('resize', updateViewport);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Clean up socket on unmount
      if (sock) {
       // console.log('TagWithFox: Cleaning up socket connection on mobile detection unmount');
        sock.close();
      }
    };
  }, [sock]);

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
    gameRef.current = Game;

    socket.on('connect', function () {
      // Add this with other socket listeners
      socket.on('projectileHitWallBroadcast', function() {
        playboom();
      });

      //tag code
      //initialize my player variable
      let thisPlayer: PlayersArray = {
        id: socket.id,
        owneraddress: state.state.owneraddress,
        outpoint: state.state.originoutpoint,
        currentoutpoint: state.state.outpoint,
        foxname: state.state.pixelFoxName || state.state.foxname, // Use pixel fox name if available, fallback to foxname
        image: "https://ordfs.network/content/" + state.state.originoutpoint + "",
        imagelink: "https://alpha.1satordinals.com/outpoint/" + state.state.originoutpoint + "/inscription",
        x: rand1,
        y: rand2,
        speed: 400,
        height: 50,
        width: 50,
        dir: 1,
        projectiles: []
      };
      thisPlayerRef.current = thisPlayer;
      // console.log(thisPlayer);
      socket.emit('playing', thisPlayer);


      //new player update playersArray
      socket.on('newPlayer', function (data) {
        //setplayersarray if changed
        setPlayersArray(data);
      });
      socket.on('awaitingActivity', function (data) {
        console.log("=== FRONTEND RECEIVED AWAITING ACTIVITY EVENT ===");
        console.log("Activity data received:", data);
        console.log("Activity data type:", typeof data);
        
        playboom()
        let temp: ActivityArray = data;
        setTempActivity(data);

        setShowInfo(false)
        setViewingTaggedInfo(true)
        setActivityMessage("Getting Transaction Id...")
        //get new position
        newchaser = true;
        console.log("=== END AWAITING ACTIVITY EVENT HANDLING ===");
      });

      socket.on('txid', function (data) {
        console.log("=== FRONTEND RECEIVED TXID EVENT ===");
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
        console.log("=== END TXID EVENT HANDLING ===");
      });

      socket.on('alreadytagged', function () {
       // console.log("already tagged, going home...")
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
        
        // Update the ref when chaser changes
        thisPlayerRef.current = thisPlayer;
      });

      //update players
      socket.on('updatePlayers', function (updatedPlayers) {
        playersArray = updatedPlayers;
        setPlayers(updatedPlayers.length);
        // Update projectiles for all players
        updatedPlayers.forEach(player => {
          const localPlayer = playersArray.find(p => p.id === player.id);
          if (localPlayer) {
            localPlayer.projectiles = player.projectiles || [];
          }
        });
      });

      // Listen for bucket foxes data from server (players receive this)
      socket.on('bucketFoxesData', function (data) {
        //  console.log('=== TAGWITHFOX.TSX (PLAYER) - BUCKET FOXES DATA RECEIVED ===');
         // console.log('Total buckets:', data.totalBuckets);
         // console.log('Available foxes count:', data.availableCount);
        
        // Store bucket foxes data
        setBucketFoxes(data.bucketFoxes);
        bucketFoxesRef.current = data.bucketFoxes;
        
      //  console.log('=== END TAGWITHFOX.TSX (PLAYER) - BUCKET FOXES DATA ===');
      });

      // Listen for when this player gets assigned a bucket
      socket.on('playerAssignedBucket', function (data) {
       // console.log('My bucket assignment:', data.playerId, '-> bucket', data.bucketIndex);
        
        // Get bucket fox data from local array
        const bucketFox = bucketFoxesRef.current[data.bucketIndex];
        
        // Store my bucket assignment
        setMyBucketAssignment({
          bucketIndex: data.bucketIndex,
          bucketFox: bucketFox
        });
        
        // Update ref for rendering context
        myBucketAssignmentRef.current = {
          bucketIndex: data.bucketIndex,
          bucketFox: bucketFox
        };
      });

      // Listen for when other players get assigned buckets
      socket.on('playerBucketAssigned', function (data) {
       // console.log('Other player bucket assignment:', data.playerId, '-> bucket', data.bucketIndex);
        
        // Get bucket fox data from local array
        const bucketFox = bucketFoxesRef.current[data.bucketIndex];
        
        // Store other player's bucket assignment
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
      });

      // Listen for bounty fox activities to add to Latest Transactions
      socket.on('bountyFoxActivity', function (data) {
       // console.log('Received bounty fox activity:', data);
        
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
        }

        Player.prototype.update = function (step, worldWidth, worldHeight) {
          // Store previous position for collision detection
          const prevX = this.x;
          const prevY = this.y;

          if (newchaser === true) {
            this.x = (Math.round((Math.floor(Math.random() * 3999) + 1) / 10) * 10);
            this.y = (Math.round((Math.floor(Math.random() * 3999) + 1) / 10) * 10);
            newchaser = false;
          }

          if (Game.controls.b === true) {
            this.speed = 800;
            thisPlayer.speed = 800;
          } else {
            this.speed = 300;
            thisPlayer.speed = 300;
          }

          // Move player
          if (Game.controls.left) {
            thisPlayer.dir = -1;
            this.x -= this.speed * step;
          }
          if (Game.controls.up)
            this.y -= this.speed * step;
          if (Game.controls.right) {
            thisPlayer.dir = 1;
            this.x += this.speed * step;
          }
          if (Game.controls.down)
            this.y += this.speed * step;

          // Check wall collisions with separate X and Y axis collision detection
          const walls = [
            { x: 1000, y: 800, width: 50, height: 800 },
            { x: 2000, y: 1500, width: 50, height: 600 },
            { x: 3500, y: 2000, width: 50, height: 700 },
            { x: 4500, y: 1000, width: 50, height: 600 },
            { x: 4000, y: 3000, width: 50, height: 500 },
            { x: 500, y: 2000, width: 50, height: 800 }
          ];

          // Check X-axis collision first
          const playerRectX = {
            left: this.x - 25,
            right: this.x + 25,
            top: prevY - 25,     // Use previous Y position
            bottom: prevY + 25   // Use previous Y position
          };

          let collisionX = false;
          walls.forEach(wall => {
            if (playerRectX.left < wall.x + wall.width &&
                playerRectX.right > wall.x &&
                playerRectX.top < wall.y + wall.height &&
                playerRectX.bottom > wall.y) {
              collisionX = true;
            }
          });

          // If X collision, revert X position
          if (collisionX) {
            this.x = prevX;
          }

          // Check Y-axis collision
          const playerRectY = {
            left: this.x - 25,    // Use current X position (after X collision check)
            right: this.x + 25,   // Use current X position (after X collision check)
            top: this.y - 25,
            bottom: this.y + 25
          };

          let collisionY = false;
          walls.forEach(wall => {
            if (playerRectY.left < wall.x + wall.width &&
                playerRectY.right > wall.x &&
                playerRectY.top < wall.y + wall.height &&
                playerRectY.bottom > wall.y) {
              collisionY = true;
            }
          });

          // If Y collision, revert Y position
          if (collisionY) {
            this.y = prevY;
          }

          // World boundaries
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

          // Update projectiles with wall collision
          if (thisPlayer.projectiles) {
            for (let i = thisPlayer.projectiles.length - 1; i >= 0; i--) {
              const projectile = thisPlayer.projectiles[i];
              const nextX = projectile.x + projectile.dir * projectile.speed * step;
              
              // Check wall collisions for projectiles
              let hitWall = false;
              walls.forEach(wall => {
                if (nextX >= wall.x && 
                    nextX <= wall.x + wall.width &&
                    projectile.y >= wall.y && 
                    projectile.y <= wall.y + wall.height) {
                  hitWall = true;
                }
              });

              if (hitWall) {
                playboom();
                socket.emit('projectileHitWall');
                thisPlayer.projectiles.splice(i, 1);
              } else {
                projectile.x = nextX;
                if (projectile.x < 0 || projectile.x > worldWidth) {
                  thisPlayer.projectiles.splice(i, 1);
                }
              }
            }
          }

          thisPlayer.x = this.x;
          thisPlayer.y = this.y;
          socket.emit('updatePlayer', thisPlayer);
        }

        Player.prototype.draw = function (context, xView, yView, zoom) {
          // Apply zoom transformation
          context.save();
          context.scale(zoom, zoom);
          // draw a simple rectangle shape as our player model
          // context.save();
          // before draw we need to convert player world's position to canvas position			
          // context.fillRect((this.x - this.width / 2) - xView, (this.y - this.height / 2) - yView, this.width, this.height);

          //should not be creating new image eact time, store locally outside this function
          const img = new Image();
          img.src = "https://ordfs.network/content/" + thisPlayer.outpoint;

          // img.src = "android-chrome-192x192.png";


          //rocket
          let rocket;
          if (thisPlayer.speed === 300) {
            rocket = img2;
          } else {
            rocket = img3;
          }

          if (thisPlayer.id === chaserId) {

            // context.strokeStyle = '#f00';  // some color/style
            // context.lineWidth = 3;         // thickness

            if (thisPlayer.dir === -1) {
              context.save();
              context.scale(-1, 1)
              context.shadowColor = '#FFEA00';
              context.shadowBlur = 50;
              context.shadowOffsetX = 0;
              context.shadowOffsetY = 0;
              context.drawImage(img, -(this.x - this.width / 2) + xView - 50, (this.y - this.height / 2) - yView, 50, 50);
              // context.strokeRect(-(this.x - this.width / 2) + xView-50, (this.y - this.height / 2) - yView, 50, 50);
              context.drawImage(rocket, -(this.x - this.width / 2) + xView - 150, (this.y - this.height / 2) - yView-20, 220, 110);
              context.restore();
            } else {
              context.save();
              context.shadowColor = '#FFEA00';
              context.shadowBlur = 50;
              context.shadowOffsetX = 0;
              context.shadowOffsetY = 0;
              context.drawImage(img, (this.x - this.width / 2) - xView, (this.y - this.height / 2) - yView, 50, 50);
              // context.strokeRect((this.x - this.width / 2) - xView, (this.y - this.height / 2) - yView, 50, 50);
              context.drawImage(rocket, (this.x - this.width / 2) - xView - 100, (this.y - this.height / 2) - yView -20, 220, 110);
              context.restore();
            }
          } else {
            if (thisPlayer.dir === -1) {
              context.save();
              context.scale(-1, 1)
              context.drawImage(img, -(this.x - this.width / 2) + xView - 50, (this.y - this.height / 2) - yView, 50, 50);
              context.drawImage(rocket, -(this.x - this.width / 2) + xView - 150, (this.y - this.height / 2) - yView-20, 220, 110);
              context.restore();
            } else {
              context.drawImage(img, (this.x - this.width / 2) - xView, (this.y - this.height / 2) - yView, 50, 50);
              context.drawImage(rocket, (this.x - this.width / 2) - xView - 100, (this.y - this.height / 2) - yView-20, 220, 110);
            }


          }
          // context.restore();

                    // Draw fox images first, then name below them
          const myBucketAssignmentForText = myBucketAssignmentRef.current;
          if (myBucketAssignmentForText && myBucketAssignmentForText.bucketFox) {
            const bucketFox = myBucketAssignmentForText.bucketFox;
            
            // Draw fox images first
            if (bucketFox.bucket === '1x') {
              // For 1x buckets, show the individual fox image (static)
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
                if (foxImage.complete && foxImage.naturalWidth > 0) {
                  // Draw the fox image with rounded corners and border
                  const foxSize = 40;
                  const borderRadius = 4;
                  const borderWidth = 1;
                  const borderColor = '#ffffff';
                  const foxX = (this.x - this.width / 2) - xView + 25 - foxSize / 2; // center under ship
                  const foxY = (this.y - this.height / 2) - yView + 65; // below ship
                  
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
            } else if (bucketFox.groupFoxes) {
              // For group buckets, show cycling images
              const myKey = `my_${myBucketAssignmentForText.bucketIndex}`;
              const currentCycling = cyclingImagesRef.current[myKey] || { currentIndex: 0, lastChange: Date.now() };
              const currentGroupFox = bucketFox.groupFoxes[currentCycling.currentIndex];
              
              // Initialize cycling state if not exists
              if (!cyclingImagesRef.current[myKey]) {
                cyclingImagesRef.current[myKey] = { currentIndex: 0, lastChange: Date.now() };
                setCyclingImages(prev => ({ ...prev, [myKey]: { currentIndex: 0, lastChange: Date.now() } }));
              }
              
              // Debug logging for cycling
              if (Date.now() % 5000 < 100) { // Log every 5 seconds
                // console.log('=== CYCLING DEBUG ===');
                // console.log('Bucket type:', bucketFox.bucket);
                // console.log('Group foxes count:', bucketFox.groupFoxes.length);
                // console.log('Current cycling index:', currentCycling.currentIndex);
                // console.log('Current group fox:', currentGroupFox);
                // console.log('Cycling state:', cyclingImagesRef.current);
              }
              
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
                
                // Only draw if image is loaded and ready
                if (foxImage && foxImage.complete && foxImage.naturalWidth > 0) {
                  // Draw the fox image with rounded corners and border
                  const foxSize = 40;
                  const borderRadius = 4;
                  const borderWidth = 1;
                  const borderColor = '#ffffff';
                  const foxX = (this.x - this.width / 2) - xView + 25 - foxSize / 2; // center under ship
                  const foxY = (this.y - this.height / 2) - yView + 65; // below ship
                  
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
            
            // Now draw the name below the images
            let displayName = '';
            if (bucketFox.bucket === '1x') {
              displayName = bucketFox.foxName || bucketFox.name || 'Falling Fox';
            } else {
              displayName = bucketFox.groupName || bucketFox.name || 'Group Fox';
            }
            context.fillStyle = '#FFFFFF';
            context.font = 'bold 20px Arial';
            context.textAlign = 'center';
            context.strokeStyle = '#000000';
            context.lineWidth = 3;
            const textX = (this.x - this.width / 2) - xView + 25; // center under ship
            const textY = (this.y - this.height / 2) - yView + 125; // below the images (65 + 40 + 20)
            context.strokeText(displayName, textX, textY);
            context.fillText(displayName, textX, textY);
          }

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

                // Draw fox images first, then name below them for chaser
                const playerAssignment = playerBucketAssignmentsRef.current[opponent.id];
                
                // Only draw bucket fox images if we have bucket data
                if (playerAssignment && playerAssignment.bucketFox) {
                  const bucketFox = playerAssignment.bucketFox;
                  
                  // Draw fox images first
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
                        const foxX = opponent.x - xView - foxSize / 2;
                        const foxY = opponent.y - yView + 40; // Position below the fox
                        
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
                  
                  // Draw cycling fox images for group buckets
                  if (bucketFox.bucket !== '1x' && bucketFox.groupFoxes) {
                    const playerKey = `player_${opponent.id}`;
                    const currentCycling = cyclingImagesRef.current[playerKey] || { currentIndex: 0, lastChange: Date.now() };
                    const currentGroupFox = bucketFox.groupFoxes[currentCycling.currentIndex];
                    
                    if (currentGroupFox) {
                      // Preload all images in the group to prevent flickering
                      bucketFox.groupFoxes.forEach((groupFox, index) => {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.onload = () => {
                          // Store the loaded image in a cache
                          if (!bucketFoxImageCacheRef.current) {
                            bucketFoxImageCacheRef.current = new Map();
                          }
                          bucketFoxImageCacheRef.current.set(groupFox.outpoint, img);
                        };
                        img.src = groupFox.img;
                      });
                      
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
                      
                      // Draw the fox image with rounded corners and border
                      const foxSize = 40;
                      const borderRadius = 4;
                      const borderWidth = 1;
                      const borderColor = '#ffffff';
                      const foxX = opponent.x - xView - foxSize / 2;
                      const foxY = opponent.y - yView + 40; // Position below the fox
                      
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
                
                // Now draw the name below the images
                let displayName = 'Unknown Fox';
                if (playerAssignment && playerAssignment.bucketFox) {
                  const bucketFox = playerAssignment.bucketFox;
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
                context.font = 'bold 20px Arial';
                context.textAlign = 'center';
                context.strokeStyle = '#000000';
                context.lineWidth = 3;
                
                // Draw text with outline for better visibility
                const textX = opponent.x - xView;
                const textY = opponent.y - yView + 100; // Position below the images (40 + 40 + 20)
                
                // Draw outline
                context.strokeText(displayName, textX, textY);
                                // Draw main text
                context.fillText(displayName, textX, textY);

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
                context.font = 'bold 20px Arial';
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
                      
                      // Only draw if image is loaded and ready
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

          // Draw walls
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

          // Draw spacerocks (only if they exist and haven't been drawn yet)
          const spacerocks = spaceRocksRef.current || [];
          if (spacerocks.length > 0) {
            // Only log once when spacerocks are first drawn
            if (!this.spacerocksDrawn) {
              //console.log('Drawing spacerocks:', spacerocks.length, 'spacerocks');
              this.spacerocksDrawn = true;
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
                  //console.log('Creating new dynamic SVG for spacerock', spacerock.number, 'with color', spacerock.color);
                  
                  // Create a data URL from the SVG content
                  const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(dynamicSvg)));
                  
                  // Create a new image with the dynamic color
                  dynamicImage = new Image();
                  dynamicImage.onload = () => {
                    // Cache the successfully loaded image
                    dynamicSpaceRockCacheRef.current.set(spacerock.color, dynamicImage);
                    //console.log('Cached dynamic spacerock SVG for color:', spacerock.color);
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
                context.font = 'bold 20px Arial';
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
          }
          
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
        // Store reference to player instance for mobile controls
        gameRef.current.playerInstance = player;

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
        camera.follow(player, vWidth / 2, vHeight / 2);
        // Set initial zoom to 0.5
        camera.setZoom(0.5);

        // Game update function
        var update = function () {
          player.update(STEP, room.width, room.height);
          camera.update();
        }


        // Game draw function
        var draw = function () {
          // clear the entire canvas

          canvascontext.clearRect(0, 0, canvascontext.width, canvascontext.height);

          // redraw all objects
          room.map.draw(canvascontext, camera.xView, camera.yView, camera.zoom);
          player.draw(canvascontext, camera.xView, camera.yView, camera.zoom);

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
           // console.log("play");
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
            // Rate limiting - max 1x per second
            const currentTime = Date.now();
            if (currentTime - lastShootTimeRef.current < 1000) {
              // console.log('Rate limit: shooting too fast');
              return;
            }
            
            // Create new projectile starting from much further behind the player
            const projectileOffset = thisPlayer.dir === 1 ? 25 : -25; // Reduced offset to 25 pixels from center
            const newProjectile = {
              x: thisPlayer.x + projectileOffset, // Start projectile very close to player center
              y: thisPlayer.y + 30, // Align with rocket center
              dir: thisPlayer.dir,
              speed: 1200
            };
            thisPlayer.projectiles = thisPlayer.projectiles || [];
            thisPlayer.projectiles.push(newProjectile);
            
            // Update last shoot time for rate limiting
            lastShootTimeRef.current = currentTime;
            
            socket.emit('updatePlayer', thisPlayer);
          }
        }
      })

      window.addEventListener('keyup', function (event) {
        var key = event.key;

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
          // Game.togglePause();
        }
      })

      // Add socket listener for projectile hits
      socket.on('projectileHit', function (data) {
        // console.log("awaiting activity")
        playboom();

        let temp: ActivityArray = data;
        setTempActivity(data);

        setShowInfo(false);
        setViewingTaggedInfo(true);
        setActivityMessage("Getting Transaction Id...");
        //get new position
        newchaser = true;
        // console.log(newchaser)
      });

    }) //end socket on connect




    // socket.on('time', (data) => setTime(data))
    // socket.on('message', (data) => getMessage(data))
    // socket.on('viewers', (data) => setViewers(data))

    // Cleanup function for socket connection
    return () => {
      if (socket) {
       // console.log('TagWithFox: Cleaning up socket connection from main useEffect');
        socket.close();
      }
    };

  }, [canvascontext]);

  //go home 
  const goToIndex = async () => {
    // Clean up socket before navigating
    if (sock) {
    //  console.log('TagWithFox: Cleaning up socket connection before going home');
      sock.close();
    }
    window.location.href = "https://foxplorer.org/";
  };

  // Mobile controls handlers
  const handleJoystickMove = (x: number, y: number) => {
    // Update game controls based on joystick input
    if (gameRef.current && gameRef.current.controls) {
      const distance = Math.sqrt(x * x + y * y);
      
      // Movement controls
      gameRef.current.controls.left = x < -0.3;
      gameRef.current.controls.right = x > 0.3;
      gameRef.current.controls.up = y < -0.3;
      gameRef.current.controls.down = y > 0.3;
      
      // Boost when dragging far from center (distance > 1.2 means outside the joystick circle)
      gameRef.current.controls.b = distance > 1.2;
    }
  };

  const handleJoystickEnd = () => {
    // Reset all movement controls and boost
    if (gameRef.current && gameRef.current.controls) {
      gameRef.current.controls.left = false;
      gameRef.current.controls.right = false;
      gameRef.current.controls.up = false;
      gameRef.current.controls.down = false;
      gameRef.current.controls.b = false;
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
     // console.log('Shoot button pressed!');
       // console.log('chaserid state:', chaserid);
       // console.log('sock.id:', sock?.id);
    
    // Rate limiting - max 1x per second
    const currentTime = Date.now();
    if (currentTime - lastShootTimeRef.current < 1000) {
      // console.log('Rate limit: shooting too fast');
      return;
    }
    
    // Only allow chaser to shoot
    if (chaserid && sock && sock.id === chaserid) {
     // console.log('Creating projectile...');
      
      // Use the thisPlayerRef which should have the current player data
      if (thisPlayerRef.current) {
        const thisPlayer = thisPlayerRef.current;
        
        // Create new projectile starting from much further behind the player
        const projectileOffset = thisPlayer.dir === 1 ? 25 : -25; // Reduced offset to 25 pixels from center
        const newProjectile = {
          x: thisPlayer.x + projectileOffset, // Start projectile very close to player center
          y: thisPlayer.y + 30, // Align with rocket center
          dir: thisPlayer.dir,
          speed: 1200
        };
        
        // Add projectile to the player's projectiles array
        thisPlayer.projectiles = thisPlayer.projectiles || [];
        thisPlayer.projectiles.push(newProjectile);
        
        // Update last shoot time for rate limiting
        lastShootTimeRef.current = currentTime;
        
       // console.log('Projectile created:', newProjectile);
       // console.log('Updated projectiles:', thisPlayer.projectiles);
        sock.emit('updatePlayer', thisPlayer);
       // console.log('Sent updatePlayer to server');
      } else {
       // console.log('thisPlayerRef not available');
      }
    } else {
     // console.log('Cannot shoot - not chaser or socket missing');
     // console.log('chaserid:', chaserid);
      //console.log('sock.id:', sock?.id);
      //console.log('sock exists:', !!sock);
    }
  };

  const handleBoost = () => {
    // Toggle boost (for the boost button)
    if (gameRef.current && gameRef.current.controls) {
      gameRef.current.controls.b = !gameRef.current.controls.b;
    }
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

  // Preload fox images when bucket assignment is received
  useEffect(() => {
    if (myBucketAssignment && myBucketAssignment.bucketFox) {
      const bucketFox = myBucketAssignment.bucketFox;
      //console.log(`=== PRELOADING MY BUCKET FOX IMAGES (Bucket ${myBucketAssignment.bucketIndex}) ===`);
     // console.log(`Bucket type: ${bucketFox.bucket}, Name: ${bucketFox.name}`);
      
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
          //  console.log(`✅ Preloaded my 1x fox image: ${foxImageUrl}`);
          };
          img.onerror = () => {
           // console.error(`❌ Failed to preload my 1x fox image: ${foxImageUrl}`);
          };
          img.src = foxImageUrl;
        }
      } else if (bucketFox.groupFoxes) {
        // Preload all group fox images
       // console.log(`Preloading ${bucketFox.groupFoxes.length} group fox images for my bucket`);
        bucketFox.groupFoxes.forEach((groupFox, groupIndex) => {
          if (!bucketFoxImageCacheRef.current?.get(groupFox.outpoint)) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              if (!bucketFoxImageCacheRef.current) {
                bucketFoxImageCacheRef.current = new Map();
              }
              bucketFoxImageCacheRef.current.set(groupFox.outpoint, img);
            //  console.log(`✅ Preloaded my group fox image ${groupIndex + 1}/${bucketFox.groupFoxes.length}: ${groupFox.outpoint}`);
            };
            img.onerror = () => {
            //  console.error(`❌ Failed to preload my group fox image: ${groupFox.outpoint}`);
            };
            img.src = groupFox.img;
          }
        });
      }
      
     // console.log('=== FINISHED PRELOADING MY BUCKET FOX IMAGES ===');
    }
  }, [myBucketAssignment]);

  // Preload fox images for other players when their assignments are received
  useEffect(() => {
    Object.entries(playerBucketAssignments).forEach(([playerId, assignment]) => {
      if (assignment && assignment.bucketFox) {
        const bucketFox = assignment.bucketFox;
        //console.log(`=== PRELOADING OTHER PLAYER BUCKET FOX IMAGES (Player ${playerId}, Bucket ${assignment.bucketIndex}) ===`);
       // console.log(`Bucket type: ${bucketFox.bucket}, Name: ${bucketFox.name}`);
        
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
           //   console.log(`✅ Preloaded other player 1x fox image: ${foxImageUrl}`);
            };
            img.onerror = () => {
            //  console.error(`❌ Failed to preload other player 1x fox image: ${foxImageUrl}`);
            };
            img.src = foxImageUrl;
          }
        } else if (bucketFox.groupFoxes) {
          // Preload all group fox images
        //  console.log(`Preloading ${bucketFox.groupFoxes.length} group fox images for other player bucket`);
          bucketFox.groupFoxes.forEach((groupFox, groupIndex) => {
            if (!bucketFoxImageCacheRef.current?.get(groupFox.outpoint)) {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                if (!bucketFoxImageCacheRef.current) {
                  bucketFoxImageCacheRef.current = new Map();
                }
                bucketFoxImageCacheRef.current.set(groupFox.outpoint, img);
              //  console.log(`✅ Preloaded other player group fox image ${groupIndex + 1}/${bucketFox.groupFoxes.length}: ${groupFox.outpoint}`);
              };
              img.onerror = () => {
              //  console.error(`❌ Failed to preload other player group fox image: ${groupFox.outpoint}`);
              };
              img.src = groupFox.img;
            }
          });
        }
        
      //  console.log(`=== FINISHED PRELOADING OTHER PLAYER BUCKET FOX IMAGES (Player ${playerId}) ===`);
      }
    });
  }, [playerBucketAssignments]);

  // Initialize cycling state when bucket assignment is received
  useEffect(() => {
    if (myBucketAssignment && myBucketAssignment.bucketFox && myBucketAssignment.bucketFox.bucket !== '1x') {
      const myKey = `my_${myBucketAssignment.bucketIndex}`;
      if (!cyclingImagesRef.current[myKey]) {
        cyclingImagesRef.current[myKey] = { currentIndex: 0, lastChange: Date.now() };
        setCyclingImages(prev => ({ ...prev, [myKey]: { currentIndex: 0, lastChange: Date.now() } }));
      }
    }
  }, [myBucketAssignment]);

  // Cycling timer for group bucket images
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const imageChangeInterval = 1000; // Change every 1 second
      let hasChanges = false;
      
      // Update cycling for my bucket assignment
      if (myBucketAssignmentRef.current && 
          myBucketAssignmentRef.current.bucketFox && 
          myBucketAssignmentRef.current.bucketFox.bucket !== '1x' && 
          myBucketAssignmentRef.current.bucketFox.groupFoxes) {
        
        const myKey = `my_${myBucketAssignmentRef.current.bucketIndex}`;
        const currentCycling = cyclingImagesRef.current[myKey] || { currentIndex: 0, lastChange: now };
        
        if (now - currentCycling.lastChange > imageChangeInterval) {
          const newIndex = (currentCycling.currentIndex + 1) % myBucketAssignmentRef.current.bucketFox.groupFoxes.length;
          cyclingImagesRef.current[myKey] = { currentIndex: newIndex, lastChange: now };
          setCyclingImages(prev => ({ ...prev, [myKey]: { currentIndex: newIndex, lastChange: now } }));
          hasChanges = true;
        }
      }
      
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

  // Sync spacerock state with refs
  useEffect(() => {
    spaceRocksRef.current = spaceRocks;
  }, [spaceRocks]);

  // Add state for game number
  const [gameNumber, setGameNumber] = useState<number | null>(null);

  // In the socket connection useEffect (wherever the socket is set up):
  useEffect(() => {
    if (!sock) return;
    sock.on('tagGameNumber', (data) => {
      setGameNumber(data.gameNumber);
    });
    return () => {
      sock.off('tagGameNumber');
    };
  }, [sock]);

  return (

    <div className="App">
      <div id="Error"></div>

      {/* {preloaded && (
        <>
          <header className="App-header">

            <FoxplorerLogoHome onClick={goToIndex} />
            <div className="LoaderHeight">

              <ThreeCircles color="black" height="50"
                width="50" />
            </div>
            <MyOtherFox /> <MyFox />
          </header>
        </>
      )} */}

      <div className="Topbar">
        <TemporaryDrawer />
        <TagLogo onClick={goToIndex} />
        <a target="blank" href="https://twitter.com/yours_foxplorer"><XLogoRight /></a>
      </div>

      <div id="Live">
        <br />


        {!loaded && (
          <>

            {loading && (
              <>
                <span className="Required">
                  <ThreeCircles color="white" height="50"
                    width="50" />
                </span>
              </>
            )}
          </>
        )}


        {loaded && (
          <>
            <div className="Status" style={{ position: 'relative' }}>
              <span className="StatusLeft">

            
   
                <a target="blank" href={foximageinfo}>
                  <img
                    src={foximageurl}
                    className={whosit}
                    alt="Your Fox"
                  />
                </a>
                <br />
                <span className="Blue"><a target="blank" href={foximageinfo} style={{ color: 'inherit', textDecoration: 'underline' }}>{foxname}</a></span><br />
                {pixelFoxName && (
                  <>
                    <span style={{ color: '#cccccc', fontSize: '18px' }}>{pixelFoxName}</span><br />
                  </>
                )}
                <span style={{ color: '#cccccc', fontSize: '18px' }}>Ord: {shortenAddress(state.state.owneraddress)}</span><br />
                <span className="Blue">Total Foxes: </span>{state.state.foxes}<br />
                <span className="Blue">Tagged Foxes: </span>{state.state.taggedfoxes}<br />
                <span className="Blue">Opponents Tagged: </span>{state.state.tags}<br />
                <br />
              </span>
              <span className="StatusRight" style={{ display: isMobile ? 'none' : 'block' }}>

                {/* <WeLive /> */}
                <div className="TagPlayersContainer">
                  <div className="TagPlayers">
                    {/* <AiOutlineEye size={33} /> {viewers}<br /> */}
                    {/* <span><AiOutlineEye size={33} /> {viewers}<br /></span> */}

                    Players: {players}<br />
                    <ExitButton onClick={goToIndex} />
                  </div></div>
              </span>
              
              {/* Mobile exit button positioned in Status */}
              {isMobile && (
                <span className="StatusRight" style={{ 
                  position: 'absolute', 
                  top: '0', 
                  right: '0',
                  display: 'block'
                }}>
                  <ExitButton onClick={goToIndex} />
                </span>
              )}


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
          
            <ImVolumeMute2 style={{ color: "#36bffa", display: showmuted ? "block" : "none" }} size={33} onClick={playrumble}/>
            <ImVolumeHigh style={{ color: "#36bffa", display: hidemuted ? "block" : "none" }} size={33} onClick={muterumble}/>
          

          {viewingtaggedinfo &&


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
              {/* Fullscreen Joystick Controls - Centered at bottom */}
              {isMobile && (
                <div style={{
                  position: 'fixed',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10000
                }}>
                  <MobileControls
                    onJoystickMove={handleJoystickMove}
                    onJoystickEnd={handleJoystickEnd}
                    onZoomChange={handleZoomChange}
                    onShoot={handleShoot}
                    isChaser={chaserid === thisPlayerRef.current?.id}
                    showJoystick={true}
                    showShootButton={false}
                    showZoomControls={false}
                  />
                </div>
              )}
              
              {/* Fullscreen Shoot Button - Bottom left */}
              {isMobile && chaserid === thisPlayerRef.current?.id && (
                <div style={{
                  position: 'fixed',
                  bottom: '120px',
                  left: '20px',
                  zIndex: 10000
                }}>
                  <MobileControls
                    onJoystickMove={() => {}} // Not used for shoot-only
                    onJoystickEnd={() => {}} // Not used for shoot-only
                    onZoomChange={handleZoomChange}
                    onShoot={handleShoot}
                    isChaser={true}
                    showJoystick={false}
                    showShootButton={true}
                    showZoomControls={false}
                  />
                </div>
              )}
              
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
                  onJoystickMove={() => {}} // Not used for zoom-only
                  onJoystickEnd={() => {}} // Not used for zoom-only
                  onZoomChange={handleZoomChange}
                  onShoot={() => {}} // Not used for zoom-only
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
          
          {/* Mobile Controls - Joystick and Shoot Button */}
          {isMobile && !isFullscreen && (
            <MobileControls
              onJoystickMove={handleJoystickMove}
              onJoystickEnd={handleJoystickEnd}
              onZoomChange={handleZoomChange}
              onShoot={handleShoot}
              isChaser={chaserid === thisPlayerRef.current?.id}
              showJoystick={true}
              showShootButton={true}
              showZoomControls={false} // Zoom controls shown separately below
            />
          )}

          {/* Zoom Controls - Only shown when not in fullscreen */}
          {!isFullscreen && (
            <MobileControls
              onJoystickMove={() => {}} // Not used for zoom-only
              onJoystickEnd={() => {}} // Not used for zoom-only
              onZoomChange={handleZoomChange}
              onShoot={() => {}} // Not used for zoom-only
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
          <DisplayPlayersArray playersarray={playersarray} chaserid={chaserid} />
        
         
        </div>


                <SpaceRocks
          spaceRocks={spaceRocks}
          spaceRocksCount={spaceRocksCount}
          latestBlockHash={latestBlockHash}
          spacerockActivities={activityarray.filter(activity => 
            activity.spacerockMetadata && 
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

      <FooterHome />

    </div>


  )
};