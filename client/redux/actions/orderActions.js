import { GLOBAL_ERROR, GET_ORDERS, GET_ORDERS_STATUSES, PLACE_ORDER, GET_SHIPPING_CHARGE, GET_ORDER_BY_ID } from "../types";
import { OrderService } from "../services/orderService";
import { openNotification } from "../../utils/common";

const getOrders = (query) => {
  return async (dispatch) => {
    const orderService = new OrderService();
    const response = await orderService.getOrders(query);
    if (response.isSuccess) {
      dispatch({ type: GET_ORDERS, payload: response.data });
    } else if (!response.isSuccess) {
      dispatch({
        type: GLOBAL_ERROR,
        payload: response.errorMessage,
      });
    }
  };
};

const getOrderById = (id) => {
  return async (dispatch) => {
    const orderService = new OrderService();
    const response = await orderService.getOrderById(id);
    if (response.isSuccess) {
      dispatch({ type: GET_ORDER_BY_ID, payload: response.data });
    } else if (!response.isSuccess) {
      dispatch({
        type: GLOBAL_ERROR,
        payload: response.errorMessage,
      });
    }
  };
};

const getOrdersStatuses = () => {
  return async (dispatch) => {
    const orderService = new OrderService();
    const response = await orderService.getOrdersStatuses();
    if (response.isSuccess) {
      dispatch({ type: GET_ORDERS_STATUSES, payload: response.data });
    } else if (!response.isSuccess) {
      dispatch({
        type: GLOBAL_ERROR,
        payload: response.errorMessage,
      });
    }
  };
};

const placeOrder = (body) => {
  return async (dispatch) => {
    const orderService = new OrderService();
    const response = await orderService.placeOrder(body);
    if (response.isSuccess) {
      await dispatch({ type: PLACE_ORDER, payload: response.data });
      openNotification("Success", "Order placed successfully");
      window.location.href = "/myprofile";
    } else if (!response.isSuccess) {
      dispatch({
        type: GLOBAL_ERROR,
        payload: response.errorMessage,
      });
    }
  };
};

const getShippingCharge = (body) => {
  return async (dispatch) => {
    const orderService = new OrderService();
    const response = await orderService.getShippingCharge(body);
    if (response.isSuccess) {
      dispatch({ type: GET_SHIPPING_CHARGE, payload: response.data });
    } else if (!response.isSuccess) {
      dispatch({
        type: GLOBAL_ERROR,
        payload: response.errorMessage,
      });
    }
  };
};

export default {
  getOrders,
  getOrdersStatuses,
  placeOrder,
  getShippingCharge,
  getOrderById
};
