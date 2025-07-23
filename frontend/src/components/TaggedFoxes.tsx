import { useState, useEffect, useRef, memo } from "react";
import { ShowMoreButton } from "../components/ShowMoreButton";
import { ShowMoreActivityButton } from "../components/ShowMoreActivityButton";
import { ShowMoreTopFoxesButton } from "../components/ShowMoreTopFoxesButton";
import { ShowMoreTaggedFoxesButton } from "../components/ShowMoreTaggedFoxesButton";
import { ShowMoreTopOwnersButton } from "../components/ShowMoreTopOwnersButton";
import { PulseLoader } from 'react-spinners';
import { Button } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";
import { ThreeCircles } from 'react-loader-spinner';
import _, { map } from 'underscore';


type TaggedArray = {
  taggeeoriginoutpoint: string,
  taggeefoxname: string,
  taggeeimage: string,
  taggeeimagelink: string,
  txid: string,
  txidlink: string,
  insclink: string,
  time: string
}

type TopTaggersByFox = {
  taggeroriginoutpoint: string,
  foxname: string,
  numtags: number,
  taggeralive: boolean
}

type TopTaggersByOwner = {
  owneraddress: string,
  numtags: number
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
  txid: string
}

type TaggedFoxesProps = {
  latestactivity: ActivityArray;
}

