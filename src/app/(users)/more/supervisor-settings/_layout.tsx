import { Stack } from 'expo-router'
import React from 'react'

const supervisor_layout = () => {
  return (
    <Stack >
      <Stack.Screen name="index" options={{ headerShown: false, }} />
    </Stack>
  )
}

export default supervisor_layout
