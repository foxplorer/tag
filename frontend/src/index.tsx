import ReactDOM from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { PandaProvider } from "panda-wallet-provider";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <PandaProvider>
    <App />
  </PandaProvider>
);