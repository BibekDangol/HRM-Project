import { Image, View } from "react-native";

import React from "react";
import tw from "twrnc";

const Logo = () => {
  return (
    <View style={tw`items-center justify-center mb-2`}>
      <View style={[tw`items-center justify-center rounded-lg`]}>
        <View style={tw`w-24 h-24 mb-2`}>
          <Image
            source={require("../assets/images/icon.png")} // local asset
            style={tw`w-full h-full rounded-xl`} // use numbers for Image
            resizeMode="cover" // scale image fully
          />
        </View>
      </View>
    </View>
  );
};

export default Logo;
