import { useState, useEffect, useRef } from "react";
import FoxSearchResults from "../components/FoxSearchResults";
import Charts from "./Charts";
import { PulseLoader } from 'react-spinners';


type FoxFiltersProps = {
  faucetvar:boolean,
  myvar:boolean,
  demovar:boolean,
  ordinalsstring?: string,
  myordinalsaddress: string,
  complete:boolean,
  setgettingfox:boolean,
  passedFunctionFoxLoadingScreen: (boolean) => void,
  handleConnect?: () => void,
  newOutpoints: string[],
  ownedOutpoints?: string[],
  allUtxos?: string,
  foxType?: 'lucky' | 'disappearing' | 'rolling' | 'falling' | 'bounty' | 'mobile-friendly'
}

const FoxFilters = ({ complete, setgettingfox, faucetvar, myvar, demovar, ordinalsstring = "[]", myordinalsaddress, passedFunctionFoxLoadingScreen, handleConnect, newOutpoints, ownedOutpoints, allUtxos, foxType = 'rolling' }: FoxFiltersProps) => {
  //loading for foxes
  const [loading, setLoading] = useState<boolean>(true);
  const [resetloading, setResetLoading] = useState<boolean>(false);
  const [setsearchloading, setSearchLoading] = useState<boolean>(false);

  //search filters
  const [background, setBackground] = useState<string>("all");
  const [name, setName] = useState<string>("all");
  const [body, setBody] = useState<string>("all");
  const [mouth, setMouth] = useState<string>("all");
  const [head, setHead] = useState<string>("all");
  const [eyes, setEyes] = useState<string>("all");
  const [item, setItem] = useState<string>("all");

  //search fields
  const [bgcheckboxes, setBgCheckboxes] = useState<string[] | undefined>();
  const [namecheckboxes, setNameCheckboxes] = useState<string[] | undefined>();
  const [bodycheckboxes, setBodyCheckboxes] = useState<string[] | undefined>();
  const [mouthcheckboxes, setMouthCheckboxes] = useState<string[] | undefined>();
  const [headcheckboxes, setHeadCheckboxes] = useState<string[] | undefined>();
  const [eyescheckboxes, setEyesCheckboxes] = useState<string[] | undefined>();
  const [itemcheckboxes, setItemCheckboxes] = useState<string[] | undefined>();

  //etc
  const [handlechangeall, setHandleChangeAll] = useState<boolean>(false);
  const [filteredordinals, setFilteredOrdinals] = useState<string>("");
  const [foxesonly, setFoxesOnly] = useState<string>("");
  const [totalresults, setTotalResults] = useState<number>(0);

  //passed loader filters to search results
    //pass loading function to child
    const passedFunctionFromFilters = () => {
      setResetLoading(false);
    }
    const endLoading = () => {
      setResetLoading(false);
    }
    
    const setSearchLoadingDone = () => {
      setSearchLoading(false);
    }

    //useRefs
    const didMount = useRef(false);
    const didMount1 = useRef(false);
    const didMount2 = useRef(false);
    const didMount3 = useRef(false);
    const didMount4 = useRef(false);
    const didMount5 = useRef(false);
    const didMount6 = useRef(false);   
    const didMount7 = useRef(false);   

  useEffect(
    () => {
      //options arrays
      const bgOptions: string[] = [];
      const nameOptions: string[] = [];
      const bodyOptions: string[] = [];
      const mouthOptions: string[] = [];
      const headOptions: string[] = [];
      const eyesOptions: string[] = [];
      const itemOptions: string[] = [];

      let tempstring;
      if (!ordinalsstring || ordinalsstring === 'undefined') {
        setLoading(false);
        return;
      }
      tempstring = JSON.parse(ordinalsstring);
      let foxlength = tempstring.length;
      //push to new array instead of splicing
      let newstring = [];


      //purge non foxes, also make sure all traits exist, need indexer, need to query 1sat-server for foxes only
      // and look into optional chaining...why tempstring[i]? below and not the others?
      for (let i = 0; i < foxlength; i++) {     
        if(tempstring[i].origin?.data?.map?.subTypeData?.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0"){
           newstring.push(tempstring[i])
        }else if (tempstring[i].data?.inscription?.file?.hash){
          //console.log(tempstring[i].data?.inscription?.file?.hash + " = has a group")
        }
      }
      foxlength = newstring.length;
      setTotalResults(newstring.length);

      //set ordinals after purging non foxes by collection id
        for (let i = 0; i < foxlength; i++) {     
        if (newstring[i].origin?.data?.map?.subTypeData?.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0") {
          if (bgOptions.includes(newstring[i].origin.data.map.subTypeData.traits[0].value)) {
            //do nothing
          } else {
            bgOptions.push(newstring[i].origin.data.map.subTypeData.traits[0].value);
          }
        }
      }
      //background options
      for (let i = 0; i < foxlength; i++) {     
        if (newstring[i].origin?.data?.map?.subTypeData?.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0") {
          if (bgOptions.includes(newstring[i].origin.data.map.subTypeData.traits[0].value)) {
            //do nothing
          } else {
            bgOptions.push(newstring[i].origin.data.map.subTypeData.traits[0].value);
          }
        }
      }
      //fox name options
      for (let i = 0; i < foxlength; i++) {
        if (newstring[i].origin?.data?.map?.subTypeData?.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0") {
          if (nameOptions.includes(newstring[i].origin.data.map.subTypeData.traits[1].value)) {
            //do nothing
          } else {
            nameOptions.push(newstring[i].origin.data.map.subTypeData.traits[1].value);
          }
        }
      }
      //body options
      for (let i = 0; i < foxlength; i++) {
        if (newstring[i].origin?.data?.map?.subTypeData?.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0") {
          if (bodyOptions.includes(newstring[i].origin.data.map.subTypeData.traits[2].value)) {
            //do nothing
          } else {
            bodyOptions.push(newstring[i].origin.data.map.subTypeData.traits[2].value);
          }
        }
      }
      //mouthOptions options
      for (let i = 0; i < foxlength; i++) {
        if (newstring[i].origin?.data?.map?.subTypeData?.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0") {
          if (mouthOptions.includes(newstring[i].origin.data.map.subTypeData.traits[3].value)) {
            //do nothing
          } else {
            mouthOptions.push(newstring[i].origin.data.map.subTypeData.traits[3].value);
          }
        }
      }
      //headOptions options
      for (let i = 0; i < foxlength; i++) {
        if (newstring[i].origin?.data?.map?.subTypeData?.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0") {
          if (headOptions.includes(newstring[i].origin.data.map.subTypeData.traits[4].value)) {
            //do nothing
          } else {
            headOptions.push(newstring[i].origin.data.map.subTypeData.traits[4].value);
          }
        }
      }
      //eyesOptions options
      for (let i = 0; i < foxlength; i++) {
        if (newstring[i].origin?.data?.map?.subTypeData?.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0") {
          if (eyesOptions.includes(newstring[i].origin.data.map.subTypeData.traits[5].value)) {
            //do nothing
          } else {
            eyesOptions.push(newstring[i].origin.data.map.subTypeData.traits[5].value);
          }
        }
      }
      //itemOptions options
      for (let i = 0; i < foxlength; i++) {
        if (newstring[i].origin?.data?.map?.subTypeData?.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0") {
          if (itemOptions.includes(newstring[i].origin.data.map.subTypeData.traits[6].value)) {
            //do nothing
          } else {
            itemOptions.push(newstring[i].origin.data.map.subTypeData.traits[6].value);
          }
        }
      }
      setBgCheckboxes(bgOptions)
      setNameCheckboxes(nameOptions)
      setBodyCheckboxes(bodyOptions)
      setMouthCheckboxes(mouthOptions)
      setHeadCheckboxes(headOptions)
      setEyesCheckboxes(eyesOptions)
      setItemCheckboxes(itemOptions)

      
      setLoading(false)
      setFoxesOnly(JSON.stringify(newstring));
    },
    [] // with dependency: run every time variable changes
  )

  //fox sorting useEffects
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    if (handlechangeall === true) {
      return
    } else {
      handleChange();
    }
  }, [background])

  useEffect(() => {
    if (!didMount1.current) {
      didMount1.current = true;
      return;
    }
    if (handlechangeall === true) {
      return
    } else {
      handleChange();
    }
  }, [name])

  useEffect(() => {
    if (!didMount2.current) {
      didMount2.current = true;
      return;
    }
    if (handlechangeall === true) {
      return
    } else {
      handleChange();
    }
  }, [body])

  useEffect(() => {
    if (!didMount3.current) {
      didMount3.current = true;
      return;
    }
    if (handlechangeall === true) {
      return
    } else {
      handleChange();
    }
  }, [mouth])

  useEffect(() => {
    if (!didMount4.current) {
      didMount4.current = true;
      return;
    }
    if (handlechangeall === true) {
      return
    } else {
      handleChange();
    }
  }, [head])

  useEffect(() => {
    if (!didMount5.current) {
      didMount5.current = true;
      return;
    }
    if (handlechangeall === true) {
      return
    } else {
      handleChange();
    }
  }, [eyes])

  useEffect(() => {
    if (!didMount6.current) {
      didMount6.current = true;
      return;
    }
    if (handlechangeall === true) {
      return
    } else {
      handleChange();
    }
  }, [item])

  useEffect(() => {
    if (!didMount7.current) {
      didMount7.current = true;
      return;
    }
      handleChange();
  }, [foxesonly])

  useEffect(() => {
    if (newOutpoints.length > 0) {
      //console.log('New outpoints in LuckyFaucetFilters:', newOutpoints);
    }
  }, [newOutpoints]);

  //handlechange
  const handleChange = async () => {
    //clear foxes
    //not needed

    //get json data
    let jjj = JSON.parse(foxesonly);
    //sort foxes
    let temmp = "kjddj";
    var nietos = [];
    let nnn = jjj.length;

    //2.0 search
    for (let i = 0; i < nnn; i++) {
      //get fox json vars
      let mybg = jjj[i].origin?.data?.map?.subTypeData?.traits[0].value;
      let myfox = jjj[i].origin?.data?.map?.subTypeData?.traits[1].value;
      let mybody = jjj[i].origin?.data?.map?.subTypeData?.traits[2].value;
      let mymouth = jjj[i].origin?.data?.map?.subTypeData?.traits[3].value;
      let myhead = jjj[i].origin?.data?.map?.subTypeData?.traits[4].value;
      let myeyes = jjj[i].origin?.data?.map?.subTypeData?.traits[5].value;
      let myitem = jjj[i].origin?.data?.map?.subTypeData?.traits[6].value;

      //push if we have a match
      if (((background === mybg) || (background === "all"))
        && ((name === myfox) || (name === "all"))
        && ((body === mybody) || (body === "all"))
        && ((mouth === mymouth) || (mouth === "all"))
        && ((head === myhead) || (head === "all"))
        && ((eyes === myeyes) || (eyes === "all"))
        && ((item === myitem) || (item === "all"))) {
        nietos.push(jjj[i]);
      }
    }
    temmp = JSON.stringify(nietos);

    //set ordinals search results variable
    setFilteredOrdinals(temmp);
  };


  //initial fox display when ordinals state changes
  const clearFilters = async () => {
    setResetLoading(true);
    setSearchLoading(true);
    setHandleChangeAll(true);

    var DropdownList = (document.getElementById("bgReset")) as HTMLSelectElement;
    DropdownList.selectedIndex = 0; // no error
    setBackground("all");

    var DropdownList = (document.getElementById("nameReset")) as HTMLSelectElement;
    DropdownList.selectedIndex = 0; // no error
    setName("all");

    var DropdownList = (document.getElementById("bodyReset")) as HTMLSelectElement;
    DropdownList.selectedIndex = 0; // no error
    setBody("all");

    var DropdownList = (document.getElementById("mouthReset")) as HTMLSelectElement;
    DropdownList.selectedIndex = 0; // no error
    setMouth("all");

    var DropdownList = (document.getElementById("headReset")) as HTMLSelectElement;
    DropdownList.selectedIndex = 0; // no error
    setHead("all");

    var DropdownList = (document.getElementById("eyesReset")) as HTMLSelectElement;
    DropdownList.selectedIndex = 0; // no error
    setEyes("all");

    var DropdownList = (document.getElementById("itemReset")) as HTMLSelectElement;
    DropdownList.selectedIndex = 0; // no error
    setItem("all");

    setHandleChangeAll(false);
    setTimeout(() => {
      endLoading();
      setSearchLoadingDone();
    }, 2000);
  
  };


  return (
    <>
        {!setgettingfox && (
          <>
      <div id="Filters">
        <h3>Filters</h3>
        <div className="CenterLoader">
        {loading && (
          <>
              <PulseLoader color="#ffffff" />
          </>
        )}
        </div>
        {!loading && (
          <>
            <ul className="FilterList">
              <li>
                {bgcheckboxes &&
                  <>
                    <label className="Label">Background</label>
                    <select className="classic" id="bgReset" onChange={(e) => {
                      const value = e.target.value;
                      setBackground(value);
                    }}>
                      <option key="all" value="all">All</option>
                      {bgcheckboxes.map(function (data) {
                        return (
                          <option key={data} value={data}>{data}</option>
                        )
                      })}
                    </select><br />
                  </>
                }
              </li><li>
                {namecheckboxes &&
                  <><label className="Label">Fox</label>
                    <select id="nameReset" onChange={(e) => {
                      const value = e.target.value;
                      setName(value);
                    }}>
                      <option key="all" value="all">All</option>
                      {namecheckboxes.map(function (data) {
                        return (
                          <option key={data} value={data}>{data}</option>
                        )
                      })}
                    </select><br />
                  </>
                }
              </li><li>
                {bodycheckboxes &&
                  <><label className="Label">Body</label>
                    <select id="bodyReset" onChange={(e) => {
                      const value = e.target.value;
                      setBody(value);
                    }}>
                      <option key="all" value="all">All</option>
                      {bodycheckboxes.map(function (data) {
                        return (
                          <option key={data} value={data}>{data}</option>
                        )
                      })}
                    </select><br />
                  </>
                }
              </li><li>
                {mouthcheckboxes &&
                  <><label className="Label">Mouth</label>
                    <select id="mouthReset" onChange={(e) => {
                      const value = e.target.value;
                      setMouth(value);
                    }}>
                      <option key="all" value="all">All</option>
                      {mouthcheckboxes.map(function (data) {
                        return (
                          <option key={data} value={data}>{data}</option>
                        )
                      })}
                    </select><br />
                  </>
                }
              </li><li>
                {headcheckboxes &&
                  <><label className="Label">Head</label>
                    <select id="headReset" onChange={(e) => {
                      const value = e.target.value;
                      setHead(value);
                    }}>
                      <option key="all" value="all">All</option>
                      {headcheckboxes.map(function (data) {
                        return (
                          <option key={data} value={data}>{data}</option>
                        )
                      })}
                    </select><br />
                  </>
                }
              </li><li>
                {eyescheckboxes &&
                  <><label className="Label">Eyes</label>
                    <select id="eyesReset" onChange={(e) => {
                      const value = e.target.value;
                      setEyes(value);
                    }}>
                      <option key="all" value="all">All</option>
                      {eyescheckboxes.map(function (data) {
                        return (
                          <option key={data} value={data}>{data}</option>
                        )
                      })}
                    </select><br />
                  </>
                }
              </li><li>
                {itemcheckboxes &&
                  <><label className="Label">Item</label>
                    <select id="itemReset" onChange={(e) => {
                      const value = e.target.value;
                      setItem(value);
                    }}>
                      <option key="all" value="all">All</option>
                      {itemcheckboxes.map(function (data) {
                        return (
                          <option key={data} value={data}>{data}</option>
                        )
                      })}
                    </select><br />
                  </>
                }

              </li>
            </ul>
            
            <a className="Clear" onClick={clearFilters}><u>Reset Filters</u></a>
            {resetloading && (
          <>
              <div className="ResetLoader">
              <PulseLoader color="#ffffff" />
              </div>
          </>
        )}
           
          </>
        )}
      </div>
      <div>
      <Charts todisplay={filteredordinals}/>

      </div>

  

      </>
        )}
      <div>
      {/* <RichList ordinalsstring={ordinalsstring}/> */}
      {myvar && (
          <>

          </>
        )}
              {faucetvar && (
          <>
                    <FoxSearchResults 
                      foxesonly={foxesonly} 
                      ordinalsstring={ordinalsstring} 
                      myordinalsaddress={myordinalsaddress} 
                      faucetvar={faucetvar} 
                      myvar={myvar} 
                      demovar={demovar}
                      handleConnect={handleConnect}
                      newOutpoints={newOutpoints}
                      ownedOutpoints={ownedOutpoints}
                      todisplay={filteredordinals}
                      background={background}
                      name={name}
                      body={body}
                      mouth={mouth}
                      head={head}
                      eyes={eyes}
                      item={item}
                      complete={complete}
                      totalresults={totalresults}
                      setsearchloading={setsearchloading}
                      passedFunctionFromFilters={passedFunctionFromFilters}
                      passedFunctionFoxLoadingScreen={passedFunctionFoxLoadingScreen}
                      clearFilters={clearFilters}
                      allUtxos={allUtxos}
                      foxType={foxType}
                    />
          </>
        )}
                      {/* {demovar && (
          <>
                    <DemoSearchResults
        myordinalsaddress={myordinalsaddress}
        todisplay={filteredordinals}
        background={background}
        name={name}
        body={body}
        mouth={mouth}
        head={head}
        eyes={eyes}
        item={item}
        totalresults={totalresults}
        faucetvar={faucetvar}
        clearFilters={clearFilters}
        passedFunctionFromFilters={passedFunctionFromFilters}
        setsearchloading={setsearchloading}
      />
          </>
        )} */}
      </div>

      </>
  )
};

export default FoxFilters;