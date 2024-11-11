import { StyleSheet, Text, View, TouchableOpacity, Platform, Alert } from "react-native";
import { AntDesign, MaterialCommunityIcons , Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import MapView, { Marker, Callout } from 'react-native-maps';
import StatusBar from "../../components/StatusBar";
import api from '../../services/api'; // Importando a configuração do axios

interface Station {
    id?: number; // opcional já que não vem na API
    nome: string;
    longitude: number; // mudando para number ao invés de string
    latitude: number; // mudando para number ao invés de string
    bikes_disponiveis: number;
    descricao: string | null;
    created_at?: string; // opcional já que não vem na API
}
const CustomMarker = ({ bikes_disponiveis }: { bikes_disponiveis: number }) => (
    <View style={styles.markerContainer}>
        <Ionicons 
            name="location-sharp" 
            size={24} 
            color={bikes_disponiveis > 0 ? "#2196F3" : "#FF4C00"}
        />
    </View>
);

const Home = () => {
    const [isRunning, setIsRunning] = useState(false);
    let [pontos, setPontos] = useState(30);
    const [time, setTime] = useState(0);
    const [stations, setStations] = useState<Station[]>([]);
    const [initialRegion] = useState({
        latitude: -8.836668, // Coordenada mais precisa de Luanda
        longitude: 13.234455,
        latitudeDelta: 0.05, // Valores menores para um zoom mais próximo
        longitudeDelta: 0.05,
    });

    const fetchStations = async () => {
        try {
            const response = await api.get('/stations');
            // Convertendo as strings de latitude e longitude para números
            
            const formattedStations = response.data.map((station: any) => ({
                ...station,
                latitude: parseFloat(station.latitude),
                longitude: parseFloat(station.longitude),
            }));
            setStations(formattedStations);
            console.log('Estações carregadas:', formattedStations); // Para debug
        } catch (error) {
            console.error('Erro ao buscar estações:', error);
            Alert.alert(
                'Erro',
                'Não foi possível carregar as estações. Por favor, verifique sua conexão.',
                [{ text: 'OK' }]
            );

        }
    };


    // Efeito para carregar as estações quando o componente montar
    useEffect(() => {
        const loadStations = async () => {
            try {
                await fetchStations();
            } catch (error) {
                // Tenta novamente após 5 segundos em caso de erro
                setTimeout(loadStations, 5000);
            }
        };

        loadStations();
    }, []);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isRunning) {
            intervalId = setInterval(() => {
                setTime(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isRunning]);

    useEffect(() => {
        if (time > 0 && time % 10 === 0) {
            setPontos(prevPontos => prevPontos + 1);
        }
    }, [time]);

    // Função de formatação de tempo, agora sem necessidade de incremento de 'pontos'
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartStop = () => {
        setIsRunning(!isRunning);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTime(0);
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                        <AntDesign name="user" size={20} color="#fff" />
                    </View>
                    <Text style={styles.userName}>Hello, Nancy</Text>
                </View>

                <View style={styles.notificationContainer}>
                    <AntDesign name="bells" size={24} color="#1A1A1A" />
                    <View style={styles.notificationBadge} />
                </View>
            </View>

            {/* Stats Section */}
            <StatusBar
                dado1={pontos}
                unit1="km"
                unit2="h"
                sub1='Pontos'
                nameIcon1='trophy-outline'
                dado2="30"
                sub2='Distância'
                nameIcon2='map-marker-distance'
                dado3="1:10"
                sub3='Tempo'
                nameIcon3='clock-outline'
            />

            {/* Timer Section */}
            <View style={styles.timerSection}>
                <View style={styles.timerDisplay}>
                    <Text style={styles.timerText}>{formatTime(time)}</Text>
                </View>
                <View style={styles.timerControls}>
                    <TouchableOpacity
                        style={[styles.timerButton, isRunning ? styles.stopButton : styles.startButton]}
                        onPress={handleStartStop}
                    >
                        <Text style={styles.buttonText}>
                            {isRunning ? 'STOP' : 'START'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={handleReset}
                    >
                        <Text style={styles.resetButtonText}>RESET</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Map Section com Estações */}
            <View style={styles.mapSection}>
                <MapView
                    style={styles.map}
                    initialRegion={initialRegion}
                    showsUserLocation
                    showsMyLocationButton
                >
                    {stations.map((station) => (
                        <Marker
                            key={station.nome}
                            coordinate={{
                                latitude: station.latitude,
                                longitude: station.longitude,
                            }}
                            title={station.nome}
                            description={station.descricao || ''}
                        >
                            <CustomMarker bikes_disponiveis={station.bikes_disponiveis} />
                            <Callout tooltip>
                                <View style={styles.calloutContainer}>
                                    <View style={styles.calloutBubble}>
                                        <Text style={styles.calloutTitle}>{station.nome}</Text>
                                        <View style={styles.calloutStats}>
                                            <Ionicons 
                                                name="bicycle" 
                                                size={20} 
                                                color={station.bikes_disponiveis > 0 ? "#2196F3" : "#FF4C00"}
                                            />
                                            <Text style={[
                                                styles.calloutText,
                                                { color: station.bikes_disponiveis > 0 ? "#2196F3" : "#FF4C00" }
                                            ]}>
                                                {station.bikes_disponiveis} bikes disponíveis
                                            </Text>
                                        </View>
                                        {station.descricao && (
                                            <Text style={styles.calloutDescription}>
                                                {station.descricao}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.calloutArrow} />
                                </View>
                            </Callout>
                        </Marker>
                    ))}
                </MapView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 20,
    },

    // Header Styles
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    userAvatar: {
        width: 40,
        height: 40,
        backgroundColor: '#2196F3',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    notificationContainer: {
        position: 'relative',
        padding: 8,
    },
    notificationBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        backgroundColor: '#FF4C00',
        borderRadius: 4,
    },

    // Stats Section Styles
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
    },
    iconContainer: {
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        padding: 10,
        borderRadius: 12,
        marginBottom: 8,
    },
    textContainer: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2196F3',
        marginBottom: 4,
    },
    unit: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    statLabel: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: '#E8E8E8',
        marginHorizontal: 15,
    },

    timerSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        alignItems: 'center',
    },
    timerDisplay: {
        marginBottom: 20,
    },
    timerText: {
        fontSize: 48,
        fontWeight: '700',
        color: '#2196F3',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    timerControls: {
        flexDirection: 'row',
        gap: 16,
    },
    timerButton: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    startButton: {
        backgroundColor: '#4CAF50',
    },
    stopButton: {
        backgroundColor: '#F44336',
    },
    resetButton: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#666666',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    resetButtonText: {
        color: '#666666',
        fontSize: 16,
        fontWeight: '600',
    },

    // Map Section Styles
    mapSection: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    map: {
        width: '100%',
        height: '100%',
    },




    markerContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 2,
        borderWidth: 1,
        borderColor: '#2196F3',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    // Modern Callout Styles
    calloutContainer: {
        // Remove padding here
        width: 200,
        alignItems: 'center',
    },
    calloutBubble: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    calloutTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    calloutStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    calloutText: {
        fontSize: 14,
        fontWeight: '600',
    },
    calloutDescription: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    calloutArrow: {
        width: 20,
        height: 20,
        backgroundColor: 'white',
        transform: [{ rotate: '45deg' }],
        marginTop: -10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default Home;