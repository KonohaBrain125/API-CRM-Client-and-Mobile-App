import { Row, Col } from "antd";
import { connect } from "react-redux";
import MainCarousel from "../src/Components/Carousel";
import ProductSlider from "../src/Components/ProductSlider";
import SliderHeader from "../src/Components/SliderHeader";
// import Popular from "../src/Components/Popular";
// import LatestSLider from "../src/Components/LatestSlider";
import initialize from "../utils/initialize";
import actions from "../redux/actions";
import Layout from "../src/Components/Layout";
import ProductCard from "../src/Components/Includes/ProductCard";

const Index = (props) => {
  return (
    <Layout title="Home">
      <div className="wrapper">
        <div className="main-carousel">
          <MainCarousel data={props.other?.getBannerImages} />
        </div>
        <div className="container">
          <SliderHeader
            headTitle="Featured Products"
            headDetails="Quicksand is a sans serif type family of three weights plus matching
          obliques"
            listLink="latestProducts"
          />
          <ProductSlider data={props.products.latestProducts} sliderName="latest" />
          {/* <section className="latest-popular">
            <Row>
              <Col lg={12} xs={24} md={12}>
                <Popular data={props.products.latestProducts} />
              </Col>
              <Col lg={12} xs={24} md={12}>
                <LatestSLider data={props.products.latestProducts} />
              </Col>
            </Row>
          </section> */}
          <SliderHeader
            headTitle="Trending Products"
            headDetails="Quicksand is a sans serif type family of three weights plus matching obliques"
            removePaddingTop="paddingTopZero"
            listLink="trendingProducts"
          />
          <ProductSlider data={props.products.trendingProducts} sliderName="trending" />
          <SliderHeader
            headTitle="Latest Products"
            headDetails="Quicksand is a sans serif type family of three weights plus matching obliques"
            removePaddingTop="paddingTopZero"
            listLink="latestProducts"
          />
          {/* <ProductSlider data={props.products.latestProducts} /> */}
          <div className="latest-products">
            
            <Row>
              {
                props.products.latestProducts?.products?.map((product, index) => {
                  return (
                    <Col className="latest-cards" key={index} lg={6} sm={8}>
                      <ProductCard data={product} sliderName="latest" />
                    </Col>
                  )
                })
              }
            </Row>
          </div>
        </div>
      </div>
    </Layout>
  );
};

Index.getInitialProps = async (ctx) => {
  initialize(ctx);

  const latestProducts = await ctx.store.dispatch(actions.getMinedProducts(ctx, 'latest'));
  const trendingProducts = await ctx.store.dispatch(actions.getMinedProducts(ctx, 'trending'));

  // const orders = await ctx.store.dispatch(actions.getOrders(ctx.req));

  await ctx.store.dispatch(actions.getBannerImages());

  return {
    latestProducts,
    trendingProducts
    // orders
  };
};

export default connect((state) => state)(Index);