import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'

import { fetchLeaveById } from '@/src/services/leave.service'
import { useLocalSearchParams } from 'expo-router'
import tw from 'twrnc'

const RejectedDetails = () => {
  const [leave, setLeave] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { id } = useLocalSearchParams();
  useEffect(() => {
    if (!id) return
    const loadLeave = async () => {
      try {
        const result = await fetchLeaveById(id as string)
        setLeave(result)
        console.log("Rejected screen", result)
        if (!result) {
          console.log("Error fetching Rejected Details", result)
        }
      } finally {
        setLoading(false)
      }
    }

    loadLeave()
  }, [id])

  if (loading) {
    return <Text style={tw`p-4 text-gray-500`}>Loading...</Text>
  }
  if (!leave) {
    return <Text style={tw`p-4 text-red-500`}>Leave not found</Text>
  }
  return (
    <View style={tw`flex-1 bg-white p-4`}>
      {/* Header */}
      <Text style={tw`text-xl font-bold mb-4`}>
        Leave Request Details
      </Text>

      {/* Status */}
      <View style={tw`mb-4`}>
        <Text style={tw`text-sm text-gray-500`}>Status</Text>
        <Text style={tw`text-lg font-semibold text-red-600`}>
          Rejected
        </Text>
      </View>

      {/* Leave Info */}
      <View style={tw`mb-4`}>
        <Text style={tw`text-sm text-gray-500`}>Leave Type</Text>
        <Text style={tw`text-base`}>{leave.leave_types.name}</Text>
      </View>

      <View style={tw`mb-4`}>
        <Text style={tw`text-sm text-gray-500`}>From</Text>
        <Text style={tw`text-base`}>{leave.start_date}</Text>
      </View>

      <View style={tw`mb-4`}>
        <Text style={tw`text-sm text-gray-500`}>To</Text>
        <Text style={tw`text-base`}>{leave.end_date}</Text>
      </View>

      {/* Rejection Reason */}
      <View style={tw`mt-6 p-4 bg-red-50 rounded-lg border border-red-200`}>
        <Text style={tw`text-sm text-red-600 font-semibold mb-1`}>
          Rejection Reason
        </Text>
        <Text style={tw`text-red-700`}>
          {leave.rejectionReason || 'No reason provided'}
        </Text>
      </View>
    </View>
  )
}

export default RejectedDetails
