const findDeadlineStyle = (shift, days) => {
    let style;
    if (shift.status === "CONCLUDED" || shift.status === "COMMENCING") {
      return "concluded";
    }
  
    const stylesMap = {
      0: "red",
      1: "red",
      2: "darkOrange",
      3: "orange",
      4: "orange",
      5: "orange",
      6: "orange",
    };
  
    style = stylesMap[days] || "green";
    return style;
  };
export default findDeadlineStyle;