import * as React from "react";

import { Calendar, CircleCheckBig, LogOut, User } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";

import StatCard from "@/src/screens/admin/components/StatCard";
import tw from "twrnc";

export default function DashboardScreen() {
  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <ScrollView contentContainerStyle={tw`px-4 pt-6 pb-10`}>
        {/* Header */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-3xl font-extrabold text-gray-900`}>
            Hello, Admin
          </Text>
          <Text style={tw`text-gray-500 text-base mt-1`}>
            Here’s what’s happening today
          </Text>
        </View>

        {/* Stats */}
        <View style={tw`flex-row flex-wrap justify-between`}>
          <StatCard
            title="Employees"
            value={150}
            icon={<User size={24} color="white" />}
          />
          <StatCard
            title="Present Today"
            value={1}
            icon={<CircleCheckBig size={24} color="white" />}
          />
          <StatCard
            title="On Leave"
            value={1}
            icon={<LogOut size={24} color="white" />}
          />
          <StatCard
            title="Holidays"
            value={1}
            icon={<Calendar size={24} color="white" />}
          />
        </View>

        {/* Recent Activity */}
        <Text style={tw`mt-8 mb-3 text-lg font-bold text-gray-800`}>
          Recent Activity
        </Text>

        <View style={tw`bg-white rounded-2xl p-4 shadow-sm`}>
          <Text style={tw`text-gray-600`}>• Ram marked present</Text>
          <Text style={tw`text-gray-600 mt-1`}>• Shyam requested leave</Text>
          <Text style={tw`text-gray-600 mt-1`}>• New user added</Text>
        </View>
      </ScrollView>
    </View>
  );
}
