import React, { Component } from "react";
import { Drawer, Collapse } from "antd";
import _ from 'lodash'

class MenuDrawer extends Component {
  state = { placement: "left" };

  //   showDrawer = () => {
  //     this.setState({
  //       visible: true,
  //     });
  //   };

  //   onClose = () => {
  //     this.setState({
  //       visible: false,
  //     });
  //   };

  onChange = (e) => {
    this.setState({
      placement: e.target.value,
    });
  };

  callback = (key) => {
    console.log(key);
  };

  render() {
    const { placement } = this.state;
    let { parentCate } = this.props;

    const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;
    return (
      <>
        <Drawer
          title="Menu"
          placement={placement}
          closable={false}
          onClose={this.props.onCloseDrawer}
          visible={this.props.showDrawer}
          key={placement}
          className="mobile-menu-drawer"
        >
          <div className="menu-list alldepart">
            <ul className="category">
              {parentCate?.map((cate, i) => {
                return (
                  <li key={i}>
                    <div className="title main-title">
                      <span>{_.capitalize(cate.displayName)}</span>
                      <span className="title-icon">
                        {cate.childCate.length > 0 && (
                          <i
                            className="fa fa-angle-down"
                            aria-hidden="true"
                          ></i>
                        )}
                      </span>
                    </div>
                    {cate.childCate.length > 0 && (
                      <ul className="sub-category">
                        {cate.childCate.map((subCate, i) => {
                          return (
                            <li
                              key={i}
                              onClick={(e) =>
                                this.searchProducts(
                                  e,
                                  subCate.slug,
                                  subCate._id
                                )
                              }
                            >
                              <div className="title sub-title">
                                <span>{_.capitalize(subCate.displayName)}</span>
                                <span className="sub-title-icon">
                                  {subCate.childCate.length > 0 && (
                                    <i
                                      className="fa fa-angle-down"
                                      aria-hidden="true"
                                    ></i>
                                  )}
                                </span>
                              </div>
                              {subCate.childCate.length > 0 && (
                                <ul className="sub-category next-sub">
                                  {subCate.childCate.map((newSubCate, i) => {
                                    return (
                                      <li
                                        key={i}
                                        onClick={(e) =>
                                          this.searchProducts(
                                            e,
                                            newSubCate.slug,
                                            newSubCate._id
                                          )
                                        }
                                      >
                                        <div className="title sub-sub-title">
                                          <span>{newSubCate.displayName}</span>
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </Drawer>
      </>
    );
  }
}

export default MenuDrawer;
