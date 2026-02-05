import { Text } from "@react-navigation/elements";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { Calendar, CircleCheckBig, LogOut, User } from "lucide-react-native";
import tw from "twrnc";

export default function AdminDashboardScreen() {
  return (
    <View style={tw`flex-1 bg-white`}>
      <ScrollView
        style={tw`bg-white`}
        contentContainerStyle={tw`px-4 pt-4 pb-8`}
      >
        <Text style={tw`text-2xl font-extrabold text-gray-800`}>
          Hello, Admin
        </Text>
        <Text>
          Welcome to your <Text style={{ fontWeight: "bold" }}>Dashboard</Text>.
        </Text>

        <View style={tw`flex-1 mt-6`}>
          {/* Row 1 */}
          <View style={tw`flex-row  justify-center`}>
            {/* //total employee */}
            <View
              style={tw`flex-1 bg-white rounded-2xl px-4 py-4 border border-gray-100 shadow- flex-row items-center`}
            >
              <View
                style={tw`w-12 h-12 rounded-full bg-blue-600 items-center justify-center`}
              >
                <User size={28} color="white" />
              </View>

              <View style={tw`ml-3 flex-1`}>
                <Text style={tw`text-gray-700 font-semibold`}>Employees</Text>
                <Text style={tw`text-3xl font-extrabold text-[#1E3354] mt-1`}>
                  150
                </Text>
              </View>
            </View>
            {/*//present today */}
            <View
              style={tw`flex-1 bg-white rounded-2xl px-4 py-4 ml-4 border border-gray-100 shadow-sm flex-row items-center`}
            >
              <View
                style={tw`w-12 h-12 rounded-full bg-green-600 items-center justify-center`}
              >
                <CircleCheckBig size={28} color="white" />
              </View>

              <View style={tw`ml-3 flex-1`}>
                <Text style={tw`text-gray-700 font-semibold`}>Present</Text>
                <Text style={tw`text-3xl font-extrabold text-gray-900 mt-1`}>
                  1
                </Text>
              </View>
            </View>
          </View>
          {/*Row 2 */}
          <View style={tw`flex-row mt-3`}>
            {/* //On Leave */}
            <View
              style={tw`flex-1 bg-white rounded-2xl px-4 py-4  border border-gray-100 shadow-sm flex-row items-center`}
            >
              <View
                style={tw`w-12 h-12 rounded-full bg-orange-600 items-center justify-center`}
              >
                <LogOut size={28} color="white" />
              </View>

              <View style={tw`ml-3 flex-1`}>
                <Text style={tw`text-gray-700 font-semibold`}>On Leave</Text>
                <Text style={tw`text-3xl font-extrabold text-[#1E3354] mt-1`}>
                  1
                </Text>
              </View>
            </View>

            {/*//Holidays */}
            <View
              style={tw`flex-1 bg-white rounded-2xl px-4 py-4 ml-4 border border-gray-100 shadow-sm flex-row items-center`}
            >
              <View
                style={tw`w-12 h-12 rounded-full bg-red-600 items-center justify-center`}
              >
                <Calendar size={28} color="white" />
              </View>

              <View style={tw`ml-3 flex-1`}>
                <Text style={tw`text-gray-700 font-semibold`}>Holidays</Text>
                <Text style={tw`text-3xl font-extrabold text-gray-900 mt-1`}>
                  1
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
