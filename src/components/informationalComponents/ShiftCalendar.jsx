import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
// Styles
import "../../styles/shiftCalendar.css";
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Initialize Localizer for Calendar
const localizer = momentLocalizer(moment);

const ShiftCalendar = ({ user, data }) => {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const debug = false;
  useEffect(() => {
    console.log(`Data: ${JSON.stringify(data)}`);
    setCalendarEvents([]);
    if (data && data.length > 0) {
      const events = data.map((shift) => {
        const concludeTime = moment(shift.conclusion, ["h:mm A"]);
        const endDate = moment(shift.date)
          .set("hour", concludeTime.hours())
          .set("minute", concludeTime.minutes());
  
        let color;
        switch (shift.status) {
          case "OPEN":
            color = "green";
            break;
          case "COMMENCING":
            color = "blue";
            break;
          case "CLOSED":
            color = "grey";
            break;
          case "CONCLUDED":
            color = "black";
            break;
          default:
            color = "white"; // Default color
        }
  
        return {
          id: shift.id,
          title: shift.brief,
          start: new Date(shift.date),
          end: endDate.toDate(),
          color: color,
        };
      });
  
      setCalendarEvents(events);
    }
  }, [data]);

  return (
    <>
    {debug ? ( <><p>This is the debug view</p></>) : ""}
    <div className="Calendar">
    <Calendar
      localizer={localizer}
      events={calendarEvents}
      startAccessor="start"
      endAccessor="end"
      eventPropGetter={(event) =>({
          style:{
              backgroundColor: event.color, //setting the color property
          }
      })}
    />
  </div>
    </>
  );
};

export default ShiftCalendar;