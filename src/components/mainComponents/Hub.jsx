import { useQuery, useMutation } from "@apollo/client";
import GET_ALL_SHIFTS from "../../graphql/queries/getAllShifts.graphql";
import GET_STAFF_BY_NAME from "../../graphql/queries/getStaffByName.graphql";
import "../../styles/hub.css";
import ShiftCard from "../informationalComponents/ShiftCard";
import UPDATE_APPLICATION_STATUS from "../../graphql/mutations/updateApplicationStatus.graphql";
import { useContext, useEffect, useState } from "react";
import { TeamsFxContext } from "../Context"; // Assuming you have a file named TeamsFxContext.js where you define this context.
import splitStringBySpace from "../../utils/stringSplitter";
import sanitizeInput from "../../utils/inputSanitizer";
import StatusIndicator from "../informationalComponents/StatusIndicator";
import ShiftCalendar from "../informationalComponents/ShiftCalendar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

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
  const [casualWorkerName, setCasualWorkerName] = useState("");
  const [foundCasualWorker, setFoundCasualWorker] = useState("");

  const [user, setUser] = useState("");
  const [firstName, setFirstName] = useState("");
  const [allShifts, setAllShifts] = useState([]);
  const [filter, setFilter] = useState(
    isSupervisor ? "createdShifts" : "allShifts"
  );
  const [showPastShifts, setShowPastShifts] = useState(false);
  const [viewColorScheme, setViewColorScheme] = useState(false);

  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [userData, setUserData] = useState(null);

  const [filteredShifts, setFilteredShifts] = useState([]);

  const [loadingQueryCasualWorker, setLoadingQueryCasualWorker] =
    useState(false);

  const [viewMode, setViewMode] = useState("shift");

  const statusData = [
    { name: "Open", color: "lightblue" },
    { name: "Applied", color: "pink" },
    { name: "Offered", color: "#007bff" },
    { name: "Pending", color: "orange" },
    { name: "Assigned", color: "green" },
    { name: "Commencing", color: "limegreen" },
    { name: "Rejected", color: "red" },
    { name: "Turned Down", color: "brown" },
    { name: "Closed", color: "black", textColor: "white" },
  ];
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
      setFirstName(splitStringBySpace(user).name);
      //setFirstName(splitStringBySpace("Grim Saint").name);
    }
  }, [user]);
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
      let shiftsToShow = data.getAllShifts;

      // Filter past shifts if the "showPastShifts" checkbox is checked
      if (!showPastShifts) {
        shiftsToShow = shiftsToShow.filter((shift) => shift.status === "OPEN");
      }

      setAllShifts(shiftsToShow);
    }
  }, [data, showPastShifts]);
  /**
   * 5: Gather GRAPHQL data based on the FirstName
   * store the result
   */
  const {
    loading: userLoadingQuery,
    error: userErrorQuery,
    data: userDataQuery,
  } = useQuery(GET_STAFF_BY_NAME, {
    variables: { name: firstName },
  });
  /**
   * 6: If data is found, set it  to later view it
   */
  useEffect(() => {
    setUserLoading(userLoadingQuery);
    setUserError(userErrorQuery);
    if (userDataQuery) {
      setUserData(userDataQuery);
    }
  }, [userLoadingQuery, userErrorQuery, userDataQuery]);
  /**
   * 7: Store user data information such as StaffId and IsSupervisor
   * used to render cards
   */
  useEffect(() => {
    if (userData) {
      console.log("user data", userData);
      setIsSupervisor(userData.getStaffByName[0].supervisor);
      setStaffId(userData.getStaffByName[0].id);
    }
  }, [userData]);
  /**
   * 8: Debug and update of shifts
   * filtered shifts for supervisors should include only the ones where they are present to "Assign" applicants
   */
  useEffect(() => {
    console.log("First Name:", firstName);
    console.log("Is Supervisor:", isSupervisor);
    let updatedFilteredShifts = allShifts;
    if (isSupervisor) {
      updatedFilteredShifts = allShifts.filter((shift) =>
        shift.applications.some((application) =>
          application.supervisors.includes(firstName)
        )
      );
    }
    setFilteredShifts(updatedFilteredShifts); // Create a new state variable for filtered shifts
  }, [filter, isSupervisor, allShifts, firstName]);

  // If supervisor, find the Casual worker
  // Do not repeat the query if the name is the same or the name is just spaces
  const {
    loading: loadingCW,
    error: errorCW,
    data: dataCW,
  } = useQuery(GET_STAFF_BY_NAME, {
    variables: { name: casualWorkerName },
    skip:
      !isSupervisor ||
      casualWorkerName.trim() === "" ||
      casualWorkerName === foundCasualWorker,
  });

  /**
   * 8.5: If i found a casual worker, set it.
   */
  useEffect(() => {
    if (loadingCW) {
      setLoadingQueryCasualWorker(true);
    }
    if (dataCW && dataCW.getStaffByName.length > 0) {
      console.log(`The Casual Worker name is ${dataCW.getStaffByName[0].name}`);
      setFoundCasualWorker(dataCW.getStaffByName[0].name);
      setLoadingQueryCasualWorker(false);
    }
  }, [dataCW, loadingCW, errorCW]);

  /**
   * 9: updates the filtered shifts if the filter changed
   * is triggered by the dependencies
   */
  useEffect(() => {
    // Inside the useEffect where you're filtering shifts based on different criteria
    let localShifts = [];
    if (filter !== "allShifts") {
      switch (filter) {
        case "createdShifts":
          // Check if the user is a supervisor before applying the filter
          localShifts = isSupervisor
            ? allShifts.filter((shift) =>
                shift.applications.some((application) =>
                  application.supervisors.includes(firstName)
                )
              )
            : allShifts;
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
  }, [filter, isSupervisor, allShifts, firstName]);

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
  // Check if user data is still loading
  if (userLoading) {
    return <p>Loading user data...</p>;
  }

  // Check if there's an error fetching user data
  if (userError) {
    return <p>Error fetching user data: {userError.message}</p>;
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
      </div>
      {viewMode === "shift" ? (
        <>
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
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filter === "createdShifts"}
                  onChange={() => handleCheckboxChange("createdShifts")}
                />{" "}
                Supervising Shifts
              </label>
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
          {/* visualize Filtered shifts */}
          {filteredShifts.length > 0 ? (
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
                  updateApplicationStatusMutation={
                    updateApplicationStatusMutation
                  }
                  className={`shift-card  ${
                    retrieveStyle(shift)
                      ? retrieveStyle(shift).toLowerCase()
                      : ""
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
          )}
        </>
      ) : (
        <ShiftCalendar user={user} data={data} />
      )}
    </div>
  );
}
