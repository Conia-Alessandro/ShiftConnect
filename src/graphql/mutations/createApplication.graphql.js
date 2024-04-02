import { gql } from "@apollo/client";

const CREATE_NEW_APPLICATION = gql`
mutation Mutation($shiftId: ID!, $supervisorsIds: [ID!]!, $input: ApplicationInput!, $casualWorkerId: ID!) {
  createApplication(shiftId: $shiftId, supervisorsIds: $supervisorsIds, input: $input, casualWorkerId: $casualWorkerId) {
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
    comment
    turndownReason
  }
}
`;
export default CREATE_NEW_APPLICATION;