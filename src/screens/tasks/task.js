import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Switch } from 'react-native-switch';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FormatDateSinHora } from '../../utils/reactiva';
import { ActivateTask } from '../services/services';



const Task = (props) => {
    const task = props.task;
    const reload = props.reload;
    const navigation = useNavigation();

    const [isEnabled, setIsEnabled] = useState(task.task_timer);

    const toggleSwitch = (val) => {
        console.log(" la val", val);
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


        //Consumo del metodo activar o descativar tarea        
        //setIsEnabled(task.task_timer)
    };


    return (
        <><TouchableOpacity onPress={() => { navigation.navigate('ItemTask', { task: task }) }}>
            <View style={styles.container}>

                <View style={{ alignSelf: 'center', width: '95%' }}>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[styles.subTitulo, { width: '50%' }]}>{task.project_name}</Text>
                        <Text style={[styles.subTitulo, { width: '30%' }]}>{task.stage}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text numberOfLines={2} style={[styles.titulo, { width: '70%' }]}>
                            {task.name}
                        </Text>
                        <View style={styles.switchContainer}>
                            <Switch
                                onValueChange={(val) => toggleSwitch(val)}
                                inActiveText=''
                                activeText=''
                                innerCircleStyle={{ borderRadius: 8, height: '100%', width: '65%' }}
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
                            <Text numberOfLines={2} style={[styles.subTitulo, { fontWeight: 'normal', }]}>
                                {task.description}
                            </Text>
                        </View>

                    </View>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('CreateTask', { titulo: 'Editar tarea', task: task })}
                    style={{ backgroundColor: '#4257DE', borderRadius: 50, width: '25%', height: '15%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: 'white', paddingHorizontal: 2 }}>
                        editar
                    </Text>
                    <Icon
                        name={'pencil'}
                        size={16}
                        color="white"
                    />
                </TouchableOpacity>

            </View>
        </TouchableOpacity>
        </>
    );
};



const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
        backgroundColor: '#D9D9D9',
        width: '95%',
        height: 200,
        padding: 10,
        borderRadius: 20,
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

export default Task;
