import { gql } from "@apollo/client";
const GET_ALL_SHIFTS = gql`
query GetAllShifts {
  getAllShifts {
    id
    status
    reference
    brief
    date
    commence
    conclusion
    actualEndTime
    applications {
      id
      casualWorker {
        id
        name
        surname
        biography
        supervisor
        mainDepartment
        casualWorkDepartments
        contacts {
          contactType
          value
          preferredTimeSlot
          preferredTime
        }
      }
      supervisors {
        id
        name
        surname
        biography
        supervisor
        mainDepartment
        casualWorkDepartments
        contacts {
          contactType
          value
          preferredTimeSlot
          preferredTime
        }
      }
      applicationStatus
      appliedAt
      turndownReason
      comment
      approvedBySupervisor {
        id
      }
    }
    totalApplications
    postedAt
    deadLine
  }
}
`;

export default GET_ALL_SHIFTS;