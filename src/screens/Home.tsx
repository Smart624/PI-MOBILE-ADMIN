import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import RootStackParamList from "../navigation/RootStackParamList";
import {collection, getDocs, getFirestore, query, where} from "firebase/firestore";
import {auth} from "../config/firebaseConfig";


type HomeScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Home'
>;

const Home = () => {
    const [adminName, setAdminName] = useState("Administrador"); // Estado para armazenar o nome
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const db = getFirestore();

    useEffect(() => {
        const fetchAdminName = async () => {
            if (auth.currentUser) {
                const userId = auth.currentUser.uid;
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("uid", "==", userId));
                const querySnapshot = await getDocs(q);

                querySnapshot.forEach((doc) => {
                    if (doc.data().fullName) {
                        setAdminName(doc.data().fullName); // Atualiza o nome
                    }
                });
            }
        };

        fetchAdminName();
    }, []);


    return (
        <View style={styles.container}>
            <Image source={require('./../../assets/images/Studio-Games.jpg')} style={styles.logo} />
            <Text style={styles.welcomeText}>Olá, administrador {adminName}!</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Activation')}>
                <Text style={styles.buttonText}>Ativar Usuários</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Fila')}>
                <Text style={styles.buttonText}>Controle de Filas</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => navigation.navigate('Login')}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 18,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 5,
        marginVertical: 10,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    logoutButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default Home;
