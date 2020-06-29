import React, { Component } from "react";
import MainCarousel from "../src/Components/Carousel";
import ProductSlider from "../src/Components/ProductSlider";
import SliderHeader from "../src/Components/SliderHeader";
import { Row, Col } from "antd";
import Popular from "../src/Components/Popular";
import LatestSLider from "../src/Components/LatestSlider";
import { connect } from "react-redux";
import initialize from "../utils/initialize";
import actions from "../redux/actions";
import Layout from "../src/Components/Layout";

const Index = (props) => {

  return (
    <Layout title="Home">
      <div className="wrapper">
        <div className="main-carousel">
          <MainCarousel />
        </div>
        <div className="container">
          <SliderHeader
            headTitle="Featured Products"
            headDetails="Quicksand is a sans serif type family of three weights plus matching
          obliques"
          listLink = "latestProducts"
          />
          <ProductSlider data={props.products.latestProducts} />
          <section className="latest-popular">
            <Row>
              <Col lg={12} xs={24} md={12}>
                <Popular data={props.products.latestProducts} />
              </Col>
              <Col lg={12} xs={24} md={12}>
                <LatestSLider data={props.products.latestProducts} />
              </Col>
            </Row>
          </section>
          <SliderHeader
            headTitle="Trending Products"
            headDetails="Quicksand is a sans serif type family of three weights plus matching obliques"
            removePaddingTop="paddingTopZero"
            listLink = "latestProducts"
          />
          <ProductSlider data={props.products.latestProducts} />
        </div>
      </div>
    </Layout>
  );
};

Index.getInitialProps = async (ctx) => {
  initialize(ctx);

  const menuData = await ctx.store.dispatch(actions.productCategories());

  const latestProducts = await ctx.store.dispatch(actions.getLatestProducts());

  const orders = await ctx.store.dispatch(actions.getOrders(ctx.req))


  return {
    menuData,
    latestProducts,
    orders
  };
};

export default connect((state) => state)(Index);