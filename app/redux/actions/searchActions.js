import { SEARCH_PRODUCTS, SEARCH_PRODUCTS_LOADING, SEARCH_FILTER, SEARCH_ERROR, GLOBAL_ERROR, SEARCH_KEYWORD } from "../types";
import { SearchService } from "../services/searchService";

// const getSearchKeywords = (query) => {
//   return async (dispatch) => {
//     const searchService = new SearchService();
//     const response = await searchService.getSearchKeywords(query);
//     if (response.isSuccess) {
//       dispatch({ type: SEARCH_KEYWORD, payload: response.data });
//     } else if (!response.isSuccess) {
//       dispatch({
//         type: GLOBAL_ERROR,
//         payload: response.errorMessage,
//       });
//     }
//   };
// };

// const searchProducts = (query, body) => {
//   return async (dispatch) => {
//     const searchService = new SearchService();
//     const response = await searchService.searchProducts(query, body);
//     if (response.isSuccess) {
//       dispatch({ type: SEARCH_PRODUCTS, payload: response.data });
//     } else if (!response.isSuccess) {
//       dispatch({
//         type: GLOBAL_ERROR,
//         payload: response.errorMessage,
//       });
//     }
//   };
// };

export const getProductsByCategory = ({_id, slug}) => {
  const query = `?page=1&perPage=10&cat_id=${_id}&cat_slug=${slug}`
  return async (dispatch) => {
    dispatch({ type: SEARCH_PRODUCTS_LOADING });
    const searchService = new SearchService();
    const response = await searchService.getProductsByCategory(query);
    if (response.isSuccess) {
      dispatch({ type: SEARCH_PRODUCTS, payload: response.data });
    } else if (!response.isSuccess) {
      dispatch({
        type: GLOBAL_ERROR,
        payload: response.errorMessage,
      });
    }
  };
};

// const searchFilter = (query) => {
//   return async (dispatch) => {
//     const searchService = new SearchService();
//     const response = await searchService.searchFilter(query);
//     if (response.isSuccess) {
//       dispatch({ type: SEARCH_FILTER, payload: response.data });
//     } else if (!response.isSuccess) {
//       dispatch({
//         type: GLOBAL_ERROR,
//         payload: response.errorMessage,
//       });
//     }
//   };
// };

// export default {
//   searchProducts,
//   searchFilter,
//   getProductsByCategory,
//   getSearchKeywords
// };
