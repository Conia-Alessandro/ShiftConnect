// 3: the main tab responsible to render the welcome component
import { useContext } from "react";
import { Welcome } from "./sample/Welcome";
import { TeamsFxContext } from "./Context";
/**
* Importing the Rest of the components
*/
import {Hub} from "../components/mainComponents/hub.jsx";
import {Staff} from "../components/mainComponents/Staff.jsx"

// load the environment variables
import config from "./sample/lib/config";

const showFunction = Boolean(config.apiName);

export default function Tab() {
const { themeString } = useContext(TeamsFxContext);
const [showStaff, showWelcome, showShifts] = [false,false,true];
let themeClass;
switch (themeString) {
  case "default":
    themeClass = "light";
    break;
  case "dark":
    themeClass = "dark";
    break;
  default:
    themeClass = "contrast";
}

return (
  <div className={themeClass}>
    {showStaff && <Staff/>}
    {showWelcome && <Welcome showFunction={showFunction} />}
    {showShifts && <Hub/>}
  </div>
);
}