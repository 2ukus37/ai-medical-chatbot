import React from 'react'
import { View } from 'react-native'

export const Card = ({ children, style }) => (
  <View style={[{ backgroundColor: '#fff', padding: 12, borderRadius: 8, elevation: 2 }, style]}>
    {children}
  </View>
)

export default Card
