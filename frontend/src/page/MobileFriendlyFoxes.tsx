import { useState, useEffect, useRef } from "react";
import { FaucetPandaConnectButton } from "../components/FaucetPandaConnectButton";
import { ActualFaucet } from "../components/ActualFaucet";
import { MyOtherFox } from "../components/MyOtherFox";
import { ThreeCircles } from 'react-loader-spinner';
import { XLogoRight } from "../components/XLogoRight";
import FoxFilters from "../components/FoxFilters";
import FooterHome from "../components/FooterHome";
import {
  usePandaWallet,
  Addresses
} from "panda-wallet-provider";
import TemporaryDrawer from "../components/Drawer";
import { PulseLoader } from 'react-spinners';

import mobileFriendlyFoxesJson from "../assets/500MobileFriendlyFoxes.json";
import mobileFriendlyFoxesLogo from "../assets/mobile-friendly_foxes_logo.png";

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

type MobileFriendlyFoxesProps = {

}

export const MobileFriendlyFoxes = ({ }: MobileFriendlyFoxesProps) => {
  //loading for twins
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false); 
  const [preloaded, setPreLoaded] = useState<boolean>(true); 
  const [connectLoading, setConnectLoading] = useState<boolean>(false);
  const [numOwned, setNumOwned] = useState<number>(0);
  const [countLoading, setCountLoading] = useState<boolean>(true);
  const [newOutpoints, setNewOutpoints] = useState<string[]>([]);
  const [ownedOutpoints, setOwnedOutpoints] = useState<string[]>([]);
  const [newBucketTxid, setNewBucketTxid] = useState<string>("");
  const [newBucketTime, setNewBucketTime] = useState<number>(0);
  const [transactions, setTransactions] = useState<Array<{
    txid: string;
    time: number;
    type: string;
    outpointarray: string[];
    foxname: string;
    groupname: string;
  }>>([]);
  //use yours
  const wallet = usePandaWallet();
  const [pubKey, setPubKey] = useState<string | undefined>();
  const [addresses, setAddresses] = useState<Addresses | undefined>();
  const [ordaddress, setOrdAddress] = useState<string>();
  const [myordaddress, setMyOrdAddress] = useState<string | undefined>(""); 

  // Mobile wallet state
  const [mobileWalletAddress, setMobileWalletAddress] = useState<string>("");
  const [mobileWalletLoading, setMobileWalletLoading] = useState<boolean>(false);
  const [mobileWalletConnected, setMobileWalletConnected] = useState<boolean>(false);
  const [mobileWalletBackupPrompted, setMobileWalletBackupPrompted] = useState<boolean>(false);
  const [connectedWalletType, setConnectedWalletType] = useState<'yours' | 'mobile' | null>(null);

  // Popup state for custom alerts
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string>("");
  const [popupTitle, setPopupTitle] = useState<string>("");
  const [popupType, setPopupType] = useState<'info' | 'success' | 'error' | 'confirm' | 'wallet-connected' | 'wallet-created'>('info');
  const [popupCallback, setPopupCallback] = useState<(() => void) | null>(null);
  const [popupSecondaryCallback, setPopupSecondaryCallback] = useState<(() => void) | null>(null);

    //ordinalsstring for Foxes Child Component
    const [ordinalsstring, setOrdinalsString] = useState<string | undefined>();
    const [allUtxos, setAllUtxos] = useState<string>(JSON.stringify([]));

    //get fox loading screen
  const [setgettingfox, setGettingFox] = useState<boolean>(false);

    //filters var => search results
    const [faucetvar, setFaucetVar] = useState<boolean>(true);
    const [myvar, setMyVar] = useState<boolean>(false);
    const [demovar, setDemoVar] = useState<boolean>(false);

    //countdown completed var
    const [complete, setComplete] = useState<boolean>(false);

      //pass loading function to child
  const setCompleted = () => {
    setComplete(true);
  }

      // hide extra info with showgetfoxscreen
      const passedFunctionFoxLoadingScreen = (state: boolean) => {
        setGettingFox(state);
      }

  //useRefs
  const didMount1 = useRef(false);
  const didMount2 = useRef(false);
  const didMount3 = useRef(false);
  const didMount4 = useRef(false);
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  useEffect(() => {
    setOrdAddress("1QHi9Z3fmoUtASxjvFCsrFrp4wZPbRfpFJ")
  }, [])

    //go home 
    const goToIndex = async () => {
      window.location.href = "https://foxplorer.org/";
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
          setConnectedWalletType('mobile');
          
          // If on mobile device, automatically check fox ownership without showing popup
          if (isMobile) {
           // console.log('Mobile device detected, automatically checking fox ownership');
            checkMobileWalletFoxOwnership(ordAddress);
          } else {
            // Show wallet connected popup with clear options (desktop only)
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
          }
          
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
           // console.error('Error creating identity address:', error);
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
           // console.log('Created new identity key and address:', actualIdentityAddress);
          } catch (error) {
           // console.error('Error creating new identity key:', error);
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
       // console.log('Mobile wallet ord address:', ordAddress);
        setMobileWalletAddress(ordAddress);
        setMobileWalletConnected(true);
        setConnectedWalletType('mobile');
        
        // If on mobile device, automatically check fox ownership without showing popup
        if (isMobile) {
         // console.log('Mobile device detected, automatically checking fox ownership for new wallet');
          checkMobileWalletFoxOwnership(ordAddress);
        } else {
          // Prompt for backup only (desktop only)
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
        }
      } else {
        showCustomAlert("Connection Error", "Failed to get wallet address. Please try again.", "error");
      }
    } catch (error) {
     // console.error('Mobile wallet connection error:', error);
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
      
     // console.log('Cleared existing wallet data');
      
      // Reset mobile wallet state
      setMobileWalletAddress("");
      setMobileWalletConnected(false);
      setMobileWalletBackupPrompted(false);
      setConnectedWalletType(null);
      
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
           // console.error('Error creating identity address:', error);
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
           // console.log('Created new identity key and address:', actualIdentityAddress);
          } catch (error) {
           // console.error('Error creating new identity key:', error);
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
       // console.log('New mobile wallet ord address:', ordAddress);
        setMobileWalletAddress(ordAddress);
        setMobileWalletConnected(true);
        setConnectedWalletType('mobile');
        
        // If on mobile device, automatically check fox ownership without showing popup
        if (isMobile) {
        //  console.log('Mobile device detected, automatically checking fox ownership for new wallet');
          checkMobileWalletFoxOwnership(ordAddress);
        } else {
          // Prompt for backup only (desktop only)
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
        }
      } else {
        showCustomAlert("Creation Error", "Failed to create new wallet address. Please try again.", "error");
      }
    } catch (error) {
     // console.error('New wallet creation error:', error);
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
      
     // console.log(`Found ${imageInscriptions.length} potential foxes for mobile wallet`);
      
      // Set the mobile wallet address as the current address
      setMyOrdAddress(ordAddress);
      setMobileWalletAddress(ordAddress);
      setMobileWalletConnected(true);
      
    } catch (error) {
     // console.error('Error checking fox ownership:', error);
      // If we can't check ownership, still set the address
      setMyOrdAddress(ordAddress);
      setMobileWalletAddress(ordAddress);
      setMobileWalletConnected(true);
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
              
            //  console.log('Wallet restored successfully');
            //  console.log('Owner Address:', ownerAddress.toString());
            //  console.log('Pay Address:', payAddress.toString());
              
                    const ordAddress = ownerAddress.toString();
      setMobileWalletAddress(ordAddress);
      setMobileWalletConnected(true);
      setConnectedWalletType('mobile');
      
      // Check for fox ownership and set address
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
    setConnectedWalletType(null);
    setMyOrdAddress("");
    
   // console.log('Mobile wallet logged out successfully');
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

      // get ord address
  useEffect(() => {
    if (!didMount2.current) {
      didMount2.current = true;
      return;
    }
    if (addresses?.ordAddress) {
      setMyOrdAddress(addresses.ordAddress);
      setConnectedWalletType('yours');
      setConnectLoading(false);
      // Ensure loading state shows for at least 1 second
      const startTime = Date.now();
      const minimumLoadingTime = 1000; // 1 second in milliseconds
      
      const checkLoadingTime = () => {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime >= minimumLoadingTime) {
          setLoading(false);
          setLoaded(true);
        } else {
          setTimeout(checkLoadingTime, minimumLoadingTime - elapsedTime);
        }
      };
      
      checkLoadingTime();
    }
  }, [addresses]);

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
       
        }, [myordaddress]);

      // get ordinals string
      useEffect(() => {
        if (!didMount1.current) {
          didMount1.current = true;
          return;
        }

        // Set the ordinals string directly from the JSON file
        setOrdinalsString(JSON.stringify(mobileFriendlyFoxesJson));
        
        // Ensure preloaded state shows for at least 2 seconds
        setTimeout(() => {
          setPreLoaded(false);
        }, 2000);
      }, [ordaddress]);

  // Check if SHUAllet is already connected on component mount
  useEffect(() => {
    const checkExistingWallet = () => {
      const ordAddress = localStorage.getItem('ownerAddress');
      const payAddress = localStorage.getItem('walletAddress');
      
      if (ordAddress && payAddress) {
       // console.log('SHUAllet already connected:', { ordAddress, payAddress });
        setMobileWalletAddress(ordAddress);
        setMobileWalletConnected(true);
        setConnectedWalletType('mobile');
        
        // Always automatically check fox ownership when SHUAllet is already connected
      // console.log('SHUAllet already connected, automatically checking fox ownership');
        checkMobileWalletFoxOwnership(ordAddress);
      } else {
        //console.log('No existing SHUAllet found');
        setMobileWalletConnected(false);
        setConnectedWalletType(null);
      }
    };
    
    checkExistingWallet();
  }, [isMobile]); // Add isMobile to dependencies

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


    //handle get adresses
    const handleGetAddresses = async () => {
      const addrs = await wallet.getAddresses();
      if (addrs) setAddresses(addrs);
    };

      //handle connnum owned
  const handleNumOwned = async (num: number, outpoints: string[]) => {
    setNumOwned(numOwned + outpoints.length);
    // console.log('Received outpoints in MobileFriendlyFoxes:', outpoints);

    setNewOutpoints(outpoints);
    // add outpoints to owned foxes
    const updatedOwnedOutpoints = [...ownedOutpoints, ...outpoints];
    setOwnedOutpoints(updatedOwnedOutpoints);
    
    
  };

  //handle connect
  const handleConnect = async () => {
    setConnectLoading(true);
    setLoading(true);
    setMyOrdAddress("")
    if (!wallet.connect) {
      window.open(
        "https://github.com/Panda-Wallet/panda-wallet#getting-started-alpha",
        "_blank"
      );
      setLoading(false);
      setConnectLoading(false);
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
      setConnectLoading(false);
      return
    }
  };

  // Add useEffect to track owned foxes
  useEffect(() => {
    const currentAddress = myordaddress || mobileWalletAddress;
    if (!currentAddress || currentAddress.trim() === '' || currentAddress.length < 26 || connectLoading) {
      setCountLoading(false);
      setAllUtxos(JSON.stringify([])); // Initialize with empty array
      setOwnedOutpoints([]);
      setNumOwned(0);
      return;
    }
    
    setCountLoading(true);

    const fetchOwnedFoxes = async () => {
      try {
        const response = await fetch(`https://ordinals.gorillapool.io/api/txos/address/${currentAddress}/unspent?limit=300000`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        setAllUtxos(JSON.stringify(data));

        // Get all outpoints from mobileFriendlyFoxesJson
        const mobileFriendlyFoxOutpoints = mobileFriendlyFoxesJson.map(fox => fox.origin.outpoint);
        
        // Filter owned foxes to only include those in mobileFriendlyFoxesJson
        const ownedFoxes = data.filter(fox => 
          mobileFriendlyFoxOutpoints.includes(fox.origin.outpoint)
        );

        // Set initial owned outpoints
        const initialOwnedOutpoints = ownedFoxes.map(fox => fox.origin.outpoint);
        setOwnedOutpoints(initialOwnedOutpoints);

        setNumOwned(ownedFoxes.length);
        setCountLoading(false);
      } catch (error) {
       // console.error('Error fetching owned foxes:', error);
        setCountLoading(false);
        // Set empty array on error
        setAllUtxos(JSON.stringify([]));
        setOwnedOutpoints([]);
        setNumOwned(0);
      }
    };

    fetchOwnedFoxes();

    // Cleanup function to reset state when address changes
    return () => {
      setAllUtxos(JSON.stringify([]));
      setOwnedOutpoints([]);
      setNumOwned(0);
      setCountLoading(false);
    };
  }, [myordaddress, mobileWalletAddress, connectLoading]);

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

  return (

    <div className="App">
                  {preloaded && (
        <>
                  <header className="App-header">
                   
                  <img 
                    src={mobileFriendlyFoxesLogo} 
                    alt="Mobile-Friendly Foxes Logo" 
                    onClick={goToIndex}
                    style={{ 
                      cursor: "pointer", 
                      width: "250px",
                      padding: "15px",
                      zIndex: "10"
                    }}
                  />
            <div className="LoaderHeight">

                <ThreeCircles color="black" height="50"
                  width="50" />
            </div>
            <MyOtherFox /> <ActualFaucet />
            </header>
        </>
      )}
                        {!preloaded && (
        <>

          <div className="Topbar">
            <TemporaryDrawer />
            <img 
              src={mobileFriendlyFoxesLogo} 
              alt="Mobile-Friendly Foxes Logo" 
              onClick={goToIndex}
              style={{ 
                cursor: "pointer", 
                width: "250px",
                padding: "15px",
                zIndex: "10"
              }}
            />
            <a target="blank" href="https://twitter.com/yours_foxplorer"><XLogoRight /></a>
          </div>

          <div id="Faucet">
<br />
              
                    {!loading && (
              <>
                        
                        <div className="Yours">       
                          <div className="MobileWallet" style={{ marginBottom: '20px' }}>
                            <span className="Demo">Desktop</span>
                            {connectedWalletType === 'yours' ? (
                              // Show connected Yours wallet address
                              <div style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                borderRadius: '8px',
                                padding: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                marginTop: '8px',
                                maxWidth: '300px'
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
                                    Yours Wallet Connected
                                  </div>
                                  <div style={{
                                    color: '#ffffff',
                                    fontSize: '12px',
                                    fontFamily: 'monospace',
                                    textAlign: 'center',
                                    wordBreak: 'break-all'
                                  }}>
                                    {myordaddress}
                                  </div>
                                </div>
                                
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '8px'
                                }}>
                                  <button
                                    onClick={() => {
                                      wallet.disconnect();
                                      setMyOrdAddress("");
                                      setAddresses(undefined);
                                      setPubKey(undefined);
                                      setConnectedWalletType(null);
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
                                    Disconnect
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // Show Yours connect button when not connected
                              <FaucetPandaConnectButton onClick={handleConnect} />
                            )}
                          </div>
                          
                          {/* Mobile Wallet Button */}
                          <div className="MobileWallet">
                            <span className="Demo">Mobile</span>
                            {connectedWalletType === 'mobile' ? (
                              // Show connected wallet information and options
                              <div style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                borderRadius: '8px',
                                padding: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                marginTop: '8px',
                                maxWidth: '300px'
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
                                    width: 'auto',
                                    minWidth: '120px'
                                  }}
                                >
                                  Restore SHUAllet
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                
              </>
             
            )}         

            {loading && (
              <>
                 <span className="Required">
                <ThreeCircles color="white" height="50"
                  width="50" />
                </span>
              </>
            )}
                                {!setgettingfox && (
              <>
        <p className="Heading"><span className="Demo"><b>Mobile-Friendly Foxes</b></span><br />Sort 500 Mobile-Friendly Foxes<br /><span style={{ color: '#808080', fontSize: '0.9em' }}>"The first mobile-friendly foxes"</span><br /><span className="GrayGroupLinks"><a target="blank" href="https://ordinals.gorillapool.io/content/7a5b9a2c686a6bfcbfdcc81b9f8d0bf4131dea778fd5603c591e06c03c3c79f4_0" style={{ color: '#808080' }}><u>Group</u></a></span></p>

        <div className="WhiteGroupLinks" style={{ textAlign: 'center', width: '100%', margin: '5px auto' }}>
          <span style={{ color: '#808080', display: 'inline-block', marginRight: '4px' }}>You own:</span>
          {!myordaddress && !mobileWalletAddress ? (
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
              <span style={{ color: '#808080' }}>{numOwned}</span>
            )
          )} <span style={{ color: '#808080' }}>/</span> <span style={{ color: '#808080' }}>{mobileFriendlyFoxesJson.length} Mobile-Friendly Foxes</span>

        </div>
        </>
            )}

        </div>
     
        <FoxFilters 
            setgettingfox={setgettingfox} 
            passedFunctionFoxLoadingScreen={passedFunctionFoxLoadingScreen} 
            complete={complete} 
            ordinalsstring={ordinalsstring} 
            myordinalsaddress={myordaddress || mobileWalletAddress} 
            faucetvar={faucetvar} 
            myvar={myvar} 
            demovar={demovar}
            handleConnect={handleConnect}
            newOutpoints={newOutpoints}
            ownedOutpoints={ownedOutpoints}
            allUtxos={allUtxos}
            foxType="mobile-friendly"
          />
          {!setgettingfox && (
              <>
          <FooterHome />

          </>
            )}
          {/* <CreateGroupText groupordinalsstring={ordinalsstring} /> */}
        
          </>
      )}

      {/* Custom Popup */}
      {showPopup && (
        <div 
          style={popupStyles.popupOverlay}
          onClick={(e) => {
            // Only close if clicking the overlay, not the popup content
            if (e.target === e.currentTarget) {
              closePopup();
            }
          }}
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
                      // Continue callback - check fox ownership and set address
                      const ordAddress = localStorage.getItem('ownerAddress');
                      if (ordAddress) {
                        checkMobileWalletFoxOwnership(ordAddress);
                      }
                      closePopup();
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