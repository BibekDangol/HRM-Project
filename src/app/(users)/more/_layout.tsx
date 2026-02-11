
import { Stack } from "expo-router";

export default function MoreLayout() {
    return(
        <Stack>
            <Stack.Screen name=" index" options={{headerShown: false, title: "More"}}></Stack.Screen>
        </Stack>
    )
}