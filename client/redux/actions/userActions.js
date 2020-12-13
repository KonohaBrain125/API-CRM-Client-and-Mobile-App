import {
  USER_PROFILE,
  GLOBAL_ERROR,
  EDIT_ADDRESS,
  ADD_ADDRESS,
  TOGGLE_ACTIVE_ADDRESS,
  UPDATE_PROFILE_PICTURE,
  MY_PROFILE_REVIEWS,
  GET_REVIEWS_START
} from "../types";
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

const addAddress = (body) => {
  return async (dispatch) => {
    const userService = new UserService();
    const response = await userService.addAddress(body);
    if (response.isSuccess) {
      dispatch({ type: ADD_ADDRESS, payload: response.data });
    } else if (!response.isSuccess) {
      dispatch({
        type: GLOBAL_ERROR,
        payload: response.errorMessage,
      });
    }
  };
};

const editAddress = (id, body) => {
  return async (dispatch) => {
    const userService = new UserService();
    const response = await userService.editAddress(id, body);
    if (response.isSuccess) {
      dispatch({ type: EDIT_ADDRESS, payload: response.data });
    } else if (!response.isSuccess) {
      dispatch({
        type: GLOBAL_ERROR,
        payload: response.errorMessage,
      });
    }
  };
};

const toggleActiveAddress = (query) => {
  return async (dispatch) => {
    const userService = new UserService();
    const response = await userService.toggleActiveAddress(query);
    if (response.isSuccess) {
      dispatch({ type: TOGGLE_ACTIVE_ADDRESS, payload: response.data });
    } else if (!response.isSuccess) {
      dispatch({
        type: GLOBAL_ERROR,
        payload: response.errorMessage,
      });
    }
  };
};

const updateProfilePicture = (body) => {
  return async (dispatch) => {
    const userService = new UserService();
    debugger;
    const response = await userService.updateProfilePicture(body);
    if (response.isSuccess) {
      dispatch({ type: UPDATE_PROFILE_PICTURE, payload: response.data });
    } else if (!response.isSuccess) {
      dispatch({
        type: GLOBAL_ERROR,
        payload: response.errorMessage,
      });
    }
  };
};

const getMyReviews = (query) => {
  return async (dispatch) => {
    await dispatch({ type: GET_REVIEWS_START });
    const userService = new UserService();
    const response = await userService.getMyReviews(query);
    if (response.isSuccess) {
      dispatch({ type: MY_PROFILE_REVIEWS, payload: response.data });
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
  editAddress,
  addAddress,
  toggleActiveAddress,
  updateProfilePicture,
  getMyReviews,
};
