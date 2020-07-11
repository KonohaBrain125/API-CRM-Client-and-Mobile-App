import React, { Component } from "react";
import { Checkbox, Input } from "antd";
import { Radio, Row, Col } from "antd";
import { getBrandOptions, getColorOptions } from "../../../utils/common";

const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};
class Filter extends Component {
  state = {
    checkedBrands: [],  
    value: 1,
  };

  onChange = e => {
    this.setState({
      value: e.target.value,
    });
  };

  // componentWillReceiveProps(nextProps) {
  //   if(this.props.checkedBrands !== nextProps.checkedBrands){
  //     this.setState({
  //       checkedBrands: nextProps.checkedBrands
  //     })
  //   }
  // }

  render() {
    const { data } = this.props;
    let brandOptions = getBrandOptions(data);

    const priceOptions = [
      { label: "Rs. 179 to Rs. 1977", value: "179-1977" },
      { label: "Rs. 1977 to Rs. 3775", value: "1977-3775" },
      { label: "Rs. 3775 to Rs. 5179", value: "3775-5179" },
    ];

    let colorOptions = getColorOptions(data);

    return (
      <div className={"listing-filter " + this.props.removeThisFilter}>
        <div className={"filter-title " + this.props.removeThisTitle}>
          <span>FILTERS</span>
          {/* <Icon type="close" className="close"/> */}
        </div>
        <div className="filter-types">
          <div className="type-title">BRAND</div>
          <div className="type-list">
            <Checkbox.Group
              options={brandOptions}
              onChange={(e) => this.props.onCheckBrands(e)}
              value={this.props.checkedBrands}
            />
          </div>
        </div>
        <div className="filter-types">
          <div className="type-title">Price</div>
          <div className="type-list price-filter">
            <Input
              placeholder="Min"
              type="number"
              value={this.props.minPrice}
              onChange={(e) => this.props.changePrice(e.target.value, "min")}
            />
            <span> - </span>
            <Input
              placeholder="Max"
              type="number"
              value={this.props.maxPrice}
              onChange={(e) => this.props.changePrice(e.target.value, "max")}
            />
            <button
              onClick={() =>
                this.props.searchPrice(this.props.minPrice, this.props.maxPrice)
              }
            >
              <i class="fa fa-search" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className="filter-types last-child-fi-type">
          <div className="type-title">Ratings</div>
          <div className="type-list">
            {data &&
              data.ratings &&
              data.ratings.length > 0 &&
              data.ratings.map((rate, i) => {
                return (
                  <div
                    key={i}
                    className="rate-stars"
                    onClick={() => this.props.onHandleRatings(rate)}
                  >
                    {Array(rate)
                      .fill(0)
                      .map((num, j) => {
                        return (
                          <i
                            className="fa fa-star"
                            aria-hidden="true"
                            key={j}
                          ></i>
                        );
                      })}
                    {Array(5 - rate)
                      .fill(0)
                      .map((num, k) => {
                        return (
                          <i
                            className="fa fa-star fade-star"
                            aria-hidden="true"
                            key={k}
                          ></i>
                        );
                      })}
                    {rate !== 5 && <span>And Up</span>}
                  </div>
                );
              })}
          </div>
        </div>
        <div className="filter-types last-child-fi-type">
          <div className="type-title">Color</div>
          <div className="type-list">
            <Checkbox.Group
              options={colorOptions}
              onChange={(e) => this.props.onChangeColors(e)}
              value={this.props.checkedColors}
            />
          </div>
        </div>
        <div className="filter-types last-child-fi-type">
          <div className="type-title">Warrenty Period</div>
          <div className="type-list">
            <Radio.Group onChange={(e) => this.props.onChangeWarrenty(e.target.value)} value={this.props.selectedWarrenty}>
              {data.warranties && data.warranties.map((warrenty) => {
                return (
                  <Radio style={radioStyle} value={warrenty}>
                    {warrenty}
                  </Radio>
                );
              })}
            </Radio.Group>
          </div>
        </div>
        <div className="filter-types last-child-fi-type">
          <div className="type-title">Sizes</div>
          <div className="type-list">
            <Radio.Group onChange={(e) => this.props.onChangeSize(e.target.value)} value={this.props.selectedSize}>
              {data.sizes && data.sizes.map((size) => {
                return (
                  <Radio style={radioStyle} value={size}>
                    {size}
                  </Radio>
                );
              })}
            </Radio.Group>
          </div>
        </div>
        <div className="sticky-filter inside-filter-sticky">
          <Row style={{ width: "100%" }}>
            <Col span={12}>
              <div className="filter-type" onClick={this.props.closeThisFilter}>
                <span>CLOSE</span>
              </div>
            </Col>
            <Col span={12}>
              <div className="filter-type apply-type removeBorder">
                <span>APPLY</span>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default Filter;
