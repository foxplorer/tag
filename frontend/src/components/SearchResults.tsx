import { useState, useEffect, useRef } from "react";
import { ShowMoreButton } from "../components/ShowMoreButton";
import { PulseLoader } from 'react-spinners';
import { Button } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";

type SearchResultsProps = {
  faucetvar: boolean,
  pickvar: boolean,
  myordinalsaddress: string,
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
  setsearchloading: boolean,
  showactions: boolean
}

type ToDisplay = {
  name: string;
  link: string;
  img: string;
  imgid: string;
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
  outpoint: string;
}

const SearchResults = ({ showactions, setsearchloading, passedFunctionFromFilters, clearFilters, faucetvar, pickvar, myordinalsaddress, todisplay, background, name, body, mouth, head, eyes, item, totalresults }: SearchResultsProps) => {

  //loading for results
  const [loading, setLoading] = useState<boolean>(true);

  //pass loading function to child
  const passedFunction = () => {
    setLoading(false);
    passedFunctionFromFilters();
  }

  //get fox screen
  const [showgetfoxscreen, setShowGetFoxScreen] = useState<boolean>(false);

  //display show more

  const [displayshowmore, setDisplayShowMore] = useState<boolean>(true);

  // use navigate
  const navigate = useNavigate();


  //get fox screen
  const [foxloading, setFoxLoading] = useState<boolean>(false);
  const [getanother, setGetAnother] = useState<boolean>(false);
  //fox container
  const container = document.getElementById('error-container');

  //send fox server response
  const [foxserverresponse, setFoxServerResponse] = useState<string>("");
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
  const [getfoxname, setGetFoxName] = useState<string>("");
  const [getfoximgid, setGetFoxImgId] = useState<string>("");

  //setnumresults
  const [foxresults, setFoxResults] = useState<number>(100);
  const [numresults, setNumResults] = useState<number | string>("?");


  //available for tag
  const [available, setAvailable] = useState<string[]>([]);
  const [taggedfoxesowned, setTaggedFoxesOwned] = useState<number | string>("?");
  const [tags, setTags] = useState<number | string>("?");
  const [getfoxbuttons, setGetFoxButtons] = useState<string>();

  // foxes to map
  const [displayfaucetfoxes, setDisplayFaucetFoxes] = useState<ToDisplay[]>([]);

  const addElement = (newElement) => {
    let c = [...displayfaucetfoxes, ...newElement];
    setDisplayFaucetFoxes(c);
  };

  //showtwins
  const [showtwins, setShowTwins] = useState<boolean>(false);

  //useRefs
  const didMount = useRef(false);


  // get tag buttons
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    //console.log(getfoxbuttons)
    //add all tagged origin outpoints to buttonids array
    // console.log("first")
    let buttonids = [];
    let d = 0;
    let mytaggedfoxes = 0;
    let dat = JSON.parse(getfoxbuttons)
    let myfoxesoutpoints = [];
    let mynumtags = 0;
    //get my fox origin outpoints
    let myfoxes = JSON.parse(todisplay)
    for (let i = 0; i < myfoxes.length; i++) {
      if (myfoxes[i] !== undefined) if (myfoxes[i].origin.data.map.subTypeData.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0") {
        myfoxesoutpoints.push(myfoxes[i].origin.outpoint)
      }
    }

    // console.log(dat.length)
    for (let i = 0; i < dat.length; i++) {
      if (dat[i].data.map.taggeeoriginoutpoint) {
        buttonids[d] = dat[i].data.map.taggeeoriginoutpoint;
        //add to my tagged foxes if I own it
        if (myfoxesoutpoints.includes(buttonids[d])) {
          mytaggedfoxes++;
        }
        d++;
      }
      //see if i am the tagger
      if (dat[i].data.map.taggerowner === myordinalsaddress) {
        mynumtags++;
      }

    }
    //  console.log(buttonids.length)
    // console.log(buttonids)
    setTaggedFoxesOwned(mytaggedfoxes)
    setAvailable(buttonids)
    setTags(mynumtags)

  }, [getfoxbuttons]);

  // get inscriptions for play tag action
  useEffect(() => {
    //ord address search
    let result = "1LrqkqTznmScsT6e198c12KNKhZ4KuyK35";
    //fetch
    fetch("https://ordinals.gorillapool.io/api/txos/address/" + result + "/unspent?limit=300000", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data)
        setGetFoxButtons(JSON.stringify(data))
      })
  }, []);

  //resetLoading
  const resetLoading = () => {
    clearFilters()
  };

  //get fox
  const getFox = (e) => {

    const id = e.currentTarget.getAttribute("data-name")
    const image = e.currentTarget.getAttribute("data-img")
    // console.log(id)
    // console.log(myordinalsaddress)

    //set vars for fox image and details
    setTrait1(e.currentTarget.getAttribute("data-trait1"))
    setTrait2(e.currentTarget.getAttribute("data-trait2"))
    setTrait3(e.currentTarget.getAttribute("data-trait3"))
    setTrait4(e.currentTarget.getAttribute("data-trait4"))
    setTrait5(e.currentTarget.getAttribute("data-trait5"))
    setTrait6(e.currentTarget.getAttribute("data-trait6"))
    setTrait7(e.currentTarget.getAttribute("data-trait7"))
    setOwner(e.currentTarget.getAttribute("data-owner"))
    setOwnerLink(e.currentTarget.getAttribute("data-owner-link"))
    setOwnerTrimmed(e.currentTarget.getAttribute("data-owner-trimmed"))
    setGetFoxLink(e.currentTarget.getAttribute("data-link"))
    setGetFoxImg(e.currentTarget.getAttribute("data-img"))
    setGetFoxName(e.currentTarget.getAttribute("data-name"))
    setGetFoxImgId(e.currentTarget.getAttribute("data-imgid"))



    setFoxLoading(true)
    setFoxServerResponse("")
    sendVarsToServer(myordinalsaddress, id)
    setShowGetFoxScreen(true)

  };

  //get fox
  const setResponseData = (data: string) => {
    setFoxLoading(false)
    setFoxServerResponse(data)
  };

  //get action
  const getAction = (data: string, imgid: string, owner: string, totalresults: number, name: string, outpoint: string) => {
    if (data === "golive") {
      // console.log("going live")
      // console.log(imgid + " = imgid ")
      // console.log(owner + " = owner ")
      // console.log(totalresults + " = total results ")
      // console.log(name + " = name ")

      navigate("/livewithfox", { state: { originoutpoint: imgid, owneraddress: owner, foxes: totalresults, foxname: name } });
    }
    if (data === "playtag") {
      if (available.includes(imgid)) {
        alert("Fox already tagged. Pick another fox.")
        return
      }
      // console.log("going live")
      // console.log(imgid + " = imgid ")
      // console.log(owner + " = owner ")
      // console.log(totalresults + " = total results ")
      // console.log(name + " = name ")

      navigate("/tagwithfox", { state: { tags: tags, taggedfoxes: taggedfoxesowned, outpoint: outpoint, originoutpoint: imgid, owneraddress: owner, foxes: totalresults, foxname: name } });
    }

    if (data === "playrollingicebergs") {



      navigate("/rollingicebergs", { state: { outpoint: outpoint, originoutpoint: imgid, owneraddress: owner, foxes: totalresults, foxname: name } });
    }

    if (data === "playchess") {



      navigate("/foxchess", { state: { outpoint: outpoint, originoutpoint: imgid, owneraddress: owner, foxes: totalresults, foxname: name } });
    }

  };

  //get action
  const pickFox = (e) => {

    // console.log("going live")
    // console.log(totalresults + " = total results ")
    navigate("/livewithfox", { state: { originoutpoint: e.currentTarget.getAttribute("data-imgid"), owneraddress: e.currentTarget.getAttribute("data-owner"), foxes: totalresults, foxname: e.currentTarget.getAttribute("data-name") } });

  };


  const backToResults = () => {
    setShowGetFoxScreen(false)
    setGetAnother(false)
  };

  //back to search results

  //sendvarstoserver
  //send addresses and avatar to server
  const sendVarsToServer = async (myordinalsaddress: string, id: string) => {
    const url = "https://localhost:9000/getfaucetfox";
    // console.log(myordinalsaddress + "=addresses in sendvars")
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({ "id": id, "address": myordinalsaddress })
      // body: JSON.stringify({ addresses, "avatar": avatar }),
    };
    fetch(url, options)
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        setGetAnother(true)
        setResponseData("Fox Sent" + JSON.stringify(data) + "Txid:")

      });
  };

  //handle demo connect
  const showMore = () => {
    let rrr = todisplay;
    if (rrr) {
      let ppp = JSON.parse(rrr)!;
      let foxcount = (foxresults - 50);
      let d = 0;
      let displayfaucetfoxestemp = [];

      //show up to 50 more
      for (let i = (foxresults - 50); i < foxresults; i++) {
        if (ppp[i] !== undefined) if (ppp[i].origin.data.map.subTypeData.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0") {
          // fox
          displayfaucetfoxestemp[d] = { img: "", name: "" }
          displayfaucetfoxestemp[d].img = "https://ordfs.network/content/" + ppp[i].origin.outpoint;
          displayfaucetfoxestemp[d].name = ppp[i].origin.data.map.name;
          displayfaucetfoxestemp[d].link = "https://alpha.1satordinals.com/outpoint/" + ppp[i].origin.outpoint + "/inscription";
          displayfaucetfoxestemp[d].imgid = ppp[i].origin.outpoint;
          displayfaucetfoxestemp[d].trait1 = ppp[i].origin.data.map.subTypeData.traits[0].value;
          displayfaucetfoxestemp[d].trait2 = ppp[i].origin.data.map.subTypeData.traits[1].value;
          displayfaucetfoxestemp[d].trait3 = ppp[i].origin.data.map.subTypeData.traits[2].value;
          displayfaucetfoxestemp[d].trait4 = ppp[i].origin.data.map.subTypeData.traits[3].value;
          displayfaucetfoxestemp[d].trait5 = ppp[i].origin.data.map.subTypeData.traits[4].value;
          displayfaucetfoxestemp[d].trait6 = ppp[i].origin.data.map.subTypeData.traits[5].value;
          displayfaucetfoxestemp[d].trait7 = ppp[i].origin.data.map.subTypeData.traits[6].value;
          displayfaucetfoxestemp[d].owner = ppp[i].owner;
          let own = ppp[i].owner;
          displayfaucetfoxestemp[d].ownerlink = "https://whatsonchain.com/address/" + own;
          displayfaucetfoxestemp[d].ownertrimmed = own.substring(0, 10) + "...";
          displayfaucetfoxestemp[d].outpoint = ppp[i].outpoint;
          d++;
          foxcount++;
        }
      }
      addElement(displayfaucetfoxestemp)

      //hide if no more foxes or add more foxes
      if (foxcount - foxresults < 0) {
        // console.log(foxcount -foxresults)
        setDisplayShowMore(false)
      } else {
        setFoxResults(foxresults + 50)
      }
    }
  };

  useEffect(
    () => {
      setFoxResults(100);
      if (container)
        container.innerHTML = "";

      let rrr = todisplay;
      if (rrr) {
        let ppp = JSON.parse(rrr)!;
        let foxcount = 0;
        let foxlength = ppp.length;
        //get total length
        for (let i = 0; i < foxlength; i++) {
          if (ppp[i] !== undefined) if (ppp[i].origin.data.map.subTypeData.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0") {
            foxcount++;
          }
        }
        setNumResults(foxcount);
        let d = 0;
        let displayfaucetfoxestemp = [];
        for (let i = 0; i < 50; i++) {
          if (ppp[i] !== undefined) if (ppp[i].origin.data.map.subTypeData.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0") {
            // fox
            displayfaucetfoxestemp[d] = { img: "", name: "" }
            displayfaucetfoxestemp[d].img = "https://ordfs.network/content/" + ppp[i].origin.outpoint;
            displayfaucetfoxestemp[d].name = ppp[i].origin.data.map.name;
            displayfaucetfoxestemp[d].link = "https://alpha.1satordinals.com/outpoint/" + ppp[i].origin.outpoint + "/inscription";
            displayfaucetfoxestemp[d].imgid = ppp[i].origin.outpoint;
            displayfaucetfoxestemp[d].trait1 = ppp[i].origin.data.map.subTypeData.traits[0].value;
            displayfaucetfoxestemp[d].trait2 = ppp[i].origin.data.map.subTypeData.traits[1].value;
            displayfaucetfoxestemp[d].trait3 = ppp[i].origin.data.map.subTypeData.traits[2].value;
            displayfaucetfoxestemp[d].trait4 = ppp[i].origin.data.map.subTypeData.traits[3].value;
            displayfaucetfoxestemp[d].trait5 = ppp[i].origin.data.map.subTypeData.traits[4].value;
            displayfaucetfoxestemp[d].trait6 = ppp[i].origin.data.map.subTypeData.traits[5].value;
            displayfaucetfoxestemp[d].trait7 = ppp[i].origin.data.map.subTypeData.traits[6].value;
            displayfaucetfoxestemp[d].owner = ppp[i].owner;
            let own = ppp[i].owner;
            displayfaucetfoxestemp[d].ownerlink = "https://whatsonchain.com/address/" + own;
            displayfaucetfoxestemp[d].ownertrimmed = own.substring(0, 10) + "...";
            displayfaucetfoxestemp[d].outpoint = ppp[i].outpoint;
            d++;
          }
        }
        setDisplayFaucetFoxes(displayfaucetfoxestemp)

        //show/hide display more as necessary
        if ((foxcount - 50) > 0) {
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
            container.innerHTML = "<p>You don't have any Foxes!<br /><br />If you think this is a mistake, refresh the page.</p>";
          } else {
            container.innerHTML = "<h3>You don't have any Foxes with these attributes:</h3><p>Background:   " + background + "<br />Fox:   " + name + "<br />Body:   " + body + "<br />Mouth:   " + mouth + "<br />Head Item:   " + head + "<br />Eyes:   " + eyes + "<br />Item:   " + item + "</p>";
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
    },
    [todisplay] // with dependency: run every time variable changes
  )




  return (
    <>
      {!showgetfoxscreen &&
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
                      <li key={uuidv4()}><a target="blank"
                        href={data.link}>
                        <img src={data.img}
                          className="seventraitfoxes"
                          id={data.imgid} />
                      </a>
                        <br />
                        {showactions && (
                          <>
                            <div className="ActionsContainer">
                              <select className="Actions" onChange={(e) => {
                                getAction(e.target.value, data.imgid, data.owner, totalresults, data.name, data.outpoint);
                              }}>
                                <option key="" value="">Actions</option>
          
                                {!available.includes(data.imgid) &&
                                  <option key="playtag" value="playtag">Play Tag</option>
                                }
   
                              </select>
                            </div>

                          </>
                        )}
                        <span className="TwinName"><a target="blank"
                          href={data.link}>{data.name}</a>
                        </span>
                        <div className="ResultsTraits">{data.trait1}<br />{data.trait2}<br />{data.trait3}<br />{data.trait4}<br />{data.trait5}<br />{data.trait6}<br />{data.trait7}</div>
                        {pickvar && (
                          <>
                            <Button className="ButtonPadded" variant="contained" data-name={data.name} data-imgid={data.imgid} data-owner={data.owner} onClick={pickFox} sx={{ color: "#fefefe" }}>Go Live</Button>


                          </>
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
                  <ShowMoreButton onClick={showMore} />
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


          {/* commenting out twinfinder so big wallets can load */}
          {/* <TwinFinder faucetvar={faucetvar} todisplay={todisplay} totalresults={totalresults} passedFunction={passedFunction} getFox={getFox} /> */}

        </>
      }
    </>
  )
};

export default SearchResults;