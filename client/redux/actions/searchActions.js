import fetch from "isomorphic-unfetch";
import { SEARCH_PRODUCTS, SEARCH_FILTER } from "../types";


const searchProducts = (query) => {
  
  return async (dispatch) => {
    const resp = await fetch(`http://localhost:3001/api/product/search${query}`);

    const data = await resp.json();
    // const data = []
    dispatch({ type: SEARCH_PRODUCTS, payload: data });
    
    return data;
  };
};

const searchFilter = (query) => {
  
    return async (dispatch) => {
      const resp = await fetch(`http://localhost:3001/api/product/generate-filter${query}`);
  
      const data = await resp.json();
      // const data = []
      dispatch({ type: SEARCH_FILTER, payload: data });
      
      return data;
    };
  };

export default {
  searchProducts,
  searchFilter
};
