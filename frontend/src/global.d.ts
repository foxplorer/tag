import { PandaProvider } from "./hooks/usePandaWallet";

declare global {
  interface Window {
    panda: PandaProvider;
  }

  export {};


}

declare module '*.mp3'; // '*.wav' if you're using wav format