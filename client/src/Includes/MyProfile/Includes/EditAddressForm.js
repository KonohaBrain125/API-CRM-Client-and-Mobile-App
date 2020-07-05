import React, { Component } from "react";
import { Form, Input, Button, Checkbox, Row, Col } from "antd";
import _ from "lodash";

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const tailLayout = {
  wrapperCol: { span: 16 },
};

class EditAddressForm extends Component {
  state = {
    addressId: "",
    fullname: "",
    label: "",
    address: "",
    area: "",
    city: "",
    region: "",
    phoneNo: "",
    geoLocation: "",
    isActive: "false",
  };

  componentDidMount() {
    let { editAddressData } = this.props;
    if (!_.isEmpty(editAddressData)) {
      this.setState({
        addressId: editAddressData.key,
        fullname: editAddressData.fullname,
        label: editAddressData.label,
        address: editAddressData.address,
        area: editAddressData.area,
        city: editAddressData.city,
        region: editAddressData.region,
        phoneNo: editAddressData.phoneNo,
        geoLocation: {long: editAddressData.geoLocation[0], lat:editAddressData.geoLocation[1]},
        isActive: editAddressData.isActive ? "true" : "false",
      });
    }
  }
  
  onFinish = (values) => {
    let body = {
      ...values,
      geoLocation: this.state.geoLocation
    }
    console.log(body)
  };

  onFinishFailed = (errorInfo) => {};

  getMyLocation = () => {
    if (navigator.geolocation) {
      let pos = navigator.geolocation.getCurrentPosition(this.showPosition);
      console.log(pos);
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  showPosition = (position) => {
    console.log(position);
    this.setState({
      geoLocation: {long: position.coords.longitude, lat:position.coords.latitude}
    });
  };

  changeGeoLocation = (e, geoLoc) => {
    let geoLocation = [];

    if(geoLoc === 'long'){
      this.setState({
        geoLocation: {...geoLocation, long: position.coords.longitude}
      })
    }else{
      this.setState({
        geoLocation: {...geoLocation, lat: position.coords.latitude}
      })
    }
  }

  render() {
    console.log(this.state);
    return (
      <div className="edit-address">
        {!_.isEmpty(this.state.address) && (
          <Form
            {...layout}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
          >
            <Row gutter={15}>
              <Col span={12}>
                <Form.Item
                  label="Full Name"
                  name="fullname"
                  rules={[
                    { required: true, message: "Please input your full name!" },
                  ]}
                  initialValue={this.state.fullname}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Address"
                  name="address"
                  rules={[
                    { required: true, message: "Please input your address!" },
                  ]}
                  initialValue={this.state.address}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Area"
                  name="area"
                  rules={[
                    { required: true, message: "Please input your area!" },
                  ]}
                  initialValue={this.state.area}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[
                    { required: true, message: "Please input your city!" },
                  ]}
                  initialValue={this.state.city}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Label"
                  name="label"
                  rules={[
                    { required: true, message: "Please input your label!" },
                  ]}
                  initialValue={this.state.label}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Phone Number"
                  name="phoneNo"
                  rules={[
                    {
                      required: true,
                      message: "Please input your Phone Number!",
                    },
                  ]}
                  initialValue={this.state.phoneNo}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Geo Location" name="geoLocation">
                  <Button onClick={this.getMyLocation}>Get My Location</Button>
                  <div style={{ display: "flex", marginTop: 10 }}>
                    <label style={{ marginRight: 10, width: 65 }}>Longitude</label>
                    <Input value={this.state.geoLocation.long} onChange={(e) => this.changeGeoLocation(e, 'long')} />
                  </div>
                  <div style={{ display: "flex", marginTop: 10 }}>
                    <label style={{ marginRight: 10, width: 65 }}>Latitude</label>
                    <Input value={this.state.geoLocation.lat} onChange={(e) => this.changeGeoLocation(e, 'lat')} />
                  </div>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item {...tailLayout}>
                  <Button type="primary" htmlType="submit">
                    Update
                  </Button>
                  <Button
                    type="secondary"
                    onClick={() => this.props.changeShow("table")}
                  >
                    Cancel
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </div>
    );
  }
}

export default EditAddressForm;
