import React from 'react'
import { Text, View } from 'react-native'
import { Button } from '@hg/ui'
import 'expo-dev-client'

export default function App() {
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#F8FAFC'}}>
      <View style={{width:320,padding:20,backgroundColor:'#fff',borderRadius:8,elevation:2}}>
        <Text style={{fontSize:20,fontWeight:'700',marginBottom:8}}>HealthGuard — Mobile</Text>
        <Text style={{marginBottom:12}}>Expo + NativeWind example that uses shared UI.</Text>
        <Button title="Primary Action" />
      </View>
    </View>
  )
}
