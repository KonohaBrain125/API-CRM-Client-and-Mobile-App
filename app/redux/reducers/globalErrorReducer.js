import { GLOBAL_ERROR } from "../types";

const initialState = {
  errorMessage: null,
  hasError: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GLOBAL_ERROR:
      return { ...state, errorMessage: action.payload, hasError: true };
    default:
      return state;
  }
};
