import React, { Component } from "react";
import { Row, Col } from "antd";

//includes
import AddressForm from "../src/Includes/DeliveryAddress/AddressForm";
import OrderSummary from "../src/Includes/Cart/OrderSummary";
import Layout from "../src/Components/Layout";

class DeliveryAddress extends Component {
  render() {
    return (
      <Layout title="Address">
        <section className="delivery-address">
          <div className="container">
            <Row>
              {/* <Col md={0} xs={0}></Col> */}
              <Col md={16} xs={24}>
                <AddressForm />
              </Col>
              <Col md={8} xs={24}>
                <OrderSummary
                  diableOrderBtn="disableBtn"
                  orderTxt="PROCCED TO CHECKOUT"
                />
              </Col>
              {/* <Col md={0}></Col> */}
            </Row>
          </div>
        </section>
      </Layout>
    );
  }
}

export default DeliveryAddress;
