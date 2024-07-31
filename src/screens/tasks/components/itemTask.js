import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Platform, ScrollView, Alert, FlatList, KeyboardAvoidingView } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Switch } from 'react-native-switch';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import iconArrowLeft from '../../../assets/iconArrowLeft.png'
import iconSubTask from '../../../assets/subTask.png'
import RNFS from 'react-native-fs';
import { FormatDateSinHora } from '../../../utils/reactiva';
import { crearMensajes, obtenerMensajes } from '../../services/services';
import DocumentPicker from 'react-native-document-picker';
import { Comments } from './comments';
import { Loading } from '../../../utils/loading';
import { useDbContext } from '../../../configuration/context/DbContext';
import { getData } from '../../../database/db';



const ItemTask = ({ route }) => {
    const db = useDbContext()
    const task = route.params.task;
    const navigation = useNavigation();
    const [inputValue, setInputValue] = useState('');
    const [userMap, setUserMap] = useState({});
    const [comment, setComment] = useState([])
    const [showUserList, setShowUserList] = useState(false);
    const [selectedFile, setSelectedFile] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(false)
    const [selectedFileName, setSelectedFileName] = useState('');
    const [mentionText, setMentionText] = useState('');
    const [users, setUser] = useState([]);
    //const users = ['user1', 'user2', 'user3']; // Lista de usuarios
    console.log("task dekl item", task);

    const [isEnabled, setIsEnabled] = useState(task.task_timer);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const users = await getData(db, `select id, nombre from users`);
        let row = []
        setLoading(true);
        await obtenerMensajes(task.id, (flag, res) => {
            //console.log("respuesta", flag, res.comment[0].adjuntos);
            if (flag) {
                setComment(res.comment)
                setLoading(false)
            } else {
                setLoading(false)
                Alert.alert("¡Atencion!", "No se obtuvieron los Comentarios");
            }
        });

        users.forEach(element => {
            row.push({ value: element.id, label: element.nombre });
        });
        row.slice(1).sort((a, b) => {
            return a.label.localeCompare(b.label)
        })
        setUser(row)
    }

    const comentariosPorFecha = comment.reduce((grupos, comentario) => {
        const fecha = new Date(comentario.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        if (!grupos[fechaFormateada]) {
            grupos[fechaFormateada] = [];
        }
        grupos[fechaFormateada].push(comentario);
        return grupos;
    }, {});

    // Convertir objeto de grupos en una matriz de objetos { fecha, comentarios }
    const datosFlatList = Object.keys(comentariosPorFecha).map(fecha => ({
        fecha,
        comentarios: comentariosPorFecha[fecha],
    }));

    const toggleSwitch = (val) => {
        if (val) {

            ActivateTask(task.id, async (flag, res) => {
                console.log("Ejecutando la tarea", flag, res);
                if (flag) {
                    setIsEnabled(previousState => !previousState);
                    reload(!task.task_timer)
                    Toast.show({ text1: val ? 'Tarea activa correcamente' : 'Tarea inactiva correcamente' })
                }
            })
        }
        else {
            Alert.alert(
                "Atención:",
                "Por favor, proporcione información sobre lo que ha hecho.",
                [
                    {
                        text: 'Cancel',
                        onPress: () => null,
                        style: 'cancel',
                    },
                    {
                        text: 'Editar Tarea',
                        onPress: async () => {
                            navigation.navigate('CreateTask', { titulo: 'Editar tarea', task: task })
                        },
                    },
                ]
            );
        }
    };

    const handleInputChange = (text) => {
        setInputValue(text);
        if (text.includes('@')) {
            if (inputValue.endsWith('@')) {
                setShowUserList(true)
            }
            const mention = text.split('@').pop().toLowerCase();
            const filteredUsers = users.filter(user => user.label.toLowerCase().includes(mention));
            setFilteredUsers(filteredUsers);
            setMentionText(mention);
        } else {
            setShowUserList(false);
        }
    };



    const handleUserSelect = (user, userId) => {
        setShowUserList(false);
        const mentionedUser = `@${user}`;
        const newText = inputValue.replace(`@${mentionText}`, mentionedUser);
        setInputValue(newText);
        setUserMap({ ...userMap, [user]: userId });
    };


    const renderUserItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleUserSelect(item.label, item.value)}>
            <View style={{ padding: 10 }}>
                <Text>{item.label}</Text>
            </View>
        </TouchableOpacity>
    );

    const handleAttachFile = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });
            console.log('Res:', res);

            // Leer el archivo y convertirlo a base64
            let fileWithBase64 = {};
            if (res.length > 0) {
                const base64 = await readFileAsBase64(res[0].uri);
                fileWithBase64 = { ...res[0], base64 };
            }
            console.log("fileBase64", fileWithBase64);
            setSelectedFile(fileWithBase64);
            setSelectedFileName(truncateFileName(res[0].name, 20));
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // El usuario canceló la selección de archivos
                console.log('Seleccionar archivo cancelado');
            } else {
                // Algo salió mal al seleccionar el archivo
                console.error('Error al seleccionar el archivo:', err);
            }
        }
    };

    const readFileAsBase64 = async (filePath) => {
        try {
            const base64 = await RNFS.readFile(filePath, 'base64');
            return base64;
        } catch (error) {
            console.error('Error al leer el archivo como base64:', error);
            throw error;
        }
    };



    const truncateFileName = (fileName, maxLength) => {
        return fileName.length > maxLength ? `${fileName.substring(0, maxLength)}...` : fileName;
    };


    const sendComment = async () => {
        setLoading(true);
        let textToSend = inputValue;

        for (const [username, userId] of Object.entries(userMap)) {
            textToSend = textToSend.replace(`@${username}`, `@${userId}`);
        }

        console.log("Mensaje a enviar con IDs:", textToSend);
        setInputValue('');
        setMentionText('');
        setShowUserList(false);
        setUserMap({});

        await crearMensajes(task.id, textToSend, selectedFile, async (flag, res) => {
            console.log("crearMensajes:", flag, res);

            if (flag) {
                if (res.errors || !res) {
                    Alert.alert('Error', 'No se subio el comentario')
                    setLoading(false);
                }
                setLoading(false);
                navigation.goBack();
            } else {
                setLoading(false);
            }

        })
    }



    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ACACAC' }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null}style={{ flex: 1, backgroundColor: '#ACACAC' }}>
                <ScrollView stickyHeaderIndices={[0]} >
                    <View style={{ backgroundColor: '#ACACAC', flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                                <Image source={iconArrowLeft} style={{ width: 20, height: 25 }} />
                            </TouchableOpacity>

                            <View style={{ marginLeft: '5%', width: '82%' }}>
                                <Text style={[styles.subTitulo, { color: 'white' }]}>{task.project_name}</Text>
                                <Text style={[styles.titulo, { color: 'white', fontSize: 30 }]}>{task.name}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ justifyContent: 'space-between', flex: 1 }}>
                        <View style={styles.container}>
                            <View style={{ alignSelf: 'center', width: '95%' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={[styles.subTitulo, { width: '60%' }]}>{task.project_name}</Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('CreateTask', { titulo: 'Editar tarea', task: task })}>
                                        <Icon
                                            name={'pencil'}
                                            size={22}
                                            color="#4257DE"
                                        />
                                    </TouchableOpacity>
                                    <View style={{ backgroundColor: '#4257DE', borderRadius: 50, width: '28%' }}>
                                        <Text style={[styles.subTitulo, { color: 'white', fontWeight: '400', alignSelf: 'center', top: '15%' }]}>{task.stage}</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={[styles.titulo, { width: '70%' }]}>
                                        {task.name}
                                    </Text>
                                    <View style={styles.switchContainer}>
                                        <Switch
                                            onValueChange={(val) => toggleSwitch(val)}
                                            inActiveText=''
                                            activeText=''
                                            innerCircleStyle={{ borderRadius: 10, height: '100%', width: '65%' }}
                                            backgroundActive='#ACACAC'
                                            backgroundInactive='#ACACAC'
                                            circleActiveColor='#5567DD'
                                            circleBorderWidth={0}
                                            barHeight={20}
                                            value={isEnabled}
                                        />
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: '2%' }}>
                                    <Text style={[styles.subTitulo]}>
                                        Asignado a:
                                    </Text>
                                    <View style={{ marginLeft: '2%', width: '80%' }}>
                                        <Text style={styles.subTitulo}>
                                            {task.user_id.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', marginTop: '2%' }}>
                                    <Text style={[styles.subTitulo]}>
                                        Desde:
                                    </Text>
                                    <View style={{ marginLeft: '1%', marginRight: '4%' }}>
                                        <Text style={styles.subTitulo}>
                                            {FormatDateSinHora(task.create_date)}
                                        </Text>
                                    </View>
                                    <Text style={[styles.subTitulo]}>
                                        Hasta:
                                    </Text>
                                    <View style={{ marginLeft: '1%' }}>
                                        <Text style={styles.subTitulo}>
                                            {FormatDateSinHora(task.date_deadline)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', marginTop: '2%' }}>
                                    <Text style={[styles.subTitulo, { fontWeight: 'normal', }]}>
                                        Tarea:
                                    </Text>
                                    <View style={{ marginLeft: '2%', width: '80%' }}>
                                        <Text style={[styles.subTitulo, { fontWeight: 'normal', textAlign: 'justify' }]}>
                                            {task.description}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View>

                            <FlatList
                                data={datosFlatList}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <View>
                                        <Text style={{ fontWeight: 'bold', textAlign: 'center', marginTop: 10 }}>{item.fecha}</Text>
                                        {item.comentarios.map(comentario => (
                                            <Comments comment={comentario} />
                                        ))}
                                    </View>
                                )}
                            />

                        </View>


                    </View>
                </ScrollView>
                        <View style={styles.containerComment}>
                            <TextInput
                                style={styles.input}
                                onChangeText={handleInputChange}
                                value={inputValue}
                                placeholder="Añadir Comentario..."
                                multiline={true}
                            />
                            <TouchableOpacity onPress={handleAttachFile}>
                                <IconFontAwesome5
                                    style={{ marginLeft: 10 }}
                                    name={'upload'}
                                    size={33}
                                    color="#979797"
                                />
                            </TouchableOpacity>
                            {selectedFileName ? (
                                <Text>{selectedFileName}</Text>
                            ) : null}
                            {showUserList && (
                                <View style={styles.userListContainer}>
                                    <FlatList
                                        data={filteredUsers}
                                        renderItem={renderUserItem}
                                        keyExtractor={(item) => item.value}
                                    />
                                </View>
                            )}
                        </View>
                        <TouchableOpacity onPress={sendComment} style={{ marginTop: 20, marginBottom: 20, backgroundColor: '#4257DE', borderRadius: 50, height: 40, width: '90%', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
                            <Text style={[styles.titulo, { fontSize: 18, color: 'white', fontWeight: '400' }]}>GUARDAR</Text>
                        </TouchableOpacity>

                <View style={{ position: 'absolute', bottom: '40%', right: 0, zIndex: 1 }}>
                    <View style={{ width: 65, height: 65, backgroundColor: '#D9D9D9', borderTopLeftRadius: 15, borderBottomLeftRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowOffset: { width: 0, height: 2.3 }, shadowOpacity: 0.5, shadowRadius: 2, }}>
                        <TouchableOpacity onPress={() => navigation.navigate('CreateTask', { titulo: 'Nueva Subtarea', task: task })}>
                            <Image source={iconSubTask} style={{ width: 35, height: 40 }} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Loading isVisible={loading} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ItemTask;



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