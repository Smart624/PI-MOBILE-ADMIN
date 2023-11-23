import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs} from 'firebase/firestore';
import { Timestamp as FirebaseTimestamp } from 'firebase/firestore';


interface UserData {
    fullName: string;
    email: string;
    cpf: string;
    dateOfBirth: FirebaseTimestamp | string;
    phone: string;
    responsiblePhone: string;
    state: string;
    city: string;
    uid: string;
    loginNickname: string;
    docId?: string; // tem o ? porque é opcional
    activated: boolean;
}

interface Timestamp {
    seconds: number;
    nanoseconds: number;
    toDate(): Date;
}

const formatDate = (date: FirebaseTimestamp | string): string => {
    if (typeof date === 'string') {
        return date;
    } else {
        return date.toDate().toLocaleDateString('pt-BR');
    }
};



const AccountActivation = () => {
    const [userInfo, setUserInfo] = useState<UserData | null>(null);
    const [activationStatus, setActivationStatus] = useState('');

    const db = getFirestore();

    const fetchUser = async (loginNickname: string): Promise<void> => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("loginNickname", "==", loginNickname));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0]; // Assume que loginNickname é único
            const data = docSnap.data() as UserData;

            // Armazena também o ID do documento
            const userDataWithDocId = {
                ...data,
                docId: docSnap.id,
            };

            setUserInfo(userDataWithDocId);
            setActivationStatus('Usuário encontrado.');
        } else {
            setUserInfo(null);
            setActivationStatus('Usuário não encontrado.');
        }
    };




    const onActivate = async () => {
        if (userInfo && userInfo.docId) {
            const userRef = doc(db, 'users', userInfo.docId);
            // se não tiver ativado
            if (!userInfo.activated) {
                await updateDoc(userRef, {
                    activated: true,
                });
                setActivationStatus('Conta ativada com sucesso.');
            }
            else {
                await updateDoc(userRef, {
                    activated: false,
                });
                setActivationStatus('Conta desativada com sucesso.');
            }
            }

    };


    const formik = useFormik({
        initialValues: { loginNickname: '' },
        validationSchema: Yup.object({
            loginNickname: Yup.string().required('Nickname é obrigatório'),
        }),
        onSubmit: (values) => {
            fetchUser(values.loginNickname);
        },
    });


    return (
        <ScrollView style={styles.container}>
            <Input
                placeholder='ID/Nick do usuário'
                onChangeText={formik.handleChange('loginNickname')}
                value={formik.values.loginNickname}
                errorMessage={formik.touched.loginNickname && formik.errors.loginNickname ? formik.errors.loginNickname : ''}
            />

            <Button title="Confirmar" onPress={() => formik.handleSubmit()} />

            {userInfo && (
                <View style={styles.userInfo}>
                    <Text>Nome Completo: {userInfo.fullName}</Text>
                    <Text>Email: {userInfo.email}</Text>
                    <Text>CPF: {userInfo.cpf}</Text>
                    <Text>Data de Nascimento: {formatDate(userInfo.dateOfBirth)}</Text>
                    <Text>Telefone: {userInfo.phone}</Text>
                    <Text>Telefone do Responsável: {userInfo.responsiblePhone}</Text>
                    <Text>Estado: {userInfo.state}</Text>
                    <Text>Cidade: {userInfo.city}</Text>
                    <Text>Ativado: {userInfo.activated ? 'Sim' : 'Não'}</Text>

                    <Button title="Ativar/Desativar Conta" onPress={onActivate} />
                </View>
            )}

            {activationStatus !== '' && (
                <Text style={activationStatus === 'Usuário não encontrado.' ? styles.activationStatusError : styles.activationStatusSuccess}>
                    {activationStatus}
                </Text>
            )}

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    userInfo: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
    },
    activationStatusSuccess: {
        marginTop: 20,
        fontSize: 16,
        color: 'green',
        textAlign: 'center',
    },
    activationStatusError: {
        marginTop: 20,
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
});


export default AccountActivation;


