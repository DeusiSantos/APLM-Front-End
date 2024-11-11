import { StyleSheet } from "react-native";

export const styleComponents = StyleSheet.create({
    logo:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent:'center',
        alignItems:'center',
        marginBottom: 15

    },
    imag:{width:250 , height:250},
    logoText1:{
        fontSize: 40,
        color: '#2196F3',
        fontWeight:'700',
    },
    logoText2:{
        fontSize: 40,
        color: '#2196F3',
        fontWeight:'700',
    },

    inputsContainer:{
       
        padding: 16,
    },
    inputs:{
        width:'100%',
        borderRadius: 3,
        padding:6,
        borderWidth: 1,
    }

})