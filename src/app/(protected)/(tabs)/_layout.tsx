import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {

   

 return (
   <Tabs
     screenOptions={{
       tabBarActiveTintColor: '#2196F3',
       headerStyle: { backgroundColor: '#2196F3' },
       headerTintColor: '#fff',
     }}
   >
     <Tabs.Screen
       name="Home"
       options={{
         title: 'Home',
         tabBarIcon: ({ color }) => (
           <MaterialCommunityIcons name="home" size={26} color={color} />
         ),
       }}
     />
     <Tabs.Screen
       name="Bikes"
       options={{
         title: 'Bikes',
         tabBarIcon: ({ color }) => (
           <MaterialCommunityIcons name="bike" size={26} color={color} />
         ),
       }}
     />
     <Tabs.Screen
       name="Message"
       options={{
         title: 'Messages',
         tabBarIcon: ({ color }) => (
           <MaterialCommunityIcons name="message" size={26} color={color} />
         ),
       }}
     />
     <Tabs.Screen
       name="User"
       options={{
         title: 'Profile',
         tabBarIcon: ({ color }) => (
           <MaterialCommunityIcons name="account" size={26} color={color} />
         ),
       }}
     />
   </Tabs>
 );
}