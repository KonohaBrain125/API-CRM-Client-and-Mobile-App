import React, { Component } from "react";
import ReactTooltip from "react-tooltip";

class PopularCard extends Component {
  render() {
    return (
      <div className="product-card">
        <div className="product-box-shadow">
          <div className="hover-items-image">
            <div className="image">
              <img src="/images/prod-bag.jpg" />
            </div>
          </div>
          <div className="card-body">
            <div className="prod-name">Auctor Sem Argu</div>
            <div className="prod-price">Rs 1500</div>
          </div>
        </div>
      </div>
    );
  }
}

export default PopularCard;
