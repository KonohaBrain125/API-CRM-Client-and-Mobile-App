import fetch from "isomorphic-unfetch";
import { USER_PROFILE, GLOBAL_ERROR } from "../types";
import { UserService } from "../services/userService";

const getUserProfile = (id) => {
  return async (dispatch) => {
    const userService = new UserService();
    const response = await userService.getUserProfile(id);
    if (response.isSuccess) {
      dispatch({ type: USER_PROFILE, payload: response.data });
    } else if (!response.isSuccess) {
      dispatch({
        type: GLOBAL_ERROR,
        payload: response.errorMessage,
      });
    }
  };
};

export default {
    getUserProfile,
};
