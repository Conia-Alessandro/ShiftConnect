import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
// Styles
import "../../styles/shiftCalendar.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Initialize Localizer for Calendar
const localizer = momentLocalizer(moment);

const ShiftCalendar = ({ user, data }) => {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const debug = false;
  useEffect(() => {
    console.log(`Data: ${JSON.stringify(data)}`);
    setCalendarEvents([]);
    if (data && data.length > 0) {
      const formattedEvents = data.map((shift) => {
        const commenceTime = moment(shift.commence, ["h:mm A"]);
        const conclusionTime = moment(shift.conclusion, ["h:mm A"]);

        const [day, month, year] = shift.date.split("/");
        const eventDate = new Date(year, month - 1, day);

        const startDateTime = new Date(
          eventDate.getFullYear(),
          eventDate.getMonth(),
          eventDate.getDate(),
          commenceTime.hours(),
          commenceTime.minutes()
        );
        const endDateTime = new Date(
          eventDate.getFullYear(),
          eventDate.getMonth(),
          eventDate.getDate(),
          conclusionTime.hours(),
          conclusionTime.minutes()
        );

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

        const durationHours = moment(endDateTime).diff(moment(startDateTime), "hours");

        return {
          id: shift.id,
          title: shift.brief,
          start: startDateTime,
          end: endDateTime,
          color: color,
          durationHours: durationHours
        };
      });

      setCalendarEvents(formattedEvents);
    }
  }, [data]);

   // Function to calculate class name based on duration
  const getClassForEvent = (event) => {
    const durationHours = event.durationHours;
    if (durationHours >= 6) {
      return "long-event";
    } else if (durationHours >= 4) {
      return "medium-event";
    } else {
      return "short-event";
    }
  };

  return (
    <>
      {debug ? (
        <>
          <p>This is the debug view</p>
        </>
      ) : (
        ""
      )}
      <div className="Calendar">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={(event) => ({
            className: `rbc-event ${event.color} ${getClassForEvent(event)}`,
          })}
        />
      </div>
    </>
  );
};

export default ShiftCalendar;
