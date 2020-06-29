import fetch from "isomorphic-unfetch";
import { SEARCH_PRODUCTS } from "../types";


const searchProducts = (query, body) => {
  
  return async (dispatch) => {
    const resp = await fetch(`http://localhost:3001/api/product/search${query}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
        // Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await resp.json();
    // const data = []
    dispatch({ type: SEARCH_PRODUCTS, payload: data });
    
    return data;
  };
};

export default {
  searchProducts
};
