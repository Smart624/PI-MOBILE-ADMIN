import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { query, where, collection, getDocs } from "firebase/firestore";
import { sendPasswordResetEmail } from 'firebase/auth';



type Props = {
    navigation: any;
};

interface FormValues {
    email: string;
    password: string;
}


const AdminLogin: React.FC<Props> = ({ navigation }) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);

    const db = getFirestore();

    const handleResetPassword = async (email: string) => {
        if (email) {
            try {
                await sendPasswordResetEmail(auth, email);
                setSuccessMessage('Link de redefinição de senha enviado para o email.');
            } catch (error) {
                setErrorMessage('Falha ao enviar link de redefinição de senha. Verifique o email fornecido.');
            }
        } else {
            setErrorMessage('Por favor, insira um email válido.');
        }
    };

    const onSubmit = async (values: FormValues) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const userId = userCredential.user.uid;
            if (auth.currentUser) {
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("uid", "==", userId));
                const querySnapshot = await getDocs(q);

                let isAdmin = false;
                querySnapshot.forEach((doc) => {
                    if (doc.data().admin === true) {
                        isAdmin = true;
                    }
                });

                if (isAdmin) {
                    setSuccessMessage('Login de administrador bem-sucedido!');
                    setErrorMessage(null);
                    navigation.navigate('Home');
                } else {
                    setErrorMessage('Acesso negado. Apenas administradores podem entrar.');
                    setSuccessMessage(null);
                }
            } else {
                setErrorMessage('Usuário não está autenticado.');
            }
        } catch (error) {
            setErrorMessage((error as any).message);
            setSuccessMessage(null);
        }
    };




    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Required'),
            password: Yup.string().required('Required'),
        }),
        onSubmit,
    });


    useEffect(() => {
        setTimeout(() => setLoaded(true), 100);
    }, []);


    if (!loaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Login do Administrador</Text>
            <Image source={require('./../../assets/images/Studio-Games.jpg')} style={styles.logo} />
            <Input
                placeholder='E-mail'
                onChangeText={formik.handleChange('email')}
                value={formik.values.email}
                errorMessage={formik.touched.email && formik.errors.email ? formik.errors.email : ''}
            />
            <Input
                placeholder='Senha'
                secureTextEntry
                onChangeText={formik.handleChange('password')}
                value={formik.values.password}
                errorMessage={formik.touched.password && formik.errors.password ? formik.errors.password : ''}
            />
            {successMessage && <Text style={{ color: 'green' }}>{successMessage}</Text>}
            {errorMessage && <Text style={{ color: 'red' }}>{errorMessage}</Text>}
            <Button title="Entrar" onPress={() => formik.handleSubmit()} />
            <Text
                style={styles.resetPasswordText}
                onPress={() => handleResetPassword(formik.values.email)}>
                Esqueci a senha
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f0f0f0',
    },
    logo: {
        alignSelf: 'center',
        marginBottom: 20,
        height: 100,
        width: 100,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        marginTop: -20,
    },
    resetPasswordText: {
        marginTop: 20,
        color: '#007bff',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});

export default AdminLogin;
