import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
    orderBy
} from "firebase/firestore";
import { StackNavigationProp } from '@react-navigation/stack';
import { Timestamp } from 'firebase/firestore';

type QueueControlScreenParams = {
Home: undefined;
QueueControl: undefined;
};

type QueueControlProps = {
    navigation: StackNavigationProp<QueueControlScreenParams>;
};

interface UserInQueue {
    docId: string;
    uid: string;
    loginNickname: string;
    category: string;
    waitTime: string;
    createdAt: Timestamp;
    firestoreDocId?: string;
}
const QueueControl = ({ navigation }: QueueControlProps) => {
    const [searchId, setSearchId] = useState('');
    const [time, setTime] = useState('');
    const [queue, setQueue] = useState<UserInQueue[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('PCs');
    const db = getFirestore();

    const fetchQueue = async () => {
        const q = query(
            collection(db, "queues"),
            where("category", "==", selectedCategory),
            orderBy("createdAt", "asc") // Order by timestamp
        );
        const querySnapshot = await getDocs(q);
        const newQueue: UserInQueue[] = [];

        querySnapshot.forEach((doc) => {
            const docData = doc.data() as UserInQueue;
            newQueue.push({ ...docData, docId: doc.id });
        });

        setQueue(newQueue);
    };





    useEffect(() => {
        fetchQueue();
    }, [selectedCategory]);

    const addToQueue = async () => {
        try {
            // Buscar usuário pelo nickname
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("loginNickname", "==", searchId));
            const userSnapshot = await getDocs(q);

            if (userSnapshot.empty) {
                alert("Erro: Usuário não encontrado.");
                return;
            }



            const userData = userSnapshot.docs[0].data() as UserInQueue;

            // Verifying and formatting the wait time
            const formattedWaitTime = formatWaitTime(time);
            if (!formattedWaitTime) {
                alert("Tempo de espera inválido. Por favor, use o formato hh:mm.");
                return;
            }

            // Adicionar usuário na fila
            await addDoc(collection(db, "queues"), {
                uid: userData.uid,
                loginNickname: userData.loginNickname,
                category: selectedCategory,
                waitTime: formattedWaitTime,
                createdAt: serverTimestamp()
            });

            // Atualizar a fila exibida
            fetchQueue();
        } catch (error) {
            console.error("Erro ao adicionar à fila:", error);
        }
    };

    const formatWaitTime = (time: string): string | null => {
        const timePattern = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
        if (!timePattern.test(time)) {
            alert("Tempo de espera inválido. Por favor, use o formato hh:mm.");
            return null;
        }
        return time;
    };

    const removeFromQueue = async (docId: string) => {
        try {
            await deleteDoc(doc(db, "queues", docId));
            fetchQueue();
        } catch (error) {
            console.error("Erro ao remover da fila:", error);
        }
    };

    const clearQueue = async () => {
        const q = query(collection(db, "queues"), where("category", "==", selectedCategory));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
        fetchQueue();
    };


    return (
        <View style={styles.container}>
            <Button title="Voltar para Home" onPress={() => navigation.navigate('Home')} />

            <TextInput
                placeholder="ID/Nick do usuário"
                value={searchId}
                onChangeText={setSearchId}
                style={styles.input}
            />
            <TextInput
                placeholder="Tempo (hh:mm)"
                value={time}
                onChangeText={setTime}
                style={styles.input}
            />
            <Button title="Adicionar à Fila" onPress={addToQueue} />

            <ScrollView>
                {queue.map((user, index) => (
                    <View key={user.docId} style={styles.userItem}>
                        <Text>{`${index + 1}. ${user.loginNickname} - Espera: ${user.waitTime}`}</Text>
                        <Button title="Remover" onPress={() => removeFromQueue(user.docId)} />
                    </View>
                ))}
            </ScrollView>


            <Button title="Limpar Fila" onPress={clearQueue} />

            <View style={styles.tabs}>
                {['PCs', 'Consoles', 'Simuladores', 'VRs'].map(category => (
                    <TouchableOpacity
                        key={category}
                        onPress={() => setSelectedCategory(category)}
                        style={selectedCategory === category ? styles.selectedTab : null}
                    >
                        <Text>{category}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        marginBottom: 10,
    },
    userItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    selectedTab: {
        borderBottomWidth: 2,
        borderBottomColor: 'blue',
    }
});

export default QueueControl;
