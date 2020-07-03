import React, { Component } from "react";
import { View, Image, StyleSheet } from "react-native";

import Swiper from "react-native-swiper";
import { productData } from "../../utils/mock";
import ConstantColors from "../../constants/ConstantColors";

class MainCarousel extends Component {
  render() {
    return (
      <Swiper
        style={styles.wrapper}
        showsButtons={true}
        autoplay={true}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
        showsButtons={false}
      >
        {productData.map((product) => {
          return (
            <View style={styles.slide1} key={product.id}>
              <Image style={styles.image} source={{ uri: product.image }} />
            </View>
          );
        })}
      </Swiper>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  wrapper: {
    height: 200,
  },
  slide1: {
    flex: 1,
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    height: null,
    width: null,
  },

  dot: {
    backgroundColor: "rgba(0,0,0,.2)",
    width: 5,
    height: 5,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  activeDot: {
    backgroundColor: ConstantColors.tintColor,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
});

export default MainCarousel;
