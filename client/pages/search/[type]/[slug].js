import React, { Component } from "react";
import { Row, Col, Pagination, Drawer } from "antd";

// includes
import ProductList from "../../../src/Includes/Listing/ProductList";
import Layout from "../../../src/Components/Layout";
import initialize from "../../../utils/initialize";
import actions from "../../../redux/actions";
import Filter from "../../../src/Includes/Listing/Filter";
import Listing from "../../Listing";
import { connect } from "react-redux";
import { withRouter } from "next/router";

class Search extends Component {
  state = {
    perPage: 10,
  };
  static async getInitialProps(ctx) {
    initialize(ctx);

    const {
      query: { slug },
    } = ctx;

    console.log(ctx);

    let searchFilterKey = "";
    let searchProdBody = {};
    if (ctx.query.type === "inputSearch") {
      searchFilterKey = "keyword";
      searchProdBody = { keyword: ctx.query.slug };
    } else if (ctx.query.type === "cateSearch") {
      searchFilterKey = "cat_id";
      searchProdBody = { cat_id: ctx.query.slug };
    }

    const menuData = await ctx.store.dispatch(actions.productCategories());

    const searchFilter = await ctx.store.dispatch(
      actions.searchFilter(`?${searchFilterKey}=${ctx.query.slug}`)
    );

    // console.log(ctx.query)
    const searchData = await ctx.store.dispatch(
      actions.searchProducts(`?page=1&perPage=10`, searchProdBody)
    );

    // return {
    //   searchData,
    //   searchFilter
    // };
  }

  render() {
    console.log(this.props);
    return (
      <Layout>
        <Listing getSearchFilter={this.props.listing.getSearchFilter} data={this.props.listing.getSearchData} perPage={this.state.perPage} />
      </Layout>
    );
  }
}

export default connect((state) => state)(withRouter(Search));
