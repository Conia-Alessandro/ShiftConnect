import React from "react";
const StatusIndicator = ({ name, color, textColor }) => {
    return(
    <div className="status-indicator">
      <div className="status-circle" style={{ backgroundColor: color, color: textColor }}></div>
      <span>{name}</span>
    </div>
    );
}
export default StatusIndicator;