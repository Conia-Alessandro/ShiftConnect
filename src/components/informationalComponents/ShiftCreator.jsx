import { useMutation, useQuery } from "@apollo/client";
import React, { useState, useEffect } from "react";

import CREATE_SHIFT from "../../graphql/mutations/createShift.graphql";
import GET_ALL_STAFF from "../../graphql/queries/getAllStaff.graphql";
import CREATE_NEW_APPLICATION from "../../graphql/mutations/createApplication.graphql";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
  faSun,
  faMoon,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
// Style
import "../../styles/shiftCreator.css";

import sanitizeInput from "../../utils/inputSanitizer";

const ShiftCreator = ({ user, casualWorker, data }) => {
  // Retrieve all staff for later
  const { StaffLoading, StaffError, StaffData } = useQuery(GET_ALL_STAFF);
  let supervisingStaff = [];
  let casualStaff = [];

  // check if data is available
  if (StaffData) {
    // Filter supervising staff
    supervisingStaff = StaffData.getAllStaff.filter(
      (staff) => staff.supervisor === true
    );
    // Filter casual staff
    casualStaff = StaffData.getAllStaff.filter(
      (staff) => staff.supervisor === false
    );
  }
  // Function to get today's date in DD/MM/YYYY format (uk then to US on mongodb)
  const getTodayDate = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, "0");
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // Function to get tomorrow's date in DD/MM/YYYY format (uk then to US on mongodb)
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day = tomorrow.getDate().toString().padStart(2, "0");
    const month = (tomorrow.getMonth() + 1).toString().padStart(2, "0");
    const year = tomorrow.getFullYear();
    return `${year}-${month}-${day}`;
  };

  /* Defining the graphql mutation and its requirements */
  /* default times are 8 and 10 respectively */
  const [createShift] = useMutation(CREATE_SHIFT);
  const [formData, setFormData] = useState({
    name: "",
    brief: "",
    commence: 8,
    conclusion: 10,
    date: getTodayDate(),
    reference: "",
    deadLine: getTomorrowDate(),
  });
  const [startPeriodAM, setStartPeriodAM] = useState(true);
  const [endPeriodAM, setEndPeriodAM] = useState(true);
  const [requireMinutesDiff, setRequireMinutesDiff] = useState(false);
  const [commenceMinutes, setCommenceMinutes] = useState(0);
  const [endMinutes, setEndMinutes] = useState(30); //a shift has to be at least half an hour to be processed, can be changed based on preference from the institution.
  //Used for icons
  const [startPeriodAm, setStartPeriodAm] = useState(true);
  const [endPeriodAm, setEndPeriodAm] = useState(true);
  const createdBy = `${user.firstName}_${user.lastName}`;
  // anything that can break the code goes into false
  const [validInput, setValidInput] = useState(false);
  const [validApplication, setValidApplication] = useState(false);

  const [createdShift, setCreatedShift] = useState(false);
  const [conditionalOffer, setConditionalOffer] = useState(false);
  const [createdApplication, setCreatedApplication] = useState(false);
  const [supervisorNotFound, setSupervisorNotFound] = useState(false);
  // Handle application creation after shift
  const [createApplicationMutation] = useMutation(CREATE_NEW_APPLICATION);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [additionalSupervisorName, setAdditionalSupervisorName] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [shiftBrief, setShiftBrief] = useState("");
  const [selectedSupervisors, setSelectedSupervisors] = useState([]);
  const [applicationStatus, setApplicationStatus] = useState("OFFERED"); //default
  const [applicationComment, setApplicationComment] = useState("");

  // Effect to synchronize commence and conclusion and period based on commence
  useEffect(() => {
    // Update conclusion based on commence
    let updatedConclusion =
      formData.commence === 12 ? 1 : formData.commence + 1;
    // Update startPeriodAM and endPeriodAM based on commence
    let startPeriodAmValue = formData.commence === 12 ? false : true;
    let endPeriodAmValue = formData.commence === 12 ? false : true;

    // Update state
    setFormData((prevData) => ({
      ...prevData,
      conclusion: updatedConclusion,
    }));
    setStartPeriodAM(startPeriodAmValue);
    setEndPeriodAM(endPeriodAmValue);
  }, [formData.commence]);

  // Effect to check for required minutes difference
  useEffect(() => {
    if (
      formData.commence === formData.conclusion &&
      startPeriodAM === endPeriodAM &&
      commenceMinutes === endMinutes
    ) {
      // If the times are the same and the time period is the same, we can't accept shifts with 0 minutes
      setRequireMinutesDiff(true);
    } else {
      if (
        formData.commence === formData.conclusion &&
        startPeriodAM === endPeriodAM &&
        endMinutes - commenceMinutes < 30 // can be changed
      ) {
        setRequireMinutesDiff(true);
      } else {
        setRequireMinutesDiff(false);
      }
    }
  }, [
    formData.commence,
    formData.conclusion,
    startPeriodAM,
    endPeriodAM,
    commenceMinutes,
    endMinutes,
  ]);

  // Effect to synchronize end period based on start period
  useEffect(() => {
    if (formData.commence === 12) {
      setStartPeriodAM(false);
      setEndPeriodAm(false);
    } else {
      setStartPeriodAM(true);
      setEndPeriodAM(true);
    }
  }, [formData.commence, startPeriodAm]);
  // Check if the required inputs are being inputted by the user
  useEffect(() => {
    if (
      formData.name.trim() !== "" &&
      formData.brief.trim() !== "" &&
      formData.reference.trim() !== "" &&
      formData.brief.length > 5 &&
      formData.reference.length > 3
    ) {
      setValidInput(true);
    } else {
      setValidInput(false);
    }
  }, [formData.brief, formData.reference, formData.name]);
  //Add use State for minute selector (if > 30 min ok otherwise not ok )
  // and implement logic for if minutes > 60 then +1 hour in commence / conclusion if minutes - 0 then -1 hour in commence / conclusion

  /*Handle change */
  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    //validation for commence and conclusion fields
    if (name === "commence" || name === "conclusion") {
      //parse input as integer
      const intValue = parseInt(value);
      // Check if the input value is a number and within the specified range
      if (!isNaN(intValue) && intValue >= 1 && intValue <= 12) {
        // If it's valid, update the sanitized value
        sanitizedValue = intValue;
      } else {
        // If it's invalid, set it back to the default value
        sanitizedValue = name === "commence" ? 8 : 10; // Default value for commence and conclusion, these can be changed based on the institution desires
      }
    }
    setFormData((previousData) => ({
      ...previousData,
      [name]: sanitizedValue,
    }));
    // Debug
    logFormDataJSON();
  };
  /*Debug features */
  const constructFormDataJSON = () => {
    const formDataJSON = {
      input: {
        name: formData.name,
        brief: formData.brief,
        commence: `${formData.commence}:${
          commenceMinutes === 0 ? "00" : commenceMinutes
        }${startPeriodAM ? "AM" : "PM"}`,
        conclusion: `${formData.conclusion}:${
          endMinutes === 0 ? "00" : endMinutes
        }${endPeriodAM ? "AM" : "PM"}`,
        date: formatDateInput(formData.date),
        reference: formData.reference,
        deadLine: formatDateInput(formData.deadLine),
        createdBy: createdBy,
      },
    };
    return formDataJSON;
  };
  // Function to log the JSON string
  const logFormDataJSON = () => {
    const formDataJSON = constructFormDataJSON();
    const jsonStr = JSON.stringify(formDataJSON, null, 2); // 2 spaces indentation for better readability
    console.log(jsonStr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //debug
    logFormDataJSON();

    try {
      const formDataJSON = {
        name: formData.name,
        brief: formData.brief,
        commence: `${formData.commence}:${
          commenceMinutes === 0 ? "00" : commenceMinutes
        }${startPeriodAM ? "AM" : "PM"}`,
        conclusion: `${formData.conclusion}:${
          endMinutes === 0 ? "00" : endMinutes
        }${endPeriodAM ? "AM" : "PM"}`,
        date: formatDateInput(formData.date),
        reference: formData.reference,
        deadLine: formatDateInput(formData.deadLine),
        createdBy: createdBy,
      };
      const { data } = await createShift({
        variables: { input: formDataJSON },
      });

      // setting variables for later use
      const shiftId = data.createShift.id;
      const shiftBrief = data.createShift.brief;
      // might have to clear these values
      setShiftId(shiftId);
      setShiftBrief(shiftBrief);

      //find and store first supervisor on name in selectedSupervisors
      const foundSupervisor = supervisingStaff.find(
        (staff) => staff.name === user.firstName
      );

      setSelectedSupervisors((previousSupervisors) => [
        ...previousSupervisors,
        foundSupervisor,
      ]);

      //clear form variables
      setFormData({
        brief: "",
        commence: 8,
        conclusion: 10,
        date: new Date(),
        reference: "",
        deadLine: new Date(),
      });
      setCreatedShift(true);
      console.log("shift created successfully!");
    } catch (error) {
      //would be better to set error and show error on page
      setCreatedShift(false);
      console.error("Error while creating shift ", error);
    }
  };

  const handleIncrement = (field) => {
    // the % function returns the remainder or 0 if 60
    // prev is the previous state
    if (field === "commenceMinutes") {
      setCommenceMinutes((prev) => (prev + 10) % 60);
    } else {
      setEndMinutes((prev) => (prev + 10) % 60);
    }
  };

  const handleDecrement = (field) => {
    if (field === "commenceMinutes") {
      setCommenceMinutes((prev) => Math.max(0, prev - 10));
    } else {
      setEndMinutes((prev) => Math.max(0, prev - 10));
    }
  };

  const handleStartPeriodChange = () => {
    setStartPeriodAm(!startPeriodAm);
  };

  const handleEndPeriodChange = () => {
    setEndPeriodAm(!endPeriodAm);
  };
  // Function to format date in DD/MM/YYYY format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  // Function to return date in YYYY-MM-DD
  const formatDateInput = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };
  //helper
  const getApplicationStatusTerm = () => {
    let term;
    switch (applicationStatus) {
      case "OFFERED":
        term = "offer";
        break;
      case "PENDING":
        term = "conditionally offer";
        break;
      case "ASSIGNED":
        term = "assign";
        break;
      default:
        term = "";
        break;
    }
    return term;
  };
  const handleApplicationStatusChange = (event) => {
    let newStatus = event.target.value;
    setApplicationStatus(newStatus);
    setConditionalOffer(newStatus.toLowerCase() === "pending");
  };

  const handleAdditionalSupervisorChange = () => {
    // additionalSupervisorName e' il nome
    let foundSupervisor = null; // try to find that supervisor (object)
    if (supervisingStaff.length > 0) {
      foundSupervisor = supervisingStaff.find(
        (staff) => staff.name === additionalSupervisorName
      );
    }
    if (foundSupervisor) {
      //if it exists
      setSelectedSupervisors((previousSupervisors) => ({
        ...previousSupervisors,
        foundSupervisor,
      }));
      setSupervisorNotFound(false);
    } else {
      setSupervisorNotFound(true);
      //set A condition to show a message on screen that the supervisor hasn't been found
    }
  };

  // Function to handle removing a supervisor
  const handleRemoveSupervisor = (id) => {
    setSelectedSupervisors((prevSupervisors) =>
      prevSupervisors.filter((supervisor) => supervisor.id !== id)
    );
  };

  // Function to render the selected supervisors
  const renderSelectedSupervisors = () => {
    return (
      <ul>
        {selectedSupervisors.map((supervisor) => (
          <li
            key={supervisor.id}
            onClick={() => handleRemoveSupervisor(supervisor.id)}
          >
            {supervisor.name}
          </li>
        ))}
      </ul>
    );
  };
  // Increment and decrement functions for hours
  const handleHourChange = (field, change) => {
    setFormData((prevData) => {
      const newHour = ((prevData[field] - 1 + change + 12) % 12) + 1; // Ensures wrapping from 12 back to 1
      return {
        ...prevData,
        [field]: newHour,
      };
    });
  };

  // Adjustments to handleInputChange to handle numeric input directly
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "commence" || name === "conclusion") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: Math.max(1, Math.min(12, parseInt(value) || prevData[name])), // Ensures values stay within 1-12
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleConditionChange = (event) => {
    setApplicationComment(event.target.value.trim());
  };
  const handleApplicationSubmit = async () => {
    let foundCasualWorker;
    let casualWorkerId;
    if (casualStaff.length > 0) {
      foundCasualWorker = casualStaff.find(
        (staff) => staff.name === casualWorker
      );
    }
    if (foundCasualWorker) {
      casualWorkerId = foundCasualWorker.id;
    }
    const supervisorIds = selectedSupervisors.map(
      (supervisor) => supervisor.id
    );

    //create the application object
    const applicationData = {
      shiftId: shiftId,
      casualWorkerId: casualWorkerId,
      supervisorsIds: supervisorIds,
      input: {
        applicationStatus: applicationStatus,
      },
    };
    try {
      const { data } = await createApplicationMutation({
        variables: { input: applicationData },
      });
      //save data ?
      setCreatedApplication(true);
      console.log("application created correctly");
    } catch (error) {
      setCreatedApplication(false);
      // consider showing error on screen
      console.error("Error while creating application", error);
    }
  };
  return (
    <div className="shiftCreation">
      <form className="createShiftForm " onSubmit={handleSubmit}>
        <label>the shifts name: </label>
        <input
          type="text"
          name="name"
          placeholder="the shift's name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <label>Brief: </label>
        <input
          type="text"
          name="brief"
          placeholder="the shift's brief"
          value={formData.brief}
          onChange={handleChange}
          required
        />
        <div className="time-selector">
          <div className="time-inputs">
            <div className="input-group">
              <FontAwesomeIcon icon={faCalendar} />
              <label>Commence:</label>
              {/*Hours, Minutes and AM/PM */}
              <button
                type="button"
                onClick={() => handleHourChange("commence", -1)}
              >
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <input
                type="number"
                name="commence"
                value={formData.commence}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                onClick={() => handleHourChange("commence", 1)}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <div className="minute-controls">
                <button
                  type="button"
                  onClick={() => handleDecrement("commenceMinutes")}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <input
                  type="number"
                  value={commenceMinutes}
                  onChange={(e) => setCommenceMinutes(parseInt(e.target.value))}
                />
                <button
                  type="button"
                  onClick={() => handleIncrement("commenceMinutes")}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
              <div className="period-selection">
                <input
                  type="radio"
                  value="AM"
                  checked={startPeriodAm}
                  onChange={handleStartPeriodChange}
                />
                <FontAwesomeIcon icon={faSun} className="sun-icon" />
                <label htmlFor="am">AM</label>
                <input
                  type="radio"
                  value="PM"
                  checked={!startPeriodAm}
                  onChange={handleStartPeriodChange}
                />
                <FontAwesomeIcon icon={faMoon} className="moon-icon" />
                <label htmlFor="pm">PM</label>
              </div>
            </div>
            <div>
              <br></br>
            </div>
            <div className="input-group">
              <FontAwesomeIcon icon={faCalendar} />
              <label>Conclusion:</label>
              <button
                type="button"
                onClick={() => handleHourChange("conclusion", -1)}
              >
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <input
                type="number"
                name="conclusion"
                min={1}
                max={12}
                value={formData.conclusion}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                onClick={() => handleHourChange("conclusion", 1)}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <div className="minute-controls">
                <button
                  type="button"
                  onClick={() => handleDecrement("endMinutes")}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <input
                  type="number"
                  value={endMinutes}
                  onChange={(e) => setEndMinutes(parseInt(e.target.value))}
                />
                <button
                  type="button"
                  onClick={() => handleIncrement("endMinutes")}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
              <div className="period-selection">
                <input
                  type="radio"
                  value="AM"
                  checked={endPeriodAm}
                  onChange={handleEndPeriodChange}
                />
                <FontAwesomeIcon icon={faSun} className="sun-icon" />
                <label htmlFor="am">AM</label>
                <input
                  type="radio"
                  value="PM"
                  checked={!endPeriodAm}
                  onChange={handleEndPeriodChange}
                />
                <FontAwesomeIcon icon={faMoon} className="moon-icon" />
                <label htmlFor="pm">PM</label>
              </div>
            </div>
          </div>
        </div>
        {/*Date picker for commence */}
        <div>
          <label>Shift's date: </label>
          <input
            type="date"
            name="date"
            placeholder="Date (MM/DD/YYYY)"
            value={formatDateInput(formData.date)}
            onChange={handleChange}
            min={getTodayDate()} // Set minimum date as today
            required
          />
        </div>

        {/*Date picker for deadline*/}
        <div>
          <label>Shift's deadline: </label>
          <input
            type="date"
            name="deadLine"
            placeholder="Deadline (MM/DD/YYYY)"
            value={formatDateInput(formData.deadLine)}
            onChange={handleChange}
            min={getTomorrowDate()} // Set minimum date as tomorrow
            required
          />
        </div>

        {/* reference*/}
        <div>
          <input
            type="text"
            name="reference"
            placeholder="The shift's reference"
            value={formData.reference}
            onChange={handleChange}
            required
          />
        </div>
        {requireMinutesDiff || !validInput ? (
          <div>
            <span>
              Almost there, fill out the rest of the information to be able to
              create the shift
            </span>
          </div>
        ) : (
          ""
        )}
        {validInput && (
          <div>
            <br></br>
          </div>
        )}
        <button
          type="submit"
          className={requireMinutesDiff || !validInput ? "disabled" : "enabled"}
        >
          Create Shift
        </button>
      </form>
      {createdShift && (
        <div>
          <h2>Create an Application for {casualWorker} ?</h2>
          {/* Toggle button for showing/hiding application form */}
          <button
            type="button"
            onClick={() => setShowApplicationForm(!showApplicationForm)}
          >
            {showApplicationForm
              ? "No, hide the form"
              : "Yes, show me the form"}
          </button>
          {showApplicationForm && (
            <div className="applicationForm">
              <h2>Formulated statement</h2>
              <span>
                I want to {getApplicationStatusTerm(applicationStatus)} the
                shift with brief "{shiftBrief}" to {casualWorker}
              </span>

              <select
                value={applicationStatus}
                onChange={handleApplicationStatusChange}
              >
                <option value="OFFER">Offer</option>
                <option value="ASSIGNED">Assign</option>
                <option value="PENDING">
                  Conditionally Offer (Provide comment)
                </option>
              </select>
              <input
                type="text"
                value={additionalSupervisorName}
                onChange={(e) =>
                  setAdditionalSupervisorName(sanitizeInput(e.target.value))
                }
              />
              <button onClick={handleAdditionalSupervisorChange}>
                Add Supervisor
              </button>
              {/* Display selected supervisor */}
              {renderSelectedSupervisors()}
              {/* if not found*/}
              {supervisorNotFound && (
                <span>
                  It seems i didn't find the supervisor{" "}
                  {additionalSupervisorName}, try a different name?
                </span>
              )}
              {/* conditional offer has been selected */}
              {conditionalOffer ? (
                <textarea
                  placeholder={`Please provide the offer's conditions for ${casualWorker}`}
                  value={applicationComment}
                  onChange={handleConditionChange}
                  className="spacer"
                  required
                ></textarea>
              ) : (
                ""
              )}

              {conditionalOffer && applicationComment.length < 10 ? (
                <h3>Please expand on the condition before proceeding...</h3>
              ) : (
                <div>
                  <h3>
                    Before submitting, confirm the Formulated statement present
                    above
                  </h3>
                  {/* checkbox here that enables the button */}
                  <input
                    type="checkbox"
                    id="confirmApp"
                    onClick={setValidApplication(validApplication)}
                  />
                  {validApplication && !supervisorNotFound ? (
                    <button onClick={handleApplicationSubmit}>
                      Submit Application
                    </button>
                  ) : (
                    ""
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShiftCreator;
