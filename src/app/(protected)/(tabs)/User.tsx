import React, { useState } from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    Image, 
    TouchableOpacity, 
    ScrollView, 
    Alert, 
    Platform,
    RefreshControl
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import StatusBar from '../../../components/StatusBar';
import { useAuth } from '../../../services/AuthContext';
import { useRouter } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import api from '../../../services/api';

interface Trajetoria {
    id: number;
    estacao_inicio: number;
    estacao_fim: number;
    estacao_inicio_nome: string;
    estacao_fim_nome: string;
    data_inicio: string;
    data_formatada: string;
}

interface Station {
    id: number;
    nome: string;
    longitude: string;
    latitude: string;
    descricao: string;
    bikes_disponiveis: number;
}

const User = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [trajetorias, setTrajetorias] = useState<Trajetoria[]>([]);
    const [stations, setStations] = useState<Station[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const getStacoesFromTrajetorias = () => {
        const stationIds = new Set<number>();

        trajetorias.forEach(trajetoria => {
            stationIds.add(trajetoria.estacao_inicio);
            stationIds.add(trajetoria.estacao_fim);
        });

        return stations.filter(station => stationIds.has(station.id));
    };

    const fetchData = async () => {
        try {
            const [trajetoriasResponse, stationsResponse] = await Promise.all([
                api.get(`/trajetorias/usuario/${user?.id}`),
                api.get('/stations')
            ]);

            const newTrajetorias = trajetoriasResponse.data.data;
            if (JSON.stringify(newTrajetorias) !== JSON.stringify(trajetorias)) {
                setTrajetorias(newTrajetorias);
                if (newTrajetorias.length > trajetorias.length) {
                    
                }
            }

            setStations(stationsResponse.data);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            Alert.alert('Erro', 'Não foi possível carregar as trajetórias');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
            const interval = setInterval(fetchData, 10000);
            return () => clearInterval(interval);
        }, [])
    );

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchData().then(() => setRefreshing(false));
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const formatarTempo = (tempo: string) => {
        if (!tempo) return "00:00";
        const [horas, minutos] = tempo.split(':');
        return `${horas}:${minutos}`;
    };

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }
        >
            <View style={styles.header}>
                <Image
                    source={{ uri: 'https://via.placeholder.com/100' }}
                    style={styles.profileImage}
                />
                <View style={styles.profileInfo}>
                    <Text style={styles.userName}>{user?.nome}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
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

            <View style={styles.buttonSection}>
                <TouchableOpacity style={styles.shareButton} >
                    <MaterialCommunityIcons name="share-variant" size={20} color="#FFF" />
                    <Text style={styles.shareButtonText}>Compartilhar Pontos</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <MaterialCommunityIcons name="logout" size={20} color="#FFF" />
                    <Text style={styles.logoutButtonText}>Sair</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.mapSection}>
                <Text style={styles.mapTitle}>Minhas Trajetórias</Text>
                {trajetorias.length > 0 ? (
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        initialRegion={{
                            latitude: -8.836668,
                            longitude: 13.234455,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                    >
                        {getStacoesFromTrajetorias().map((station) => (
                            <Marker
                                key={station.id}
                                coordinate={{
                                    latitude: parseFloat(station.latitude),
                                    longitude: parseFloat(station.longitude),
                                }}
                                title={station.nome}
                                description={station.descricao}
                            >
                                <View style={styles.markerContainer}>
                                    <MaterialCommunityIcons
                                        name="bike"
                                        size={24}
                                        color="#2196F3"
                                    />
                                </View>
                            </Marker>
                        ))}

                        {trajetorias.map((trajetoria) => {
                            const stacaoInicio = stations.find(s => s.id === trajetoria.estacao_inicio);
                            const stacaoFim = stations.find(s => s.id === trajetoria.estacao_fim);

                            if (stacaoInicio && stacaoFim) {
                                return (
                                    <Polyline
                                        key={trajetoria.id}
                                        coordinates={[
                                            {
                                                latitude: parseFloat(stacaoInicio.latitude),
                                                longitude: parseFloat(stacaoInicio.longitude),
                                            },
                                            {
                                                latitude: parseFloat(stacaoFim.latitude),
                                                longitude: parseFloat(stacaoFim.longitude),
                                            }
                                        ]}
                                        strokeColor="#2196F3"
                                        strokeWidth={3}
                                    />
                                );
                            }
                        })}
                    </MapView>
                ) : (
                    <View style={styles.noDataContainer}>
                        <MaterialCommunityIcons
                            name="map-marker-off"
                            size={48}
                            color="#666"
                        />
                        <Text style={styles.noDataText}>
                            Nenhuma trajetória registrada ainda
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>Histórico de Trajetórias</Text>
                {trajetorias.length > 0 ? (
                    <View style={styles.trajetoriasList}>
                        {trajetorias.map((trajetoria) => (
                            <View key={trajetoria.id} style={styles.trajetoriaItem}>
                                <MaterialCommunityIcons
                                    name="bike-fast"
                                    size={24}
                                    color="#2196F3"
                                />
                                <View style={styles.trajetoriaInfo}>
                                    <Text style={styles.trajetoriaDate}>
                                        {trajetoria.data_formatada}
                                    </Text>
                                    <Text style={styles.trajetoriaRoute}>
                                        {trajetoria.estacao_inicio_nome} → {trajetoria.estacao_fim_nome}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.noTrajetoriasText}>
                        Nenhuma trajetória registrada ainda
                    </Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#2196F3',
    },
    profileInfo: {
        marginLeft: 15,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    buttonSection: {
        padding: 20,
        alignItems: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#dc3545',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        width: '80%',
        justifyContent: 'center',
        marginTop: 40
    },
    shareButton: {
        flexDirection: 'row',
        backgroundColor: '#01a30f',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        width: '80%',
        justifyContent: 'center',
    },
    logoutButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    shareButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    mapSection: {
        margin: 20,
        backgroundColor: '#FFF',
        borderRadius: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    mapTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginVertical: 15,
        color: '#333',
        textAlign: 'center',
    },
    map: {
        height: 300,
        width: '100%',
        borderRadius: 15,
    },
    markerContainer: {
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#2196F3',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    noDataContainer: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 15,
    },
    noDataText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
    },
    statsSection: {
        margin: 20,
        padding: 20,
        backgroundColor: '#FFF',
        borderRadius: 15,
    },
    statsSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
        color: '#333',
    },
    trajetoriasList: {
        gap: 15,
    },
    trajetoriaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
    },
    trajetoriaInfo: {
        marginLeft: 15,
        flex: 1,
    },
    trajetoriaDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    trajetoriaRoute: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    noTrajetoriasText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
        fontStyle: 'italic',
    },
});

export default User;