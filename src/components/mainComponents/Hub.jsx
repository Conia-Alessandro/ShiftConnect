import { useQuery, useMutation } from "@apollo/client";
import GET_ALL_SHIFTS from "../../graphql/queries/getAllShifts.graphql";
import "../../styles/hub.css";
import ShiftCard from "../informationalComponents/ShiftCard";
import UPDATE_APPLICATION_STATUS from "../../graphql/mutations/updateApplicationStatus.graphql";
import GET_ALL_STAFF from "../../graphql/queries/getAllStaff.graphql";
import { useContext, useEffect, useState } from "react";
import { TeamsFxContext } from "../Context"; // Assuming you have a file named TeamsFxContext.js where you define this context.
import splitStringBySpace from "../../utils/stringSplitter";
import sanitizeInput from "../../utils/inputSanitizer";
import StatusIndicator from "../informationalComponents/StatusIndicator";
import ShiftCalendar from "../informationalComponents/ShiftCalendar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import ShiftCreator from "../informationalComponents/ShiftCreator";
import statusData from "../informationalComponents/statusData";
import UPDATE_SHIFT_STATUSES from "../../graphql/mutations/updateShiftsStatuses.graphql";
// Loading component
const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <div className="dot-1"></div>
      <div className="dot-2"></div>
      <div className="dot-3"></div>
    </div>
  );
};

