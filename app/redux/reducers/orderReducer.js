import {
  GET_ORDERS,
  GET_ORDERS_STATUSES,
  PLACE_ORDER,
  GET_SHIPPING_CHARGE,
  GET_ORDERS_NEXT,
} from "../types";

const initialState = {
  getOrders: null,
  getOrdersStatus: null,
  placeOrderResp: null,
  getShippingChargeResp: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_ORDERS:
      return { ...state, getOrders: action.payload, hasError: false };
    case GET_ORDERS_NEXT:
      let orders = action.payload.orders.length
        ? [...state.getOrders.orders, ...action.payload.orders]
        : [...state.getOrders.orders];
      return {
        ...state,
        getOrders: {
          orders,
          totalCount: state.getOrders.totalCount,
        },
        hasError: false,
      };
    case GET_ORDERS_STATUSES:
      return { ...state, getOrdersStatus: action.payload, hasError: false };
    case PLACE_ORDER:
      return { ...state, placeOrderResp: action.payload, hasError: false };
    case GET_SHIPPING_CHARGE:
      return {
        ...state,
        getShippingChargeResp: action.payload,
        hasError: false,
      };
    default:
      return state;
  }
};
