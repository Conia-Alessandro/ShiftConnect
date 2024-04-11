import {gql} from "@apollo/client";

const UPDATE_SHIFT_STATUSES = gql`
mutation UpdateShiftsStatus {
  updateShiftsStatus {
    id
    status
    reference
    name
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
    }
    totalApplications
    postedAt
    deadLine
    createdBy
  }
}
`;

export default UPDATE_SHIFT_STATUSES;