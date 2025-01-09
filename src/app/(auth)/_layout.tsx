import { Stack } from "expo-router";
import { AuthProvider } from "../../services/AuthContext";

export default function AuthLayout() {
    return (
        <AuthProvider>
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: '#2196F3' },
                    headerTintColor: '#fff',
                }}
            >
                <Stack.Screen name="index" options={{ title: 'Iniciar Sessão' }} />
                <Stack.Screen name="SignUp" options={{ title: 'Criar Conta' }} />
            </Stack>
        </AuthProvider>
    );
}