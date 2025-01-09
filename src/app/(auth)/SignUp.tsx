import { Alert, Button, StyleSheet, Text, TextInput, Touchable, TouchableOpacity, View } from "react-native";
import Logo from "../../components/Logo";
import { useState } from "react";
import { Link, router } from "expo-router";
import api from "../../services/api";


const SignUp = () => {
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [telefone , setTelefone] = useState('')
    const [loading , setLoading] = useState(false);

    const handleSignUp = async () => {
         // Validation
         if (!email || !senha || !telefone || !nome) {
            Alert.alert("Erro", "Por favor, preencha todos os campos");
            return;
        }

        setLoading(true);
        
        try {
            const response = await api.post('/auth/register', {
                nome,
                email,
                telefone,
                senha
            });

            // Store token (you might want to use AsyncStorage or another storage solution)
            // Example: await AsyncStorage.setItem('userToken', response.data.token);
            
            Alert.alert("Sucesso", response.data.mensagem);
            router.push('/');
        } catch (error) {
            Alert.alert("Erro ao fazer signUp. Verifique suas credenciais.");
        } finally {
            setLoading(false);
        }
    }

    return (

        <View style={style.container}>
            <View>
                <Logo />
                <Text style={[style.textWelcome]}>Crie Uma Conta Agora!</Text>
            </View>

            <View style={[style.inputContainer, style.LittleMarginTop]}>
                <TextInput
                    style={style.input}
                    placeholder="Nome:"
                    placeholderTextColor="#666"
                    value={nome}
                    onChangeText={setNome}
                    autoCapitalize="none"

                />
            </View>

            <View style={[style.inputContainer]}>


                <TextInput
                    style={[style.input]}
                    placeholder="Email:"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"

                />
            </View>

            <View style={[style.inputContainer]}>


                <TextInput
                    style={[style.input]}
                    placeholder="Telefone:"
                    placeholderTextColor="#666"
                    value={telefone}
                    onChangeText={setTelefone}
                    autoCapitalize="none"

                />
            </View>

            <View style={[style.inputContainer,]}>
                <TextInput
                    style={style.input}
                    placeholder="Senha:"
                    placeholderTextColor="#666"
                    value={senha}
                    onChangeText={setSenha}
                    autoCapitalize="none"
                    secureTextEntry
                />
            </View>

            <TouchableOpacity style={[style.buttonEntrar,]} onPress={handleSignUp}>
                <Text style={style.loginButtonText}>Criar Conta</Text>
            </TouchableOpacity>

              
            <Link href={'/'} style={style.esqueceuAsenha}>
                    <Text style={style.esqueceuAsenhaText}>Já tem uma conta ? Iniciar Sessão</Text>
            </Link>
                

        </View>
    )
}

const style = StyleSheet.create({
    LittleMarginTop: { marginTop: 25 },
    LittleMarginBottom: { marginBottom: 25 },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
    },
    inputContainer: {
        width: '100%',
        marginBottom: 15,
        borderRadius: 15,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    input: {
        width: "100%",
        padding: 13,
    },
    textWelcome: {
        textAlign: 'center',
        fontSize: 23,
        fontWeight: '500',
        color: '#333',

    },
    buttonEntrar: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2196F3',
        height: 60,
        textAlign: 'center',
        color: '#fff',
        borderRadius: 10
    },
    loginButtonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '700',
        fontSize: 18

    },
    esqueceuAsenha: {
        marginTop: 12,
        alignSelf: 'flex-end',
    },
    esqueceuAsenhaText: {
        color: '#2196F3',
        fontSize: 14,
    },
    line: {
        borderBottomColor: '#E0E0E0',
        borderBottomWidth: 2,
        marginVertical: 13,
        width: '35%',
    },
    lineWithText: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 15,
    },
    lineText: {
        marginHorizontal: 10,
        color: '#666',
    },

    buttonCriar: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5CB85C',
        height: 60,
        textAlign: 'center',
        color: '#fff',
        borderRadius: 10
    },
    CriarButtonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '700',
        fontSize: 18

    },




})

export default SignUp;