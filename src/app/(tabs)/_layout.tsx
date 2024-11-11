import { Tabs } from "expo-router";

import { AntDesign, FontAwesome, MaterialIcons } from '@expo/vector-icons'
import { View } from "react-native";


export default function Layout() {
    return (
        <Tabs screenOptions={{
            tabBarStyle:{
                backgroundColor: '#fff',
                height: 70
            }
        }}>
            <Tabs.Screen name="Home" options={{
                title:'',
                tabBarLabelPosition: 'beside-icon',
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => (
                    <View style={{
                        backgroundColor: focused ? '#2196F3' : 'transparent',
                        width: 55,
                        padding: 15,
                        borderRadius: 300,
                    }}>
                        <AntDesign
                            name="home"
                            color={ focused ? '#fff' : "#2196F3"}
                            size={size}
                        />
                    </View>
                    
                )
            }} />

            <Tabs.Screen name="Message" options={{
               title:'',
               tabBarLabelPosition: 'beside-icon',
               headerShown: false,
               tabBarIcon: ({ focused, color, size }) => (
                   <View style={{
                       backgroundColor: focused ? '#2196F3' : 'transparent',
                       width: 55,
                       padding: 15,
                       borderRadius: 300,
                   }}>
                       <AntDesign
                           name="message1"
                           color={ focused ? '#fff' : "#2196F3"}
                           size={size}
                       />
                   </View>
                   
               )
           }} />

            <Tabs.Screen name="Bikes" options={{
               title:'',
               tabBarLabelPosition: 'beside-icon',
               headerShown: false,
               tabBarIcon: ({ focused, color, size }) => (
                   <View style={{
                       backgroundColor: focused ? '#2196F3' : 'transparent',
                       width: 55,
                       padding: 15,
                       borderRadius: 300,
                   }}>
                       <MaterialIcons
                           name="directions-bike"
                           color={ focused ? '#fff' : "#2196F3"}
                           size={size}
                       />
                   </View>
                   
               )
           }} />

            <Tabs.Screen name="User" options={{
                title:'',
                tabBarLabelPosition: 'beside-icon',
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => (
                    <View style={{
                        backgroundColor: focused ? '#2196F3' : 'transparent',
                        width: 55,
                        padding: 15,
                        borderRadius: 300,
                    }}>
                        <AntDesign
                            name="user"
                            color={ focused ? '#fff' : "#2196F3"}
                            size={size}
                        />
                    </View>
                    
                )
            }} />

        </Tabs>
    )
}