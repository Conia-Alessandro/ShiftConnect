// getStaffByName.graphql.js
import { gql } from '@apollo/client';

const GET_STAFF_BY_NAME = gql`
  query GetStaffByName($name: String!){
  getStaffByName(name: $name) {
    id
    name
    surname
    biography
    casualWorkDepartments
    contacts {
      contactType
      preferredTime
      value
    }
    mainDepartment
    photo
    supervisor
  }
}
`;

export default GET_STAFF_BY_NAME;
