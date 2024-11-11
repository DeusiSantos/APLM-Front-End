import { StyleSheet, Text, View } from "react-native";
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';



const StatusBar = (props: any) =>{

    return(
        <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name={props.nameIcon1} size={24} color="#2196F3" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.statValue}>{props.dado1}</Text>
                        <Text style={styles.statLabel}>{props.sub1}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.statCard}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name={props.nameIcon2} size={24} color="#2196F3" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.statValue}>{props.dado2}<Text style={styles.unit}>{props.unit1}</Text></Text>
                        <Text style={styles.statLabel}>{props.sub2}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.statCard}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name={props.nameIcon3} size={24} color="#2196F3" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.statValue}>{props.dado3}<Text style={styles.unit}>{props.unit2}</Text></Text>
                        <Text style={styles.statLabel}>{props.sub3}</Text>
                    </View>
                </View>
            </View>
    )
}


const styles = StyleSheet.create({
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
});

export default StatusBar;