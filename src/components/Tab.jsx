// 3: the main tab responsible to render the welcome component
import { useContext } from "react";
import { Welcome } from "./sample/Welcome";
import { TeamsFxContext } from "./Context";
// load the environment variables
import config from "./sample/lib/config";

const showFunction = Boolean(config.apiName);

export default function Tab() {
  const { themeString } = useContext(TeamsFxContext);
const showStaff = false;
const showWelcome = true;
const showShifts = false;

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
    {showStaff && ""}
    {showWelcome && <Welcome showFunction={showFunction} />}
    {showShifts && ""}
  </div>
);
}