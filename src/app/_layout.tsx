import { Stack } from "expo-router";

export default function Layout(){
    return(
        <Stack
        screenOptions={{
            headerStyle:{
                backgroundColor: '#2196F3',
            },
            headerTintColor: '#fff',
        }}
        >
            <Stack.Screen name="index" options={{ title: 'Iniciar Sessão'}} />
            <Stack.Screen name="SignUp" options={{ title: 'Criar Conta'}} />
            <Stack.Screen name="(tabs)" options={{headerTitle: '' , headerBackVisible: false}}/>

        </Stack>
    )
}