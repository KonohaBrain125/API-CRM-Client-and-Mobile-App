import React, { Component } from "react";
import Menu from "../../src/Includes/MyProfile/menu";
import { Row, Col } from "antd";

//includes
import MenuDetails from "../../src/Includes/MyProfile/MenuDetails";
import MyOrders from "../../src/Includes/MyProfile/MyOrders";
import MyWishlist from "../../src/Includes/MyProfile/MyWishlist";
import MyReviews from "../../src/Includes/MyProfile/MyReviews";
import Layout from "../../src/Components/Layout";
import withPrivate from "../../utils/auth/withPrivate";
import { connect } from "react-redux";
import actions from "../../redux/actions";
import { getUserInfo } from "../../utils/common";

class MyProfile extends Component {
  state = {
    currentMenu: "manage-account",
    userInfo: {},
  };

  componentDidMount() {
    let loginToken = this.props.authentication.token;
    let userInfo = getUserInfo(loginToken);

    if (userInfo?._id) {
      this.props.getUserProfile(userInfo._id);
    }

  }

  componentDidUpdate(prevProps){
    if(this.props.user.userProfile !== prevProps.user.userProfile && this.props.user.userProfile){
      this.setState({
        userInfo: this.props.user.userProfile
      })
    }
  }

  changeMenuTab = (menu) => {
    this.setState({
      currentMenu: menu,
    });
  };

  render() {
    
    return (
      <Layout title="My Profile">
        <div className="my-profile">
          <div className="container min-height">
            <Row>
              <Col lg={4} xs={24}  className="left-menu">
                <Menu changeMenuTab={this.changeMenuTab} currentMenu={this.state.currentMenu} />
              </Col>
              <Col lg={20} xs={24} className="profile-right-menu">
                {/* <MenuDetails data = {this.state.userInfo} /> */}
                {this.props.children}

                {/* {this.state.currentMenu === "my-orders" && <MyOrders />}

                {this.state.currentMenu === "my-reviews" && <MyReviews />}

                {this.state.currentMenu === "my-whishlist" && <MyWishlist />} */}

                {/* {
                this.state.currentMenu === "sell-on-daraz" &&
                <MenuDetails />
              } */}
              </Col>
            </Row>
          </div>
        </div>
      </Layout>
    );
  }
}

export default connect((state) => state, actions)(withPrivate(MyProfile));
