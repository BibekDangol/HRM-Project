import { Text, View } from "react-native";

import React from "react";
import { TW } from "@/theme/twStyles";
import tw from "twrnc";

const Logo = ({ size = 60 }) => {
  return (
    <View style={tw`items-center justify-center mb-2`}>
      <View
        style={[
          tw`${TW.bgAction}/80 items-center justify-center rounded-lg`,
          { width: size, height: size },
        ]}
      >
        <Text style={tw`text-white text-lg font-bold`}>
          TH
        </Text>
      </View>
    </View>
  );
};

export default Logo;