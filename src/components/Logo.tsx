import { Image, View } from "react-native";
import tw from "@/theme/tw";

const Logo = () => {
  return (
    <View style={tw`items-center justify-center mb-2`}>
      <View style={tw`w-35 h-35`}>
        <Image
          source={require("@/src/assets/images/hrm.png")}
          style={tw`w-full h-full rounded-xl`}
          resizeMode="stretch"
        />
      </View>
    </View>
  );
};

export default Logo;
