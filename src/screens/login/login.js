
import React, { useState, useEffect } from "react";
import { TextInput, FlatList, View, Text, TouchableOpacity, Image, StyleSheet, Button, Alert, ToastAndroid, Modal } from 'react-native';
import logo from '../../assets/logoReactiva.png'
import { AuthService } from "../services/login.services";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ReactNativeBiometricsLegacy as Biometric, BiometryTypes } from 'react-native-biometrics';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/Entypo'
import { useNavigation } from "@react-navigation/native";
import { getData, getDbConnection } from "../../database/db";
import { Loading } from "../../utils/loading";
import Toast from "react-native-toast-message";
import Recoverpassword from "../login/recoverPassword/recoverpassword"


export const Login = ({route}) => {
    const [form, setForm] = useState({
        username: { valor: '', nombre: 'login' },
        password: { valor: '', nombre: 'password' },
    });
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);
    const [signatureAvaliable, setSignatureAvaliable] = useState('')
    const [session, setSession] = useState('')
    const [loading, setLoading] = useState(false)
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        loadData();
    }, [route])

    const loadData = async () => {
        setSignatureAvaliable(JSON.parse(await AsyncStorage.getItem("signature")))
        setSession(JSON.parse(await AsyncStorage.getItem("session")))

        console.log("la session ", JSON.parse(await AsyncStorage.getItem("session")));
        console.log("signatureAvaliable ", JSON.parse(await AsyncStorage.getItem("signature")));
    }

    const onLogin = async () => {
        setLoading(true)
        console.log(" el username ", form);
        if (form.username.valor && form.password.valor) {
            const dataToStore = {
                username: {
                    valor: form.username.valor
                },
                password: {
                    valor: form.password.valor
                }
            };
            await AsyncStorage.setItem('signature', JSON.stringify(dataToStore));
            
            if (session) {
                if (session.username == form.username.valor && session.password == form.password.valor) {
                    Toast.show({ text1: "Bienvenido " + form.username.valor })
                    setLoading(false)
                    navigation.navigate('Home')
                }
                else {
                    setLoading(false)
                    Alert.alert("Alerta", "Tiene una sesión iniciada, ¿desear cerrarla?")
                }
            }
            else {
                AuthService(form, async (flag, res) => {
                    if (flag) {
                        console.log("respuesta", flag, res)
                        Toast.show({ text1: "Bienvenido " + form.username.valor })
                        setLoading(false)
                        let user = { ...form };
                        user.username.valor = '';
                        setForm(user);
                        let pass = { ...form };
                        pass.password.valor = '';
                        setForm(pass);
                        navigation.navigate('Home')
                    }
                    else {
                        setLoading(false)
                        let user = { ...form };
                        user.username.valor = '';
                        setForm(user);
                        let pass = { ...form };
                        pass.password.valor = '';
                        setForm(pass);
                    }
                })
            }
        }
        else {
            setLoading(false)
            Alert.alert("Alerta", "Todos los campos son obligatorios")
        }
    }

    const loginBiometric = async () => {
        try {
            console.log("login biometrico", session);
            const { available, biometryType } = await Biometric.isSensorAvailable();
            console.log('Tipo de biometría disponible:', biometryType);
            if (available) {
                let promptMessage = '';
                if (biometryType === BiometryTypes.TouchID) {
                    promptMessage = 'Usa tu huella dactilar para autenticarte';
                } else if (biometryType === BiometryTypes.FaceID) {
                    promptMessage = 'Usa tu rostro para autenticarte';
                } else if (biometryType === BiometryTypes.Biometrics) {
                    promptMessage = 'Usa tu huella dactilar para autenticarte';
                } else {
                    console.log('No se encontró soporte para TouchID o FaceID');
                    return;
                }
                if (signatureAvaliable) {
                    try {
                        const promptResult = await Biometric.simplePrompt({
                            promptMessage: 'Por favor, escanea tu huella dactilar para autenticarte',
                            fallbackPromptMessage: '¿Deseas usar otro método de autenticación?',
                        });
                        console.log('propmresult', promptResult);
                        setLoading(true)

                        if (session) {
                            if (promptResult.success) {
                                console.log('Autenticación biométrica exitosa');
                                setLoading(false)
                                navigation.navigate('Home')
                            } else {
                                console.log('El usuario canceló la autenticación biométrica');
                                setLoading(false)
                                // El usuario canceló la autenticación biométrica
                            }
                            return
                        } else {
                            if (promptResult.success) {
                                AuthService(signatureAvaliable, async (flag, res) => {
                                    if (flag) {
                                        console.log("respuesta", flag, res)
                                        Toast.show({ text1: "Bienvenido " + signatureAvaliable.username.valor })
                                        setLoading(false)
                                        let user = { ...signatureAvaliable };
                                        user.username.valor = '';
                                        setForm(user);
                                        let pass = { ...signatureAvaliable };
                                        pass.password.valor = '';
                                        setForm(pass);
                                        navigation.navigate('Home')
                                    }
                                    else {
                                        setLoading(false)
                                        let user = { ...signatureAvaliable };
                                        user.username.valor = '';
                                        setForm(user);
                                        let pass = { ...signatureAvaliable };
                                        pass.password.valor = '';
                                        setForm(pass);
                                    }
                                })
                            } else {
                                console.log('El usuario canceló la autenticación biométrica');
                                setLoading(false)
                                // El usuario canceló la autenticación biométrica
                            }
                            return
                        }

                    } catch (error) {
                        setLoading(false)
                        console.error("Error", 'error iniciando sesion biometrico', error);
                    }
                }
                if (form.username.valor && form.password.valor) {
                    const { publicKey } = await Biometric.createKeys();
                    console.log('Llave pública creada:', publicKey);
                    const challenge = 'Por favor, escanea tu huella dactilar para registrarte';
                    // Crear la firma biométrica
                    const { success, signature } = await Biometric.createSignature({
                        promptMessage: challenge,
                        payload: challenge,
                    });
                    if (success) {
                        const dataToStore = {
                            signature: signature,
                            username: {
                                valor: form.username.valor
                            },
                            password: {
                                valor: form.password.valor
                            }
                        };
                        console.log('Firma biométrica creada:', dataToStore);
                        await AsyncStorage.setItem('signature', JSON.stringify(dataToStore));
                        onLogin();
                        return
                    } else {
                        console.log('Firma biométrica no creada');
                    }
                }
                Alert.alert("Atención:", "Debe llenar los campos para registrar su huella.")

                // Continuar con la lógica de autenticación aquí
            } else {
                console.log('El sensor biométrico no está disponible en este dispositivo');
                Alert.alert("Atención:", "El sensor biométrico no está disponible en este dispositivo")
            }
        } catch (error) {
            console.error('Error al intentar usar la autenticación biométrica:', error);
        }
    };
    const openModal = (user) => {
        setSelectedUser(user);
        setModalIsOpen(true);
      };
    
      const closeModal = () => {
        setSelectedUser(null);
        setModalIsOpen(false);
      };
    return (
        <View style={{ backgroundColor: '#ACACAC', flex: 1 }}>
            <KeyboardAwareScrollView contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }}>
                <View style={{ alignItems: 'center' }}>
                    <Image style={{ width: 300, height: 100, marginBottom: 15 }} source={logo} />
                    <TextInput
                        style={{ backgroundColor: '#D9D9D9', width: '84.7%', height: 50, borderRadius: 70, textAlign: 'center', marginBottom: 10 }}
                        placeholder="Correo electrónico"
                        placeholderTextColor={'gray'}
                        autoCapitalize="none"
                        value={form.username.valor}
                        onChangeText={text => {
                            let user = { ...form };
                            user.username.valor = text;
                            setForm(user);
                        }}
                    >
                    </TextInput>
                    <View style={{ backgroundColor: '#D9D9D9', width: '84.7%', height: 50, borderRadius: 70, justifyContent: 'center', marginBottom: 10 }}>
                        <TextInput
                            style={{ textAlign: 'center' }}
                            placeholder="Contraseña"
                            placeholderTextColor={'gray'}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            value={form.password.valor}
                            onChangeText={text => {
                                let pass = { ...form };
                                pass.password.valor = text;
                                setForm(pass);
                            }}
                        >
                        </TextInput>
                        <TouchableOpacity
                            style={styles.iconContainer}
                            onPress={() => setShowPassword(!showPassword)}>
                            <Icon
                                name={showPassword ? 'eye-with-line' : 'eye'}
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                        <Text style={{ color: 'white', fontWeight: "400", fontSize: 16 }}>¿Olvidaste tu contraseña? </Text>
                        <TouchableOpacity onPress={() => openModal()}>
                            <Text style={{ color: '#FFC700', fontWeight: "400", fontSize: 16 }}>Click aquí</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={{ width: '86.8%', height: 50, borderRadius: 70, justifyContent: 'center', backgroundColor: '#4257DE' }}
                        onPress={() => onLogin()}>
                        <Text style={{ alignSelf: 'center', fontSize: 17, color: 'white' }}>INICIAR SESIÓN</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={{ alignSelf: 'center', marginTop: '10%' }} onPress={() => loginBiometric()}>
                    <Icon name="fingerprint" size={70} color="black" />
                </TouchableOpacity>
            </KeyboardAwareScrollView>
            <Loading isVisible={loading} />
            <Recoverpassword isOpen={modalIsOpen} onRequestClose={closeModal}/> 
        </View>
    )
}

const styles = StyleSheet.create({

    iconContainer: {
        position: 'absolute',
        right: 10,
    }
});
