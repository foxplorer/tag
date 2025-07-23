// src/index.ts
import express, { Request, Response } from 'express'
import bodyParser from 'body-parser';
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import lodash from 'lodash'
import { config } from "dotenv"
import cors from 'cors';
import helmet from 'helmet'
import * as fs from 'fs';
import * as path from 'path';
// Get current directory for CommonJS
const __dirname = process.cwd();

// Load JSON files with error handling
const loadJsonFile = (filename: string): any => {
  try {
    const filePath = path.join(__dirname, 'assets', filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
};

const bountyFoxesGroup = loadJsonFile('500BountyFoxesGroup.json');
const bountyFoxes2xGroups = loadJsonFile('500BountyFoxes2xGroups.json');
const bountyFoxes5xGroups = loadJsonFile('500BountyFoxes5xGroups.json');
const bountyFoxes10xGroups = loadJsonFile('500BountyFoxes10xGroups.json');
const bountyFoxesStillLeft = loadJsonFile('500BountyFoxesStillLeft.json');

const app = express();
app.use(helmet());
// app.use(cors());
const server = createServer(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

const io: Server = new Server(server, {
  cors: {
    origin: `http://localhost:3000`,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const tagIo = new Server(server, {
  path: '/tag',
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Also check the main Express app CORS settings
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Add type for bucket types
type BucketType = '1x' | '2x' | '5x' | '10x' | 'empty';

// Add type for bucket foxes
type BucketFox = {
  img: string;
  name: string;
  outpoint: string;
  traits: string[];
  bucket: BucketType;
  // Individual fox information (for 1x buckets)
  foxName?: string;
  pixelFoxName?: string;
  originOutpoint?: string;
  // Group information (for 2x, 5x, 10x buckets)
  groupName?: string;
  groupLink?: string;
  groupOutpoint?: string;
  groupOutpoints?: string[]; // Array of all fox outpoints in the group
  groupFoxes?: Array<{
    outpoint: string;
    foxName: string;
    pixelFoxName: string;
    img: string;
  }>;
}

// Add state variables for bucket foxes (server-side)
let bucketFoxes: BucketFox[] = [];
let bucketFoxesLoading = false;
let available: string[] = [];

// Track bucket assignments for tag game
const bucketAssignments = new Map<string, number>(); // Map<socketId, bucketIndex>
const addressToSocketMap = new Map<string, string>(); // Map<owneraddress, socketId>

// Add function to set bucket foxes
const setBucketFoxes = (buckets: BucketFox[]) => {
  bucketFoxes = buckets;
};

// Add function to set available foxes
const setAvailable = (outpoints: string[]) => {
  available = outpoints;
};

// Add function to set bucket foxes loading state
const setBucketFoxesLoading = (loading: boolean) => {
  bucketFoxesLoading = loading;
};

// Generate array of 10 bucket foxes (corrected)
const generateBucketFoxes = async () => {
  const maxRetries = 3;
  let lastError: any = null;
  let foxes: any[] = [];
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Fetch foxes from the faucet address with proper error handling
      console.log(`Fetching foxes from faucet address... (attempt ${attempt}/${maxRetries})`);
      const response = await fetch('https://ordinals.gorillapool.io/api/txos/address/1FW75Wkv5zK6twHjuwGeEpGZ4AJPZEz4ED/unspent?limit=5000&offset=0&bsv20=false&origins=false&refresh=false');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      foxes = await response.json();
      
      if (!Array.isArray(foxes)) {
        throw new Error('Invalid response format: expected array of foxes');
      }
      
      console.log(`✅ Successfully fetched ${foxes.length} foxes from faucet (attempt ${attempt})`);
      break; // Success, exit retry loop
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = attempt * 1000; // Exponential backoff: 1s, 2s, 3s
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If all retries failed, use fallback
  if (lastError) {
    console.error('❌ ERROR: All attempts to fetch foxes failed:', lastError);
    console.log('🔄 FALLBACK: Using offline mode with empty buckets...');
    
    // Create fallback bucket foxes with empty buckets
    const fallbackBucketFoxes: BucketFox[] = [];
    
    // Fill all 10 slots with empty buckets
    for (let i = 0; i < 10; i++) {
      fallbackBucketFoxes.push({
        img: '',
        name: 'Empty',
        outpoint: '',
        traits: [],
        bucket: 'empty' as BucketType
      });
    }
    
    // Set empty available outpoints for the tag game
    setAvailable([]);
    
    // Set the fallback bucket foxes
    setBucketFoxes(fallbackBucketFoxes);
    setBucketFoxesLoading(false);
    
    console.log('✅ FALLBACK: Created 10 empty buckets due to API failure');
    console.log('💡 TIP: Check your internet connection and try again later');
    return;
  }
  
  // Continue with normal processing if fetch succeeded
  try {

    // Get available foxes: Pixel Foxes at faucet that are also in bountyFoxesGroup
    const availableFoxes = foxes.filter((fox: any) => 
      fox.origin?.data?.map?.subTypeData?.collectionId === "1611d956f397caa80b56bc148b4bce87b54f39b234aeca4668b4d5a7785eb9fa_0" &&
      bountyFoxesGroup.group.some((groupFox: any) => groupFox["origin.outpoint"] === fox.origin.outpoint)
    );

    // Set available outpoints for the tag game
    const availableOutpoints = availableFoxes.map((fox: any) => fox.origin.outpoint);
    setAvailable(availableOutpoints);

    console.log(`Total foxes at faucet: ${availableFoxes.length}`);

    // Helper function to create a bucket fox
    const createBucketFox = (fox: any, bucketType: BucketType): BucketFox => {
      const groupFox = bountyFoxesGroup.group.find((gf: any) => gf["origin.outpoint"] === fox.origin.outpoint);
      
      const baseFox: BucketFox = {
        img: `https://ordfs.network/content/${fox.origin.outpoint}`,
        name: fox.origin.data.map.name,
        outpoint: fox.outpoint,
        originOutpoint: fox.origin.outpoint,
        traits: fox.origin.data.map.traits,
        bucket: bucketType,
        foxName: groupFox ? groupFox.foxData.foxName : fox.origin.data.map.name,
        pixelFoxName: groupFox ? groupFox.foxData.pixelFoxName : fox.origin.data.map.name
      };

      // Add group info if it's a group fox
      if (bucketType !== '1x') {
        let group;
        if (bucketType === '2x') {
          group = bountyFoxes2xGroups.find((g: any) => g.group.some((gf: any) => gf["origin.outpoint"] === fox.origin.outpoint));
        } else if (bucketType === '5x') {
          group = bountyFoxes5xGroups.find((g: any) => g.group.some((gf: any) => gf["origin.outpoint"] === fox.origin.outpoint));
        } else if (bucketType === '10x') {
          group = bountyFoxes10xGroups.find((g: any) => g.group.some((gf: any) => gf["origin.outpoint"] === fox.origin.outpoint));
        }

        if (group) {
          return {
            ...baseFox,
            groupName: group.foxGroup,
            groupLink: group.link,
            groupOutpoint: group.outpoint,
            groupOutpoints: group.group.map((gf: any) => gf["origin.outpoint"]),
            groupFoxes: group.group.map((gf: any) => ({
              outpoint: gf["origin.outpoint"],
              foxName: gf.foxData.foxName,
              pixelFoxName: gf.foxData.pixelFoxName,
              img: `https://ordfs.network/content/${gf["origin.outpoint"]}`
            })),
            name: group.foxGroup || baseFox.name
          };
        }
      }

      return baseFox;
    };

    // Create sets for efficient lookup of foxes in groups
    const foxesIn2xGroups = new Set<string>();
    const foxesIn5xGroups = new Set<string>();
    const foxesIn10xGroups = new Set<string>();

    bountyFoxes2xGroups.forEach((group: any) => {
      group.group.forEach((fox: any) => foxesIn2xGroups.add(fox["origin.outpoint"]));
    });
    bountyFoxes5xGroups.forEach((group: any) => {
      group.group.forEach((fox: any) => foxesIn5xGroups.add(fox["origin.outpoint"]));
    });
    bountyFoxes10xGroups.forEach((group: any) => {
      group.group.forEach((fox: any) => foxesIn10xGroups.add(fox["origin.outpoint"]));
    });

    // Get available 1x foxes (not in any group) from bountyFoxesStillLeft
    const available1xFoxes = bountyFoxesStillLeft.filter((fox: any) => 
      availableFoxes.some((faucetFox: any) => faucetFox.origin.outpoint === fox.origin.outpoint)
    );

    console.log(`Available 1x foxes (not in groups): ${available1xFoxes.length}`);

    // Get available groups (all members must be at faucet)
    const available2xGroups = bountyFoxes2xGroups.filter((group: any) => 
      group.group.every((fox: any) => 
        availableFoxes.some((faucetFox: any) => faucetFox.origin.outpoint === fox["origin.outpoint"])
      )
    );
    const available5xGroups = bountyFoxes5xGroups.filter((group: any) => 
      group.group.every((fox: any) => 
        availableFoxes.some((faucetFox: any) => faucetFox.origin.outpoint === fox["origin.outpoint"])
      )
    );
    const available10xGroups = bountyFoxes10xGroups.filter((group: any) => 
      group.group.every((fox: any) => 
        availableFoxes.some((faucetFox: any) => faucetFox.origin.outpoint === fox["origin.outpoint"])
      )
    );

    console.log(`Available groups: 2x=${available2xGroups.length}, 5x=${available5xGroups.length}, 10x=${available10xGroups.length}`);
    console.log(`Available 1x foxes from bountyFoxesStillLeft: ${available1xFoxes.length}`);
    console.log(`Total available foxes at faucet: ${availableFoxes.length}`);

    // Create bucket foxes with proper fallback logic
    const bucketFoxes: BucketFox[] = [];
    const usedGroups = new Set<string>();
    const usedFoxes = new Set<string>();

    // Target distribution: 7x 1x, 1x 2x, 1x 5x, 1x 10x
    let target1x = 7;
    let target2x = 1;
    let target5x = 1;
    let target10x = 1;

    // Step 1: Try to place 2x groups
    if (target2x > 0 && available2xGroups.length > 0) {
      console.log(`Trying to place 2x group. Available: ${available2xGroups.length}`);
      const shuffled2xGroups = [...available2xGroups].sort(() => Math.random() - 0.5);
      for (const group of shuffled2xGroups) {
        if (usedGroups.has(`2x_${group.outpoint || ''}`)) {
          console.log(`2x group ${group.foxGroup} already used, skipping`);
          continue;
        }
        
        // Find a representative fox from this group
        const representativeFox = availableFoxes.find((fox: any) => 
          group.group.some((groupFox: any) => groupFox["origin.outpoint"] === fox.origin.outpoint)
        );
        
        if (!representativeFox) {
          console.log(`No representative fox found for 2x group ${group.foxGroup}`);
          continue;
        }
        
        if (usedFoxes.has(representativeFox.outpoint)) {
          console.log(`Representative fox ${representativeFox.outpoint} already used for 2x group ${group.foxGroup}`);
          continue;
        }
        
        bucketFoxes.push(createBucketFox(representativeFox, '2x'));
        usedGroups.add(`2x_${group.outpoint || ''}`);
        usedFoxes.add(representativeFox.outpoint);
        target2x--;
        console.log(`Placed 2x group: ${group.foxGroup} with fox ${representativeFox.outpoint}`);
        console.log(`Added group outpoint to usedGroups: 2x_${group.outpoint || ''}`);
        break;
      }
    }

    // Step 2: Try to place 5x groups
    if (target5x > 0 && available5xGroups.length > 0) {
      console.log(`Trying to place 5x group. Available: ${available5xGroups.length}`);
      const shuffled5xGroups = [...available5xGroups].sort(() => Math.random() - 0.5);
      for (const group of shuffled5xGroups) {
        if (usedGroups.has(`5x_${group.outpoint || ''}`)) {
          console.log(`5x group ${group.foxGroup} already used, skipping`);
          continue;
        }
        
        const representativeFox = availableFoxes.find((fox: any) => 
          group.group.some((groupFox: any) => groupFox["origin.outpoint"] === fox.origin.outpoint)
        );
        
        if (!representativeFox) {
          console.log(`No representative fox found for 5x group ${group.foxGroup}`);
          continue;
        }
        
        if (usedFoxes.has(representativeFox.outpoint)) {
          console.log(`Representative fox ${representativeFox.outpoint} already used for 5x group ${group.foxGroup}`);
          continue;
        }
        
        bucketFoxes.push(createBucketFox(representativeFox, '5x'));
        usedGroups.add(`5x_${group.outpoint || ''}`);
        usedFoxes.add(representativeFox.outpoint);
        target5x--;
        console.log(`Placed 5x group: ${group.foxGroup}`);
        break;
      }
    }

    // Step 3: Try to place 10x groups
    if (target10x > 0 && available10xGroups.length > 0) {
      console.log(`Trying to place 10x group. Available: ${available10xGroups.length}`);
      const shuffled10xGroups = [...available10xGroups].sort(() => Math.random() - 0.5);
      for (const group of shuffled10xGroups) {
        if (usedGroups.has(`10x_${group.outpoint || ''}`)) {
          console.log(`10x group ${group.foxGroup} already used, skipping`);
          continue;
        }
        
        const representativeFox = availableFoxes.find((fox: any) => 
          group.group.some((groupFox: any) => groupFox["origin.outpoint"] === fox.origin.outpoint)
        );
        
        if (!representativeFox) {
          console.log(`No representative fox found for 10x group ${group.foxGroup}`);
          continue;
        }
        
        if (usedFoxes.has(representativeFox.outpoint)) {
          console.log(`Representative fox ${representativeFox.outpoint} already used for 10x group ${group.foxGroup}`);
          continue;
        }
        
        bucketFoxes.push(createBucketFox(representativeFox, '10x'));
        usedGroups.add(`10x_${group.outpoint || ''}`);
        usedFoxes.add(representativeFox.outpoint);
        target10x--;
        console.log(`Placed 10x group: ${group.foxGroup}`);
        break;
      }
    }

    // Step 4: Fill remaining slots with 1x foxes from bountyFoxesStillLeft
    console.log(`Attempting to place ${target1x} 1x foxes from bountyFoxesStillLeft`);
    const shuffled1xFoxes = [...available1xFoxes].sort(() => Math.random() - 0.5);
    
    for (const fox of shuffled1xFoxes) {
      if (bucketFoxes.length >= 10) break;
      
      // Find the corresponding faucet fox
      const faucetFox = availableFoxes.find((f: any) => f.origin.outpoint === fox.origin.outpoint);
      if (!faucetFox || usedFoxes.has(faucetFox.outpoint)) continue;
      
      bucketFoxes.push(createBucketFox(faucetFox, '1x'));
      usedFoxes.add(faucetFox.outpoint);
      target1x--;
      console.log(`Placed 1x fox: ${fox.origin.data.map.name}`);
    }

    // Step 5: If we still need more 1x foxes, try using any remaining foxes (including those in groups)
    // if (target1x > 0) {
    //   console.log(`Still need ${target1x} more foxes. Trying fallback to any remaining foxes...`);
    //   const remainingFoxes = availableFoxes.filter((fox: any) => !usedFoxes.has(fox.outpoint));
    //   const shuffledRemaining = [...remainingFoxes].sort(() => Math.random() - 0.5);
      
    //   for (const fox of shuffledRemaining) {
    //     if (bucketFoxes.length >= 10) break;
        
    //     bucketFoxes.push(createBucketFox(fox, '1x'));
    //     usedFoxes.add(fox.outpoint);
    //     target1x--;
    //     console.log(`Placed fallback 1x fox: ${fox.origin.data.map.name}`);
    //   } 
    // }

    // Step 6: If we still need more foxes, create empty buckets (complete fallback)
    if (target1x > 0) {
      console.log(`Still need ${target1x} more foxes. Creating empty buckets as final fallback...`);
      for (let i = 0; i < target1x; i++) {
        if (bucketFoxes.length >= 10) break;
        
        bucketFoxes.push({
          img: '',
          name: 'Empty',
          outpoint: '',
          traits: [],
          bucket: 'empty' as BucketType
        });
        console.log(`Created empty bucket as fallback`);
      }
    }

    // Step 7: Fill remaining slots with empty buckets (ensure we always have exactly 10 buckets)
    while (bucketFoxes.length < 10) {
      bucketFoxes.push({
        img: '',
        name: 'Empty',
        outpoint: '',
        traits: [],
        bucket: 'empty' as BucketType
      });
    }

    // Log final distribution
    const finalDistribution = {
      '1x': bucketFoxes.filter(b => b.bucket === '1x').length,
      '2x': bucketFoxes.filter(b => b.bucket === '2x').length,
      '5x': bucketFoxes.filter(b => b.bucket === '5x').length,
      '10x': bucketFoxes.filter(b => b.bucket === '10x').length,
      'empty': bucketFoxes.filter(b => b.bucket === 'empty').length
    };

    console.log('Final bucket distribution:', finalDistribution);
    console.log(`Total foxes placed: ${bucketFoxes.length - finalDistribution.empty}`);

    // Set the bucket foxes
    setBucketFoxes(bucketFoxes);
    setBucketFoxesLoading(false);

  } catch (error) {
    console.error('❌ ERROR: Failed to fetch foxes from faucet address:', error);
    console.log('🔄 FALLBACK: Using offline mode with empty buckets...');
    
    // Create fallback bucket foxes with empty buckets
    const fallbackBucketFoxes: BucketFox[] = [];
    
    // Fill all 10 slots with empty buckets
    for (let i = 0; i < 10; i++) {
      fallbackBucketFoxes.push({
        img: '',
        name: 'Empty',
        outpoint: '',
        traits: [],
        bucket: 'empty' as BucketType
      });
    }
    
    // Set empty available outpoints for the tag game
    setAvailable([]);
    
    // Set the fallback bucket foxes
    setBucketFoxes(fallbackBucketFoxes);
    setBucketFoxesLoading(false);
    
    console.log('✅ FALLBACK: Created 10 empty buckets due to API failure');
    console.log('💡 TIP: Check your internet connection and try again later');
  }
};


app.get('/', async (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});


server.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  // Initialize both bounty foxes and spacerocks when server starts
  console.log('=== INITIALIZING GAME DATA ON SERVER START ===');
  try {
    // Generate bucket foxes for tag game
    console.log('Generating bucket foxes...');
    await generateBucketFoxes();
    console.log('=== BUCKET FOXES GENERATED SUCCESSFULLY ===');
    console.log('Bucket foxes array:', JSON.stringify(bucketFoxes, null, 2));
    console.log('Available foxes count:', available.length);
    
    // Initialize spacerock system
    console.log('Initializing spacerock system...');
    await fetchSpaceRocks();
    console.log('=== SPACEROCK SYSTEM INITIALIZED SUCCESSFULLY ===');
    console.log(`Generated ${spaceRocks.length} spacerock positions`);
    
    // Initialize tag game count
    console.log('Initializing tag game count...');
    currentTagGameCount = await fetchTagGameCount();
    console.log(`Initial tag game count: ${currentTagGameCount}`);
    
    console.log('=== ALL GAME DATA INITIALIZED SUCCESSFULLY ===');
  } catch (error) {
    console.error('Error initializing game data on server start:', error);
  }
});


// tag code
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

type ActivityArray = {
  taggerowneraddress: string,
  taggeroutpoint: string,
  taggercurrentoutpoint: string,
  taggerfoxname: string,
  taggerimage: string,
  taggerimagelink: string,
  taggeeowneraddress: string,
  taggeeoutpoint: string,
  taggeecurrentoutpoint: string,
  taggeefoxname: string,
  taggeeimage: string,
  taggeeimagelink: string,
  time: number,
  txid: string,
  gamenumber?: number,
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
  }
}
// Function to refresh both bounty foxes and spacerocks
const refreshGameData = async () => {
  console.log('=== REFRESHING GAME DATA BETWEEN ROUNDS ===');
  
  try {
    // Refresh bounty foxes
    console.log('Refreshing bounty foxes...');
    await generateBucketFoxes();
    
    // Refresh spacerocks
    console.log('Refreshing spacerocks...');
    await fetchSpaceRocks();
    
    // Refresh tag game count
    console.log('Refreshing tag game count...');
    currentTagGameCount = await fetchTagGameCount();
    
    // Broadcast updated data to all connected clients
    tagIo.emit('bucketFoxesData', {
      bucketFoxes,
      availableCount: available.length,
      totalBuckets: bucketFoxes.length
    });
    
    tagIo.emit('spaceRocksData', {
      spaceRocks,
      spaceRocksCount,
      latestBlockHash
    });
    
    // Broadcast updated tag game number to all connected clients
    tagIo.emit('tagGameNumber', { 
      epoch: 1, 
      gameNumber: currentTagGameCount + 1 // Next game number (current count + 1)
    });
    
    console.log('=== GAME DATA REFRESHED SUCCESSFULLY ===');
    console.log(`Updated tag game count: ${currentTagGameCount}, next game: ${currentTagGameCount + 1}`);
  } catch (error) {
    console.error('Error refreshing game data:', error);
  }
};

async function createTagInscription(currentactivity: ActivityArray) {
  // online
  // const url = "https://[your-server]/createtag";
  //offline
  const url = "http://localhost:9000/createtag";
  
  // Get the next game number (current count + 1)
  const gameNumber = currentTagGameCount + 1;
  console.log(`Creating tag game #${gameNumber} (current count: ${currentTagGameCount})`);
  
  // console.log(myordinalsaddress + "=addresses in sendvars")
  const options = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify({
      "taggerowneraddress": currentactivity.taggerowneraddress,
      "taggeroutpoint": currentactivity.taggeroutpoint,
      "taggercurrentoutpoint": currentactivity.taggercurrentoutpoint,
      "taggerfoxname": currentactivity.taggerfoxname,
      "taggeeowneraddress": currentactivity.taggeeowneraddress,
      "taggeeoutpoint": currentactivity.taggeeoutpoint,
      "taggeecurrentoutpoint": currentactivity.taggeecurrentoutpoint,
      "taggeefoxname": currentactivity.taggeefoxname,
      "time": currentactivity.time,
      "gamenumber": gameNumber
    })
    // body: JSON.stringify({ addresses, "avatar": avatar }),
  };
  
  try {
    console.log('=== SENDING TAG INSCRIPTION REQUEST ===');
    console.log('URL:', url);
    console.log('Request body:', JSON.stringify(options.body, null, 2));
    
    const response = await fetch(url, options);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const data = await response.json();
    console.log('=== TAG INSCRIPTION RESPONSE ===');
    console.log('Response data:', data);
    console.log('Response data type:', typeof data);
    console.log('Has txid:', !!data.txid);
    
    // Update the activity object with the txid
    if (data.txid) {
      currentactivity.txid = data.txid;
      console.log('Updated activity with txid:', data.txid);
    }
    
    console.log('=== EMITTING TXID EVENT ===');
    console.log('Emitting to tagIo with data:', JSON.stringify(data));
    tagIo.emit('txid', JSON.stringify(data));
    console.log('Txid event emitted successfully');
    
    // Increment the game count after successful tag creation
    currentTagGameCount++;
    tagIo.emit('tagGameNumber', { epoch: 1, gameNumber });
    console.log(`Tag game #${gameNumber} created successfully. New count: ${currentTagGameCount}`);
    
    // Refresh game data after tag inscription is created (this will correct any discrepancies)
    setTimeout(() => {
      refreshGameData();
    }, 5000); // Wait 5 seconds after tag creation to refresh data
    
    return data;
  } catch (error) {
    console.error('=== ERROR CREATING TAG INSCRIPTION ===');
    console.error('Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    // Don't increment count if creation failed
    console.log(`Tag game #${gameNumber} failed - count remains at ${currentTagGameCount}`);
    throw error;
  }
};

async function createSpaceRockInscription(playerAddress: string, spacerockData: any) {
  // offline
  const url = "http://localhost:9000/createspacerock";
  //online
  // const url = "https://[your-server]/createspacerock";
  
  const options = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify({
      "address": playerAddress,
      "number": spacerockData.number,
      "spacerockColor": spacerockData.color, // Fallback color if What's On Chain API fails
      "spacerockPosition": { x: spacerockData.x, y: spacerockData.y },
      "collisionTime": Date.now(),
      "fallbackBlockHeight": latestBlockHeight, // Actual block height from foxlive
      "fallbackBlockHash": latestBlockHash // Fallback block hash from foxlive
    })
  };
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log('SpaceRock inscription response:', data);
    return data;
  } catch (error) {
    console.error('Error creating spacerock inscription:', error);
    return { message: 'Error creating spacerock inscription' };
  }
}

async function getBountyFoxes(taggerAddress: string, taggeeOutpoints: string[]) {
  try {
    console.log('=== GETTING BOUNTY FOXES ===');
    console.log('Tagger address:', taggerAddress);
    console.log('Taggee outpoints:', taggeeOutpoints);
      //offline
      const response = await fetch('http://localhost:9000/getbountyfoxes', {
      //online
      // const response = await fetch('https://[your-server]/getbountyfoxes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: taggerAddress,
        outpoints: taggeeOutpoints
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Bounty foxes result:', result);
    return result;
  } catch (error) {
    console.error('Error getting bounty foxes:', error);
    return { message: 'Failed to get bounty foxes' };
  }
}

let connectedUsers: number = 0;
let players: PlayersArray[] = [];
let activity: ActivityArray;
let chaser: PlayersArray;
let tagged: string[] = [];
let chaserposition: number;
let canTag: boolean = true;

// Add type for spacerock
type SpaceRock = {
  x: number;
  y: number;
  number: number;
  color: string;
  outpoint: string;
}

// Add state variables for spacerocks
let spaceRocks: SpaceRock[] = [];
let spaceRocksLoading = false;
let spaceRocksCount = 0;
let latestBlockHash = '';
let latestBlockHeight = 0;

// Add state variable for tag game count
let currentTagGameCount = 0;

// Function to fetch current tag game count from blockchain
const fetchTagGameCount = async (): Promise<number> => {
  try {
    console.log('=== FETCHING TAG GAME COUNT ===');
    
    // Search for tag games with epoch 1
    const url = "https://ordinals.gorillapool.io/api/txos/search?limit=1000";
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({
        "map": {
          "app": "foxplorer",
          "name": "tag",
          "type": "ord",
          "epoch": "1"
        }
      })
    };
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    const gameCount = Array.isArray(data) ? data.length : 0;
    console.log(`Found ${gameCount} existing tag games for epoch 1`);
    
    return gameCount;
  } catch (error) {
    console.error('Error fetching tag game count:', error);
    return 0;
  }
};

// Function to fetch spacerock metadata and calculate colors
const fetchSpaceRocks = async (): Promise<void> => {
  try {
    console.log('=== FETCHING SPACEROCK METADATA ===');
    
    // Get latest block data for color calculation
    const blockResponse = await fetch('https://api.whatsonchain.com/v1/bsv/main/block/headers');
    const blockData = await blockResponse.json();
    latestBlockHash = blockData[0].hash;
    latestBlockHeight = blockData[0].height;
    console.log('Latest block hash:', latestBlockHash);
    console.log('Latest block height:', latestBlockHeight);
    
    // Search for spacerock metadata
    const url = "https://ordinals.gorillapool.io/api/txos/search?limit=500";
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({
        "map": {
          "app": "foxplorer",
          "name": "Space Rocks",
          "type": "ord",
          "subType": "collectionItem"
        }
      })
    };
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log('Spacerock API response:', data);
    console.log('Spacerocks created length:', data.length);

    // Always create spacerocks if we have a valid block hash, regardless of existing on-chain data
    if (latestBlockHash) {
      // Only create 1 spacerock per round
      const existingCount = Array.isArray(data) ? data.length : 0;
      const spacerocksToCreate = 1; // Always create exactly 1 spacerock per round
      
      spaceRocksCount = spacerocksToCreate;
      console.log(`Creating ${spaceRocksCount} spacerock per round (existing on-chain: ${existingCount})`);
      
      // Generate spacerock positions and colors
      spaceRocks = [];
      const worldWidth = 6000;
      const worldHeight = 4000;
      
      for (let i = 0; i < spacerocksToCreate; i++) { // Only create 1 spacerock
        // Generate random position (avoiding walls and center areas)
        let x, y;
        do {
          x = Math.round((Math.floor(Math.random() * (worldWidth - 200)) + 100) / 10) * 10;
          y = Math.round((Math.floor(Math.random() * (worldHeight - 200)) + 100) / 10) * 10;
        } while (isTooCloseToWalls(x, y, 150) || 
                (x > 800 && x < 1200 && y > 600 && y < 1000) || // Avoid center area
                (x > 1800 && x < 2200 && y > 1300 && y < 1700) || // Avoid wall areas
                (x > 3300 && x < 3700 && y > 1800 && y < 2200) ||
                (x > 4300 && x < 4700 && y > 800 && y < 1200) ||
                (x > 3800 && x < 4200 && y > 2800 && y < 3200) ||
                (x > 300 && x < 700 && y > 1800 && y < 2200));
        
        // Calculate color based on last 6 digits of block hash and spacerock number
        const hexColor = latestBlockHash.slice(-6);
        const numberOffset = (i * 7) % 6; // Use spacerock number to vary the color
        const adjustedHex = hexColor.slice(numberOffset) + hexColor.slice(0, numberOffset);
        const color = `#${adjustedHex}`;
        
        // Space Rock number is existing count + 1 (so if 0 existing, start with #1)
        const spacerockNumber = existingCount+1;
        
        spaceRocks.push({
          x,
          y,
          number: spacerockNumber,
          color,
          outpoint: `spacerock_${spacerockNumber}` // Placeholder outpoint until created on-chain
        });
      }
      
      console.log(`Generated ${spaceRocks.length} spacerock positions`);
      console.log('=== END FETCHING SPACEROCK METADATA ===');
    } else {
      console.log('No block data available - not creating any spacerocks');
      spaceRocks = [];
      spaceRocksCount = 0;
    }
  } catch (error) {
    console.error('Error fetching spacerocks:', error);
    console.log('API error occurred - not creating any spacerocks');
    spaceRocks = [];
    spaceRocksCount = 0;
    latestBlockHash = '';
    latestBlockHeight = 0;
  }
};



function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Wall definitions (same as client-side)
const walls = [
  { x: 1000, y: 800, width: 50, height: 800 },
  { x: 2000, y: 1500, width: 50, height: 600 },
  { x: 3500, y: 2000, width: 50, height: 700 },
  { x: 4500, y: 1000, width: 50, height: 600 },
  { x: 4000, y: 3000, width: 50, height: 500 },
  { x: 500, y: 2000, width: 50, height: 800 }
];

// Function to check if a position is too close to walls
function isTooCloseToWalls(x: number, y: number, minDistance: number = 100): boolean {
  for (const wall of walls) {
    // Check if position is within minimum distance of any wall
    if (x >= wall.x - minDistance && 
        x <= wall.x + wall.width + minDistance &&
        y >= wall.y - minDistance && 
        y <= wall.y + wall.height + minDistance) {
      return true;
    }
  }
  return false;
}

// Function to check if a position is too close to other players
function isTooCloseToPlayers(x: number, y: number, players: PlayersArray[], minDistance: number = 150): boolean {
  for (const player of players) {
    const distance = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
    if (distance < minDistance) {
      return true;
    }
  }
  return false;
}

// Function to generate a safe spawn position
function generateSafeSpawnPosition(players: PlayersArray[]): { x: number, y: number } {
  const maxAttempts = 100;
  const worldWidth = 6000;
  const worldHeight = 4000;
  const playerSize = 50;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate random position (rounded to nearest 10 for grid alignment)
    const x = Math.round((Math.floor(Math.random() * (worldWidth - playerSize)) + playerSize/2) / 10) * 10;
    const y = Math.round((Math.floor(Math.random() * (worldHeight - playerSize)) + playerSize/2) / 10) * 10;
    
    // Check if position is safe (not too close to walls or other players)
    if (!isTooCloseToWalls(x, y) && !isTooCloseToPlayers(x, y, players)) {
      return { x, y };
    }
  }
  
  // If we can't find a safe position after max attempts, return a fallback position
  console.log('Warning: Could not find safe spawn position, using fallback');
  return { x: 100, y: 100 };
}

setInterval(function () {
let playerslength = players.length;
if (playerslength > 0) {
  const rndInt = randomIntFromInterval(0, playerslength-1);
  console.log(rndInt + " = new chaser position");
  console.log(players[rndInt])
  console.log(Date.now().toLocaleString())
  chaserposition = rndInt;
  
  // Update chaser position to a safe location
  if (players[chaserposition]) {
    const safePosition = generateSafeSpawnPosition(players);
    players[chaserposition].x = safePosition.x;
    players[chaserposition].y = safePosition.y;
    console.log(`Moved chaser to safe position: ${safePosition.x}, ${safePosition.y}`);
  }
}
}, 30000);

tagIo.on("connection", (socket) => {
  console.log("client connected: ", socket.id)
  connectedUsers++;

    //players disconnect
    socket.on('disconnect', (reason) => {
      connectedUsers--;

      // Find the player by socket.id
      const disconnectingPlayer = players.find(player => player.id === socket.id);

      // Remove by socket.id (existing logic)
      players = players.filter(player => player.id !== socket.id);

      // ALSO: Remove any player with the same outpoint (in case of refresh/duplicate)
      if (disconnectingPlayer) {
        players = players.filter(player => player.outpoint !== disconnectingPlayer.outpoint);

        // Clean up from tagged array
        const taggedIndex = tagged.indexOf(disconnectingPlayer.outpoint);
        if (taggedIndex !== -1) {
          tagged.splice(taggedIndex, 1);
        }

        // Clean up bucket assignments
        for (const [address, sockId] of addressToSocketMap.entries()) {
          if (address === disconnectingPlayer.owneraddress) {
            addressToSocketMap.delete(address);
          }
        }
        for (const [sockId, bucketIndex] of bucketAssignments.entries()) {
          if (sockId === socket.id) {
            bucketAssignments.delete(sockId);
          }
        }
      }

      //emit new players list
      tagIo.emit('newPlayer', players);
      console.log('User disconnected');
      console.log(reason)
    });

    // Check if this connecting player already exists in the players array (after server restart)
    // and ensure they have a bucket assignment
    const existingPlayer = players.find(player => player.id === socket.id);
    if (existingPlayer && !bucketAssignments.has(socket.id)) {
      console.log(`Player ${socket.id} reconnected after server restart, assigning bucket...`);
      
      // Find an available bucket
      const assignedBucketIndices = new Set<number>();
      bucketAssignments.forEach((bucketIndex, playerSocketId) => {
        assignedBucketIndices.add(bucketIndex);
      });
      
      const availableBucketIndices = bucketFoxes
        .map((bucket, index) => ({ bucket, index }))
        .filter(({ bucket, index }) => bucket.bucket !== 'empty' && !assignedBucketIndices.has(index))
        .map(({ index }) => index);
      
      if (availableBucketIndices.length > 0) {
        const randomAvailableIndex = Math.floor(Math.random() * availableBucketIndices.length);
        const bucketIndex = availableBucketIndices[randomAvailableIndex];
        
        bucketAssignments.set(socket.id, bucketIndex);
        addressToSocketMap.set(existingPlayer.owneraddress, socket.id);
        
        socket.emit('playerAssignedBucket', {
          playerId: socket.id,
          bucketIndex: bucketIndex
        });
        
        tagIo.emit('playerBucketAssigned', {
          playerId: socket.id,
          playerOutpoint: existingPlayer.outpoint,
          bucketIndex: bucketIndex
        });
        
        console.log(`Reassigned bucket ${bucketIndex} to reconnected player ${socket.id}`);
      }
    }

    //watching
    tagIo.emit('newPlayer', players);

      socket.on('playing', function (data) {
        console.log('Player outpoint:', data.outpoint);
        console.log('Player owner:', data.owneraddress);
        console.log(data + " = new player data prejoin")

        // NEW: Remove any existing player with the same outpoint (cleanup)
        const existingPlayerIndex = players.findIndex(player => player.outpoint === data.outpoint);
        if (existingPlayerIndex !== -1) {
          console.log(`Removing stale player with outpoint: ${data.outpoint}`);
          players.splice(existingPlayerIndex, 1);
          
          // Also remove from tagged array if they were tagged
          const taggedIndex = tagged.indexOf(data.outpoint);
          if (taggedIndex !== -1) {
            tagged.splice(taggedIndex, 1);
            console.log(`Removed ${data.outpoint} from tagged array`);
          }
          
          // Clean up bucket assignment
          for (const [address, sockId] of addressToSocketMap.entries()) {
            if (address === data.owneraddress) {
              addressToSocketMap.delete(address);
            }
          }
          for (const [sockId, bucketIndex] of bucketAssignments.entries()) {
            const player = players.find(p => p.id === sockId);
            if (player && player.outpoint === data.outpoint) {
              bucketAssignments.delete(sockId);
            }
          }
        }
    
        //alreadytagged emit if player already playing and not in tagged array
        const alreadyplaying = players.find(player => player.outpoint === data.outpoint);
        if (alreadyplaying){
          console.log("can't play, already playing = " + data.outpoint)
          socket.emit('alreadytagged')
          return; // Exit early if already playing
        }

        // Assign a bucket to this player (only for actual players, not spectators)
        console.log('=== ASSIGNING BUCKET TO PLAYER ===');
        console.log('Player socket ID:', socket.id);
        console.log('Player outpoint:', data.outpoint);
        
        // Check if this player already has a bucket assignment
        if (!bucketAssignments.has(socket.id)) {
          // Find an available bucket (not empty and not already assigned)
          const assignedBucketIndices = new Set<number>(); // Track assigned bucket indices
          
          // Get currently assigned buckets from existing players
          bucketAssignments.forEach((bucketIndex, playerSocketId) => {
            assignedBucketIndices.add(bucketIndex);
          });
          
          // Find available bucket indices (not empty and not already assigned)
          const availableBucketIndices = bucketFoxes
            .map((bucket, index) => ({ bucket, index }))
            .filter(({ bucket, index }) => bucket.bucket !== 'empty' && !assignedBucketIndices.has(index))
            .map(({ index }) => index);
          
          if (availableBucketIndices.length > 0) {
            const randomAvailableIndex = Math.floor(Math.random() * availableBucketIndices.length);
            const bucketIndex = availableBucketIndices[randomAvailableIndex];
            
            // Track this assignment
            bucketAssignments.set(socket.id, bucketIndex);
            addressToSocketMap.set(data.owneraddress, socket.id);
            
            // Send bucket assignment to this specific player (just the index)
            socket.emit('playerAssignedBucket', {
              playerId: socket.id,
              bucketIndex: bucketIndex
            });
            
            console.log(`Assigned bucket ${bucketIndex} to player ${socket.id} (outpoint: ${data.outpoint})`);
            
            // Broadcast to all clients that this player was assigned a bucket (just the index)
            tagIo.emit('playerBucketAssigned', {
              playerId: socket.id,
              playerOutpoint: data.outpoint,
              bucketIndex: bucketIndex
            });
          } else {
            console.log('No available buckets to assign');
          }
        } else {
          console.log(`Player ${socket.id} already has bucket assignment: ${bucketAssignments.get(socket.id)}`);
          
          // Re-send the existing bucket assignment to this player
          const existingBucketIndex = bucketAssignments.get(socket.id);
          socket.emit('playerAssignedBucket', {
            playerId: socket.id,
            bucketIndex: existingBucketIndex
          });
          
          // Re-broadcast to all clients
          tagIo.emit('playerBucketAssigned', {
            playerId: socket.id,
            playerOutpoint: data.outpoint,
            bucketIndex: existingBucketIndex
          });
        }
        console.log('=== END BUCKET ASSIGNMENT ===');
    
        //get players
        tagIo.emit('newPlayer', players);
    
        //long update can tag, needs to change?
        const updateCanTag = function () {
          if (!canTag) {
            setTimeout(() => {
              canTag = true;
            }, 15000);
          }
          return canTag;
        }
    
    
        //collision code good
        const collision = function (player: PlayersArray, chaser: PlayersArray) {
          if (player.id !== chaser.id) {
            
            // Prevent foxes with the same pixel fox name from tagging each other
            if (player.foxname === chaser.foxname) {
              return false;
            }
            
            if (player.x < chaser.x + chaser.width) {
              if (player.x + player.width > chaser.x) {
                if (player.y < chaser.y + chaser.height) {
                  if (player.y + player.height > chaser.y) {
                    canTag = false;
                    activity = {
                      taggerowneraddress: chaser.owneraddress,
                      taggeroutpoint: chaser.outpoint,
                      taggercurrentoutpoint: chaser.currentoutpoint,                  
                      taggerfoxname: chaser.foxname,
                      taggerimage: chaser.image,
                      taggerimagelink: chaser.imagelink,
                      taggeeowneraddress: player.owneraddress,
                      taggeeoutpoint: player.outpoint,
                      taggeecurrentoutpoint: player.currentoutpoint,
                      taggeefoxname: player.foxname,
                      taggeeimage: player.image,
                      taggeeimagelink: player.imagelink,
                      time: Date.now(),
                      txid: "getting txid",
                      gamenumber: currentTagGameCount + 1 // Add the next game number
                    };
                    console.log(activity)
                    // Add to tagged array
                    tagged.push(activity.taggeeoutpoint);
                    
                    // Move chaser to a safe position after tagging
                    const safePosition = generateSafeSpawnPosition(players.filter(p => p.id !== chaser.id));
                    chaser.x = safePosition.x;
                    chaser.y = safePosition.y;
                    console.log(`Chaser moved to safe position after tagging: ${safePosition.x}, ${safePosition.y}`);
                    
                    return true;
                  }
                }
              }
            }
          }
          return false;
        }
        //upload activity function, good
        const uploadActivity = async () => {
          // Create tag inscription
          const tagResult = await createTagInscription(activity);
          console.log(tagResult) + "= tagResult"
          
          // Get the taggee's bucket assignment to find the correct outpoints
          const taggeeSocketId = addressToSocketMap.get(activity.taggeeowneraddress);
          const taggeeBucketIndex = taggeeSocketId ? bucketAssignments.get(taggeeSocketId) : undefined;
          console.log(`Taggee address: ${activity.taggeeowneraddress}, socket ID: ${taggeeSocketId}, bucket index: ${taggeeBucketIndex}`);
          let taggeeOutpoints: string[] = [];
          
          if (taggeeBucketIndex !== undefined && bucketFoxes[taggeeBucketIndex]) {
            const taggeeBucket = bucketFoxes[taggeeBucketIndex];
            
            if (taggeeBucket.bucket === '1x') {
              // For 1x buckets, use the single fox outpoint
              taggeeOutpoints = [taggeeBucket.outpoint];
            } else if (taggeeBucket.groupFoxes) {
              // For group buckets, use all the group fox outpoints
              taggeeOutpoints = taggeeBucket.groupFoxes.map(fox => fox.outpoint);
            }
            
            console.log(`Taggee bucket ${taggeeBucketIndex}: ${taggeeBucket.bucket} bucket with ${taggeeOutpoints.length} outpoints`);
            
            // Only get bounty foxes if we have valid outpoints from the bucket assignment
            const bountyResult = await getBountyFoxes(activity.taggerowneraddress, taggeeOutpoints);
            
            // If bounty foxes were found, update the activity with bounty metadata
            if (bountyResult && bountyResult.status === "broadcast successful" && bountyResult.bountyFoxes > 0) {
              // Get the bucket information for enhanced metadata
              const taggeeBucket = bucketFoxes[taggeeBucketIndex];
              
              // Update the activity with bounty transaction txid
              if (bountyResult.txid) {
                activity.txid = bountyResult.txid; // Use bounty transaction txid instead of tag txid
              }
              
              activity.bountyFoxesMetadata = {
                bountyFoxes: taggeeOutpoints, // Use the outpoints that were sent to get bounty foxes
                totalBountyFoxes: bountyResult.bountyFoxes,
                taggerRewarded: bountyResult.taggerRewarded || false,
                // Add bucket information for frontend display
                bucketType: taggeeBucket.bucket,
                bucketName: taggeeBucket.name,
                bucketImage: taggeeBucket.img,
                groupName: taggeeBucket.groupName,
                groupLink: taggeeBucket.groupLink,
                groupOutpoint: taggeeBucket.groupOutpoint,
                groupFoxes: taggeeBucket.groupFoxes || [],
                // Add individual fox information for 1x buckets
                foxName: taggeeBucket.foxName,
                pixelFoxName: taggeeBucket.pixelFoxName,
                originOutpoint: taggeeBucket.originOutpoint
              };
              
              // Emit bounty fox activity to all clients for Latest Transactions
              console.log('=== EMITTING BOUNTY FOX ACTIVITY ===');
              console.log('Activity object:', JSON.stringify(activity, null, 2));
              console.log('Bounty metadata:', JSON.stringify((activity as any).bountyFoxesMetadata, null, 2));
              console.log('Emitting to all clients via tagIo.emit...');
              tagIo.emit('bountyFoxActivity', activity);
              console.log('=== BOUNTY FOX ACTIVITY EMITTED ===');
              
              console.log(`Bounty foxes found for tagger: ${bountyResult.bountyFoxes} foxes`);
              console.log(`Bucket type: ${taggeeBucket.bucket}, Name: ${taggeeBucket.name}`);
            }
          } else {
            // No bucket assignment found - taggee has no bounty foxes, so don't check for bounty foxes
            console.log(`No bucket assignment found for taggee ${activity.taggeeowneraddress} - no bounty foxes to check`);
          }
          
          updateCanTag();
        }
    
    
        //updates chaser if cantag === true
        //update chaser is what checks for collision and swaps it 
        const updateChaser = async () => {
          if (players.length === 1) {
            chaser = players[0];
            tagIo.emit('newChaser', chaser.id);
          } else {
            if(players[chaserposition]){
              chaser = players[chaserposition];
              tagIo.emit('newChaser', chaser.id);
            }
          }
    
          // Changed this part to properly handle collisions
          for (const player of players) {
            if (collision(player, chaser)) {
              tagIo.emit('awaitingActivity', activity);
              uploadActivity();
              return;
            }
          }
        }
    
        //happens for every time any player updates, seems excessive
        const updatePlayers = function (thisPlayer: PlayersArray) {
          const foundPlayer = players.find(player => player.outpoint === thisPlayer.outpoint);
          if (!foundPlayer) {
            if (tagged.includes(thisPlayer.outpoint)) {
              console.log("can't play, already tagged = " + thisPlayer.outpoint)
              socket.emit('alreadytagged')
              //perhaps disconnect here
              // socket.disconnect();
            } else {
              // Generate safe spawn position for new player
              const safePosition = generateSafeSpawnPosition(players);
              thisPlayer.x = safePosition.x;
              thisPlayer.y = safePosition.y;
              console.log(`New player spawned at safe position: ${safePosition.x}, ${safePosition.y}`);
              
              players.push(thisPlayer);
              console.log(players)
              tagIo.emit('newPlayer', players);
            }
          }
    
          //have this updating on an interval every 30 seconds instead
          if (canTag) {
            updateChaser();
          }
    
          //don't understand this, trying by outpoint
          var foundIndex = players.findIndex(player => player.outpoint === thisPlayer.outpoint);
          //why
          if (foundIndex >= 0) {
            players[foundIndex] = thisPlayer;
          }
          //removes duplicates
          players = lodash.uniqBy(players, 'outpoint');
        }
    
    
    
    
        //happens on every update players
        socket.on('updatePlayer', thisPlayer => {
          updatePlayers(thisPlayer);
          
          // Check for projectile collisions
          if (thisPlayer.projectiles) {
            thisPlayer.projectiles.forEach((projectile: Projectile, index: number) => {
              players.forEach((player) => {
                if (player.id !== thisPlayer.id) { // Don't collide with self
                  // Prevent foxes with the same pixel fox name from tagging each other
                  if (player.foxname === thisPlayer.foxname) {
                    return; // Skip this collision check
                  }
                  
                  // Calculate collision box for player
                  const playerLeft = player.x - player.width/2;
                  const playerRight = player.x + player.width/2;
                  const playerTop = player.y - player.height/2;
                  const playerBottom = player.y + player.height/2;
                  
                  // Check if projectile is within player bounds
                  if (projectile.x >= playerLeft && 
                      projectile.x <= playerRight && 
                      projectile.y >= playerTop && 
                      projectile.y <= playerBottom) {
                    
                    // Create activity object for the hit
                    const activity = {
                      taggerowneraddress: thisPlayer.owneraddress,
                      taggeroutpoint: thisPlayer.outpoint,
                      taggercurrentoutpoint: thisPlayer.currentoutpoint,
                      taggerfoxname: thisPlayer.foxname,
                      taggerimage: thisPlayer.image,
                      taggerimagelink: thisPlayer.imagelink,
                      taggeeowneraddress: player.owneraddress,
                      taggeeoutpoint: player.outpoint,
                      taggeecurrentoutpoint: player.currentoutpoint,
                      taggeefoxname: player.foxname,
                      taggeeimage: player.image,
                      taggeeimagelink: player.imagelink,
                      time: Date.now(),
                      txid: "getting txid",
                      gamenumber: currentTagGameCount + 1 // Add the next game number
                    };
                    
                    // Remove projectile
                    thisPlayer.projectiles.splice(index, 1);
                    
                    // Add to tagged array
                    tagged.push(activity.taggeeoutpoint);
                    
                    // Move shooter to a safe position after successful hit
                    const safePosition = generateSafeSpawnPosition(players.filter(p => p.id !== thisPlayer.id));
                    thisPlayer.x = safePosition.x;
                    thisPlayer.y = safePosition.y;
                    console.log(`Shooter moved to safe position after hit: ${safePosition.x}, ${safePosition.y}`);
                    
                    // First show the activity screen
                    tagIo.emit('awaitingActivity', activity);
                    
                    // Create tag inscription and get bounty foxes simultaneously
                    createTagInscription(activity).then(() => {
                      // After inscription is created, get bounty foxes using correct outpoints
                      const taggeeSocketId = addressToSocketMap.get(activity.taggeeowneraddress);
                      const taggeeBucketIndex = taggeeSocketId ? bucketAssignments.get(taggeeSocketId) : undefined;
                      console.log(`Projectile hit - Taggee address: ${activity.taggeeowneraddress}, socket ID: ${taggeeSocketId}, bucket index: ${taggeeBucketIndex}`);
                      let taggeeOutpoints: string[] = [];
                      
                      if (taggeeBucketIndex !== undefined && bucketFoxes[taggeeBucketIndex]) {
                        const taggeeBucket = bucketFoxes[taggeeBucketIndex];
                        
                        if (taggeeBucket.bucket === '1x') {
                          // For 1x buckets, use the single fox outpoint
                          taggeeOutpoints = [taggeeBucket.outpoint];
                        } else if (taggeeBucket.groupFoxes) {
                          // For group buckets, use all the group fox outpoints
                          taggeeOutpoints = taggeeBucket.groupFoxes.map(fox => fox.outpoint);
                        }
                        
                        console.log(`Projectile hit - Taggee bucket ${taggeeBucketIndex}: ${taggeeBucket.bucket} bucket with ${taggeeOutpoints.length} outpoints`);
                        
                        // Only get bounty foxes if we have valid outpoints from the bucket assignment
                        return getBountyFoxes(activity.taggerowneraddress, taggeeOutpoints).then(result => ({
                          bountyResult: result,
                          taggeeOutpoints: taggeeOutpoints,
                          taggeeBucketIndex: taggeeBucketIndex
                        }));
                      } else {
                        // No bucket assignment found - taggee has no bounty foxes, so don't check for bounty foxes
                        console.log(`Projectile hit - No bucket assignment found for taggee ${activity.taggeeowneraddress} - no bounty foxes to check`);
                        return { bountyResult: null, taggeeOutpoints: [], taggeeBucketIndex: -1 }; // Return null to skip bounty fox processing
                      }
                    }).then(({ bountyResult, taggeeOutpoints, taggeeBucketIndex }) => {
                      // If bounty foxes were found, update the activity with bounty metadata
                      if (bountyResult && bountyResult.status === "broadcast successful" && bountyResult.bountyFoxes > 0 && taggeeBucketIndex >= 0) {
                        // Get the bucket information for enhanced metadata
                        const taggeeBucket = bucketFoxes[taggeeBucketIndex];
                        
                        // Update the activity with bounty transaction txid
                        if (bountyResult.txid) {
                          activity.txid = bountyResult.txid; // Use bounty transaction txid instead of tag txid
                        }
                        
                        (activity as any).bountyFoxesMetadata = {
                          bountyFoxes: taggeeOutpoints, // Use the outpoints that were sent to get bounty foxes
                          totalBountyFoxes: bountyResult.bountyFoxes,
                          taggerRewarded: bountyResult.taggerRewarded || false,
                          // Add bucket information for frontend display
                          bucketType: taggeeBucket.bucket,
                          bucketName: taggeeBucket.name,
                          bucketImage: taggeeBucket.img,
                          groupName: taggeeBucket.groupName,
                          groupLink: taggeeBucket.groupLink,
                          groupOutpoint: taggeeBucket.groupOutpoint,
                          groupFoxes: taggeeBucket.groupFoxes || [],
                          // Add individual fox information for 1x buckets
                          foxName: taggeeBucket.foxName,
                          pixelFoxName: taggeeBucket.pixelFoxName,
                          originOutpoint: taggeeBucket.originOutpoint
                        };
                        
                        // Emit bounty fox activity to all clients for Latest Transactions
                        console.log('=== EMITTING BOUNTY FOX ACTIVITY ===');
                        console.log('Activity object:', JSON.stringify(activity, null, 2));
                        console.log('Bounty metadata:', JSON.stringify((activity as any).bountyFoxesMetadata, null, 2));
                        console.log('Emitting to all clients via tagIo.emit...');
                        tagIo.emit('bountyFoxActivity', activity);
                        console.log('=== BOUNTY FOX ACTIVITY EMITTED ===');
                        
                        console.log(`Bounty foxes found for tagger: ${bountyResult.bountyFoxes} foxes`);
                        console.log(`Bucket type: ${taggeeBucket.bucket}, Name: ${taggeeBucket.name}`);
                      }
                    }).catch((error) => {
                      console.error('Error in tag inscription or bounty fox check:', error);
                    });
                    
                    updateCanTag();
                    // Don't remove the player immediately - let the client handle that after showing the activity
                  }
                }
              });
            });
          }
          
          // Check for spacerock collisions
          if (spaceRocks.length > 0) {
            // Calculate collision box for the player
            const playerLeft = thisPlayer.x - thisPlayer.width/2;
            const playerRight = thisPlayer.x + thisPlayer.width/2;
            const playerTop = thisPlayer.y - thisPlayer.height/2;
            const playerBottom = thisPlayer.y + thisPlayer.height/2;
            
            // Check collision with each spacerock
            for (let i = spaceRocks.length - 1; i >= 0; i--) {
              const spacerock = spaceRocks[i];
              const spacerockSize = 100; // Same size as client-side
              const spacerockLeft = spacerock.x - spacerockSize/2;
              const spacerockRight = spacerock.x + spacerockSize/2;
              const spacerockTop = spacerock.y - spacerockSize/2;
              const spacerockBottom = spacerock.y + spacerockSize/2;
              
              // Check if player collides with spacerock
              if (playerRight >= spacerockLeft && 
                  playerLeft <= spacerockRight && 
                  playerBottom >= spacerockTop && 
                  playerTop <= spacerockBottom) {
                
                // Log the collision on server
                console.log(`🚀 SPACEROCK COLLISION: Player ${thisPlayer.foxname} (${thisPlayer.owneraddress}) collided with Space Rock #${spacerock.number} at position (${spacerock.x}, ${spacerock.y})`);
                
                // Remove the spacerock from the array
                const removedSpacerock = spaceRocks.splice(i, 1)[0];
                
                // Create spacerock activity for Latest Transactions with initial metadata
                const spacerockActivity = {
                  taggerowneraddress: thisPlayer.owneraddress,
                  taggeroutpoint: thisPlayer.outpoint,
                  taggercurrentoutpoint: thisPlayer.currentoutpoint,
                  taggerfoxname: thisPlayer.foxname,
                  taggerimage: thisPlayer.image,
                  taggerimagelink: thisPlayer.imagelink,
                  taggeeowneraddress: "Space Rock #" + removedSpacerock.number,
                  taggeeoutpoint: removedSpacerock.outpoint,
                  taggeecurrentoutpoint: removedSpacerock.outpoint,
                  taggeefoxname: "Space Rock #" + removedSpacerock.number,
                  taggeeimage: "https://ordfs.network/content/" + removedSpacerock.outpoint,
                  taggeeimagelink: "https://alpha.1satordinals.com/outpoint/" + removedSpacerock.outpoint + "/inscription",
                  time: Date.now(),
                  txid: "getting txid",
                  spacerockMetadata: {
                    color: removedSpacerock.color,
                    blockHeight: "Latest", // Will be updated with actual block height
                    blockHash: latestBlockHash,
                    spacerockName: "Space Rock #" + removedSpacerock.number
                  }
                };
                
                // Don't emit immediately - wait for inscription creation
                
                // Call createspacerock endpoint with player's ordinal address
                createSpaceRockInscription(thisPlayer.owneraddress, removedSpacerock)
                  .then((result) => {
                    if (result.txid) {
                      // Check if your server got more current block data
                      if (result.hasFreshData && result.updatedBlockHeight && result.updatedBlockHash && result.updatedColor) {
                        console.log(`🔄 Updating spacerock data with fresh block information:`);
                        console.log(`   Old block height: ${latestBlockHeight} -> New: ${result.updatedBlockHeight}`);
                        console.log(`   Old block hash: ${latestBlockHash.slice(-6)} -> New: ${result.updatedBlockHash.slice(-6)}`);
                        console.log(`   Old color: ${removedSpacerock.color} -> New: ${result.updatedColor}`);
                        
                        // Update foxlive's global block data
                        latestBlockHeight = result.updatedBlockHeight;
                        latestBlockHash = result.updatedBlockHash;
                        
                        // Update the spacerock color in the activity data
                        removedSpacerock.color = result.updatedColor;
                      }
                      
                      // Create the final spacerock activity with complete data
                      const finalSpacerockActivity = {
                        ...spacerockActivity,
                        txid: result.txid,
                        time: result.time || Date.now(),
                        spacerockMetadata: {
                          color: result.color || spacerockActivity.spacerockMetadata?.color,
                          blockHeight: result.blockHeight || result.bl0ckheight || spacerockActivity.spacerockMetadata?.blockHeight,
                          blockHash: result.blockHash || result.bl0ckhash || spacerockActivity.spacerockMetadata?.blockHash,
                          spacerockName: result.spacerockName || spacerockActivity.spacerockMetadata?.spacerockName
                        }
                      };
                      
                      // Emit the spacerock activity with complete data to all clients
                      tagIo.emit('spacerockActivity', finalSpacerockActivity);
                      
                      // Broadcast spacerock collision with txid to all clients
                      tagIo.emit('spacerockCollision', {
                        playerId: thisPlayer.id,
                        playerFoxname: thisPlayer.foxname,
                        playerAddress: thisPlayer.owneraddress,
                        spacerockNumber: removedSpacerock.number,
                        spacerockColor: result.color || removedSpacerock.color, // Use updated color if available
                        spacerockPosition: { x: removedSpacerock.x, y: removedSpacerock.y },
                        collisionTime: Date.now(),
                        txid: result.txid,
                        spacerockMetadata: {
                          color: result.color,
                          blockHeight: result.blockHeight || result.bl0ckheight,
                          blockHash: result.blockHash || result.bl0ckhash,
                          spacerockName: result.spacerockName
                        }
                      });
                      
                      console.log(`SpaceRock inscription created with txid: ${result.txid}`);
                      console.log('SpaceRock metadata:', result);
                    } else if (result.error === "Block data unavailable" && result.retryable) {
                      console.log('Block data unavailable - spacerock will be available for next player');
                      
                      // Don't emit spacerock activity or collision - the spacerock stays in the game
                      // The spacerock will be available for the next player who collides with it
                      console.log(`Space Rock #${removedSpacerock.number} remains available for next player`);
                      
                    } else if (result.error === "UTXO unavailable" && result.retryable) {
                      console.log(`UTXO unavailable for Space Rock #${removedSpacerock.number} - spacerock may have already been claimed`);
                      
                      // Don't emit spacerock activity or collision - the spacerock stays in the game
                      // The spacerock will be available for the next player who collides with it
                      console.log(`Space Rock #${removedSpacerock.number} remains available for next player`);
                      
                    } else {
                      console.error('Failed to create spacerock inscription:', result.message);
                      
                      // Emit spacerock activity with initial data even if inscription fails
                      tagIo.emit('spacerockActivity', spacerockActivity);
                      
                      // Broadcast spacerock collision without txid
                      tagIo.emit('spacerockCollision', {
                        playerId: thisPlayer.id,
                        playerFoxname: thisPlayer.foxname,
                        playerAddress: thisPlayer.owneraddress,
                        spacerockNumber: removedSpacerock.number,
                        spacerockColor: removedSpacerock.color,
                        spacerockPosition: { x: removedSpacerock.x, y: removedSpacerock.y },
                        collisionTime: Date.now()
                      });
                    }
                  })
                  .catch((error) => {
                    console.error('Error in spacerock inscription creation:', error);
                    
                    // Emit spacerock activity with initial data even if inscription fails
                    tagIo.emit('spacerockActivity', spacerockActivity);
                    
                    // Broadcast spacerock collision without txid
                    tagIo.emit('spacerockCollision', {
                      playerId: thisPlayer.id,
                      playerFoxname: thisPlayer.foxname,
                      playerAddress: thisPlayer.owneraddress,
                      spacerockNumber: removedSpacerock.number,
                      spacerockColor: removedSpacerock.color,
                      spacerockPosition: { x: removedSpacerock.x, y: removedSpacerock.y },
                      collisionTime: Date.now()
                    });
                  });
                
                // Update spacerock count
                spaceRocksCount = spaceRocks.length;
                
                // Broadcast updated spacerock data to all clients
                tagIo.emit('spaceRocksData', {
                  spaceRocks,
                  spaceRocksCount,
                  latestBlockHash
                });
                
                console.log(`Space Rock #${removedSpacerock.number} removed. Remaining spacerocks: ${spaceRocks.length}`);
                break; // Only remove one spacerock per collision
              }
            }
          }
          
          tagIo.emit('updatePlayers', players);
        })
      }); //end playing


  // Add type for projectile
  type Projectile = {
    x: number;
    y: number;
    dir: number;
    speed: number;
  }

  // Add socket handler for new projectiles
  socket.on('newProjectile', (projectile: Projectile) => {
    const player = players.find(p => p.id === socket.id);
    if (player) {
      if (!player.projectiles) {
        player.projectiles = [];
      }
      player.projectiles.push(projectile);
      tagIo.emit('updatePlayers', players);
    }
  });

  // Handle projectile wall collisions
  socket.on('projectileHitWall', () => {
    tagIo.emit('projectileHitWallBroadcast');
  });


  // Send bucket data to the client when they connect
  console.log('=== TAG CLIENT CONNECTED ===');
  console.log('Client socket ID:', socket.id);
  console.log('Current bucket foxes:', bucketFoxes);
  console.log('Available foxes count:', available.length);
  console.log('Current tag game count:', currentTagGameCount);
  
  // Send all bucket foxes data to the client (both spectators and players)
  socket.emit('bucketFoxesData', {
    bucketFoxes,
    availableCount: available.length,
    totalBuckets: bucketFoxes.length
  });

  // Send spacerock data to the client
  socket.emit('spaceRocksData', {
    spaceRocks,
    spaceRocksCount,
    latestBlockHash
  });

  // Send current tag game number to the client
  socket.emit('tagGameNumber', { 
    epoch: 1, 
    gameNumber: currentTagGameCount + 1 // Next game number (current count + 1)
  });

  console.log('Sent bucket foxes data to client');
  console.log('Sent spacerock data to client');
  console.log('Sent tag game number to client');
  console.log('=== END TAG CLIENT CONNECTION ===');

  // Send all current bucket assignments to new client when they connect
  bucketAssignments.forEach((bucketIndex, playerSocketId) => {
    const assignedPlayer = players.find(player => player.id === playerSocketId);
    if (assignedPlayer) {
      socket.emit('playerBucketAssigned', {
        playerId: playerSocketId,
        playerOutpoint: assignedPlayer.outpoint,
        bucketIndex: bucketIndex
      });
    }
  });
});//end on connect for tag

// Spacerock system now initialized with bounty foxes on server start

// Add continuous refresh interval for game data
const REFRESH_INTERVAL = 30000; // 30 seconds

// Track if server is already initialized
let serverInitialized = false;

// Initialize the server
const initializeServer = async () => {
  if (serverInitialized) {
    console.log('Server already initialized, skipping...');
    return;
  }
  
  console.log('=== INITIALIZING FOXLIVE SERVER ===');
  
  try {
    // Initialize bucket foxes
    console.log('Initializing bucket foxes...');
    await generateBucketFoxes();
    
    // Initialize spacerocks
    console.log('Initializing spacerocks...');
    await fetchSpaceRocks();
    
    // Initialize tag game count
    console.log('Initializing tag game count...');
    currentTagGameCount = await fetchTagGameCount();
    console.log(`Initial tag game count: ${currentTagGameCount}`);
    
    serverInitialized = true;
    console.log('=== FOXLIVE SERVER INITIALIZED SUCCESSFULLY ===');
    
    // Start continuous refresh interval
    setInterval(() => {
      console.log('=== PERIODIC GAME DATA REFRESH ===');
      refreshGameData();
    }, REFRESH_INTERVAL);
    
    console.log(`Started continuous refresh every ${REFRESH_INTERVAL/1000} seconds`);
  } catch (error) {
    console.error('Error initializing server:', error);
  }
};

// Check if server is already listening
if (!server.listening) {
  // Start the server
  server.listen(PORT, () => {
    console.log(`FoxLive server running on port ${PORT}`);
    console.log(`Tag game available at: http://localhost:${PORT}/tag`);
    
    // Initialize server data after server starts
    initializeServer();
  });
} else {
  console.log('Server is already listening on port', PORT);
}

// Add basic health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    players: players.length,
    spacerocks: spaceRocks.length,
    bucketFoxes: bucketFoxes.length
  });
});

// Add endpoint to get current game state
app.get('/game-state', (req: Request, res: Response) => {
  res.json({
    players: players.length,
    spacerocks: spaceRocks.length,
    bucketFoxes: bucketFoxes.length,
    availableFoxes: available.length,
    latestBlockHash: latestBlockHash
  });
});

console.log('FoxLive server setup complete');
