import "../../styles/staff.css";
import { useQuery } from "@apollo/client";
import StaffCard from "../informationalComponents/StaffCard.jsx";
import GET_STAFF_BY_NAME from "../../graphql/queries/getStaffByName.graphql.js";

export function Staff() {
  const { loading, error, data } = useQuery(GET_STAFF_BY_NAME, {
    variables: { name: "Edgar" },
  });
  if (loading) {
    return (
      <div className="staff page">
        <p>Loading...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="staff page">
        <p>Error {error.message}</p>
      </div>
    );
  }
  return (
    <div className="staff page">
      <div className="narrow page-padding">
        <h1>Welcome to the Staffs page</h1>
        {data.getStaffByName.map((staff) => (
          <StaffCard key={staff.id} staff={staff} />
        ))}
      </div>
    </div>
  );
}
