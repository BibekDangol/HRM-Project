import { Text, View } from 'react-native';

import React from 'react';
import tw from 'twrnc';

type colors = "red" | "green" | "yellow" | "orange"
const capsuleColor: Record<colors, string> = {
  red: 'bg-red-100 text-red-700',
  green: 'bg-green-100 text-green-700',
  yellow: "bg-yellow-100 text-yellow-700",
  orange: "bg-orange-100 text-orange-700"
}
type CapsuleProps = {
  text: string | null;
  color: keyof typeof capsuleColor
}
const Capsule = ({ text, color }: CapsuleProps) => {
  return (
    <View>
      <Text
        style={tw`px-4 py-1 rounded-full text-sm font-medium ${capsuleColor[color]}`}
      >
        {text}
      </Text>
    </View>
  )
}

export default Capsule
