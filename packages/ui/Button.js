import React from 'react'
import { Pressable, Text } from 'react-native'

export const Button = ({ title = 'Button', onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: '#2563EB',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 6,
        alignItems: 'center'
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '600' }}>{title}</Text>
    </Pressable>
  )
}

export default Button
