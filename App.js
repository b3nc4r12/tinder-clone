import React from "react"
import { StatusBar } from "expo-status-bar"
import { LogBox } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import StackNavigator from "./StackNavigator"
import { AuthProvider } from "./hooks/useAuth"

LogBox.ignoreLogs(["AsyncStorage has been extracted"])

const App = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <StackNavigator />
      </AuthProvider>
      <StatusBar style="auto" />
    </NavigationContainer>
  )
}

export default App