import React, { useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Title,
  Paragraph,
  Colors,
} from "react-native-paper";
import { View, Image, StyleSheet, Alert, Text } from "react-native";

import {
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { AntDesign } from "@expo/vector-icons";

import Constants from "../../constants/Constants";

const SearchedSingleProduct = (props) => {
  const renderActionButtonComponent = (type, product) => {
    switch (type) {
      case "searched":
        return (
          <View style={styles.rowFlex}>
            <Button onPress={() => console.warn("Wifi")} style={{ flex: 0.6 }}>
              <Text style={{ color: "black" }}>{"Add to Wishlist "}</Text>
              <AntDesign
                name="heart"
                size={Constants.normalScreenDescriptionSize}
                color="black"
              />
            </Button>
            <Button style={{ flex: 0.4 }}>
              <Text style={{ color: "black" }}>{"Add to Cart "}</Text>
              <AntDesign
                name="shoppingcart"
                size={Constants.normalScreenDescriptionSize}
                color="black"
              />
            </Button>
          </View>
        );
      case "wishlist":
        return (
          <View style={styles.rowFlex}>
            <Button onPress={() => console.warn("Wifi")} style={{ flex: 1 }}>
              <Text style={{ color: "red" }}>{"Remove "}</Text>
              <AntDesign
                name="delete"
                size={Constants.normalScreenDescriptionSize}
                color="red"
              />
            </Button>
            <Button onPress={()=>props.setVisible(product)} style={{ flex: 1 }}>
              <Text style={{ color: Constants.tintColor }}>
                {"Add to Cart "}
              </Text>
              <AntDesign
                name="shoppingcart"
                size={Constants.normalScreenDescriptionSize}
                color={Constants.tintColor}
              />
            </Button>
          </View>
        );
      default:
        <View style={styles.rowFlex}></View>;
    }
  };

  return (
    <TouchableWithoutFeedback>
      <Card
        onPress={() => props.navigation.navigate("Detail")}
        style={{ marginBottom: 5 }}
      >
        <TouchableNativeFeedback>
          <Card.Content>
            <View style={{ flex: 1, flexDirection: "row", marginTop: 5 }}>
              <View style={{ flex: 1.5 }}>
                <Image
                  style={styles.tinyLogo}
                  source={{ uri: props.product.image }}
                />
              </View>
              <View style={{ flex: 2 }}>
                <>
                  <Title>{props.product.title}</Title>
                  <Paragraph>{props.product.price}</Paragraph>
                  <Avatar.Text
                    size={24}
                    label="4/5 stars"
                    color={Constants.headerTintColor}
                    backgroundColor="green"
                    width={90}
                    style={{ marginTop: 10 }}
                  />
                </>
              </View>
            </View>
          </Card.Content>
        </TouchableNativeFeedback>
        <Card.Actions
          style={{
            backgroundColor: Constants.cardColor,
            marginTop: 5,
          }}
        >
          {renderActionButtonComponent(props.type, props.product)}
        </Card.Actions>
      </Card>
    </TouchableWithoutFeedback>
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
});

export default SearchedSingleProduct;
