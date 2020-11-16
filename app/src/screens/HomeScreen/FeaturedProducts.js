import React, { useEffect } from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";

import { productData } from "../../utils/mock";

import SingleCard from "../../components/SingleCard";
import { getPhoneDetails } from "../../utils/common";
import Constants from "../../constants/Constants";
import { getLatestProducts } from "../../../redux/actions/productActions";

const FeaturedProducts = (props) => {
  const dispatch = useDispatch();
  const { products } = useSelector(({ products }) => products.latestProducts);

  const { type } = props;

  useEffect(() => {
    if (type === "latest") dispatch(getLatestProducts());
  }, [type, dispatch]);

  useEffect(() => {
    console.log(products);
  }, [products]);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{props.title}</Text>
      </View>
      <View style={{ flex: 4 }}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={200}
          decelerationRate="fast"
        >
          {products?.map((product) => (
            <SingleCard key={product._id} product={product} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    marginLeft: "3%",
    fontSize:
      getPhoneDetails().height < 600
        ? Constants.smallScreenHeaderSize
        : Constants.normalScreenHeaderSize,
    fontWeight: "bold",
  },
});

export default FeaturedProducts;
