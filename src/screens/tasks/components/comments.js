
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Platform, StyleSheet, Alert, Share, } from 'react-native';
import Modal from 'react-native-modal';
import ImageViewer from 'react-native-image-zoom-viewer';
import Toast from 'react-native-toast-message';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import RNFetchBlob from 'rn-fetch-blob';

export const Comments = (props) => {
    const { comment } = props;
    console.log("comment", comment);
    const [showImage, setShowImage] = useState(false);
    const [file, setFile] = useState(comment.adjuntos.length > 0 ? `data:${comment.adjuntos[0].tipo};base64,${comment.adjuntos[0].url}` : '');

    async function descargarArchivo(url, nombreArchivo) {
        try {
            const { config, fs } = RNFetchBlob;
            let rutaDescarga = fs.dirs.DocumentDir + '/' + nombreArchivo;

            await config({
                fileCache: true,
                path: rutaDescarga,
            }).fetch('GET', url);

            console.log('Archivo descargado:', rutaDescarga);
            Share.share({
                title: 'Compartir archivo descargado',
                message: nombreArchivo,
                url: `file://${rutaDescarga}`,
                type: 'file',
            });
            // Puedes hacer lo que necesites con el archivo descargado aquí, como mostrarlo al usuario o procesarlo de alguna manera.
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
        }
    }


    return (
        <View style={styles.container} key={comment.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {comment.foto_autor ?
                    <View style={{ overflow: 'hidden', borderRadius: 15, width: 30, height: 30 }}>
                        <Image
                            source={{ uri: `data:image/png;base64,${comment.foto_autor}` }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                            onError={(error) => {
                                console.error("Error al cargar la imagen: ", error);
                            }}
                        />
                    </View>
                    :
                    <IconFontAwesome
                        style={{ marginLeft: 5 }}
                        name={'user'}
                        size={33}
                        color="#979797"
                    />
                }
                <View style={{ marginLeft: '4%', width: comment.adjuntos && comment.adjuntos.length > 0 ? '75%' : '85%' }}>
                    <Text style={styles.subTitulo}>
                        {comment.fecha}
                    </Text>
                    <Text style={styles.subTitulo}>
                        {comment.autor}
                    </Text>
                    <Text style={[styles.subTitulo, { textAlign: 'justify' }]}>
                        {comment.contenido}
                    </Text>
                </View>
                {comment.adjuntos && comment.adjuntos.length > 0 &&
                    <View>
                        <TouchableOpacity onPress={() => comment.adjuntos[0].tipo.includes("image") ? setShowImage(!showImage) : descargarArchivo(file, comment.adjuntos[0].nombre)}>
                            <IconFontAwesome5
                                style={{ marginLeft: 10 }}
                                name={comment.adjuntos[0].tipo.includes("image") ? 'image' : 'file-download'}
                                size={33}
                                color="#979797"
                            />
                        </TouchableOpacity>
                        <Modal
                            animationType="fade"
                            transparent={true}
                            visible={showImage}
                        >
                            <View style={{
                                height: '65%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'white',
                                borderRadius: 20,
                                ...(Platform.OS === 'android' ? { elevation: 11 } : {
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 5,
                                }),
                            }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#555555' }}>Evidencia:</Text>
                                <ImageViewer
                                    imageUrls={[{ url: `data:image/png;base64,${comment.adjuntos[0].url}` }]}
                                    style={{ width: '100%', borderBottomRightRadius:20, borderBottomLeftRadius:20 }}
                                    maxScale={3}
                                    enableSwipeDownToDismiss
                                    renderIndicator={() => null}
                                    backgroundColor='white'
                                />
                            </View>
                            <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', top: 130, right: 1 }}>
                                <TouchableOpacity
                                    onPress={() => setShowImage(!showImage)}
                                    style={{
                                        backgroundColor: '#979797',
                                        borderRadius: 50,
                                        borderColor: 'white',
                                        borderWidth: 2,
                                        width: 40,
                                        height: 40,
                                        elevation: 15,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{ color: 'white', fontSize: 20, fontFamily: 'Poppins-Bold' }}>
                                        X
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Modal>
                    </View>}
            </View>
        </View>
    );

}

const styles = StyleSheet.create({
    containerComment: {
        position: 'relative',
        zIndex: 1,
        alignSelf: 'center',
        backgroundColor: '#D9D9D9',
        width: '86.8%',
        padding: 10,
        borderRadius: 18,
        margin: 5,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    userListContainer: {
        position: 'absolute',
        width: '100%',
        top: 40,
        backgroundColor: 'white',
        borderWidth: 1,
        borderRadius: 18,
        borderColor: '#ccc',
    },
    container: {
        alignSelf: 'center',
        backgroundColor: '#D9D9D9',
        width: '86.8%',
        padding: 10,
        borderRadius: 18,
        margin: 5,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },

    input: {
        height: 80,
        borderRadius: 10,
        paddingHorizontal: 10,
    },

    backButton: {
        marginLeft: '5%',
        zIndex: 1,
    },
    titulo: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 22
    },
    subTitulo: {
        color: 'black',
        fontWeight: '200',
        fontSize: 13
    },
    switchContainer: {
        right: '3%',
        marginTop: 10,
        transform: [{ scaleX: 0.8 }, { scaleY: 0.6 }],
        flexDirection: 'row',
        alignItems: 'center',
    }
});