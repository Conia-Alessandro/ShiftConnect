import { useMutation } from "@apollo/client";
import { useState } from "react"; // Import useState hook#

import CREATE_NEW_APPLICATION from "../components/mutations/createApplication.graphql";
/**
 * Custom hook to create an application
 * @returns Data from the Graphql query
 */
const useNewApplicationMutation = () => {
  const [createNewApplicationMutation] = useMutation(CREATE_NEW_APPLICATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createNewApplication = async (shiftId, supervisorsIds, input) => {
    setLoading(true);
    try {
      // Here you can add the logic to get the casualWorkerId and comment
      const casualWorkerId = input.casualWorkerId;
      const comment = input.comment;

      const { data } = await createNewApplicationMutation({
        variables: {
          shiftId,
          supervisorsIds,
          input: {
            applicationStatus: "PENDING",
            comment
          },
          casualWorkerId
        }
      });

      setLoading(false);
      return data;
    } catch (error) {
      setError(error);
      setLoading(false);
      throw error;
    }
  };

  return [createNewApplication, { loading, error }];
};

export default useNewApplicationMutation;