export function Hub() {
  const { teamsUserCredential } = useContext(TeamsFxContext);

  const [isSupervisor, setIsSupervisor] = useState(false);
  const [staffId, setStaffId] = useState("");
  const [casualWorkerId, setCasualWorkerId] = useState("");
  const [casualWorkerName, setCasualWorkerName] = useState("");
  const [foundCasualWorker, setFoundCasualWorker] = useState("");

  const [user, setUser] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [allShifts, setAllShifts] = useState([]);
  const [filter, setFilter] = useState(
    isSupervisor ? "createdShifts" : "allShifts"
  );
  const [showPastShifts, setShowPastShifts] = useState(false);
  const [viewColorScheme, setViewColorScheme] = useState(false);

  const [filteredShifts, setFilteredShifts] = useState([]);

  const [loadingQueryCasualWorker, setLoadingQueryCasualWorker] =
    useState(false);

  const [viewMode, setViewMode] = useState("shift");

  const [staffData, setStaffData] = useState([]);
  const [casualStaffData, setCasualStaffData] = useState([]);

  // Mutation to return new shifts
  const [updateAllShiftsAndReturn, { loadingNewShifts, errorNewShifts }] =
    useMutation(UPDATE_SHIFT_STATUSES);
  // loading on new shifts
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 1 : Retrieve User credential and set the user to the Retrieved "Displayed Name" (unique to MS teams account)
   * Example: Grim Saint III
   */
  useEffect(() => {
    if (teamsUserCredential) {
      teamsUserCredential.getUserInfo().then((userInfo) => {
        setUser(userInfo.displayName);
      });
    }
  }, [teamsUserCredential]);
  /**
   * 2: Store the name and set it as the FirstName of the User for this application
   * Example: Grim
   */
  useEffect(() => {
    if (user) {
      //const { name, surname, extra } = splitStringBySpace(user);
      const { name, surname, extra } = splitStringBySpace("Grim Saint III");
      setFirstName(name);

      //Set last name, will be used for shifts
      setLastName(surname);
    }
  }, [user]);

  // Update the graphql Shift database:
  const updateAllShifts = () => {
    setIsLoading(true); // Start loading

    // Simulate a network request or some async operation
    updateAllShiftsAndReturn()
      .then(({ data }) => {
        console.log("Mutation completed:", data);

        // Spinner shows for at least 2 seconds
        setTimeout(() => {
          setIsLoading(false); // Stop loading
        }, 2000);
      })
      .catch((error) => {
        console.error("Error executing mutation:", error);
        setIsLoading(false); // Stop loading in case of error
      });
  };

  // Get all instead of calling api later

  const { loading: StaffLoading, error: StaffError, data: StaffData } = useQuery(GET_ALL_STAFF);
  /**
   * 2.5: set staff and casualWorker data
   */
  useEffect(() => {
    console.log(`values: ${StaffData} , ${firstName} , ${lastName}`);
    if (StaffData && firstName && lastName) {
      let supervisingStaff = StaffData.getAllStaff.filter(
        (staff) => staff.supervisor === true
      );
      setStaffData(supervisingStaff);
      let casualWorkingStaff = StaffData.getAllStaff.filter(
        (staff) => staff.supervisor === false
      );
      setCasualStaffData(casualWorkingStaff);
      // Check if the current user is a supervisor
      const fullName = `${firstName} ${lastName}`.toLowerCase();

      const supervisorUser = StaffData.getAllStaff.some(staff => 
        staff.supervisor === true && 
        `${staff.name} ${staff.surname}`.toLowerCase() === fullName
      );
      // Update isSupervisor based on the result
      console.log(`Result`);
      setIsSupervisor(supervisorUser);

      // If the user is a supervisor, set their ID
      if (supervisorUser) {
        setStaffId(supervisorUser.id);
      } else {
        // If the user is not a supervisor, reset supervisor ID
        setStaffId("");
      }
    }
  }, [StaffData, firstName, lastName]);

  /**
   * 3: Call the Get All shift query through Apollo client, save the statuses
   * loading: false, error: false, data : {Object}
   * with data being GRAPHQL data from the Apollo Server
   */
  const { loading, error, data } = useQuery(GET_ALL_SHIFTS);

  /**
   * 4: if there's data, save it and set it to AllShifts
   * in particular, if the filter "showPastShifts" is not pressed, change AllShifts to only include "OPEN" shifts (default)
   */
  useEffect(() => {
    if (data) {
      // set the shifts to show to ALL shifts
      let shiftsToShow = data.getAllShifts;

      // Filter past shifts if the "showPastShifts" checkbox is checked
      // Updated so it includes COMMENCING shifts
      if (!showPastShifts) {
        // set shifts to show to filtered one (the open / commencing ones)
        shiftsToShow = shiftsToShow.filter(
          (shift) => shift.status === "OPEN" || shift.status === "COMMENCING"
        );
      }

      setAllShifts(shiftsToShow);
    }
  }, [data, showPastShifts]);

  /**
   * 5: Gather all shifts where the supervisor is concerned with.
   */
  useEffect(() => {
    if (allShifts) {
      let updatedFilteredShifts = allShifts;
      if (isSupervisor) {
        console.log(
          `${firstName}${
            isSupervisor ? "is a supervisor" : "is not a supervisor"
          }`
        );
        updatedFilteredShifts = allShifts.filter((shift) =>
          shift.applications.some((application) =>
            application.supervisors.includes(firstName)
          )
        );
      }
      setFilteredShifts(updatedFilteredShifts); // Create a new state variable for filtered shifts
    }
  }, [isSupervisor, allShifts, firstName]);
  /**
   * 6: if the user is a supervisor, and a new cassualWorkerName has been provided, then try to find it.
   * if it's found, loading stops and this allows the next step to take place
   */
  useEffect(() => {
    if (isSupervisor) {
      if (
        casualWorkerName.trim() !== "" ||
        casualWorkerName === foundCasualWorker
      ) {
        const casualWorker = casualStaffData.find(
          (staff) => staff.name === casualWorkerName
        );
        if (casualWorker) {
          console.log(`The Casual Worker name is ${casualWorker.name}`);
          setFoundCasualWorker(casualWorker.name);
          setCasualWorkerId(casualWorker.id);
          setLoadingQueryCasualWorker(false);
        } else {
          setLoadingQueryCasualWorker(true);
        }
      }
    }
  }, [isSupervisor, casualWorkerName, foundCasualWorker, casualStaffData]);

  /**
   * 7: updates the filtered shifts if the filter changed
   * is triggered by the dependencies
   */
  useEffect(() => {
    // Inside the useEffect where you're filtering shifts based on different criteria
    let localShifts = [];
    if (filter !== "allShifts") {
      switch (filter) {
        case "createdShifts":
          // Check if the user is a supervisor before applying the filter
          localShifts = allShifts.filter(
            (shift) => shift.createdBy === `${firstName}_${lastName}`
          );
          break;
        case "coveringShifts":
          localShifts = allShifts.filter((shift) =>
            shift.applications.some((application) =>
              application.supervisors.some(
                (supervisor) => supervisor.name === firstName
              )
            )
          );
          break;
        case "yourShifts":
          // Filter shifts where the user is the casual worker
          localShifts = allShifts.filter((shift) =>
            shift.applications.some(
              (application) => application.casualWorker.name === firstName
            )
          );
          break;
        case "applications":
          // Filter shifts where the user has applied or is pending
          localShifts = allShifts.filter((shift) =>
            shift.applications.some(
              (application) =>
                application.casualWorker.name === firstName &&
                (application.applicationStatus === "APPLIED" ||
                  application.applicationStatus === "PENDING")
            )
          );
          break;
        case "rota":
          // Filter shifts where the user is assigned
          localShifts = allShifts.filter((shift) =>
            shift.applications.some(
              (application) =>
                application.casualWorker.name === firstName &&
                application.applicationStatus === "ASSIGNED"
            )
          );
          break;
        default:
          localShifts = allShifts;
      }
    } else {
      localShifts = allShifts;
    }
    setFilteredShifts(localShifts); // Update filteredShifts state with the localShifts
  }, [filter, isSupervisor, allShifts, firstName, lastName]);

  const [updateApplicationStatusMutation] = useMutation(
    UPDATE_APPLICATION_STATUS
  );

  const retrieveStyle = (shift) => {
    // if it finds an user application it returns the status as a style color
    let userApplication = shift.applications.find(
      (application) => application.casualWorker.name === user
    );
    if (shift.status === "CLOSED") {
      return shift.status;
    } else {
      return userApplication ? userApplication.applicationStatus : "";
    }
  };

  const handleCheckboxChange = (filterType) => {
    if (filterType === filter) {
      // If the same checkbox is checked again, revert to view all shifts or createdShifts
      const filterValue = isSupervisor ? "createdShifts" : "allShifts";
      setFilter(filterValue);
    } else {
      // Toggle filter based on checkbox selection
      setFilter(filterType);
    }
  };

  // Function to handle checkbox change for past shifts (on/ off)
  const handleShowPastShiftsChange = () => {
    setShowPastShifts(!showPastShifts);
  };
  const toggleColorSchemeView = () => {
    setViewColorScheme(!viewColorScheme);
  };
  if (loading) {
    return (
      <div className="hub page">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hub page">
        <p>Error {error.message}</p>
      </div>
    );
  }
  // Function to handle toggle button click for the calendar
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  return (
    <div className="hub page">
      {/* Header */}
      <div className="header-container">
        <h1>{`${isSupervisor ? "Supervisor" : "Applicant"} Hub`}</h1>
        <h3>{`Welcome back ${firstName}`}</h3>
        <div>
        <button
        type="button"
        onClick={updateAllShifts}
        disabled={isLoading}
        className={isLoading ? "loading-button" : ""}
      >
        {isLoading ? <div className="spinner"></div> : "Update All Shifts"}
      </button>
        </div>
        {/* Toggle button for the choice of shift / calendar */}
        <button
          onClick={() => toggleViewMode("shift")}
          className={`toggleBtn ${viewMode === "shift" ? "selected" : ""}`}
        >
          SHIFT VIEW
        </button>
        <button
          onClick={() => toggleViewMode("calendar")}
          className={`toggleBtn ${viewMode === "calendar" ? "selected" : ""}`}
        >
          CALENDAR VIEW
        </button>
        {isSupervisor ? (
          <button
            onClick={() => toggleViewMode("shiftCreator")}
            className={`toggleBtn ${
              viewMode === "shiftCreator" ? "selected" : ""
            }`}
          >
            SHIFT CREATOR
          </button>
        ) : (
          ""
        )}
      </div>
      {/* supervisor controls */}
      {isSupervisor && (
        <>
          <h3>Look up an Applicant:</h3>
          <div className="input-container">
            <input
              type="text"
              placeholder="First Name"
              value={casualWorkerName}
              onChange={(e) =>
                setCasualWorkerName(sanitizeInput(e.target.value))
              }
              className="casual-worker-input"
            />
            {casualWorkerName.trim() !== "" && loadingQueryCasualWorker && (
              <LoadingSpinner />
            )}{" "}
            {/* Render loading spinner if search is loading */}
          </div>
        </>
      )}
      {/*Use case: Non-Supervisor */}
      <br></br>
      {/* Status indicator Toggle*/}
      <label onClick={toggleColorSchemeView} className="colorSchemeLabel">
        {viewColorScheme ? (
          <FontAwesomeIcon icon={faEyeSlash} />
        ) : (
          <FontAwesomeIcon icon={faEye} />
        )}
        {`${viewColorScheme ? " hide" : " view"} color scheme`}
      </label>
      {/* Status indicator */}
      {viewColorScheme ? (
        <div className="status-indicators">
          {statusData.map(({ name, color, textColor }) => (
            <StatusIndicator
              key={name}
              name={name}
              color={color}
              textColor={textColor}
            />
          ))}
        </div>
      ) : (
        ""
      )}
      {/* View filters */}
      <div className="checkboxes">
        {isSupervisor ? (
          <div className="checkbox-filters">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filter === "createdShifts"}
                onChange={() => handleCheckboxChange("createdShifts")}
              />{" "}
              Supervising Shifts
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filter === "coveringShifts"}
                onChange={() => handleCheckboxChange("coveringShifts")}
              />{" "}
              Shifts where i'm covering
            </label>
          </div>
        ) : (
          ""
        )}
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filter === "allShifts"}
            onChange={() => handleCheckboxChange("allShifts")}
          />{" "}
          Available Shifts
        </label>
        {isSupervisor ? (
          ""
        ) : (
          <div className="checkbox-filters">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filter === "yourShifts"}
                onChange={() => handleCheckboxChange("yourShifts")}
              />{" "}
              your shifts
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filter === "applications"}
                onChange={() => handleCheckboxChange("applications")}
              />{" "}
              Applications
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filter === "rota"}
                onChange={() => handleCheckboxChange("rota")}
              />{" "}
              Rota
            </label>
          </div>
        )}
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showPastShifts}
            onChange={handleShowPastShiftsChange}
            className="pastShiftsToggle"
          />{" "}
          past shifts
        </label>
      </div>
      {/*Message on found or not applications */}
      <h2>
        {foundCasualWorker ? (
          <b>{`${foundCasualWorker}'s`} applications</b>
        ) : (
          ""
        )}
      </h2>
      {viewMode === "shift" ? (
        // Visualize Filtered shifts
        filteredShifts.length > 0 ? (
          <div className="shift-card-list">
            {filteredShifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                user={{
                  firstName: firstName,
                  supervisor: isSupervisor ? true : false,
                  id: staffId,
                }}
                query={isSupervisor ? casualWorkerName : firstName}
                casualWorker={isSupervisor ? foundCasualWorker : ""}
                casualWorkerId={casualWorkerId}
                updateApplicationStatusMutation={
                  updateApplicationStatusMutation
                }
                className={`shift-card ${
                  retrieveStyle(shift) ? retrieveStyle(shift).toLowerCase() : ""
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="no-shifts-message">
            <p>
              {filter === "rota"
                ? "It seems that you either haven't applied to a shift or you haven't been offered one, check all shifts to apply to a shift!"
                : `Sorry! It seems you don't have any ${
                    filter === "applications" ? "Applications" : filter
                  }.`}
            </p>
          </div>
        )
      ) : viewMode === "calendar" ? (
        <ShiftCalendar user={firstName} data={filteredShifts} />
      ) : (
        <ShiftCreator
          user={{
            firstName: firstName,
            lastName: lastName,
          }}
          data={filteredShifts}
          casualWorker={foundCasualWorker}
        />
      )}
    </div>
  );
}
