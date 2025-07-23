import { useState, useEffect, useRef } from "react";
import { PandaConnectButton } from "../components/PandaConnectButton";
import Form from "../components/Form";
import { DemoButton } from "../components/DemoButton";
import { FoxplorerLogo } from "../components/FoxplorerLogo";
import { FoxplorerLogoHome } from "../components/FoxplorerLogoHome";
import { MyFox } from "../components/MyFox";
import { Candle } from "../components/Candle";
import { NormalFaucet } from "../components/NormalFaucet";
import { MyOtherFox } from "../components/MyOtherFox";
import { ThreeCircles } from 'react-loader-spinner';
import { XLogoRight } from "../components/XLogoRight";
import { XLogo } from "../components/XLogo";
import Filters from "../components/Filters";
import TemporaryDrawer from "../components/Drawer";
import FooterHome from "../components/FooterHome";


// Import the four-leaf clover image
import fourLeafClover from "../assets/four-leaf-clover.png";

import {
  usePandaWallet,
  Addresses,
  MimeTypes
} from "panda-wallet-provider";

import { Drawer } from "@mui/material";

interface FoxData {
  foxName: string;
  pixelFoxName: string;
}

interface GroupMember {
  "origin.outpoint": string;
  foxData: FoxData;
}

interface LuckyGroup {
  foxGroup: string;
  description: string;
  type: string;
  group: GroupMember[];
}

interface Fox {
  origin?: {
    outpoint: string;
  };
  // Add other properties as needed
}

interface LuckyFox extends Fox {
  foxData?: FoxData;
}

