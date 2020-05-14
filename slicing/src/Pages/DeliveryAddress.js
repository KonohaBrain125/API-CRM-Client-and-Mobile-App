import React, { Component } from "react";
import { Row, Col } from "antd";

//includes
import AddressForm from "../Includes/DeliveryAddress/AddressForm";
import OrderSummary from "../Includes/Cart/OrderSummary";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

class DeliveryAddress extends Component {
  render() {
    return (
      <>
        <Header />
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
        <Footer />
      </>
    );
  }
}

export default DeliveryAddress;
