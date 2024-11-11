import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Share } from 'react-native';
import StatusBar from '../../components/StatusBar';

const User = () => {
    // Dados mockados para o gráfico
    const corridaMesData = {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        datasets: [{
            data: [5, 8, 6, 9],
            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        }]
    };

    // Função para compartilhar pontos
    const compartilharPontos = async () => {
        Alert.alert("Area em desenvolvimento");
    };

    return (
        <View style={styles.container}>
            {/* Seção do perfil */}
            <View style={styles.profileSection}>
                <Image
                    source={{ uri: 'https://via.placeholder.com/100' }}
                    style={styles.profileImage}
                />
                <Text style={styles.userName}>João Silva</Text>
                <StatusBar dado1="32" unit1="km" unit2="h" sub1='Pontos' nameIcon1='trophy-outline' dado2="30" sub2='Distância' nameIcon2='map-marker-distance' dado3="1:10" sub3='Tempo' nameIcon3='clock-outline' />
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={compartilharPontos}
                >
                    <Text style={styles.shareButtonText}>Compartilhar Pontos</Text>
                </TouchableOpacity>
            </View>

            {/* Seção do gráfico */}
            <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>Corridas do Mês</Text>
                <LineChart
                    data={corridaMesData}
                    width={Dimensions.get('window').width - 60}
                    height={220}
                    chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                    }}
                    bezier
                    style={styles.chart}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    shareButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        marginTop: 10,
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    chartSection: {
        width: '100%',
        marginTop: 20,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderWidth: 1,
        backgroundColor: '#fff',
        borderColor: '#F0F0F0',
        borderRadius: 10,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        textAlign: 'center',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
});

export default User;