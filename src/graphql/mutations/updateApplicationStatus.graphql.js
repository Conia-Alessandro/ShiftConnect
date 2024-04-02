import { gql } from '@apollo/client';

const UPDATE_APPLICATION_STATUS = gql`
  mutation UpdateApplicationStatus($input: ApplicationInput!) {
  updateApplicationStatus(input: $input) {
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
    approvingStaff {
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
  }
}
`;

export default UPDATE_APPLICATION_STATUS;
