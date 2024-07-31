import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Animated, TouchableOpacity, Image, Alert, Platform, BackHandler, RefreshControl } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Icon } from 'react-native-elements';
import Icons from 'react-native-vector-icons/AntDesign';
import { SearchPicker } from '../utils/picker/picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Task from './tasks/task';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDbContext } from '../configuration/context/DbContext';
import { getData } from '../database/db';
import { GetOwnTask, GetTaskProject } from './services/services';
import plus from '../assets/plus.png'
import { closeSession, deleteReloadData } from '../utils/reactiva';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InitializeData } from './services/login.services';
import { Loading } from '../utils/loading';

//<Button title="create" onPress={() => navigation.navigate('CreateTask')}></Button>
const Home = ({ route }) => {
    const db = useDbContext()
    const navigation = useNavigation();
    const stickyRef = useRef(null);
    const scrollY = useRef(new Animated.Value(0)).current;
    const [stickyActive, setStickyActive] = useState(false);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const [project, setProject] = useState([])
    const [projectSelected, setProjectSelected] = useState({ value: '-1', label: 'Proyectos' })
    const [taskList, setTaskList] = useState([])
    const [stage, setStage] = useState([])
    const [loading, setLoading] = useState(false)
    const session = AsyncStorage.getItem("session");
    const [taskFiltered, setTaskFiltered] = useState([])
    const [reload, setReload] = useState([])
    const fadeAnim = useRef(new Animated.Value(1)).current
    const [refreshing, setRefreshing] = useState(false);
    const [showTasks, setShowTasks] = useState(true);


    useEffect(() => {
        loadData()
    }, [route, reload])

    useEffect(() => {
        taskXproject()
    }, [projectSelected])



    const loadData = async () => {
        setLoading(true);
        setRefreshing(true);
        setSelectedItemIndex(null)
        const colores = ['green', 'orange', 'red', 'yellow', 'orange', 'purple', 'blue', 'salmon'];
        let colorIndex = 0;
        const isok = await deleteReloadData(db);
        if (isok) {
            await InitializeData(async (flag, res) => {
                if (flag) {
                    try {
                        setLoading(true)
                        const row = []
                        const rowStage = []
                        const projectList = await getData(db, `select * from projects`);
                        const stages = await getData(db, `select * from tag_stage where value = 'stages'`)
                        //console.log('los proyectos ', stages);
                        projectList.forEach(element => {
                            row.push({ value: element.id, label: element.name });
                            row.sort((a, b) => {
                                return a.label.localeCompare(b.label)
                            })
                        });
                        setProject(row);
                        stages.forEach(element => {
                            rowStage.push({ estado: element.name, color: colores[colorIndex] })
                            colorIndex = (colorIndex + 1) % colores.length;
                        });
                        setStage(rowStage)
                        await GetOwnTask(async (flag, res) => {
                            if (flag) {
                                setTaskList(res)
                                setTaskFiltered(res)
                            }
                        })
                        setProjectSelected({ value: '-1', label: 'Proyectos' })
                        setLoading(false)
                        setRefreshing(false);
                    } catch (error) {
                        setLoading(false);
                        setRefreshing(false);
                        console.error('error...', error);
                        Alert.alert("Error:", "Se presentó un error al cargar los  proyectos.");
                    }
                } else {
                    setLoading(false);
                    setRefreshing(false);
                    Alert.alert("Error:", "Se presentaron problemas al actualizar los datos");
                }
            });
        }
    };

    const taskXproject = async () => {
        try {
            setLoading(true)
            //console.log("entro aqui -----------------", projectSelected.value);
            GetTaskProject(projectSelected.value, async (flag, res) => {
                //console.log("respuesta ne home task", flag, res);
                if (flag) {
                    setTaskList(res)
                    setTaskFiltered(res)
                    setLoading(false)
                } else {
                    setLoading(false)
                }
            })
        } catch (error) {
            console.error("error obteniendo tareas", error);
        }
    }

    const handleButtonPress = (estado, index) => {
        if (index === selectedItemIndex) {
            setTaskFiltered(taskList);
            setSelectedItemIndex([]);
        } else {
            setSelectedItemIndex(index);
            const matchingTask = taskList['task'].filter((element) => element.stage === estado);
            const matchingChildren = taskList['children_tasks'] ? taskList['children_tasks'].map(childTasks => {
                return childTasks.filter(task => task.stage === estado);
            }) : null
            setTaskFiltered({
                ...taskList,
                task: matchingTask,
                children_tasks: matchingChildren
            });
        }
    };

    const headerHeight = scrollY.interpolate({
        inputRange: [0, 220],
        outputRange: [220, 90],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const secondHeaderOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });


    const closeLogin = async () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Está seguro de que desea cerrar sesión?',
            [
                { text: 'Cancel', onPress: () => null, style: 'cancel' },
                {
                    text: 'OK', onPress: async () => {
                        let isOk = await closeSession(session);
                        if (isOk) navigation.navigate('Login', { reload: true });
                        else Alert.alert('Error', 'Se presentó un problema al cerrar sesión');
                    }
                },
            ]
        );
    };

    useFocusEffect(
        React.useCallback(() => {
            const handleBackPress = () => {
                if (Platform.OS === 'android') {
                    showAlert();
                    return true; // Prevent default back press behavior on Android
                } else {
                    // Handle iOS back press here, e.g., go back in the navigation stack
                    navigation.goBack();
                    return true; // Prevent default back press behavior on iOS
                }
            };

            BackHandler.addEventListener('hardwareBackPress', handleBackPress);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
            };
        }, [navigation])
    );

    const showAlert = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Está seguro de que desea cerrar sesión?',
            [
                { text: 'Cancel', onPress: () => null, style: 'cancel' },
                {
                    text: 'OK', onPress: async () => {
                        let isOk = await closeSession(session);
                        if (isOk) navigation.navigate('Login', {});
                        else Alert.alert('Error', 'Se presentó un problema al cerrar sesión');
                    }
                },
            ]
        );
    };




    /* const getPosicionScrollView = () => {
        //console.log(stickyActive);
        if (!stickyActive) {
            return (
                
            );
        } else {
            return (
                
            );
        }
    }; */

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ACACAC' }}>
            <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 10 }}>
                    <View style={{ width: '90%', alignItems: 'center' }}>
                        <Text style={[styles.titulo, { fontWeight: '800', color: '#FFF' }]}>Bienvenid@</Text>
                    </View>
                    <TouchableOpacity onPress={() => (closeLogin())}>
                        <View style={[styles.shadow, { backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: 20, padding: 10 }]}>
                            <Icons
                                name={'logout'}
                                size={20}
                                color="#4257DE"
                            />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center', margin: '1%' }}>
                    <View style={{ width: '100%' }}>
                        <Text style={[styles.titulo, { fontSize: 25, color: '#FAFAFA', marginBottom: '2%', }]}>Proyectos</Text>
                    </View>
                    {/* <SearchPicker
                                style={{ button: { borderColor: '#D9D9D9', width: '80%', borderRadius: 20 }}}
                                items={picker}/> */}
                </View>
                <View style={{ backgroundColor: '#D9D9D9', borderRadius: 20, width: '100%', alignSelf: 'center' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <View style={{ justifyContent: 'center', width: '20%' }}>
                            <Icon name='search' type='font-awesome-5' size={30} color='#4257DE' />
                        </View>
                        <SearchPicker
                            style={{ button: { borderColor: '#D9D9D9', width: '80%', borderRadius: 20 } }}
                            items={project}
                            value={projectSelected}
                            onChange={(itemValue) => {
                                setProjectSelected(itemValue);
                            }}
                        />
                    </View>
                </View>



                <View>
                    <View style={{ width: '100%', marginTop: '-5%' }}>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                            <View style={[styles.container, { marginTop: 20, marginBottom: -10 }]}>
                                {stage.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.item,
                                            { flexDirection: 'row', justifyContent: 'space-around' },
                                            selectedItemIndex === index && { backgroundColor: '#4257DE' },
                                        ]}
                                        onPress={() => handleButtonPress(item.estado, index)}
                                    >
                                        <Text style={{ color: 'white' }}>{item.estado}</Text>
                                        <Icon name="circle" type="font-awesome" size={20} color={item.color} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <View style={{ width: '95%' }}>
                            <Text style={{ fontSize: 30, color: '#D9D9D9', }}>Tareas</Text>
                        </View>
                    </View>
                </View>
            </Animated.View>

            <Animated.View style={[styles.secondHeader, { opacity: secondHeaderOpacity }]}>
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: '2%' }}>
                        <View style={{ width: '90%' }}>
                            <Text style={{ fontSize: 40, color: 'white', alignSelf: 'center', fontWeight: '800', }}> Mis Tareas </Text>
                        </View>
                    </View>
                    <View style={{ width: '100%', marginTop: '-5%' }}>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                            <View style={styles.container}>
                                {stage.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.item,
                                            { flexDirection: 'row', justifyContent: 'space-around' },
                                            selectedItemIndex === index && { backgroundColor: '#4257DE' },
                                        ]}
                                        onPress={() => handleButtonPress(item.estado, index)}
                                    >
                                        <Text style={{ color: 'white' }}>{item.estado}</Text>
                                        <Icon name="circle" type="font-awesome" size={20} color={item.color} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Animated.View>


            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 30, marginBottom: -30 }}>
                <TouchableOpacity
                    style={[
                        styles.items,
                        { flexDirection: 'row', justifyContent: 'space-around' },
                        showTasks && { backgroundColor: '#4257DE' },
                    ]}
                    onPress={() => setShowTasks(true)}
                >
                    <Text style={{ color: 'white' }}>Mis Tareas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.items,
                        { flexDirection: 'row', justifyContent: 'space-around' },
                        !showTasks && { backgroundColor: '#4257DE' },
                    ]}
                    onPress={() => setShowTasks(false)}
                >
                    <Text style={{ color: 'white' }}>Tareas de mis hijos</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                style={styles.scrollView}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={loadData}
                        colors={['#9Bd35A', '#689F38']}
                        progressBackgroundColor="#ffffff"
                    />
                }
            >
                <View style={styles.content}>
                    {showTasks && taskFiltered.task ? (
                        taskFiltered.task
                            .sort((a, b) => (a.task_timer === b.task_timer ? 0 : a.task_timer ? -1 : 1))
                            .map((task) => (
                                <Task key={task.id} task={task} reload={(flag) => setReload(flag)} />
                            ))
                    ) : null}
                    {!showTasks && taskFiltered.children_tasks ? (
                        <>
                            
                            {taskFiltered.children_tasks.map((tasks) =>
                                tasks
                                    .sort((a, b) => (a.task_timer === b.task_timer ? 0 : a.task_timer ? -1 : 1))
                                    .map((task) => <Task key={task.id} task={task} />)
                            )}
                        </>
                    ) : null}
                </View>

            </ScrollView>

            <TouchableOpacity onPress={() => navigation.navigate('CreateTask', { titulo: 'Nueva tarea' })} style={{ position: 'absolute', top: '88%', left: '75%' }}>
                <View style={[styles.shadow]}>
                    <Image style={{ width: 70, height: 70 }} source={plus} />
                </View>
            </TouchableOpacity>
            <Loading isVisible={loading} />
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    header: {
        top: Platform.OS == 'ios' ? 0 : 20,
        left: 10,
        right: 10,
        width: '95%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondHeader: {
        position: 'absolute',
        top: Platform.OS == 'ios' ? 50 : 0,
        left: 0,
        right: 0,
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        color: 'white',
        fontSize: 20,
    },
    scrollView: {
        flex: 1,
        marginTop: Platform.OS == 'ios' ? 10 : 30,
    },
    container1: {
        flex: 1,
    },
    content: {
        padding: 20,
        backgroundColor: '#ACACAC',
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        marginHorizontal: 5,
        borderRadius: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
    },
    titulo: {
        color: '#D9D9D9',
        fontSize: 40,
    },
    container: {
        flexDirection: 'row',
        padding: 10,
    },
    item: {
        width: 130,
        margin: 5,
        padding: 5,
        backgroundColor: 'transparent',
        borderRadius: 20,
        borderColor: 'white',
        borderWidth: 1,
        textAlign: 'center',
    },
    items: {
        width: '41%',
        margin: 5,
        padding: 5,
        backgroundColor: 'transparent',
        borderRadius: 20,
        borderColor: 'white',
        borderWidth: 1,
        textAlign: 'center',
    },
});

export default Home;
