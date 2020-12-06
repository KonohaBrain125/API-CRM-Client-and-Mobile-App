import { GET_ORDERS, GET_ORDERS_STATUSES, PLACE_ORDER, GET_SHIPPING_CHARGE, GET_ORDER_BY_ID, CANCEL_ORDER, GET_ORDERS_START } from "../types";

const initialState = {
  getOrders: null,
  getOrdersStatus: null,
  placeOrderResp: null,
  getShippingChargeResp: null,
  cancelOrderResp: null,
  getOrderByIdResp: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_ORDERS_START:
      return { ...state, hasError: false, loading: true };
    case GET_ORDERS:
      return { ...state, getOrders: action.payload, loading: false, hasError: false, };
    case GET_ORDER_BY_ID:
      return { ...state, getOrderByIdResp: action.payload, loading: false, hasError: false  };
    case GET_ORDERS_STATUSES:
      return { ...state, getOrdersStatus: action.payload, hasError: false, loading: false  };
    case PLACE_ORDER:
      return { ...state, placeOrderResp: action.payload, hasError: false, loading: false  };
    case CANCEL_ORDER:
      return { ...state, cancelOrderResp: action.payload, hasError: false, loading: false  };
    case GET_SHIPPING_CHARGE:
      return { ...state, getShippingChargeResp: action.payload, hasError: false, loading: false  };
    default:
      return state;
  }
};
