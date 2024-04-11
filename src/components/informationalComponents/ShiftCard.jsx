import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faUsers,
  faEdit,
  faPlus,
  faCalendar,
  faHourglass,
  faUser,
  faTimes,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
//style
import "../../styles/shiftCard.css";
import createNewApplication from "../../hooks/createNewApplication";
import findDeadlineStyle from "../../utils/findDeadline";
/**
 *
 * @param {Object,Object,String,mutation} query was not needed anymore
 * @returns
 */
const ShiftCard = ({
  shift,
  user,
  casualWorker,
  casualWorkerId,
  updateApplicationStatus,
}) => {
  //calculate difference in days between deadline and shiftdate
  /**
   * Function to get the date elements
   * @param {Date} date
   * @returns
   */
  const getDateElements = (date) => {
    const dateParts = date.split("/"); // Split the date string by '/'
    const day = parseInt(dateParts[0], 10); // Parse day as integer
    const month = parseInt(dateParts[1], 10) - 1; // Parse month as integer (subtracting 1 because month in Date object is zero-based)#
    const year = parseInt(dateParts[2], 10); // Parse year as integer
    return { year, month, day };
  };
  // useStates for the card
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedAnApplication, setSelectedAnApplication] = useState(false);
  const [cardClass, setCardClass] = useState("");
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(false);
  const currentSupervisorId = user.id;

  const [conditionalOffer, setConditionalOffer] = useState(false);
  const [conditions, setConditions] = useState("");
  const [offeredStatus, setOfferedStatus] = useState("OFFERED");

  const [showBrief, setShowBrief] = useState(false);
  const [styleChanged, setStyleChanged] = useState(false);

  const [deadLineStyle, setDeadlineStyle] = useState("");
  const [isShiftExpired, setIsShiftExpired] = useState(false);

  // Check if the user has applied for this shift and get the application, retrieves true or false
  const userApplication = shift.applications
    .filter((application) => {
      if (user.supervisor) {
        // If the user is a supervisor, check against the found Casualworker instead of firstName
        return application.casualWorker.name === casualWorker;
      } else {
        // If the user is not a supervisor, check against the firstName
        return application.casualWorker.name === user.firstName;
      }
    })
    .shift(); // Take the first element from the filtered array
  // Define todaysDate outside useEffect
  const todaysDate = new Date();
  console.log("this should only run once");
  useEffect(() => {
    let dateComponents = getDateElements(shift.deadLine);
    const deadLineDate = new Date(
      dateComponents.year,
      dateComponents.month,
      dateComponents.day
    );

    const timeDiff = deadLineDate.getTime() - todaysDate.getTime();
    const diffInDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    console.log(`diff in days for ${shift.brief} is ${diffInDays}`);

    setDeadlineStyle(findDeadlineStyle(shift, diffInDays));
    setIsShiftExpired(todaysDate >= deadLineDate);
  });

  useEffect(() => {
    if (userApplication && !styleChanged) {
      setCardClass(
        getCardClass(
          shift.status === "OPEN" || shift.status === "COMMENCING"
            ? userApplication.applicationStatus
            : shift.status
        )
      );
      setStyleChanged(true);
    } else if (!styleChanged) {
      setStyleChanged(true);
    }
  });

  const handleUpdateApplication = () => {
    setSelectedAnApplication(!selectedAnApplication);
    // Check if the user has applied already for that shift
    if (userApplication) {
      //find the application object for the user
      const foundApplication = shift.applications.find(
        (application) => application.casualWorker.name === user.firstName
      );
      //set the selected application
      setSelectedApplication(foundApplication);
    } else {
      // Handle request shift
      setSelectedRequest(!selectedRequest);
    }
  };
  /**
   * Handles the change of status, doesn't directly update it on the backend
   * @param {event} event that triggered the change
   */
  const handleApplicationStatusChange = (event) => {
    // Update the application status here
    const newStatus = event.target.value;
    //this would do it straight away
    //updateApplicationStatus(selectedApplication.id, newStatus);
    //setSelectedApplication(null);

    //Reset reason when status changed
    setSelectedStatus(newStatus);
    setReason("");
  };

  const getCardClass = (status) => {
    return status ? status.toLowerCase() : "";
  };
  /**
   * Sets the Reason on change
   * @param {event} event the triggered event
   */
  const handleReasonChange = (event) => {
    setReason(event.target.value);
  };
  /**
   * Sets the comment on change
   * @param {event} event the triggered event
   */
  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleConditionChange = (event) => {
    setConditions(event.target.value);
  };
  // The offer chosen by the supervisor for a casual worker , if it's pending it sets conditional offer to true.
  const handleOfferChange = (event) => {
    console.log(`chosen ${event.target.value}`);
    //either true or false , if a conditional offer is chosen, the field pops up and you are required to fill it
    setConditionalOffer(event.target.value.toLowerCase() === "pending");
    setOfferedStatus(event.target.value);
  };
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Handle form submission based on the selected status
    if (selectedStatus === "TURNEDDOWN") {
      // Handle turning down the shift
      console.log("Reason for turning down:", reason);
    } else if (selectedStatus === "PENDING") {
      // Handle applying with comment
      console.log("Comment for application:", comment);
    }

    // Reset reason and comment
    setReason("");
    setComment("");
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();
    //handle submission of request for a shift
    try {
      // Call the createNewApplication function with the required parameters
      const data = await createNewApplication(shift.id, [currentSupervisorId], {
        casualWorkerId,
        comment,
      });
      setSelectedApplication(data);
      const newlyCreatedApplication = shift.applications.find(
        (application) => application.casualWorker.id === casualWorkerId
      );
      // Handle success
      setSelectedApplication(newlyCreatedApplication);
      setCardClass(getCardClass(userApplication.applicationStatus));
    } catch (error) {
      // Handle error
    }
  };

  const handleOfferSubmit = async (event) => {
    event.preventDefault();
  };
  return (
    <div
      className={`individual-card ${cardClass !== "" ? cardClass : ""} ${
        selectedAnApplication || showBrief ? "expanded" : ""
      } ${selectedRequest ? "expanded" : ""}`}
    >
      <div className="card-header">
        <h3 title="The shift's reference">{shift.reference}</h3>
        <p>{shift.name}</p>
      </div>
      <div className={`card-body ${showBrief ? "expanded" : ""}`}>
        <p onClick={() => setShowBrief(!showBrief)} className="show_hide_brief_p">
          {showBrief ? "" : "Show Brief"}
        </p>
        <hr></hr>
        {showBrief ? (
          <div className="brief_content">
            <p>{shift.brief}</p>
          </div>
        ) : (
          ""
        )}
        {showBrief && (
          <div>
            <p onClick={() => setShowBrief(!showBrief)} className="show_hide_brief_p">
          {showBrief ? "hide brief" : ""}
        </p>
        <hr></hr>  
          </div>
        )}
        <p>
          <FontAwesomeIcon icon={faCalendar} /> {shift.date}
        </p>
        <p>
          <FontAwesomeIcon icon={faClock} /> {shift.commence} -{" "}
          {shift.conclusion}
        </p>
        <p>
          <FontAwesomeIcon icon={faUsers} /> {shift.totalApplications}{" "}
          Applications{" "}
        </p>
        {/* If there's no user application and the shift expired */}
        {!userApplication && isShiftExpired && casualWorker.trim() !== "" && (
          <p>
            <FontAwesomeIcon icon={faTimes} />{" "}
            {user.supervisor ? casualWorker : "You"} did not apply for this
            shift, and it's now {shift.status.toLowerCase()}.
          </p>
        )}
        {shift.status === "CONCLUDED" && userApplication ? (
          <p>
            <FontAwesomeIcon icon={faUser} />
            <b className="green">
              {user.supervisor ? casualWorker : "you"} took part in this Shift
            </b>
          </p>
        ) : (
          ""
        )}

        <p>
          {shift.actualEndTime && (
            <span>
              <strong>Actual End Time:</strong> {shift.actualEndTime}
            </span>
          )}
        </p>
      </div>
      <div className="card-footer">
        {!isShiftExpired && userApplication ? (
          <button
            onClick={handleUpdateApplication}
            className={selectedAnApplication ? "active" : ""}
          >
            {selectedAnApplication ? (
              <span>
                <FontAwesomeIcon icon={faArrowLeft} /> Back
              </span>
            ) : (
              <span>
                <FontAwesomeIcon icon={faEdit} />{" "}
                {user.supervisor
                  ? "Update This Application "
                  : "Update Application"}
              </span>
            )}
          </button>
        ) : (
          // Render the "Request Shift" button only if the shift has not expired
          !isShiftExpired && (
            <button onClick={handleUpdateApplication}>
              {selectedRequest ? (
                <span>
                  <FontAwesomeIcon icon={faArrowLeft} /> Back
                </span>
              ) : (
                <span>
                  <FontAwesomeIcon icon={faPlus} />{" "}
                  {user.supervisor
                    ? `Add ${casualWorker} to this shift`
                    : "Request Shift"}
                </span>
              )}
            </button>
          )
        )}
        {/* Handle case for Existing Application*/}
        {!isShiftExpired && selectedAnApplication && userApplication && (
          <div>
            <span>What do you want to do?</span>
            <select onChange={handleApplicationStatusChange}>
              {/* change with shift status instead of application status */}
              {shift.status === "OPEN" &&
                (!selectedApplication ||
                  !selectedApplication.applicationStatus) && (
                  <>
                    <option value="APPLIED">Apply</option>
                    <option value="PENDING">Apply by attaching Comment</option>
                    <option value="TURNEDDOWN">Turn Down</option>
                  </>
                )}
              {selectedApplication.applicationStatus === "OFFERED" && (
                <>
                  <option value="ASSIGNED">Accept Offer</option>
                  <option value="PENDING">Accept with Conditions</option>
                  <option value="TURNEDDOWN">Turn Down</option>
                </>
              )}
              {selectedApplication.applicationStatus === "APPLIED" && (
                <>
                  <option value="PENDING">Apply by attaching Comment</option>
                  <option value="TURNEDDOWN">Turn Down</option>
                </>
              )}
              {selectedApplication.applicationStatus === "PENDING" && (
                <>
                  <option value="APPLIED">Apply</option>
                  <option value="TURNEDDOWN">Turn Down</option>
                </>
              )}
              {selectedApplication.applicationStatus === "ASSIGNED" && (
                <option value="TURNEDDOWN">Turn Down</option>
              )}
            </select>
            {/* Render form for 'PENDING' and 'TURNEDDOWN' statuses */}
            {selectedStatus === "PENDING" && (
              <form onSubmit={handleSubmit} className="chat-box">
                <textarea
                  placeholder={"Please provide a comment for your application"}
                  value={comment}
                  onChange={handleCommentChange}
                  required
                ></textarea>
                <button type="submit">Submit Application</button>
                <span className="tooltip">
                  Please provide a comment for your application
                </span>
              </form>
            )}
            {selectedStatus === "TURNEDDOWN" &&
              selectedApplication.status === "OFFERED" && (
                <form onSubmit={handleSubmit} className="chat-box">
                  <textarea
                    placeholder={
                      "Please provide a reason for turning down the shift"
                    }
                    value={reason}
                    onChange={handleReasonChange}
                    required
                  ></textarea>
                  <button type="submit">Provide Reason and TurnDown</button>
                  <span className="tooltip">
                    Please provide a reason for turning down the shift
                  </span>
                </form>
              )}
          </div>
        )}
        {/*Use case: Request shift */}
        {!user.supervisor && selectedRequest && (
          <div>
            <form onSubmit={handleRequestSubmit} className="chat-box">
              <textarea
                placeholder={"Please provide a comment to request this shift"}
                value={comment}
                onChange={handleCommentChange}
                required
              ></textarea>
              <button
                type="submit"
                className={`${
                  comment !== "" && comment.length > 5
                    ? "submitOk"
                    : "submitNotOk"
                }`}
              >
                Submit Application
              </button>
              <br></br>
              <span className="tooltip">
                Please provide a comment to request this shift
              </span>
            </form>
          </div>
        )}
        {/*Use case, assign/offer Casual worker to Shift */}
        {user.supervisor && selectedRequest && (
          <div>
            <form onSubmit={handleOfferSubmit} className="chat-box spacer">
              <span>In regards to this application, I want to</span>
              <select value={offeredStatus} onChange={handleOfferChange}>
                <option value="OFFER">Offer</option>
                <option value="ASSIGNED">Assign</option>
                <option value="PENDING">
                  Conditionally Offer (Provide comment)
                </option>
              </select>
              <span className="spacer">{casualWorker} this shift</span>
              {conditionalOffer ? (
                <textarea
                  placeholder={`Please provide the offer's conditions for ${casualWorker}`}
                  value={conditions}
                  onChange={handleConditionChange}
                  className="spacer"
                  required
                ></textarea>
              ) : (
                ""
              )}
              <span className="darkOrange double-spacer block">
                <FontAwesomeIcon
                  icon={faWarning}
                  className="darkOrange"
                ></FontAwesomeIcon>
                Choose carefully! those are Case-sensitive choices!
              </span>
              <button
                type="submit"
                className={`${
                  conditionalOffer
                    ? conditions.length > 5
                      ? "submitOk"
                      : "submitNotOk"
                    : "submitOk"
                }`}
              >
                Offer
              </button>
            </form>
          </div>
        )}
      </div>
      {/* Bottom of card*/}
      <p className={`deadline ${deadLineStyle}`}>
        <FontAwesomeIcon icon={faHourglass} />
        <small>{shift.deadLine}</small>
      </p>
    </div>
  );
};

export default ShiftCard;
