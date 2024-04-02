import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

// Initialize Localizer for Calendar
const localizer = momentLocalizer(moment);

const ShiftCalendar = ({ user, data }) => {
  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    const userApplications = data.shifts.filter((shift) =>
      shift.applications.some(
        (application) => application.casualWorker.name === user.firstName
      )
    );

    const events = userApplications.map((shift) => {
      // Parse the time string and adjust the date accordingly
      const concludeTime = moment(shift.conclusion, ["h:mm A"]);
      const endDate = moment(shift.date)
        .set("hour", concludeTime.hours())
        .set("minute", concludeTime.minutes());

      // Define color based on shift status
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
        title: shift.title,
        start: new Date(shift.date),
        end: endDate.toDate(),
        color: color,
        // Additional properties
      };
    });

    setCalendarEvents(events);
  }, [data, user]);

  return (
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
  );
};

export default ShiftCalendar;