import { gql } from "@apollo/client";

const GET_ALL_STAFF = gql`
query GetAllStaff {
  getAllStaff {
    id
    name
    surname
    biography
    mainDepartment
    casualWorkDepartments
    supervisor
    photo
    contacts {
      contactType
      preferredTime
      preferredTimeSlot
      value
    }

  }
}
`;

export default GET_ALL_STAFF;