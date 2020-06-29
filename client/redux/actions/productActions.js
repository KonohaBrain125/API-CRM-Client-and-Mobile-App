import Router from "next/router";
import fetch from "isomorphic-unfetch";
import { LATEST_PRODUCTS, MENU_CATEGORIES, PRODUCT_DETAILS, SEARCH_PRODUCTS } from "../types";
import { setCookie, removeCookie, getCookie } from "../../utils/cookie";

const productCategories = () => {
  return async (dispatch) => {
    const resp = await fetch(
      "http://localhost:3001/api/superadmin/product-categories"
    );

    const data = await resp.json();

    dispatch({ type: MENU_CATEGORIES, payload: data });
    
    return data;
  };
};

const getLatestProducts = () => {
  return async (dispatch) => {
    const resp = await fetch("http://localhost:3001/api/product/latest");

    const data = await resp.json();

    dispatch({ type: LATEST_PRODUCTS, payload: data });

    return data;
  };
};

const getProductDetails = (slug) => {
  return async (dispatch) => {
    const resp = await fetch(`http://localhost:3001/api/product/${slug}`);

    const data = await resp.json();

    dispatch({ type: PRODUCT_DETAILS, payload: data });
    
    return data;
  };
};

const getProductBrands = () => {
  return async (dispatch) => {
    const resp = await fetch(`http://localhost:3001/api/superadmin/product-brands`);

    const data = await resp.json();

    dispatch({ type: PRODUCT_DETAILS, payload: data });
    
    return data;
  };
};

const getOrders = (ctx) => {
  return async (dispatch) => {

   const resp =  await fetch(`http://localhost:3001/api/cart-wishlist/carts?page=1`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-auth-token": getCookie("token", ctx),
      },
    })
    const data = await resp.json();

    dispatch({ type: "check", payload: data });
    
    return data;
  };
};

export default {
  getLatestProducts,
  productCategories,
  getProductDetails,
  getProductBrands,
  getOrders
};
