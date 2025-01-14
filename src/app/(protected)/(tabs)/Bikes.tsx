import React, { useEffect, useState } from 'react';
import {
    StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity,
    SafeAreaView, Dimensions, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import StatusBar from '../../../components/StatusBar';
import api from '../../../services/api';
import { useAuth } from '../../../services/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 48) / 2;

interface Station {
    id?: number;
    nome: string;
    bikes_disponiveis: number;
    descricao: string | null;
}

interface Reservation {
    id: number;
    id_ciclista: number;
    id_estacao: number;
    status: string;
    data_reserva: string;
}

const ReservationInfo = ({ reservation, stationName }: { reservation: Reservation, stationName: string }) => (
    <View style={styles.reservationCard}>
        <MaterialCommunityIcons name="bike" size={48} color="#2196F3" />
        <Text style={styles.reservationTitle}>Reserva Ativa</Text>
        <Text style={styles.reservationStatus}>Status: {reservation.status}</Text>
        <Text style={styles.reservationDate}>
            Data: {new Date(reservation.data_reserva).toLocaleString()}
        </Text>
        <Text style={styles.reservationStation}>Estação: {stationName}</Text>
    </View>
);

const Bikes = () => {
    useFocusEffect(
        React.useCallback(() => {
            Promise.all([fetchStations(), checkActiveReservation()]);
        }, [])
    );
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [disponiveis, setDisponiveis] = useState(0);
    const [indisponiveis, setIndisponiveis] = useState(0);
    const [total, setTotal] = useState(0);
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const checkActiveReservation = async () => {
        try {
            const response = await api.get(`/reservas/active/${user?.id}`);
            if (response.data.status === 'success') {
                setActiveReservation(response.data.data);
            } else {
                setActiveReservation(null);
            }
        } catch (error) {
            console.error('Erro ao verificar reserva:', error);
            setActiveReservation(null);
        }
    };

    const handleReserve = async (stationId: number) => {
        try {
            console.log('Dados enviados:', {
                id_ciclista: user?.id,
                id_estacao: stationId
            });

            const response = await api.post('/reservas/reserve', {
                id_ciclista: user?.id,
                id_estacao: stationId
            });

            console.log('Resposta:', response.data);
            Alert.alert('Sucesso', 'Bike reservada com sucesso!');
            checkActiveReservation();
            fetchStations();
        } catch (error: any) {
            console.error('Erro detalhado:', error.response?.data || error.message);
            Alert.alert('Erro', error.response?.data?.message || 'Não foi possível reservar a bike');
        }
    };

    const fetchStations = async () => {
        try {
            const response = await api.get('/stations');
            // Filtra as estações com bikes disponíveis
            const availableStations = response.data.filter(
                (station: Station) => station.bikes_disponiveis > 0
            );
            setStations(response.data);
    
            // Atualiza os contadores
            setDisponiveis(availableStations.length);
            setIndisponiveis(response.data.length - availableStations.length);
            setTotal(response.data.length);
        } catch (error) {
            console.error('Erro ao buscar estações:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchStations(), checkActiveReservation()]);
        setRefreshing(false);
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchStations(), checkActiveReservation()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const filteredStations = stations.filter(station =>
            // Primeiro filtra por bikes disponíveis
            station.bikes_disponiveis > 0 &&
            // Depois aplica o filtro de busca se houver um termo
            (station.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (station.descricao?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
        );

    const renderStationCard = ({ item }: { item: Station }) => (
        <TouchableOpacity style={styles.card}>
            <View style={[
                styles.statusIndicator,
                { backgroundColor: item.bikes_disponiveis > 0 ? '#4CAF50' : '#F44336' }
            ]} />

            <View style={styles.cardHeader}>
                <MaterialCommunityIcons
                    name="bike"
                    size={24}
                    color={item.bikes_disponiveis > 0 ? '#4CAF50' : '#F44336'}
                />
                <Text style={styles.bikeCount}>{item.bikes_disponiveis}</Text>
            </View>

            <Text style={styles.stationName} numberOfLines={2}>
                {item.nome}
            </Text>

            {item.descricao && (
                <Text style={styles.description} numberOfLines={2}>
                    {item.descricao}
                </Text>
            )}

            <TouchableOpacity
                style={[
                    styles.reserveButton,
                    !item.bikes_disponiveis && styles.disabledButton
                ]}
                disabled={!item.bikes_disponiveis}
                onPress={() => handleReserve(item.id!)}
            >
                <Text style={styles.reserveButtonText}>
                    {item.bikes_disponiveis ? 'Reservar' : 'Indisponível'}
                </Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <StatusBar
                    dado1={disponiveis}
                    sub1='Disponivel'
                    nameIcon1='check-circle-outline'
                    dado2={indisponiveis}
                    sub2='Indisponivel'
                    nameIcon2='close-circle-outline'
                    dado3={total}
                    sub3='Total'
                    nameIcon3='chart-bar'
                />

                {activeReservation ? (
                    <ReservationInfo
                        reservation={activeReservation}
                        stationName={stations.find(s => s.id === activeReservation.id_estacao)?.nome || ''}
                    />
                ) : (
                    <FlatList
                        ListHeaderComponent={
                            <>
                                <Text style={styles.title}>Estações disponíveis</Text>
                                <View style={styles.searchContainer}>
                                    <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Buscar estação..."
                                        value={searchTerm}
                                        onChangeText={setSearchTerm}
                                        placeholderTextColor="#666"
                                    />
                                </View>
                            </>
                        }
                        data={filteredStations}
                        renderItem={renderStationCard}
                        keyExtractor={item => item.nome}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1A1A1A',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1A1A1A',
    },
    row: {
        justifyContent: 'space-between',
    },
    listContent: {
        paddingBottom: 16,
    },
    card: {
        width: cardWidth,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        position: 'relative',
    },
    statusIndicator: {
        position: 'absolute',
        top: 0,
        right: 16,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    bikeCount: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#1A1A1A',
    },
    stationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
        height: 40,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        height: 36,
    },
    reserveButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#E0E0E0',
    },
    reserveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    reservationCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginVertical: 16,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    reservationTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginVertical: 16,
    },
    reservationStatus: {
        fontSize: 18,
        color: '#2196F3',
        marginBottom: 8,
    },
    reservationDate: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    reservationStation: {
        fontSize: 16,
        color: '#666',
    },
});

export default Bikes;