const TaggedFoxes = memo(function TaggedFoxes({ latestactivity }: TaggedFoxesProps) {
  const [taggedfoxesstring, setTaggedFoxesString] = useState<string>();
  const [taggedfoxes, setTaggedFoxes] = useState<TaggedArray[]>([]);
  const [activity, setActivity] = useState<ActivityArray[]>();
  const [toptaggersbyfox, setTopTaggersByFox] = useState<TopTaggersByFox[]>([]);
   const [toptaggersbyfoxtodisplay, setTopTaggersByFoxToDisplay] = useState<TopTaggersByFox[]>([]); 
   const [taggedfoxestodisplay, setTaggedFoxesToDisplay] = useState<TaggedArray[]>([]); 

   const [toptaggersbyowner, setTopTaggersByOwner] = useState<TopTaggersByOwner[]>([]);
   const [toptaggersbyownertodisplay, setTopTaggersByOwnerToDisplay] = useState<TopTaggersByOwner[]>([]);  
  const [latestactivitydisplay, setLatestActivityDisplay] = useState<ActivityArray[]>([]);
  const [taggedfoxcount, setTaggedFoxCount] = useState<number>();
  const [topfoxcount, setTopFoxCount] = useState<number>(); 
  const [ownerresults, setOwnerResults] = useState<number>(); 
  //useRefs
  const didMount = useRef(false);
  const didMount1 = useRef(false);
  const didMount2 = useRef(false);
  const didMount3 = useRef(false);
  const didMount4 = useRef(false);

    //setnumresults
    const [activityresults, setActivityResults] = useState<number>(12);
    const [topfoxresults, setTopFoxResults] = useState<number>(10);
    const [topownersresults, setTopOwnersResults] = useState<number>(10);
    const [taggedfoxresults, setTaggedFoxResults] = useState<number>(10);    
    //display show more
    const [displayshowmoreactivity, setDisplayShowMoreActivity] = useState<boolean>(true);
    const [displayshowmoretopfoxes, setDisplayMoreTopFoxes] = useState<boolean>(true);
    const [displayshowmoretopowners, setDisplayMoreTopOwners] = useState<boolean>(true);    
    const [displayshowmoretaggedfoxes, setDisplayMoreTaggedFoxes] = useState<boolean>(true);
    // get tagged foxes
  useEffect(() => {
    // if (!didMount2.current) {
    //   didMount2.current = true;
    //   return;
    // }
    //map search
    // const url = "https://ordinals.gorillapool.io/api/inscriptions/search?limit=100000&offset=0";
    // const options = {
    //   method: "POST",
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json;charset=UTF-8",
    //   },
    //   body: JSON.stringify(
    //     {
    //     "map": {
    //         "app": "mytestappxyz123",
    //         "name": "mytestappnamexyz123"
    //     }
    //     }
    //     )
    // };
    // fetch(url, options)
    //   .then((response) => response.json())
    //   .then((data) => {
    //     // console.log(data);
    //     setGetFoxButtons(JSON.stringify(data))
    //   });
    //console.log("use effect")
    let result = "1LrqkqTznmScsT6e198c12KNKhZ4KuyK35";
    //fetch
    fetch("https://ordinals.gorillapool.io/api/txos/address/" + result + "/unspent?limit=300000", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
       let ddd = JSON.stringify(data)
       let ccc = JSON.parse(ddd)
       setTaggedFoxCount(ccc.length)
            //get activity data
    let recentactivity: ActivityArray[] = [];
    let a = 0;
    for (let i = 0; i < ccc.length; i++) {
      if (ccc[i].origin.data.map.taggeroriginoutpoint) {
        recentactivity[a] = {
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
        }

        recentactivity[a].taggerowneraddress = ccc[i].origin.data.map.taggerowner;
        recentactivity[a].taggeroutpoint = ccc[i].origin.data.map.taggeroriginoutpoint;
        recentactivity[a].taggerfoxname = ccc[i].origin.data.map.taggerfoxname;
        recentactivity[a].taggerimage = "https://ordfs.network/content/" + ccc[i].origin.data.map.taggeroriginoutpoint;
        recentactivity[a].taggerimagelink = "https://alpha.1satordinals.com/outpoint/" + ccc[i].origin.data.map.taggeroriginoutpoint + "/inscription";
        recentactivity[a].taggeeowneraddress = ccc[i].origin.data.map.taggeeowner;
        recentactivity[a].taggeeoutpoint = ccc[i].origin.data.map.taggeeoriginoutpoint;
        recentactivity[a].taggeefoxname = ccc[i].origin.data.map.taggeefoxname;
        recentactivity[a].taggeeimage = "https://ordfs.network/content/" + ccc[i].origin.data.map.taggeeoriginoutpoint;
        recentactivity[a].taggeeimagelink = "https://alpha.1satordinals.com/outpoint/" + ccc[i].origin.data.map.taggeeoriginoutpoint + "/inscription";
        recentactivity[a].time = ccc[i].origin.data.map.time;
        recentactivity[a].txid = ccc[i].txid;
      }
      a++;
    }
    let sortedActivity = _.sortBy(recentactivity, 'time').reverse();
    // console.log(sortedActivity)
    setActivity(sortedActivity)
      })
  }, []);

  const addActivityElement = (newElement) => {
    let c = [...latestactivitydisplay, ...newElement];
    setLatestActivityDisplay(c);
  };
  //show more activity
    //handle demo connect
    const showMoreActivity = () => {
      let count = (activityresults - 6);
      let a = 0;
    //get activity data
    let firstactivity: ActivityArray[] = [];
    for (let i = (activityresults - 6); i < activityresults; i++) {
      if (activity[i] !== undefined) {
        firstactivity[a] = {
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
        }
  
        firstactivity[a].taggerowneraddress = activity[i].taggerowneraddress;
        firstactivity[a].taggeroutpoint = activity[i].taggeroutpoint;
        firstactivity[a].taggerfoxname = activity[i].taggerfoxname;
        firstactivity[a].taggerimage = "https://ordfs.network/content/" + activity[i].taggeroutpoint;
        firstactivity[a].taggerimagelink = "https://alpha.1satordinals.com/outpoint/" + activity[i].taggeroutpoint + "/inscription";
        firstactivity[a].taggeeowneraddress = activity[i].taggeeowneraddress;
        firstactivity[a].taggeeoutpoint = activity[i].taggeeoutpoint;
        firstactivity[a].taggeefoxname = activity[i].taggeefoxname;
        firstactivity[a].taggeeimage = "https://ordfs.network/content/" + activity[i].taggeeoutpoint;
        firstactivity[a].taggeeimagelink = "https://alpha.1satordinals.com/outpoint/" + activity[i].taggeeoutpoint + "/inscription";
        firstactivity[a].time = activity[i].time;
        firstactivity[a].txid = activity[i].txid;
      
          a++;
          count++;
      }
    }
        addActivityElement(firstactivity)
  
        //hide if no more foxes or add more foxes
        if (activity.length - activityresults <= 0) {
          // console.log(foxcount -foxresults)
          setDisplayShowMoreActivity(false)
        } else {
          setActivityResults(activityresults + 6)
        }
    };

  // get ord address
  useEffect(() => {
    if (!didMount1.current) {
      didMount1.current = true;
      return;
    }
 
    //get activity data
    let firstactivity: ActivityArray[] = [];
    let a = 0;
    let activitycount=activity.length;
    for (let i = 0; i < 6; i++) {
      firstactivity[a] = {
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
        }

        firstactivity[a].taggerowneraddress = activity[i].taggerowneraddress;
        firstactivity[a].taggeroutpoint = activity[i].taggeroutpoint;
        firstactivity[a].taggerfoxname = activity[i].taggerfoxname;
        firstactivity[a].taggerimage = "https://ordfs.network/content/" + activity[i].taggeroutpoint;
        firstactivity[a].taggerimagelink = "https://alpha.1satordinals.com/outpoint/" + activity[i].taggeroutpoint + "/inscription";
        firstactivity[a].taggeeowneraddress = activity[i].taggeeowneraddress;
        firstactivity[a].taggeeoutpoint = activity[i].taggeeoutpoint;
        firstactivity[a].taggeefoxname = activity[i].taggeefoxname;
        firstactivity[a].taggeeimage = "https://ordfs.network/content/" + activity[i].taggeeoutpoint;
        firstactivity[a].taggeeimagelink = "https://alpha.1satordinals.com/outpoint/" + activity[i].taggeeoutpoint + "/inscription";
        firstactivity[a].time = activity[i].time;
        firstactivity[a].txid = activity[i].txid;
      
      a++;
    }

    //show/hide display more for activity
    if ((activitycount - 6) >= 0) {
      setDisplayShowMoreActivity(true)
    } else {
      setDisplayShowMoreActivity(false)
    }


    //get tagged foxes
    let newstring: TaggedArray[] = [];
    let taggeeoutpoints: string[] = [];
    let d = 0;

    for (let i = 0; i < activity.length; i++) {
        //save all taggeeoriginoutpoints for reference
        taggeeoutpoints.push(activity[i].taggeeoutpoint)
        newstring[d] = {
          taggeeoriginoutpoint: "string",
          taggeefoxname: "string",
          taggeeimage: "string",
          taggeeimagelink: "string",
          txid: "string",
          txidlink: "string",
          insclink: "string",
          time: "string"
        }
        let n = Number(activity[i].time);
        //console.log(n)
        let date = new Date(n).toLocaleString();

        newstring[d].taggeeoriginoutpoint = activity[i].taggeeoutpoint;
        newstring[d].taggeefoxname = activity[i].taggeefoxname;
        newstring[d].taggeeimage = "https://ordfs.network/content/" + activity[i].taggeeoutpoint;
        newstring[d].taggeeimagelink = "https://alpha.1satordinals.com/outpoint/" + activity[i].taggeeoutpoint + "/inscription";
        newstring[d].txid = activity[i].txid;
        newstring[d].txidlink = "https://whatsonchain.com/tx/" + activity[i].txid;
        newstring[d].insclink = "https://alpha.1satordinals.com/outpoint/" + activity[i].txid + "_0/inscription";
        newstring[d].time = date;
        d++;
    }

    //get tagger data by owner
    let temptaggers: TopTaggersByOwner[] = [];
    //console.log(ccc.length + " = ccc length")
    for (let i = 0; i < activity.length; i++) {
      if (activity[i].taggerowneraddress) {
      //  console.log(ccc[i].origin.data.map.taggerowner)
        let temp = {
          owneraddress: "string",
          numtags: 0
        }
        if (temptaggers.length === 0) {
          temp.owneraddress = activity[i].taggerowneraddress;
          temp.numtags = 1;
          temptaggers.push(temp)
        //  console.log(temptaggers)
        } else {
        //  console.log(temptaggers.length)
          let found = 0;
          for (let h = 0; h < temptaggers.length; h++) {

            if (temptaggers[h].owneraddress === activity[i].taggerowneraddress) {

              temptaggers[h].numtags++;
              //console.log(temptaggers[h])
              found = 1;
            }
          }
          if (found === 0) {
            temp.owneraddress = activity[i].taggerowneraddress;
            temp.numtags = 1;
            temptaggers.push(temp)
            //console.log(temptaggers)
          }
        }
      }
    }
    setOwnerResults(temptaggers.length)

    // //get tagger data by fox
    let tempfoxtaggers: TopTaggersByFox[] = [];
    let foxtaggers: string[] = [];

    //console.log(ccc.length + " = ccc length")
    for (let i = 0; i < activity.length; i++) {
      if (activity[i].taggeroutpoint) {
       // console.log(ccc[i].origin.data.map.taggeroriginoutpoint)
        let temp = {
          taggeroriginoutpoint: "string",
          foxname: "string",
          numtags: 0,
          taggeralive: true
        }
        if (tempfoxtaggers.length === 0) {
          temp.taggeroriginoutpoint = activity[i].taggeroutpoint;
          temp.foxname = activity[i].taggerfoxname;
          temp.numtags = 1;
          if (taggeeoutpoints.includes(activity[i].taggeroutpoint)) {
            temp.taggeralive = false;
          }
          tempfoxtaggers.push(temp)
         // console.log(tempfoxtaggers)
        } else {
         // console.log(tempfoxtaggers.length)
          let found = 0;
          for (let h = 0; h < tempfoxtaggers.length; h++) {

            if (tempfoxtaggers[h].taggeroriginoutpoint === activity[i].taggeroutpoint) {
              tempfoxtaggers[h].numtags++;
             // console.log(temptaggers[h])
              found = 1;
            }
          }
          if (found === 0) {
            temp.taggeroriginoutpoint = activity[i].taggeroutpoint;
            temp.foxname = activity[i].taggerfoxname;
            temp.numtags = 1;
            if (taggeeoutpoints.includes(activity[i].taggeroutpoint)) {
              temp.taggeralive = false;
            }
            tempfoxtaggers.push(temp)
           // console.log(tempfoxtaggers)
          }
        }
      }
    }
    setTopFoxCount(tempfoxtaggers.length)

    //latest activity
    setLatestActivityDisplay(firstactivity)

    //no sort for tagged foxes
    setTaggedFoxes(newstring)

    //sort top taggers by owner
    let topTaggers = _.sortBy(temptaggers, 'numtags').reverse();
    setTopTaggersByOwner(topTaggers)

    // sort top taggers by fox
    let sortedTaggers = _.sortBy(tempfoxtaggers, 'numtags').reverse();
    setTopTaggersByFox(sortedTaggers)
  }, [activity]);


  //show more top foxes
  useEffect(() => {
    if (!didMount2.current) {
      didMount2.current = true;
      return;
    }
    let temp: TopTaggersByFox[] = [];
    //console.log(ccc.length + " = ccc length")
    for (let i = topfoxresults-10; i < topfoxresults; i++) {

      if (toptaggersbyfox[i]) {
          temp.push(toptaggersbyfox[i])
      }else{
        setDisplayMoreTopFoxes(false)
      }
    }
    setTopFoxResults(topfoxresults + 10)
    addTopFoxElement(temp)
}, [toptaggersbyfox]);

const addTopFoxElement = (newElement: TopTaggersByFox[]) => {
  let c = [...toptaggersbyfoxtodisplay, ...newElement];
  setTopTaggersByFoxToDisplay(c);
};

const showMoreTopFoxes = () => {

  let temp: TopTaggersByFox[] = [];
  //console.log(ccc.length + " = ccc length")
  for (let i = topfoxresults-10; i < topfoxresults; i++) {

    if (toptaggersbyfox[i]) {
        temp.push(toptaggersbyfox[i])
    }else{
      setDisplayMoreTopFoxes(false)
    }
  }
  setTopFoxResults(topfoxresults + 10)
  addTopFoxElement(temp)
};


  //show more tagged foxes
  useEffect(() => {
    if (!didMount3.current) {
      didMount3.current = true;
      return;
    }
    let temp: TaggedArray[] = [];
    //console.log(ccc.length + " = ccc length")
    for (let i = taggedfoxresults-10; i < taggedfoxresults; i++) {

      if (taggedfoxes[i]) {
          temp.push(taggedfoxes[i])
      }else{
        setDisplayMoreTaggedFoxes(false)
      }
    }
    setTopFoxResults(topfoxresults + 10)
    addTaggedFoxElement(temp)
}, [taggedfoxes]);

const addTaggedFoxElement = (newElement: TaggedArray[]) => {
  let c = [...taggedfoxestodisplay, ...newElement];
  setTaggedFoxesToDisplay(c);
};

const showMoreTaggedFoxes = () => {
  let temp: TaggedArray[] = [];
  //console.log(ccc.length + " = ccc length")
  for (let i = taggedfoxresults-10; i < taggedfoxresults; i++) {

    if (taggedfoxes[i]) {
        temp.push(taggedfoxes[i])
    }else{
      setDisplayMoreTaggedFoxes(false)
    }
  }
  setTaggedFoxResults(taggedfoxresults + 10)
  addTaggedFoxElement(temp)
};


  //show more top owners
  useEffect(() => {
    if (!didMount4.current) {
      didMount4.current = true;
      return;
    }
    let temp: TopTaggersByOwner[] = [];
    //console.log(ccc.length + " = ccc length")
    for (let i = topownersresults-10; i < topownersresults; i++) {

      if (toptaggersbyowner[i]) {
          temp.push(toptaggersbyowner[i])
      }else{
        setDisplayMoreTopOwners(false)
      }
    }
    setTopOwnersResults(topownersresults + 10)
    addTopTaggersByOwnerElement(temp)
}, [toptaggersbyowner]);

const addTopTaggersByOwnerElement = (newElement: TopTaggersByOwner[]) => {
  let c = [...toptaggersbyownertodisplay, ...newElement];
  setTopTaggersByOwnerToDisplay(c);
};

const showMoreTopOwners = () => {
  let temp: TopTaggersByOwner[] = [];
  //console.log(ccc.length + " = ccc length")
  for (let i = topownersresults-10; i < topownersresults; i++) {

    if (toptaggersbyowner[i]) {
        temp.push(toptaggersbyowner[i])
    }else{
      setDisplayMoreTopOwners(false)
    }
  }
  setTopOwnersResults(topownersresults + 10)
  addTopTaggersByOwnerElement(temp)
};



  //add latest activity
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    let temp = latestactivitydisplay;
    // console.log(temp)
    temp.push(latestactivity)
    // console.log(latestactivity)
    // let latest = latestactivity;
    // let n = Number(latest.time);
    //console.log(n)
    // let date = new Date(n).toLocaleString();
    // console.log(latestactivity.time)
    let late = _.sortBy(temp, 'time').reverse();
    // latest.time = date;
    // temp.push(latest)
    // setLatestActivityDisplay(latestactivitydisplay => [...latestactivitydisplay, temp]);
    setLatestActivityDisplay(late)
    // addActivityElement(temp)
  }, [latestactivity]);


  return (

    <>
    <br />
      <h3>Latest Activity: {taggedfoxcount}</h3>
      <div id="Activity">



        {!latestactivitydisplay &&
          <>
            <span className="Required">
              <ThreeCircles color="white" height="50"
                width="50" />
            </span>
          </>
        }

        
        {latestactivitydisplay &&

          <>
            <ol key={uuidv4()} className="activity-ol">
              {latestactivitydisplay.map(function (data) {

                let txidlink = "https://whatsonchain.com/tx/" + data.txid;
                let inscriptionlink = "https://alpha.1satordinals.com/outpoint/" + data.txid + "_0/inscription";
                let n = Number(data.time);
                //console.log(n)
                let date = new Date(n).toLocaleString();
                  return (
                      <li key={uuidv4()}>
                          <a target="blank"
                            href={data.taggerimagelink}>
                            <img className="ActivityIt" src={data.taggerimage}
                              id={data.taggeroutpoint} />
                          </a>
                          <a target="blank"
                            href={data.taggeeimagelink}>
                            <img className="ActivityNotIt" src={data.taggeeimage}
                              id={data.taggeeoutpoint} />
                          </a>
                          <br />
                          <a className="Tagger" target="blank"
                            href={data.taggerimagelink}>{data.taggerfoxname}</a><br /><a className="Taggee" target="blank"
                              href={data.taggeeimagelink}>{data.taggeefoxname}</a><br />
                            {date}<br />
                            <a className="ActivityLink" target="blank" href={txidlink}><u>Transaction</u></a><br />
                            <a className="ActivityLink" target="blank" href={inscriptionlink}><u>Inscription</u></a>
                      </li>
                  )
              })}
            </ol>
          </>
        }

{displayshowmoreactivity && 
              
                <div id="ShowMore">
                  <ShowMoreActivityButton onClick={showMoreActivity} />
                </div>
             
            }
      </div>

      <div id="TopByFox">
      <br />
        <h3>Top Taggers By Fox: {topfoxcount}</h3>

        {!toptaggersbyfoxtodisplay &&
          
            <span className="Required">
              <ThreeCircles color="white" height="50"
                width="50" />
            </span>
          
        }
        {toptaggersbyfoxtodisplay &&
          
            <ol id="top-taggers-by-fox">
              {toptaggersbyfoxtodisplay.map(function (data) {
               // console.log("mapping top taggers by fox")
                let foximagelink = "https://ordfs.network/content/" + data.taggeroriginoutpoint;
                let foxinfolink = "https://alpha.1satordinals.com/outpoint/" + data.taggeroriginoutpoint + "/inscription";

                if (data.taggeralive === true) {
                  let alive = "Alive";
                  return (
                    
                      <li key={uuidv4()}>
                        <a target="blank"
                          href={foxinfolink}>
                          <img src={foximagelink}
                            className="NormalImage"
                            id={data.taggeroriginoutpoint} />
                        </a>
                        <br />
                        <span className="TwinName"><a className="Taggee" target="blank"
                          href={foxinfolink}>{data.foxname}</a><br /><br />

                          {data.numtags} Tags<br />
                          <span className="TaggedBlue">
                            <b>{alive}</b>
                          </span>

                        </span>
                      </li>
                    
                  )
                } else if (data.taggeralive === false) {
                  let alive = "Tagged";
                  return (
                    
                      
                        <li className="TaggedFoxHover" key={uuidv4()}>
                          <span className="TopTaggersTagged">
                          <a target="blank"
                            href={foxinfolink}>
                            <img src={foximagelink}
                              className="GrayscaleImage"
                              id={data.taggeroriginoutpoint} />
                          </a>
                          <br />
                          <span className="TwinName"><a target="blank"
                            href={foxinfolink}>{data.foxname}</a><br /><br />

                            {data.numtags} Tags<br />
                            <span className="TaggedGray">
                              <b>{alive}</b>
                            </span>

                          </span>
                          </span>
                        </li>
                    
                    
                  )
                }
              })}
            </ol>
          
        }
{displayshowmoretopfoxes && 
              <div id="ShowMoreTopFoxes">
                <br />
                <ShowMoreTopFoxesButton onClick={showMoreTopFoxes} />
              </div>
           
          }
      </div>

      <div id="TaggedFoxes">
      <br />
        <h3>Tagged Foxes: {taggedfoxcount}</h3>

        {!taggedfoxestodisplay &&
          <>
            <span className="Required">
              <ThreeCircles color="white" height="50"
                width="50" />
            </span>
          </>
        }
        {taggedfoxestodisplay &&
          <>

            <ul id="tagged-fox-container">

              {taggedfoxestodisplay.map(function (data) {
               // console.log("mapping")
                return (
                  <li key={uuidv4()}>
                    <a target="blank"
                      href={data.taggeeimagelink}>
                      <img src={data.taggeeimage}
                        className="seventraitfoxes"
                        id={data.taggeeoriginoutpoint} />
                    </a>
                    <br />
                    <span className="TwinName"><a target="blank"
                      href={data.taggeeimagelink}>{data.taggeefoxname}</a><br /><br />
                      <span className="TwinNameDate">{data.time}</span><br /><br />
                      <a target="blank" href={data.insclink}><u>Inscription</u></a><br />
                      <a target="blank" href={data.txidlink}><u>Transaction</u></a>

                    </span>
                  </li>
                )
              })}
            </ul>
          </>
        }
        {displayshowmoretaggedfoxes && 
              <div id="ShowMoreTopFoxes">
                <br />
                <ShowMoreTaggedFoxesButton onClick={showMoreTaggedFoxes} />
              </div>
           
          }
      </div>

      <div id="TopTaggers">
      <br />
        <h3>Top Taggers By Owner: {ownerresults}</h3>
        {!toptaggersbyownertodisplay &&
          <>
            <span className="Required">
              <ThreeCircles color="white" height="50"
                width="50" />
            </span>
          </>
        }
        {toptaggersbyownertodisplay &&
          <>
            <ol id="top-taggers-by-owner">
              {toptaggersbyownertodisplay.map(function (data) {
               // console.log("mapping top taggers")
                let link = "https://whatsonchain.com/address/" + data.owneraddress;
                return (
                  
                    <li key={uuidv4()}>
                      <a target="blank" href={link}><u>{data.owneraddress}</u></a><br /> Tags: {data.numtags} <br /><br />
                    </li>
                  
                )
              })}
            </ol>
          </>
        }
        {displayshowmoretopowners && 
              <div id="ShowMoreTopOwners">
                <br />
                <ShowMoreTopOwnersButton onClick={showMoreTopOwners} />
              </div>
           
          }
      </div>





    </>
  )

});

export default TaggedFoxes;