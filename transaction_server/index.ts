import express from "express";
import { createOrdinals, sendOrdinals, oneSatBroadcaster } from "js-1sat-ord";
import type { CreateOrdinalsConfig, SendOrdinalsConfig, Utxo, LocalSigner, PreMAP, CollectionItemSubTypeData } from "js-1sat-ord";
import helmet from 'helmet';
import { PrivateKey } from "@bsv/sdk";
import { config } from "dotenv";
import cors from 'cors';
import bodyParser from 'body-parser';
import { env } from 'process';
import * as fs from 'fs';
import * as path from 'path';
config();


//get mobile friendly foxes utxos
const MOBILE_FRIENDLY_FOXES_UTXOS = (() => {
    try {
        const goldGrillsPath = path.join(__dirname, '500MobileFriendlyFoxes.json');
        const fileContents = fs.readFileSync(goldGrillsPath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error('Error loading Lucky Foxes UTXOs:', error);
        return [];
    }
})();


// Load payment UTXOs for mobile friendly foxes
const MOBILE_FRIENDLY_FOXES_PAYMENT_UTXOS = (() => {
    try {
        const paymentUtxosPath = path.join(__dirname, '500MobileFriendlyFoxesPaymentUtxosWithScripts.json');
        const fileContents = fs.readFileSync(paymentUtxosPath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error('Error loading Disappearing Foxes Payment UTXOs:', error);
        return [];
    }
})();

//get bounty foxes utxos
const BOUNTY_FOXES_UTXOS = (() => {
    try {
        const goldGrillsPath = path.join(__dirname, '500BountyFoxes.json');
        const fileContents = fs.readFileSync(goldGrillsPath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error('Error loading Lucky Foxes UTXOs:', error);
        return [];
    }
})();

// Load payment UTXOs for bounty foxes
const BOUNTY_FOXES_PAYMENT_UTXOS = (() => {
    try {
        const paymentUtxosPath = path.join(__dirname, '500BountyFoxesPaymentUtxosWithScripts.json');
        const fileContents = fs.readFileSync(paymentUtxosPath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error('Error loading Disappearing Foxes Payment UTXOs:', error);
        return [];
    }
})();

// Load all 1000 tag game inscription utxos for Epoch 1
const ALL_TAG_PAYMENT_UTXOS = (() => {
    try {
        const paymentUtxosPath = path.join(__dirname, '1000TagPaymentUtxosWithScripts.json');
        const fileContents = fs.readFileSync(paymentUtxosPath, 'utf8');
        const utxos = JSON.parse(fileContents);        return utxos;
    } catch (error) {
        console.error('Error loading all tag epoch 1 payment UTXOs:', error);
        return [];
    }
})();

// Load all 500 space rock payment utxos
const SPACE_ROCK_PAYMENT_UTXOS = (() => {
    try {
        const paymentUtxosPath = path.join(__dirname, '500SpaceRockPaymentUtxosWithScripts.json');
        const fileContents = fs.readFileSync(paymentUtxosPath, 'utf8');
        const utxos = JSON.parse(fileContents);        return utxos;
    } catch (error) {
        console.error('Error loading space rock payment UTXOs:', error);
        return [];
    }
})();


const app = express();

// Basic middleware first
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = env.PORT || 9000;

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:5000'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: true
};

app.use(cors(corsOptions));

// Security middleware last
app.use(helmet());




//get scripts for sending inscriptions
async function getScript(outpoint: string) {
    const response: any = await fetch("https://ordinals.gorillapool.io/api/txos/" + outpoint + "?script=true");
    const script = await response.json();
    return script.script;
}

// Get Bounty Foxes   
app.post("/getbountyfoxes", async (req, res) => {
    //received info, and outpoints to dest address
    console.log("Received request body:", req.body);
    let ordDestAddress = req.body.address;
    let outpoints = req.body.outpoints;
    console.log("Looking for outpoints:", outpoints);
    console.log("Address:", ordDestAddress);

    //make sure max 10 outpoints per tx
    if (outpoints.length > 10) {
        console.log(`Too many outpoints requested: ${outpoints.length}, maximum is 10`);
        res.send(JSON.stringify({
            error: "too_many_outpoints",
            message: "Maximum 10 outpoints per transaction allowed",
            outpoints: req.body.outpoints
        }));
        return;
    }

    // Get the first outpoint from the frontend array
    const firstOutpoint = outpoints[0];
    console.log("First outpoint from frontend:", firstOutpoint);

    // Find the position of the first outpoint in BOUNTY_FOXES_UTXOS (500BountyFoxes.json)
    const firstOutpointPosition = BOUNTY_FOXES_UTXOS.findIndex((fox: any) => fox.outpoint === firstOutpoint);

    if (firstOutpointPosition === -1) {
        console.error(`First outpoint ${firstOutpoint} not found in BOUNTY_FOXES_UTXOS`);
        res.send(JSON.stringify({
            error: "first_outpoint_not_found",
            message: "First outpoint not found in bounty foxes array",
            outpoints: req.body.outpoints
        }));
        return;
    }

    console.log(`First outpoint found at position ${firstOutpointPosition} in BOUNTY_FOXES_UTXOS`);

    // Get the payment UTXO at the same position
    let paymentUtxos = BOUNTY_FOXES_PAYMENT_UTXOS;

    // Check if we have the new file with scripts
    try {
        const fs = require('fs');
        const path = require('path');
        const newFilePath = path.join(__dirname, '500BountyFoxesPaymentUtxosWithScripts.json');
        if (fs.existsSync(newFilePath)) {
            const newFileContents = fs.readFileSync(newFilePath, 'utf8');
            const newPaymentUtxos = JSON.parse(newFileContents);
            if (newPaymentUtxos.length > firstOutpointPosition) {
                paymentUtxos = newPaymentUtxos;
                console.log(`Using new bounty foxes payment UTXOs file with scripts (${paymentUtxos.length} UTXOs)`);
            }
        }
    } catch (error) {
        console.log(`Could not load new bounty foxes payment UTXOs file, using fallback: ${error}`);
    }

    if (paymentUtxos.length < firstOutpointPosition + 1) {
        console.error(`Not enough bounty foxes payment UTXOs available. Need position ${firstOutpointPosition + 1}, but only have ${paymentUtxos.length}`);
        res.send(JSON.stringify({
            error: "not_enough_payment_utxos",
            message: "Not enough payment UTXOs available",
            outpoints: req.body.outpoints
        }));
        return;
    }

    const paymentUtxo = paymentUtxos[firstOutpointPosition];

    if (!paymentUtxo) {
        console.error(`No bounty foxes payment UTXO found at position ${firstOutpointPosition}`);
        res.send(JSON.stringify({
            error: "payment_utxo_not_found",
            message: "Payment UTXO not found for this position",
            outpoints: req.body.outpoints
        }));
        return;
    }


    console.log("Using payment UTXO:", paymentUtxo);

    //setup
    const paymentWif = process.env.BOUNTY_PAYMENT_WIF as string;
    const paymentPk = PrivateKey.fromWif(paymentWif);

    const ordWif = process.env.LUCKY_ORD_WIF as string;
    const ordPk = PrivateKey.fromWif(ordWif);

    const signingWif = process.env.GROUP_SIGNING_WIF as string;
    const signingPk = PrivateKey.fromWif(signingWif);

    const changeAddress = "1NLuxzkA5KNvYSUW7J3sns4mzHPKV9bq9n";

    const sig: LocalSigner = {
        idKey: signingPk
    }

    // Use the payment UTXO we found instead of fetching all UTXOs
    const utxos = [paymentUtxo];
    console.log("Using payment UTXO for transaction:", utxos);

    //put ord utxos for outpoints array into array of ord utxos
    const ordinalarray: Utxo[] = []

    console.log(BOUNTY_FOXES_UTXOS.length)

    // Loop through each outpoint to create ordinal UTXOs
    for (let p = 0; p < outpoints.length; p++) {
        let utxoposition: number = -1;

        // Find the position of this outpoint in the LUCKY_FOXES_UTXOS array
        for (let i = 0; i < BOUNTY_FOXES_UTXOS.length; i++) {
            if (BOUNTY_FOXES_UTXOS[i].outpoint === outpoints[p]) {
                utxoposition = i;
                break; // Exit loop once found
            }
        }

        if (utxoposition === -1) {
            console.log(`Outpoint ${outpoints[p]} not found in BOUNTY_FOXES_UTXOS`);
            // Exit early if any outpoint is not found
            res.send(JSON.stringify({
                error: "foxes_already_taken",
                message: "Someone already got those foxes.",
                outpoints: req.body.outpoints
            }));
            return;
        }

        console.log(`Processing outpoint ${outpoints[p]} at position ${utxoposition}`);

        //fetch script for this specific outpoint
        const script1 = await getScript(BOUNTY_FOXES_UTXOS[utxoposition].outpoint)

        const ordAddress = "1FW75Wkv5zK6twHjuwGeEpGZ4AJPZEz4ED";

        // Create ordinal UTXO for this outpoint
        const ordinal: Utxo = {
            satoshis: BOUNTY_FOXES_UTXOS[utxoposition].satoshis,
            txid: BOUNTY_FOXES_UTXOS[utxoposition].txid,
            script: script1,
            vout: BOUNTY_FOXES_UTXOS[utxoposition].vout
        };

        console.log(`Created ordinal for outpoint ${outpoints[p]}:`, ordinal);
        ordinalarray.push(ordinal);
    }

    console.log(`Total ordinals created: ${ordinalarray.length}`);
    // console.log("Final ordinal array:", JSON.stringify(ordinalarray, null, 2));

    //adding metadata, add data for game?
    const metaData = {
        app: "foxplorer",
        name: "bounty foxes",
        type: "ord",
        time: Date.now(),
        outpoints: JSON.stringify(outpoints),
        address: ordDestAddress
    };

    //make sure max 10 outpoints per tx

    const configinscription: SendOrdinalsConfig = {
        paymentUtxos: utxos,
        ordinals: ordinalarray,
        paymentPk: paymentPk,
        ordPk: ordPk,
        destinations: ordinalarray.map(() => ({
            address: ordDestAddress,
            inscription: undefined
        })),
        changeAddress: changeAddress,
        metaData: metaData,
        signer: sig
    };

    //real send code
    try {
        const { tx } = await sendOrdinals(configinscription);
        console.log({ tx });
        const result = await tx.broadcast(oneSatBroadcaster());
        console.log(result);
        if (result) {
            const response = {
                status: "broadcast successful",
                txid: result.txid,
                message: "broadcast successful",
                outpoints: req.body.outpoints,
                address: ordDestAddress,
                bountyFoxes: outpoints.length,
                taggerRewarded: true
            };
            res.send(response);

        } else {
            res.send(JSON.stringify({
                error: "broadcast_failed",
                message: "Transaction broadcast failed",
                outpoints: req.body.outpoints
            }));
        }
    } catch (error) {
        console.error("Error in sendOrdinals:", error);
        res.send(JSON.stringify({
            error: "transaction_failed",
            message: error instanceof Error ? error.message : "Transaction failed",
            outpoints: req.body.outpoints
        }));
    }
    //end real send code
});

// Get friendly Faucet Fox - Mobile Friendly Foxes
app.post("/getfriendlyfaucetfox", async (req, res) => {
    try {
        console.log("Received request body:", req.body);
        let ordDestAddress = req.body.address;
        let outpoints = req.body.outpoints;
        console.log("Looking for outpoints:", outpoints);
        console.log("Address:", ordDestAddress);

        if (outpoints[0] === 'empty') {
            // Return error to trigger frontend's handleEmptyBucket
            res.status(400).send(JSON.stringify({
                error: "no_outpoints",
                message: "No outpoints found"
            }));
            return;
        }

        //make sure max 10 outpoints per tx
        if (outpoints.length > 1) {
            console.log(`Too many outpoints requested: ${outpoints.length}, maximum is 10`);
            res.send(JSON.stringify({
                error: "too_many_outpoints",
                message: "Maximum 10 outpoints per transaction allowed",
                outpoints: req.body.outpoints
            }));
            return;
        }

        // Get the first outpoint from the frontend array
        const firstOutpoint = outpoints[0];
        console.log("First outpoint from frontend:", firstOutpoint);

        // Find the position of the first outpoint in MOBILE_FRIENDLY_FOXES_UTXOS (500MobileFriendlyFoxes.json)
        const firstOutpointPosition = MOBILE_FRIENDLY_FOXES_UTXOS.findIndex((fox: any) => fox.outpoint === firstOutpoint);

        if (firstOutpointPosition === -1) {
            console.error(`First outpoint ${firstOutpoint} not found in MOBILE_FRIENDLY_FOXES_UTXOS`);
            res.send(JSON.stringify({
                error: "first_outpoint_not_found",
                message: "First outpoint not found in mobile friendly foxes array",
                outpoints: req.body.outpoints
            }));
            return;
        }

        console.log(`First outpoint found at position ${firstOutpointPosition} in MOBILE_FRIENDLY_FOXES_UTXOS`);

        // Get the payment UTXO at the same position
        const paymentUtxos = MOBILE_FRIENDLY_FOXES_PAYMENT_UTXOS;

        if (paymentUtxos.length < firstOutpointPosition + 1) {
            console.error(`Not enough mobile friendly foxes payment UTXOs available. Need position ${firstOutpointPosition + 1}, but only have ${paymentUtxos.length}`);
            res.send(JSON.stringify({
                error: "not_enough_payment_utxos",
                message: "Not enough payment UTXOs available",
                outpoints: req.body.outpoints
            }));
            return;
        }

        const paymentUtxo = paymentUtxos[firstOutpointPosition];

        if (!paymentUtxo) {
            console.error(`No mobile friendly foxes payment UTXO found at position ${firstOutpointPosition}`);
            res.send(JSON.stringify({
                error: "payment_utxo_not_found",
                message: "Payment UTXO not found for this position",
                outpoints: req.body.outpoints
            }));
            return;
        }

        console.log("Using payment UTXO:", paymentUtxo);

        //setup
        const paymentWif = process.env.MOBILE_FRIENDLY_PAYMENT_WIF as string;
        const paymentPk = PrivateKey.fromWif(paymentWif);

        const ordWif = process.env.LUCKY_ORD_WIF as string;
        const ordPk = PrivateKey.fromWif(ordWif);

        const signingWif = process.env.GROUP_SIGNING_WIF as string;
        const signingPk = PrivateKey.fromWif(signingWif);

        const changeAddress = "1NLuxzkA5KNvYSUW7J3sns4mzHPKV9bq9n";

        const sig: LocalSigner = {
            idKey: signingPk
        }

        // Use the payment UTXO we found instead of fetching all UTXOs
        const utxos = paymentUtxo;
        console.log("Using payment UTXO for transaction:", utxos);
        
        // Debug: Fetch the actual script from the blockchain and compare
        try {
            const actualScript = await getScript(`${paymentUtxo.txid}_${paymentUtxo.vout}`);
            console.log("=== SCRIPT COMPARISON ===");
            console.log("Script from file:", paymentUtxo.script);
            console.log("Script from blockchain:", actualScript);
            console.log("Scripts match:", paymentUtxo.script === actualScript);
            console.log("=== END SCRIPT COMPARISON ===");
        } catch (error) {
            console.error("Error fetching script for comparison:", error);
        }

        // Create ordinal UTXO for the single outpoint
        const ordinalarray: Utxo[] = []

        console.log(MOBILE_FRIENDLY_FOXES_UTXOS.length)

        // Since mobile friendly foxes are individual outpoints, we only have one
        const outpoint = outpoints[0];
        let utxoposition: number = -1;

        // Find the position of this outpoint in the MOBILE_FRIENDLY_FOXES_UTXOS array
        for (let i = 0; i < MOBILE_FRIENDLY_FOXES_UTXOS.length; i++) {
            if (MOBILE_FRIENDLY_FOXES_UTXOS[i].outpoint === outpoint) {
                utxoposition = i;
                break; // Exit loop once found
            }
        }

        if (utxoposition === -1) {
            console.log(`Outpoint ${outpoint} not found in MOBILE_FRIENDLY_FOXES_UTXOS`);
            res.send(JSON.stringify({
                error: "foxes_already_taken",
                message: "Someone already got those foxes.",
                outpoints: req.body.outpoints
            }));
            return;
        }

        console.log(`Processing outpoint ${outpoint} at position ${utxoposition}`);

        //fetch script for this specific outpoint
        const script1 = await getScript(MOBILE_FRIENDLY_FOXES_UTXOS[utxoposition].outpoint)

        const ordAddress = "1FW75Wkv5zK6twHjuwGeEpGZ4AJPZEz4ED";

        // Create ordinal UTXO for this outpoint
        const ordinal: Utxo = {
            satoshis: MOBILE_FRIENDLY_FOXES_UTXOS[utxoposition].satoshis,
            txid: MOBILE_FRIENDLY_FOXES_UTXOS[utxoposition].txid,
            script: script1,
            vout: MOBILE_FRIENDLY_FOXES_UTXOS[utxoposition].vout
        };

        console.log(`Created ordinal for outpoint ${outpoint}:`, ordinal);
        ordinalarray.push(ordinal);

        console.log(`Total ordinals created: ${ordinalarray.length}`);

        //adding metadata, add data for game?
        const metaData = {
            app: "foxplorer",
            name: "mobile friendly foxes",
            type: "ord",
            time: Date.now(),
            outpoints: JSON.stringify(outpoints),
            address: ordDestAddress
        };

        const configinscription: SendOrdinalsConfig = {
            paymentUtxos: [utxos] as Utxo[],
            ordinals: ordinalarray,
            paymentPk: paymentPk,
            ordPk: ordPk,
            destinations: ordinalarray.map(() => ({
                address: ordDestAddress,
                inscription: undefined
            })),
            changeAddress: changeAddress,
            metaData: metaData,
            signer: sig
        };

        //real send code
        try {
            const { tx } = await sendOrdinals(configinscription);
            console.log({ tx });
            const result = await tx.broadcast(oneSatBroadcaster());
            console.log(result);
            if (result) {
                const response = {
                    status: "broadcast successful",
                    txid: result.txid,
                    message: "broadcast successful",
                    outpoints: req.body.outpoints
                };
                res.send(response);
            } else {
                res.send(JSON.stringify({
                    error: "broadcast_failed",
                    message: "Transaction broadcast failed",
                    outpoints: req.body.outpoints
                }));
            }
        } catch (error) {
            console.error("Error in sendOrdinals:", error);
            res.send(JSON.stringify({
                error: "transaction_failed",
                message: error instanceof Error ? error.message : "Transaction failed",
                outpoints: req.body.outpoints
            }));
        }
        //end real send code

        // Generate a dummy transaction ID for non-empty buckets
        // const dummyTxId = "dummy_tx_" + Math.random().toString(36).substring(2, 15);
        // const response = {
        //     status: "broadcast successful",
        //     txid: dummyTxId,
        //     message: "broadcast successful",
        //     outpoints: req.body.outpoints
        // };

        // Add a 2-second delay before sending the response
        // await new Promise(resolve => setTimeout(resolve, 2000));
        // res.send(JSON.stringify(response));
    } catch (error) {
        console.error("Error in getfriendlyfaucetfox:", error);
        res.status(500).send(JSON.stringify({
            error: "Transaction failed",
            message: error instanceof Error ? error.message : "Unknown error occurred"
        }));
    }

    //end dummy code
});


// Create Tag
app.post("/createtag", async (req, res) => {
    console.log("=== CREATING TAG GAME ===");
    console.log("Game number:", req.body.gamenumber);
    console.log("Tagger owner address:", req.body.taggerowneraddress);
    console.log("Tagger outpoint:", req.body.taggeroutpoint);
    console.log("Tagger current outpoint:", req.body.taggercurrentoutpoint);
    console.log("Tagger fox name:", req.body.taggerfoxname);
    console.log("Taggee owner address:", req.body.taggeeowneraddress);
    console.log("Taggee outpoint:", req.body.taggeeoutpoint);
    console.log("Taggee current outpoint:", req.body.taggeecurrentoutpoint);
    console.log("Taggee fox name:", req.body.taggeefoxname);
    console.log("Time:", req.body.time);
    console.log("Epoch: 1");
    console.log("=== END TAG GAME DATA ===");


    //setup
    const paymentWif = process.env.TAG_ONE_THOUSAND_PAYMENT_WIF as string;
    const paymentPk = PrivateKey.fromWif(paymentWif);

    const ordWif = process.env.TAG_ORD_WIF as string;
    const ordPk = PrivateKey.fromWif(ordWif);

    const signingWif = process.env.TAG_SIGNING_WIF as string;
    const signingPk = PrivateKey.fromWif(signingWif);

    const sig: LocalSigner = {
        idKey: signingPk
    }

    const ordDestination = "1LrqkqTznmScsT6e198c12KNKhZ4KuyK35";
    const paymentAddress = "1FvxNMZZhJ7K1wFxScNrGi1MLYkWFWPLKr";

    // const utxos = await fetchPayUtxos("1FvxNMZZhJ7K1wFxScNrGi1MLYkWFWPLKr");
    // console.log(utxos)

    //get payment utxo at ALL_TAG_PAYMENT_UTXOS[req.body.gamenumber-1]
    const gameNumber = req.body.gamenumber;
    const utxoIndex = gameNumber - 1;
    
    // Validate game number is within bounds
    if (gameNumber < 1 || gameNumber > 1000) {
        console.error(`Invalid game number: ${gameNumber}. Must be between 1 and 1000.`);
        res.send(JSON.stringify({
            error: "invalid_game_number",
            message: `Game number ${gameNumber} is invalid. Must be between 1 and 1000.`
        }));
        return;
    }
    
    if (utxoIndex >= ALL_TAG_PAYMENT_UTXOS.length) {
        console.error(`UTXO index ${utxoIndex} out of bounds. Available UTXOs: ${ALL_TAG_PAYMENT_UTXOS.length}`);
        res.send(JSON.stringify({
            error: "utxo_unavailable",
            message: `No UTXO available for game ${gameNumber}.`
        }));
        return;
    }
    
    const utxos = ALL_TAG_PAYMENT_UTXOS[utxoIndex];
    console.log(`Using UTXO at index ${utxoIndex} for game ${gameNumber}:`, utxos);

    const changeAddress = "1NLuxzkA5KNvYSUW7J3sns4mzHPKV9bq9n";

    //create ordinal with tag map data and inscription and sign 
    const txinscriptiondata = {
        "taggerowneraddress": req.body.taggerowneraddress,
        "taggeroriginoutpoint": req.body.taggeroutpoint,
        "taggeroutpoint": req.body.taggercurrentoutpoint,
        "taggerfoxname": req.body.taggerfoxname,
        "taggeeowneraddress": req.body.taggeeowneraddress,
        "taggeeoriginoutpoint": req.body.taggeeoutpoint,
        "taggeeoutpoint": req.body.taggeecurrentoutpoint,
        "taggeefoxname": req.body.taggeefoxname,
        "time": req.body.time,
        "epoch": 1,
        "gamenumber": req.body.gamenumber
    }

    // inscription to base64, no data
    const encodedFileData = Buffer.from(JSON.stringify(txinscriptiondata)).toString("base64");

    //adding metadata
    // Define MAP keys as a JSON object
    const metaData = {
        app: "foxplorer",
        type: "ord",
        name: "tag",
        taggerowner: req.body.taggerowneraddress,
        taggerfoxname: req.body.taggerfoxname,
        taggeroriginoutpoint: req.body.taggeroutpoint,
        taggeroutpoint: req.body.taggercurrentoutpoint,
        taggeeowner: req.body.taggeeowneraddress,
        taggeefoxname: req.body.taggeefoxname,
        taggeeoriginoutpoint: req.body.taggeeoutpoint,
        taggeeoutpoint: req.body.taggeecurrentoutpoint,
        time: req.body.time,
        epoch: 1,
        gamenumber: req.body.gamenumber
    }

    const configinscription: CreateOrdinalsConfig = {
        utxos: [utxos], // This is correct - wrapping single UTXO in array
        destinations: [{
            address: ordDestination,
            inscription: { dataB64: encodedFileData, contentType: "text/plain;charset=utf-8" }
        }],
        paymentPk: paymentPk,
        changeAddress: changeAddress,
        metaData: metaData,
        signer: sig
    };

            //real send code        
            
            const { tx } = await createOrdinals(configinscription);
            console.log({ tx })
            const result = await tx.broadcast(oneSatBroadcaster())
            console.log(result)
            res.send(JSON.stringify(result))

            //dummy send code
            // const dummyTxId = "dummy_tx_" + Math.random().toString(36).substring(2, 15);
            // const response = {
            //     status: "broadcast successful",
            //     txid: dummyTxId,
            //     message: "broadcast successful",
            //     outpoints: req.body.outpoints
            // };

            // // Add a 2-second delay before sending the response
            // await new Promise(resolve => setTimeout(resolve, 2000));
            // res.send(JSON.stringify(response));
});


// Create space rock inscription
app.post("/createspacerock", async (req, res) => {
    console.log("=== CREATE SPACEROCK REQUEST ===");
    console.log("Request body:", req.body);

    // Get the spacerock number from the request (this should be existing count + 1)
    let number = req.body.number;
    console.log("Spacerock number to create:", number);

    // Validate that we have a valid number
    if (!number || number < 1) {
        console.error("Invalid spacerock number:", number);
        res.send(JSON.stringify({ 
            error: "Invalid spacerock number", 
            message: "Spacerock number must be at least 1" 
        }));
        return;
    }

    console.log("Creating spacerock number:", number);

    const { address } = req.body;
    console.log("creating space rock: " + address)

    if (!address) {
        res.send(JSON.stringify({ error: "Address is required" }));
        return;
    }

    // Try to get fresh block data from What's On Chain
    let latestBlockHeight: string | number = "unknown";
    let latestBlockHash: string = "unknown";
    let hexcolor: string = "36bffa"; // Default fallback color
    
    try {
        console.log("Fetching latest block data from What's On Chain...");
        const response = await fetch('https://api.whatsonchain.com/v1/bsv/main/block/headers');
        
        if (!response.ok) {
            throw new Error(`What's On Chain API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json() as any;
        
        if (!data || !data[0] || !data[0].height || !data[0].hash) {
            throw new Error("Invalid response format from What's On Chain API");
        }
        
        latestBlockHeight = data[0].height;
        latestBlockHash = data[0].hash;
        hexcolor = latestBlockHash.slice(-6);
        
        console.log("Latest block height:", latestBlockHeight);
        console.log("Latest block hash:", latestBlockHash);
        console.log("Hexcolor:", hexcolor);
        
    } catch (error) {
        console.error("Failed to fetch block data from What's On Chain:", error);
        
        // Check if foxlive provided complete fallback data
        if (req.body.spacerockColor && 
            req.body.spacerockColor.startsWith('#') && 
            req.body.fallbackBlockHeight && 
            req.body.fallbackBlockHash) {
            
            console.log("Using complete fallback data from foxlive");
            hexcolor = req.body.spacerockColor.slice(1); // Remove the # prefix
            latestBlockHeight = req.body.fallbackBlockHeight;
            latestBlockHash = req.body.fallbackBlockHash;
            console.log("Fallback color:", req.body.spacerockColor);
            console.log("Fallback block height:", latestBlockHeight);
            console.log("Fallback block hash:", latestBlockHash);
        } else {
            // Incomplete fallback data - fail gracefully
            console.error("Incomplete fallback data available, failing spacerock creation");
            console.log("Available fallback data:", {
                hasColor: !!(req.body.spacerockColor && req.body.spacerockColor.startsWith('#')),
                hasBlockHeight: !!req.body.fallbackBlockHeight,
                hasBlockHash: !!req.body.fallbackBlockHash
            });
            res.send(JSON.stringify({ 
                error: "Incomplete block data", 
                message: "Unable to fetch latest block data and incomplete fallback provided. Spacerock will be available for the next player.",
                retryable: true
            }));
            return;
        }
    }

    // Check if we got fresh data that's different from foxlive's fallback data
    const hasFreshData = req.body.fallbackBlockHeight && 
                       req.body.fallbackBlockHash && 
                       (latestBlockHeight !== req.body.fallbackBlockHeight || 
                        latestBlockHash !== req.body.fallbackBlockHash);

    // Validate that the UTXO is still available for this spacerock number
    const utxoIndex = number - 1;
    const assignedUtxo = SPACE_ROCK_PAYMENT_UTXOS[utxoIndex];
    
    if (!assignedUtxo) {
        console.error(`No UTXO available for spacerock number ${number} (index ${utxoIndex})`);
        res.send(JSON.stringify({ 
            error: "UTXO unavailable", 
            message: `No UTXO available for Space Rock #${number}. This spacerock may have already been claimed.`,
            retryable: true
        }));
        return;
    }

    try {
        //setup
        const paymentWif = process.env.SPACEROCK_PAYMENT_WIF as string;
        const paymentPk = PrivateKey.fromWif(paymentWif);

        const ordWif = process.env.GROUP_ORD_WIF as string;
        const ordPk = PrivateKey.fromWif(ordWif);

        const signingWif = process.env.GROUP_SIGNING_WIF as string;
        const signingPk = PrivateKey.fromWif(signingWif);

        const sig: LocalSigner = {
            idKey: signingPk
        }

        const ordDestination = address; // Send to user's address
        const paymentAddress = "1PxyjgKnBHoL9gFjSKLGJQU7FXGbX6N7kR";

        // Use the correct UTXO index (UTXOs are 0-499, so spacerock #1 uses UTXO index 0)
        const utxos = [assignedUtxo];
        console.log("Using UTXO for spacerock:", utxos);

        const changeAddress = "1PxyjgKnBHoL9gFjSKLGJQU7FXGbX6N7kR";

//svg code replace 36bffa with hex color
        const content = `<svg width="800px" height="800px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="#000000">
<g id="spaceRock_bg" stroke-width="0"/>
<g id="spaceRock_tracer" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="10.24">
<path fill="#000000" d="M228.813 23L68.75 72.28 39.5 182.095l47.53-21.22 10.44-4.655 2.5 11.155 8.75 39.125 6.405 28.53-21.75-19.53-15.72-14.125-28.218 32.344 140.657 136 9.656-40.69 7.53-31.874 10.407 31.063 54.72 163.592L432.343 465.5l45.75-202.938-84.563-148.718L228.814 23zm-57.688 49.875l-27.813 39.906-3.25 73.44-27.187-88.94 58.25-24.405zm17.844 93.406l113.124 155.25L407 355.407l-107.375-.844-110.656-128v-60.28zM79.312 330.25l140.125 153.125-5.563-65.875-134.563-87.25z"/>
</g>
<g id="spaceRock_icon">
<path fill="#${hexcolor}" d="M228.813 23L68.75 72.28 39.5 182.095l47.53-21.22 10.44-4.655 2.5 11.155 8.75 39.125 6.405 28.53-21.75-19.53-15.72-14.125-28.218 32.344 140.657 136 9.656-40.69 7.53-31.874 10.407 31.063 54.72 163.592L432.343 465.5l45.75-202.938-84.563-148.718L228.814 23zm-57.688 49.875l-27.813 39.906-3.25 73.44-27.187-88.94 58.25-24.405zm17.844 93.406l113.124 155.25L407 355.407l-107.375-.844-110.656-128v-60.28zM79.312 330.25l140.125 153.125-5.563-65.875-134.563-87.25z"/>
</g>
</svg>`
        const encodedFileData = Buffer.from(content).toString("base64");

        const time = Date.now();

        // //adding metadata
        const metaData = {
            app: "foxplorer",
            name: "Space Rocks",
            type: "ord",
            time: time,
            color: "#" + hexcolor,
            latestBlockHeight: latestBlockHeight,
            latestBlockHash: latestBlockHash,
            subType: "collectionItem",
            subTypeData: {
                spaceRocksName: "Space Rocks #" + number,
                collectionId: "5889aa0c3ec9736a49a30864cf700a9f7e9e6e422f8a720162c4bd350e1f9b00_0"
            } as CollectionItemSubTypeData
        } as PreMAP;

        const configinscription: CreateOrdinalsConfig = {
            utxos: [assignedUtxo],
            destinations: [{
                address: ordDestination,
                inscription: {
                    dataB64: encodedFileData,
                    contentType: "image/svg+xml"
                }
            }],
            paymentPk: paymentPk,
            changeAddress: changeAddress,
            metaData: metaData,
            signer: sig
        };
        //no broadcast yet
        const { tx } = await createOrdinals(configinscription);
        console.log({ tx })
        const result = await tx.broadcast(oneSatBroadcaster())
        console.log(result)
        
        if (result && result.txid) {
            res.send(JSON.stringify({ 
                txid: result.txid, 
                time: time, 
                color: "#" + hexcolor, 
                blockHeight: latestBlockHeight, 
                blockHash: latestBlockHash, 
                spacerockName: "Space Rocks #" + number,
                hasFreshData: hasFreshData,  // Flag indicating if we got more current data
                updatedBlockHeight: hasFreshData ? latestBlockHeight : null,
                updatedBlockHash: hasFreshData ? latestBlockHash : null,
                updatedColor: hasFreshData ? "#" + hexcolor : null,
                ownerAddress: address  // Add the owner address
            }));
        } else {
            res.send(JSON.stringify({ 
                error: "broadcast_failed",
                message: "Transaction broadcast failed",
                retryable: true
            }));
        }
    } catch (error) {
        console.error("Error creating spacerock inscription:", error);
        res.send(JSON.stringify({ 
            error: "Failed to create spacerock inscription",
            message: error instanceof Error ? error.message : "Unknown error"
        }));
    }
});


// Server setup
app.listen(PORT, () => {
    console.log(`The application is listening on port http://localhost:${PORT}`);
});

app.enable('trust proxy');

