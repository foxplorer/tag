import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { Foxplorer } from "./page/Foxplorer";
import { Tag } from "./page/Tag";
import { TagWithFox } from "./page/TagWithFox";
import { PickAFox } from "./page/PickAFox";
import { PickAFoxYours } from "./page/PickAFoxYours";
import { BountyFoxes } from "./page/BountyFoxes";
import { MobileFriendlyFoxes } from "./page/MobileFriendlyFoxes";

export const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Foxplorer />}
          />

          <Route
            path="/tag"
            element={<Tag />}
          />

          <Route
            path="/pickafox"
            element={<PickAFox />}
          />

          <Route
            path="/pickafoxyours"
            element={<PickAFoxYours />}
          />

          <Route
            path="/tagwithfox"
            element={<TagWithFox />}
          />

          <Route
            path="/bountyfoxes"
            element={<BountyFoxes />}
          />

          <Route
            path="/mobilefriendlyfoxes"
            element={<MobileFriendlyFoxes />}
          />
        </Routes>
      </Router>
    </>
  );
};
