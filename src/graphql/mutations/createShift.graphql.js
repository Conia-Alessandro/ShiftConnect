import { gql } from "@apollo/client";

const CREATE_SHIFT = gql`
mutation Mutation($input: addShiftInput) {
  createShift(input: $input) {
    brief
    commence
    conclusion
    date
    reference
    createdBy
    id
  }
}
`
export default CREATE_SHIFT;