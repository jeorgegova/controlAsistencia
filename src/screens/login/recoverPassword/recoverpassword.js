import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, View, Modal, Alert } from 'react-native'
import { Image, Text } from 'react-native-elements';
import imagen from '../../../assets/Picture1.png';
import { recoverPassword } from '../../services/services';

const Recoverpassword = ({ isOpen, onRequestClose }) => {
    const [success, setSuccess] = useState()
    const [email, setEmail] = useState()

    const onRecover = (email) => {
        setSuccess(true)
        const emailReset = {email: email}
        recoverPassword(emailReset, async (err, response) => {
            //console.log("response get task propias", err, response);
            if (err) {
                Alert.alert("Error:", "No se pudo enviar el correo.")
                return 
            }
        })
        setTimeout(() => {
            onRequestClose(setSuccess(false))
        }, 4000);
    }


    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isOpen}
        >

            <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', width: '100%', height: '100%', justifyContent: 'center' }}>
                <KeyboardAvoidingView>
                    <View style={{ alignItems: 'center', padding: 5, backgroundColor: 'white', borderRadius: 20,  width: '90%', alignSelf: 'center', height: 'auto' }}>
                        {!success ?
                            <>
                                <View style={{ width: '98%', alignItems: 'flex-end' }}>
                                    <TouchableOpacity
                                        onPress={() => onRequestClose(setSuccess(false))}
                                        style={{
                                            borderRadius: 50,
                                            borderColor: 'white',
                                            borderWidth: 2,
                                            width: 40,
                                            height: 40,
                                            elevation: 15,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                        <Text style={{ color: '#4257DE', fontSize: 20, fontFamily: 'Poppins-Bold', fontWeight: '800' }} >
                                            X
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View>
                                    <View style={{ marginTop: '-7%' }}>
                                        <Text style={{ fontWeight: '700', fontSize: 18, color: '#4257DE', textAlign: 'center' }}>Recuperar Contraseña:</Text>
                                    </View>
                                    <View>
                                        <View style={{ marginTop: '3%' }}>
                                            <Text style={{ fontSize: 14, fontWeight: '300', textAlign: 'center' }}>
                                                Ingresa el correo asociado a la cuenta para enviarte
                                                las instrucciones de recuperacion de contraseña
                                            </Text>
                                        </View>
                                        <View style={{ marginTop: '3%' }} >
                                            <TextInput
                                                style={{ backgroundColor: '#D9D9D9', width: '84.7%', height: 35, borderRadius: 70, textAlign: 'center', marginBottom: 10, alignSelf: 'center', justifyContent: 'center' }}
                                                placeholder="Correo electrónico..."
                                                placeholderTextColor={'gray'}
                                                autoCapitalize="none"
                                                onChangeText={(value)=>setEmail(value)}
                                            ></TextInput>
                                        </View>
                                        <View >
                                            <TouchableOpacity style={{ width: '86.8%', height: 35, borderRadius: 70, justifyContent: 'center', backgroundColor: '#4257DE', alignSelf: 'center', marginBottom: '5%' }}
                                                onPress={() => onRecover(email)} >
                                                <Text style={{ alignSelf: 'center', fontSize: 17, color: 'white' }}>Enviar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </>
                            :
                            <>
                                <View style={{ marginBottom: '3%' }}>
                                    <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 18, color: '#4257DE', textAlign: 'center', fontWeight: '700' }}> Revisa tu correo</Text>
                                </View>
                                <View style={{ width: '95%', marginBottom: '3%' }}>

                                    <Text style={{ fontSize: 14, fontWeight: '300', textAlign: 'center' }}>
                                        Hemos enviado las instrucciones para reestablecer
                                        la contraseña a tu correo electronico.
                                    </Text>
                                </View>
                                <View style={{ alignSelf: 'center', marginTop: 5 }}>
                                    <Image style={{ width: 80, height: 80, marginBottom: 15 }} source={imagen} />
                                </View>

                            </>
                        }
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    )
}

export default Recoverpassword