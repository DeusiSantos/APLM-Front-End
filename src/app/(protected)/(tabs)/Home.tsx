import { StyleSheet, Text, View, TouchableOpacity, Platform, Alert } from "react-native";
import { AntDesign, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import StatusBar from "../../../components/StatusBar";
import api from '../../../services/api';
import { useAuth } from "../../../services/AuthContext";
import * as Location from 'expo-location';
import { GOOGLE_MAPS_KEY } from '@env';

interface Station {
    id?: number;
    nome: string;
    longitude: number;
    latitude: number;
    bikes_disponiveis: number;
    descricao: string | null;
    created_at?: string;
}

interface ActiveReservation {
    id: number;
    id_ciclista: number;
    id_estacao: number;
    status: string;
    data_reserva: string;
}

interface Coordinate {
    latitude: number;
    longitude: number;
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
    const mapRef = useRef<MapView>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const { user } = useAuth();
    const [pontos, setPontos] = useState(30);
    const [time, setTime] = useState(0);
    const [stations, setStations] = useState<Station[]>([]);
    const [activeReservation, setActiveReservation] = useState<ActiveReservation | null>(null);
    const [reservedStation, setReservedStation] = useState<Station | null>(null);
    const [simulatedLocation, setSimulatedLocation] = useState<Coordinate | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
    const [isRouteCompleted, setIsRouteCompleted] = useState(false);
    const [randomDestination, setRandomDestination] = useState<Station | null>(null);
    const [routeDistance, setRouteDistance] = useState<number>(0);
    const [estimatedTime, setEstimatedTime] = useState<string>('00:00:00');
    const [routeType, setRouteType] = useState<'pickup' | 'random'>('pickup');
    const [initialRegion, setInitialRegion] = useState({
        latitude: -8.836668,
        longitude: 13.234455,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    const interpolateCoordinates = (start: Coordinate, end: Coordinate, steps: number): Coordinate[] => {
        const coords = [];
        for (let i = 0; i <= steps; i++) {
            const latitude = start.latitude + (end.latitude - start.latitude) * (i / steps);
            const longitude = start.longitude + (end.longitude - start.longitude) * (i / steps);
            coords.push({ latitude, longitude });
        }
        return coords;
    };

    const updateReservationStatus = async () => {
        try {
            if (!activeReservation) {
                console.error('Nenhuma reserva ativa encontrada');
                return;
            }

            // Atualizando para usar o ID da reserva na URL
            await api.patch(`/reservas/status/levantado/${activeReservation.id}`);

            Alert.alert('Sucesso', 'Bike levantada com sucesso!');
            setIsRouteCompleted(true);
            setActiveReservation(null);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            Alert.alert('Erro', 'Não foi possível atualizar o status da reserva');
        }
    };

    const updateReservationStatusDevolvido = async () => {
        try {
            if (!activeReservation) {
                console.error('Nenhuma reserva ativa encontrada');
                return;
            }

            // Atualizando para usar o ID da reserva na URL
            await api.patch(`/reservas/status/devolvido/${activeReservation.id}`);

            Alert.alert('Sucesso', 'Bike devolvida com sucesso!');
            setIsRouteCompleted(true);
            setActiveReservation(null);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            Alert.alert('Erro', 'Não foi possível atualizar o status da reserva');
        }
    };



    const selectRandomStation = () => {
        if (!stations.length) return;

        const currentStation = reservedStation;
        const availableStations = stations.filter(station =>
            station.id !== currentStation?.id &&
            station.bikes_disponiveis > 0
        );

        if (availableStations.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableStations.length);
            setRandomDestination(availableStations[randomIndex]);
            setRouteType('random');

            // Ajusta o mapa para mostrar a nova rota
            if (userLocation) {
                mapRef.current?.fitToCoordinates([
                    {
                        latitude: userLocation.coords.latitude,
                        longitude: userLocation.coords.longitude,
                    },
                    {
                        latitude: availableStations[randomIndex].latitude,
                        longitude: availableStations[randomIndex].longitude,
                    }
                ], {
                    edgePadding: {
                        top: 50,
                        right: 50,
                        bottom: 50,
                        left: 50,
                    },
                    animated: true,
                });
            }
        }
    };

    const simulateRoute = async () => {
        if ((!userLocation || !reservedStation) && !randomDestination) return;
        if (isSimulating) return;

        setIsSimulating(true);
        setSimulatedLocation({
            latitude: userLocation!.coords.latitude,
            longitude: userLocation!.coords.longitude
        });

        const destination = routeType === 'pickup' ? reservedStation : randomDestination;

        if (!destination) return;

        const steps = 50;
        const route = interpolateCoordinates(
            {
                latitude: userLocation!.coords.latitude,
                longitude: userLocation!.coords.longitude
            },
            {
                latitude: destination.latitude,
                longitude: destination.longitude
            },
            steps
        );

        setRouteCoordinates(route);

        for (let i = 0; i < route.length; i++) {
            setSimulatedLocation(route[i]);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (routeType === 'pickup') {
            await updateReservationStatus();
        } else if (routeType === 'random' && reservedStation) {
            try {
                // Registra a trajetória
                const trajetoriaData = {
                    id_usuario: user?.id,
                    estacao_inicio: reservedStation.id,
                    estacao_fim: destination.id,
                    data_inicio: new Date().toISOString().split('T')[0]
                };
    
                await api.post('/trajetorias', trajetoriaData);
    
                // Atualiza os pontos do ciclista
                const pointsData = {
                    pontos: 10,
                    distancia: user?.distancia + routeDistance.toFixed(2),
                    tempo: user?.tempo + estimatedTime
                };
    
                await api.patch(`/cyclists/${user?.id}/points`, pointsData);
                
                // Atualiza o estado local
                setPontos(prev => prev + 10);

                await updateReservationStatusDevolvido();
                
                Alert.alert('Sucesso', 
                    `Corrida finalizada!\n+10 pontos\nDistância: ${routeDistance.toFixed(2)} km\nTempo: ${estimatedTime}`
                );
                
                // Reset dos estados
                setTime(0);
                setIsRunning(false);
                setRouteDistance(0);
                setEstimatedTime('00:00:00');
    
            } catch (error) {
                console.error('Erro ao finalizar corrida:', error);
                Alert.alert('Erro', 'Não foi possível registrar a corrida');
            }
        }
    
        setIsSimulating(false);
    };

    useEffect(() => {
        const getLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'Precisamos da sua localização para mostrar as estações próximas.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setUserLocation(location);

            if (location) {
                setInitialRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            }
        };

        getLocation();
        const locationInterval = setInterval(getLocation, 10000);
        return () => clearInterval(locationInterval);
    }, []);

    const fetchStations = async () => {
        try {
            const response = await api.get('/stations');
            const formattedStations = response.data.map((station: any) => ({
                ...station,
                latitude: parseFloat(station.latitude),
                longitude: parseFloat(station.longitude),
            }));
            setStations(formattedStations);
        } catch (error) {
            console.error('Erro ao buscar estações:', error);
            Alert.alert('Erro', 'Não foi possível carregar as estações. Por favor, verifique sua conexão.');
        }
    };

    const checkActiveReservation = async () => {
        try {
            const response = await api.get(`/reservas/active/${user?.id}`);
            console.log('Resposta da reserva:', response.data);

            if (response.data.status === 'success' && response.data.data) {
                setActiveReservation(response.data.data);

                // Verificar se o status é "levantado"
                if (response.data.data.status === 'levantado') {
                    setIsRouteCompleted(true);
                    // Se não houver destino aleatório ainda, seleciona um
                    if (!randomDestination) {
                        selectRandomStation();
                    }
                } else {
                    const station = stations.find(s => s.id === response.data.data.id_estacao);
                    if (station) {
                        setReservedStation(station);
                        setRouteType('pickup');
                        setIsRouteCompleted(false);
                    }
                }
            } else {
                setActiveReservation(null);
                setReservedStation(null);
                setRandomDestination(null);
                setIsRouteCompleted(false);
            }
        } catch (error) {
            console.error('Erro ao verificar reserva:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchStations();
                await checkActiveReservation();
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            }
        };

        loadData();
        const interval = setInterval(loadData, 10000); // Atualiza a cada 10 segundos
        return () => clearInterval(interval);
    }, [activeReservation]); // Adiciona activeReservation como dependência

    // Timer logic
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

    const formatarTempo = (tempo: string) => {
        if (!tempo) return "00:00";
        const [horas, minutos] = tempo.split(':');
        return `${horas}:${minutos}`;
    };

    useEffect(() => {
        if (reservedStation && userLocation) {
            // Ajusta o mapa para mostrar tanto o usuário quanto a estação
            mapRef.current?.fitToCoordinates([
                {
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                },
                {
                    latitude: reservedStation.latitude,
                    longitude: reservedStation.longitude,
                }
            ], {
                edgePadding: {
                    top: 50,
                    right: 50,
                    bottom: 50,
                    left: 50,
                },
                animated: true,
            });
        }
    }, [reservedStation, userLocation]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                        <AntDesign name="user" size={20} color="#fff" />
                    </View>
                    <Text style={styles.userName}>Hello, {user?.nome}</Text>
                </View>

                <View style={styles.notificationContainer}>
                    <AntDesign name="bells" size={24} color="#1A1A1A" />
                    <View style={styles.notificationBadge} />
                </View>
            </View>

            <StatusBar
                dado1={user?.pontos}
                unit1="km"
                unit2="h"
                sub1='Pontos'
                nameIcon1='trophy-outline'
                dado2={user?.distancia}
                sub2='Distância'
                nameIcon2='map-marker-distance'
                dado3={user?.tempo ? formatarTempo(user?.tempo) : "00:00"}
                sub3='Tempo'
                nameIcon3='clock-outline'
            />



            <View style={styles.mapSection}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={initialRegion}
                    showsUserLocation={!isSimulating}
                    showsMyLocationButton
                    loadingEnabled={true}
                    showsCompass={true}
                    showsScale={true}
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

                    {isSimulating && simulatedLocation && (
                        <Marker
                            coordinate={simulatedLocation}
                            title="Sua posição"
                        >
                            <View style={styles.userMarker}>
                                <MaterialCommunityIcons
                                    name="bike-fast"
                                    size={30}
                                    color="#2196F3"
                                />
                            </View>
                        </Marker>
                    )}

                    {userLocation && (routeType === 'pickup' ? reservedStation : randomDestination) && (
                        <MapViewDirections
                            origin={isSimulating && simulatedLocation ? simulatedLocation : {
                                latitude: userLocation.coords.latitude,
                                longitude: userLocation.coords.longitude,
                            }}
                            destination={routeType === 'pickup'
                                ? {
                                    latitude: reservedStation!.latitude,
                                    longitude: reservedStation!.longitude,
                                }
                                : {
                                    latitude: randomDestination!.latitude,
                                    longitude: randomDestination!.longitude,
                                }
                            }
                            apikey={GOOGLE_MAPS_KEY}
                            strokeWidth={3}
                            strokeColor={routeType === 'pickup' ? "#2196F3" : "#4CAF50"}
                            mode="WALKING"
                            onReady={result => {
                                // Atualiza a visualização do mapa
                                mapRef.current?.fitToCoordinates(result.coordinates, {
                                    edgePadding: {
                                        top: 50,
                                        right: 50,
                                        bottom: 50,
                                        left: 50,
                                    },
                                });
                                
                                // Armazena a distância
                                setRouteDistance(result.distance);
                                
                                // Calcula o tempo estimado (assumindo velocidade média de 12 km/h)
                                const timeInHours = result.distance / 12; // 12 km/h
                                const timeInSeconds = timeInHours * 3600;
                                setEstimatedTime(formatTime(Math.round(timeInSeconds)));
                            }}
                            
                        />
                    )}
                </MapView>

                {/* Botões de controle */}
                <View style={styles.buttonContainer}>
                    {!isSimulating && (
                        <>
                            {!isRouteCompleted && reservedStation && (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => {
                                        setRouteType('pickup');
                                        simulateRoute();
                                    }}
                                >
                                    <MaterialCommunityIcons name="play" size={24} color="#FFF" />
                                    <Text style={styles.actionButtonText}>Simular Rota até Estação</Text>
                                </TouchableOpacity>
                            )}

                            {isRouteCompleted && randomDestination && (
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                                    onPress={() => {
                                        setRouteType('random');
                                        simulateRoute();
                                    }}
                                >
                                    <MaterialCommunityIcons name="bike" size={24} color="#FFF" />
                                    <Text style={styles.actionButtonText}>Pedalar até {randomDestination.nome}</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>

                {/* Indicadores de status */}
                {isSimulating && (
                    <View style={styles.statusInfo}>
                        <MaterialCommunityIcons
                            name="bike"
                            size={24}
                            color="#2196F3"
                        />
                        <Text style={styles.statusText}>
                            {routeType === 'pickup'
                                ? 'Indo buscar a bike...'
                                : 'Pedalando até o destino...'}
                        </Text>
                    </View>
                )}
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
    userMarker: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    calloutContainer: {
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
    buttonContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        gap: 8,
    },
    actionButton: {
        backgroundColor: '#2196F3',
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        elevation: 4,
    },
    actionButtonText: {
        color: '#FFF',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    statusInfo: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 4,
    },
    statusText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    }
});

export default Home;