import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native-gesture-handler";

import {
  Card,
  Appbar,
  Button,
  Checkbox,
  TouchableRipple,
} from "react-native-paper";
import { View, Text, Image, StyleSheet, ToastAndroid } from "react-native";

import Constants from "../../constants/Constants";
import {
  getCartProducts,
  editCartQty,
} from "../../../redux/actions/cartActions";
import { getProductDetails } from "../../../redux/actions/productActions";
import Skeleton from "../../components/shared/Skeleton";
import { getDiscountedAmount, SERVER_BASE_URL } from "../../../utils/common";

const CartScreen = (props) => {
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.authentication);
  const { getCartProductsResponse } = useSelector((state) => state.cart);

  const [state, setState] = useState({
    checkedall: false,
  });

  useEffect(() => {
    dispatch(getCartProducts("page=1", token));
  }, [dispatch]);

  useEffect(() => {
    if (!getCartProductsResponse) return;

    let newState = {};

    for (let i = 0; i < getCartProductsResponse.carts.length; i++) {
      newState["checked" + i] = false;
    }

    setState({
      ...state,
      ...newState,
    });
  }, [getCartProductsResponse]);

  const _goBack = () => {
    props.navigation.pop();
  };

  const setChecked = (i, _id) => {
    if (i === "all") {
      // checedall = false

      let allChecks = { ...state };

      for (let checks in allChecks) {
        allChecks[checks] = state.checkedall ? false : true;
      }

      setState((prevState) => ({
        ...allChecks,
        checkedall: !prevState.checkedall,
      }));
      
    } else if (i === null) {
      setState((prevState) => ({
        checked: !prevState.checked,
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        ["checked" + i]: !prevState["checked" + i],
      }));
    }
  };

  const showToastWithGravityAndOffset = () => {
    ToastAndroid.showWithGravityAndOffset(
      "Can not checkout without any product!",
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50
    );
  };

  const isCartStack = props.route.name === "CartStack";

  if (!getCartProductsResponse) {
    return <Skeleton />;
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        // stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: 50 }}>
          <Appbar.Header statusBarHeight={0}>
            {isCartStack && (
              <Appbar.BackAction
                color={Constants.headerTintColor}
                onPress={_goBack}
              />
            )}

            <Appbar.Content title="Cart" color={Constants.headerTintColor} />
          </Appbar.Header>
        </View>

        {getCartProductsResponse?.carts?.map((cart, i) => (
          <TouchableWithoutFeedback key={i}>
            <Card
              onPress={() => {
                cart.product &&
                  dispatch(getProductDetails(cart.product.slug, token));
                props.navigation.navigate("Detail");
              }}
              style={{ marginBottom: 5 }}
            >
              <Card.Content>
                <View style={{ flex: 1, flexDirection: "row", marginTop: 5 }}>
                  <View
                    style={{
                      flex: 0.1,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 10,
                    }}
                  >
                    <Checkbox
                      status={state["checked" + i] ? "checked" : "unchecked"}
                      onPress={() => {
                        setChecked(i, cart._id);
                      }}
                    />
                  </View>
                  <View style={{ flex: 0.5 }}>
                    <Image
                      style={styles.tinyLogo}
                      source={{
                        uri:
                          SERVER_BASE_URL +
                          "/uploads/" +
                          cart.product.images[0].medium,
                      }}
                    />
                  </View>
                  <View style={{ flex: 0.5 }}>
                    <>
                      <View style={{ flex: 0.2 }}>
                        <Text style={{ ...Constants.titleText }}>
                          {cart.product.name}
                        </Text>
                        <Text style={{ ...Constants.paragraphText }}>
                          {"Ujjal's shop"}
                        </Text>
                      </View>
                      <View style={{ flex: 0.2 }}></View>

                      <View style={{ flex: 0.2, flexDirection: "row" }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, color: "orange" }}>
                            {getDiscountedAmount(
                              cart.product.price.$numberDecimal,
                              cart.product.discountRate
                            )}
                          </Text>
                          <Text
                            style={{
                              fontSize: 10,
                              textDecorationLine: "line-through",
                              textDecorationStyle: "solid",
                            }}
                          >
                            {cart.product.price.$numberDecimal}
                          </Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: "row" }}>
                          <TouchableRipple
                            onPress={() =>
                              dispatch(
                                editCartQty(
                                  `${cart._id}?quantity=${cart.quantity - 1}`,
                                  token
                                )
                              )
                            }
                            style={{
                              flex: 0.3,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Button>{"-"}</Button>
                          </TouchableRipple>
                          <View
                            style={{
                              flex: 0.4,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text>{cart.quantity}</Text>
                          </View>
                          <TouchableRipple
                            onPress={() =>
                              dispatch(
                                editCartQty(
                                  `${cart._id}?quantity=${cart.quantity + 1}`,
                                  token
                                )
                              )
                            }
                            style={{
                              flex: 0.3,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Button>{"+"}</Button>
                          </TouchableRipple>
                        </View>
                      </View>
                      <View style={{ flex: 0.2 }}></View>
                    </>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </TouchableWithoutFeedback>
        ))}
        {/* <View style={{ height: 250, marginTop: 0 }}>
          <FeaturedProducts title={"Products for you"} />
        </View> */}
      </ScrollView>

      <View style={{ backgroundColor: Constants.headerTintColor, height: 70 }}>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View
            style={{
              flex: 0.4,
              justifyContent: "center",
              flexDirection: "row",
              marginLeft: 5,
            }}
          >
            <View style={{ flex: 0.2, justifyContent: "center" }}>
              <Checkbox
                status={state["checkedall"] ? "checked" : "unchecked"}
                onPress={() => {
                  setChecked("all");
                }}
              />
            </View>
            <View
              style={{ flex: 0.8, justifyContent: "center", marginLeft: 5 }}
            >
              <Text style={{ fontWeight: "bold" }}>{"ALL"}</Text>
            </View>
          </View>
          <View style={{ flex: 0.6 }}>
            <View style={{ flex: 1, flexDirection: "row" }}>
              <View
                style={{
                  flex: 0.3,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 10 }}>{"Shipping: Rs 0"}</Text>
                <Text style={{ fontSize: 13 }}>{"Total: Rs 0"}</Text>
              </View>
              <View style={{ flex: 0.7, ...styles.footer }}>
                <Button
                  style={{
                    flex: 1,
                    backgroundColor: "orange",
                    justifyContent: "center",
                    margin: 10,
                    borderRadius: 5,
                  }}
                  labelStyle={{ color: "white" }}
                  // onPress={() => props.navigation.navigate("CheckOut")}
                  onPress={
                    !state.checked
                      ? showToastWithGravityAndOffset
                      : () => props.navigation.navigate("CheckOut")
                  }
                >
                  Check Out
                </Button>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  rowFlex: {
    display: "flex",
    flexDirection: "row",
  },
  tinyLogo: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  footer: {
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.5,
    // shadowRadius: 2,
    // elevation: 2,
  },
});

export default CartScreen;
