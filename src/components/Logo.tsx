import { Image, Text, TextInput, View } from "react-native";
import { styleComponents } from "./style";
import LogoTipo from '../assets/logo.png'
const Logo = () => {

    return(
        
            <View style={styleComponents.logo}>
                <Image source={LogoTipo} style={styleComponents.imag} />
                {/* <Text style={styleComponents.logoText1}>Binas</Text>
                <Text style={styleComponents.logoText2}>JC</Text> */}
            </View>
        

    )
}

export default Logo;