export const Foxplorer = () => {

  //use yours wallet
  const wallet = usePandaWallet();
  const [pubKey, setPubKey] = useState<string | undefined>();
  const [ordaddress, setOrdAddress] = useState<string>();
  const [addresses, setAddresses] = useState<Addresses | undefined>();
  const [myordaddress, setMyOrdAddress] = useState<string | undefined>(undefined); 

  //show actions menu
  const [showactions, setShowActions] = useState<boolean>(false);

  //loading
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(true);

  //ordinalsstring for Foxes Child Component
  const [ordinalsstring, setOrdinalsString] = useState<string | undefined>();

    //filters var => search results
    const [faucetvar, setFaucetVar] = useState<boolean>(false);
    const [myvar, setMyVar] = useState<boolean>(true);
    const [demovar, setDemoVar] = useState<boolean>(false);
    const [pickvar, setPickVar] = useState<boolean>(false);
    const [tag, setTag] = useState<boolean>(false);

  //formdata
  interface FormData {
    name: string;
  }

  //useRefs
  const didMount1 = useRef(false);
  const didMount2 = useRef(false);

  // data manipulation
  // useEffect(() => {
  //   // Get gold grills group
  //   const goldGrillsGroup = lucky500 as LuckyGroup;
    
  //   // Get the origin outpoints from gold grills group
  //   const goldGrillsOutpoints = goldGrillsGroup.group.map(fox => fox["origin.outpoint"]);
    
  //   // Filter bigjson to only keep UTXOs that are in gold grills group and add foxData
  //   const goldGrillsUtxos = (bigjson as Fox[]).filter(fox => 
  //     goldGrillsOutpoints.includes(fox.origin?.outpoint)
  //   ).map(fox => {
  //     // Find matching gold grill fox data
  //     const goldGrillFox = goldGrillsGroup.group.find(lucky => 
  //       lucky["origin.outpoint"] === fox.origin?.outpoint
  //     );
  //     // Add foxData to the UTXO
  //     return {
  //       ...fox,
  //       foxData: goldGrillFox?.foxData
  //     } as LuckyFox;
  //   });
    
  //   // Format the output with styled names
  //   const formattedOutput = goldGrillsUtxos.map(utxo => ({
  //     ...utxo,
  //     displayName: utxo.foxData ? {
  //       foxName: utxo.foxData.foxName,
  //       pixelFoxName: utxo.foxData.pixelFoxName
  //     } : 'Unknown Fox'
  //   }));
    
  //   // Log the formatted UTXOs
  //   console.log("Formatted Gold Grills UTXOs:", JSON.stringify(formattedOutput, null, 2));
  //   console.log("Number of gold grills UTXOs:", formattedOutput.length);
  // }, []);
      // get ord address
      useEffect(() => {
        if (!didMount2.current) {
          didMount2.current = true;
          return;
        }

        // Add null check for addresses
        if (!addresses || !addresses.ordAddress) {
          console.log('No addresses available yet');
          return;
        }

        setMyOrdAddress(addresses.ordAddress);
        setShowActions(true);
        setOrdAddress(addresses.ordAddress);
      }, [addresses]);
    // get ordinals string
    useEffect(() => {
      if (!didMount1.current) {
        didMount1.current = true;
        return;
      }
      let result;
      if(ordaddress){
        result = ordaddress.trim();
      }
      
      //fetch
      fetch("https://ordinals.gorillapool.io/api/txos/address/" + result + "/unspent?limit=300000", {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById("error")!.innerHTML = "";
          if((data.message)){
            setLoading(false);
            document.getElementById("error")!.innerHTML = data.message + ": Please enter a valid Ordinals address";
          }else{
            // console.log(data);
            // console.log(JSON.stringify(data));
          setOrdinalsString(JSON.stringify(data))
          setLoaded(true)
          }
        })
        .catch((error) => console.log(error));
    }, [ordaddress]);


  //handle ordinput
  const handleOrdInput = async (data: FormData) => {
    setLoading(true);
    let result = data.name.trim();
    setOrdAddress(result);
  };



    //handle demo connect
    const handleDemoConnect = async () => {
      window.location.href = "/mobilefriendlyfoxes";
          //current working code
          // setOrdinalsString(JSON.stringify(demojson))
          // setLoaded(true)


      // setOrdAddress("1CFCMQb4uC9fvBCsmk1pfWjdwouAJ5BEJe")
      // setTimeout(() => {
      //   if (demojson) {
      //     setLoading(true)
      //     setOrdAddress("1CFCMQb4uC9fvBCsmk1pfWjdwouAJ5BEJe")
      //     // setOrdinalsString(JSON.stringify(demojson))
      //     // setLoaded(true)
      //   } else {
      //     handleDemoConnect();
      //   }
      // }, 2000);
    };

    //handle get adresses
    const handleGetAddresses = async () => {
      try {
        const addrs = await wallet.getAddresses();
        if (addrs && addrs.ordAddress) {
          setAddresses(addrs);
        } else {
          console.log('Invalid address data received');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting addresses:', error);
        setLoading(false);
      }
    };

  //handle connect
  const handleConnect = async () => {
    setLoading(true);
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
      alert("Make sure you are signed-in to Yours Wallet and try again.")
      setLoading(false);
      return
    }
  };

  //go home 
  const goToIndex = async () => {
    window.location.href = "/";
  };

  const goToFaucet = async () => {
    window.location.href = "/faucet";
  };

  const goToIcebergs = async () => {
    window.location.href = "/rollingicebergs";
  };

  //return jsx
  return (
    <div className="App">

      {!loaded && (
        <>
          <header className="App-header">
            <TemporaryDrawer />
            <a target="blank" href="https://twitter.com/yours_foxplorer"><XLogo /></a>
            
            {/* Grid container to keep logo centered with clover positioned */}
            <div style={{ 
              display: 'grid', 
              placeItems: 'center',
              position: 'relative',
              width: '100%'
            }}>
              <FoxplorerLogoHome onClick={goToIndex} />
            </div>
            
            <PandaConnectButton onClick={handleConnect} />
            <DemoButton onClick={handleDemoConnect} />
            <div id="error"></div>
            <Form onSubmit={handleOrdInput} />
            <div className="LoaderHeight">
              {loading && (
                <ThreeCircles color="black" height="50" width="50" />
              )}
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              maxWidth: '600px',
              marginTop: '20px'
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <MyOtherFox />
                <MyFox />
              </div>
            </div>
          </header>
          {/* <FooterHome /> */}

        </>
      )}


      {loaded && (
      
        <>
        <div className="Topbar">
          <TemporaryDrawer />
          <FoxplorerLogo onClick={goToIndex} />
          <a target="blank" href="https://twitter.com/yours_foxplorer"><XLogoRight /></a>
        </div>
          <div id="Faucet">
      <p className="Heading"><span className="Demo"><b>Foxchain Explorer</b></span><br />Sort Unlimited Pixel Foxes</p>

        </div>
          <Filters ordinalsstring={ordinalsstring} myordinalsaddress={myordaddress} faucetvar={faucetvar} myvar={myvar} demovar={demovar} pickvar={pickvar} tag={tag} showactions={showactions} />
          <FooterHome />
          {/* <CreateGroupText groupordinalsstring={ordinalsstring} /> */}
          {/* <CreateJsonForAll groupordinalsstring={ordinalsstring} /> */}
        </>
      )}


    </div>
  );
};