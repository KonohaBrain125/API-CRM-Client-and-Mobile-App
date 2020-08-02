import React, { Component } from "react";
import MenuDrawer from "./Includes/MenuDrawer";
import { connect } from "react-redux";
import actions from "../../redux/actions";
import { withRouter } from "next/router";
import { getChildCategories, getUserInfo } from "../../utils/common";

class MobileHeader extends Component {
  state = { visible: false };

  componentWillReceiveProps(nextProps) {
    if (this.props.authentication.token !== nextProps.authentication.token) {
      let userInfo = [];
      if (nextProps.authentication.token) {
        userInfo = getUserInfo(loginToken);
      }
      this.setState({
        loginToken: nextProps.authentication.token,
        userInfo,
      });
    }

    if (
      this.props.menu.menuCategories !== nextProps.menu.menuCategories &&
      nextProps.menu.menuCategories
    ) {
      let parentCategory = [];

      let parentCate = [];
      let {
        menuCategories: { categories },
      } = nextProps.menu;
      categories.map((cate) => {
        if (cate.parent === undefined) {
          parentCategory.push(cate);
        }
      });

      let allCates = getChildCategories(categories, parentCategory);

      allCates.map((newChild) => {
        let newallCates = getChildCategories(categories, newChild.childCate);
        let parentCateEle = { ...newChild, childCate: newallCates };
        parentCate.push(parentCateEle);
      });

      this.setState({
        parentCate,
      });
    }
  }

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  onCloseDrawer = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    let { parentCate } = this.state

    return (
      <div className="mobile-header">
        <div className="menu-logo">
          <div className="burger-menu" onClick={this.showDrawer}>
            <i class="fa fa-bars" aria-hidden="true"></i>
          </div>
          <div className="logo">
            <img src="/images/logo.png" />
          </div>
        </div>
        <div className="search-mob">
          <i class="fa fa-search" aria-hidden="true"></i>
        </div>
        <MenuDrawer
          showDrawer={this.state.visible}
          onCloseDrawer={this.onCloseDrawer}
          parentCate = {parentCate}
        />
      </div>
    );
  }
}

export default connect((state) => state, actions)(withRouter(MobileHeader));
