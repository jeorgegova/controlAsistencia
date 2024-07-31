import React, { useEffect, useState } from "react";
import { getData } from "../../../database/db";
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert, KeyboardAvoidingView } from "react-native";
import { useDbContext } from "../../../configuration/context/DbContext";
import { SearchPicker } from '../../../utils/picker/picker';
import { CheckBox, Icon } from 'react-native-elements';
import { Calendar } from 'react-native-calendars';
import { LocaleConfig } from 'react-native-calendars';
import { Switch } from 'react-native-switch';
import iconArrowLeft from '../../../assets/iconArrowLeft.png'
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormatDateSinHora } from "../../../utils/reactiva";
import { Loading } from '../../../utils/loading';
import { EditTask, CreateNewTask } from "../../services/services";
import Toast from "react-native-toast-message";

export const CreateTask = (props) => {
    const db = useDbContext()
    const data = props.route.params.task ? props.route.params.task : ''
    const [selectedItemIndex, setSelectedItemIndex] = useState([]);
    const [selectedIndex, setIndex] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [markedDates, setMarkedDates] = useState({});
    const navigation = useNavigation();
    const [isEnabled, setIsEnabled] = useState(data.task_timer && props.route.params.titulo !== 'Nueva Subtarea' ? data.task_timer : false);
    const [user, setUser] = useState([]);
    const [userSelected, setUserSelected] = useState([])
    const [project, setProject] = useState([])
    const [stage, setStage] = useState([])
    const [status, setStatus] = useState([])
    const [loading, setLoading] = useState(false)
    const [Titulo, setTitulo] = useState(data.name && props.route.params.titulo !== 'Nueva Subtarea' ? data.name : '')
    const [projectSelected, setProjectSelected] = useState()
    const [Description, setDescription] = useState(data.description && props.route.params.titulo !== 'Nueva Subtarea' ? data.description : '')
    const [Hora, setHora] = useState(data.planned_hours && props.route.params.titulo !== 'Nueva Subtarea' ? data.planned_hours.toString() : '')
    const [statusSelected, setStatusSelected] = useState([])
    const [Descripcion, setDescripcion] = useState(data.descripcion)

    useEffect(() => {
        loadData();
        // Formatear fechas recibidas y establecerlas en el estado
        if (props.route.params.task && props.route.params.titulo !== 'Nueva Subtarea') setSelectedItemIndex(data.stage)

        if (props.route.params.task && props.route.params.titulo !== 'Nueva Subtarea') {
            const { create_date, date_deadline } = props.route.params.task;
            setStartDate(create_date);
            setEndDate(date_deadline);

            // Formatear las fechas para el marcado en el calendario
            const formattedDates = {};
            const currentDate = new Date(create_date);
            const deadlineDate = new Date(date_deadline);

            // Agregar la fecha de inicio
            formattedDates[FormatDateSinHora(create_date)] = { color: '#4257DE', textColor: 'white' };

            // Agregar las fechas intermedias
            while (currentDate < deadlineDate) {
                currentDate.setDate(currentDate.getDate() + 1);
                formattedDates[currentDate.toISOString().split('T')[0]] = { color: '#4257DE', textColor: 'white' };
            }

            // Agregar la fecha de finalización
            formattedDates[date_deadline] = { color: '#4257DE', textColor: 'white' };

            setMarkedDates(formattedDates);
        }

    }, [props.route.params.task]);



    const loadData = async () => {
        setLoading(true)
        let row = []
        let rowProject = []
        let rowStage = []
        let rowTags = []
        let rowStatus = []
        const projectList = await getData(db, `select * from projects`);
        const users = await getData(db, `select id, nombre from users`);
        const stages = await getData(db, `select * from tag_stage `)
        rowProject.push({ value: -1, label: 'Seleccione el proyecto...' })
        row.push({ value: -1, label: 'Seleccione usuario...' })
        rowStatus.push({ value: -1, label: 'Seleccione un estado...' })


        console.log('los users ', stages);
        projectList.forEach(element => {
            rowProject.push({ value: element.id, label: element.name });
        });
        rowProject.slice(1).sort((a, b) => {
            return a.label.localeCompare(b.label);
        });
        setProject(rowProject)
        let projectSelected = rowProject.find(item => item.value === data.project_id)
        setProjectSelected(projectSelected)


        users.forEach(element => {
            row.push({ value: element.id, label: element.nombre });
        });
        row.slice(1).sort((a, b) => {
            return a.label.localeCompare(b.label)
        })
        setUser(row)
        let selected = row.find(item => item.label === data.user_id)
        setUserSelected(selected)

        const colores = ['green', 'orange', 'red', 'yellow', 'orange', 'purple', 'blue', 'salmon'];
        let colorIndex = 0;

        stages.forEach(element => {
            if (element.value === 'stages') {
                rowStage.push({ value: element.id, estado: element.name, color: colores[colorIndex] });

                colorIndex = (colorIndex + 1) % colores.length;
            } else if (element.value === 'status') {
                rowStatus.push({ value: element.id, label: element.name })
                if (props.route.params.task && props.route.params.titulo !== 'Nueva Subtarea') {
                    let StatusSelected = rowStatus.find(item => item.label === data.estatus)
                    setStatusSelected(StatusSelected)
                } else {

                    setStatusSelected(rowStatus[0])
                }
            }
            else {
                rowTags.push({ value: element.id, label: element.name })
                /*   let tagsSelected = rowTags.find(item=> item.value === data.project_id)
                setProjectSelected(tagsSelected) */
            }
        });
        if (props.route.params.task && props.route.params.titulo !== 'Nueva Subtarea') {
            rowStage.forEach(item => {
                if (item.estado === data.stage) {
                    setSelectedItemIndex(item.value);
                }
            });
        }

        setStage(rowStage)
        setStatus(rowStatus)
        setLoading(false)


    }

    const handleChangeTextTitulo = (text) => { setTitulo(text); };
    const handleChangeTextDescription = (text) => { setDescription(text); };
    const handleChangeTextDescripcion = (text) => { setDescripcion(text); };
    const handleChangeTextHora = (text) => { setHora(text); };


    const handleButtonPress = (value) => {

        setSelectedItemIndex(value);
    };

    const toggleSwitch = (val) => {
        if (!val && !Descripcion) {
            Alert.alert('Atención', 'No se puede detener la tarea sin un comentario')
            return
        }
        setIsEnabled(previousState => !previousState);
    };

    const handleDayPress = (day) => {
        if (!startDate || (startDate && endDate)) {
            setStartDate(day.dateString);
            setEndDate('');
            const newMarkedDates = {
                [day.dateString]: { color: '#4257DE', textColor: 'white' }
            };
            setMarkedDates(newMarkedDates);
        } else {
            // Here you need to handle the start and end date correctly
            // setStartDate and setEndDate accordingly
            if (new Date(day.dateString) < new Date(startDate)) {
                setEndDate(startDate);
                setStartDate(day.dateString);
            } else {
                setEndDate(day.dateString);
            }

            const newMarkedDates = { ...markedDates };
            let currentDate = new Date(startDate);
            while (currentDate <= new Date(day.dateString)) {
                const formattedDate = currentDate.toISOString().split('T')[0];
                if (currentDate.getTime() === new Date(startDate).getTime()) {
                    newMarkedDates[formattedDate] = { color: '#4257DE', textColor: 'white' };
                } else {
                    newMarkedDates[formattedDate] = { color: '#4257DE', textColor: 'white' };
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            setMarkedDates(newMarkedDates);
        }
    };



    LocaleConfig.locales['fr'] = {
        monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
    };

    LocaleConfig.defaultLocale = 'fr';


    const verificarCampos = () => {
        const camposFaltantes = [];

        if (data) if (!data || !data.id) {
            camposFaltantes.push('ID');
        }
        if (!endDate) {
            camposFaltantes.push('Fecha de finalización');
        }

        if (!Description) {
            camposFaltantes.push('Descripción');
        }
        if (!statusSelected || statusSelected.value == -1) {
            camposFaltantes.push('Estado');
        }
        if (!Titulo) {
            camposFaltantes.push('Título');
        }
        if (!Hora) {
            camposFaltantes.push('Horas planificadas');
        }
        if (!selectedItemIndex || selectedItemIndex.length == 0) {
            camposFaltantes.push('Etapa');
        }

        if (!userSelected || userSelected.value == -1) {
            camposFaltantes.push('Usuario');
        }
        if (!projectSelected || projectSelected.value == -1) {
            camposFaltantes.push('Proyecto');
        }

        if (camposFaltantes.length > 0) {
            setLoading(false)
            Alert.alert(
                'Atención!',
                `Por favor, llene los siguientes campos:\n${camposFaltantes.map((campo) => `- ${campo}`).join('\n')}`
            );
            return false;
        }
        return true;
    };

    const save = async () => {
        setLoading(true)
        if (data.stage && props.route.params.titulo !== 'Nueva Subtarea') {
            stage.forEach(item => {
                if (item.estado === data.stage) {
                    setSelectedItemIndex(item.value);
                }
            });
        }
        const isValid = () => {
            if (verificarCampos()) {

                if (!isEnabled) {
                    if (!isEnabled && !Descripcion) {
                        return true;
                    } else {
                        setLoading(false)
                        Alert.alert("No es posible enviarlo debido a que la tarea no está activa.")
                        return false;
                    }
                } else if (isEnabled && !Descripcion) {
                    setLoading(false)
                    Alert.alert("Lo siento, señor usuario, no es posible editar la tarea sin describir lo que ha realizado.")
                } else if (isEnabled && Descripcion) {
                    return true;
                }
            }

        };

        const dataDB = {
            ...(data && { id: data.id }), // Si data existe, incluye el campo id
            date_deadline: FormatDateSinHora(endDate),
            descripcion: Descripcion,
            description: Description,
            estado: statusSelected && statusSelected.label ? statusSelected.label : null,
            name: Titulo,
            ... (data && { parent_id: props.route.params.titulo == 'Nueva Subtarea' ? data.id : data.parent_id }),
            planned_hours: Hora,
            project_id: projectSelected ? projectSelected.value : null,
            stage_id: selectedItemIndex,
            task_timer: isEnabled,
            user_id: userSelected ? userSelected.value : null,
        };
        console.log("data debe", dataDB);

        if (isValid()) {
            //console.log("dataBD", dataDB);
            if (dataDB) {
                if (data && props.route.params.titulo !== 'Nueva Subtarea') {
                    await EditTask(dataDB, (res, flag) => {
                        console.log("respuesta", flag, res);
                        if (flag) {
                            setLoading(false)
                            navigation.goBack()
                            Toast.show({ text1: "Tarea Editada Con Exito!!" });
                        } else {
                            setLoading(false)
                            Alert.alert("¡Atencion!", "No pudimos guardar los datos");
                        }
                    });
                } else {

                    await CreateNewTask(dataDB, (res, flag) => {
                        console.log("respuesta", flag, res);
                        if (flag) {
                            setLoading(false)
                            navigation.goBack()
                            Toast.show({ text1: "Tarea Creada Con Exito!!" });
                        } else {
                            setLoading(false)
                            Alert.alert("¡Atencion!", "No pudimos guardar los datos");
                        }
                    });
                }
            }
        }
    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ACACAC' }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1, backgroundColor: '#ACACAC' }}>
                <ScrollView stickyHeaderIndices={[0]}>
                    <View style={{ backgroundColor: '#ACACAC', flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, }}>
                            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                                <Image source={iconArrowLeft} style={{ width: 20, height: 25 }} />
                            </TouchableOpacity>
                            <View style={{ alignItems: 'center', width: '82%' }}>
                                <Text style={[styles.titulo, { fontWeight: '800', color: '#FFF', margin: '3%' }]}>{props.route.params.titulo}</Text>
                            </View>
                        </View>

                    </View>
                    <View style={{ backgroundColor: '#ACACAC', flex: 1 }}>

                        <View style={{ alignItems: 'center' }}>
                            <View style={{ width: '80%' }}>
                                <Text style={{ fontSize: 15, color: 'black', marginBottom: '2%', fontWeight: 200, }}>Titulo de la tareas</Text>
                            </View>
                            <TextInput
                                style={{ backgroundColor: '#D9D9D9', width: '84.7%', height: 50, borderRadius: 20, textAlign: 'center', marginBottom: 10 }}
                                value={Titulo}
                                onChangeText={handleChangeTextTitulo}
                            >
                            </TextInput>

                            <View style={{ marginBottom: '2%' }}>
                                <View style={{ width: '80%' }}>
                                    <Text style={{ fontSize: 15, color: 'black', marginBottom: '2%', fontWeight: 200, }}>Proyecto</Text>
                                </View>
                                <View style={{ backgroundColor: '#D9D9D9', borderRadius: 20, width: '84.7%', alignSelf: 'center' }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                        <View style={{ justifyContent: 'center', width: '20%' }}>
                                            <Icon name='search' type='font-awesome-5' size={30} color='#4257DE' />
                                        </View>
                                        <SearchPicker
                                            style={{ button: { borderColor: '#D9D9D9', width: '80%', borderRadius: 20 } }}
                                            items={project}
                                            value={projectSelected}
                                            onChange={(itemValue) => {
                                                setProjectSelected(itemValue)
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={{ marginBottom: '4%' }}>
                                <View style={{ width: '80%' }}>
                                    <Text style={{ fontSize: 15, color: 'black', marginBottom: '2%', fontWeight: 200, }}>Asignado a</Text>
                                </View>
                                <View style={{ backgroundColor: '#D9D9D9', borderRadius: 20, width: '84.7%', alignSelf: 'center' }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                        <View style={{ justifyContent: 'center', width: '20%' }}>
                                            <Icon name='search' type='font-awesome-5' size={30} color='#4257DE' />
                                        </View>
                                        <SearchPicker
                                            style={{ button: { borderColor: '#D9D9D9', width: '80%', borderRadius: 20 } }}
                                            items={user}
                                            value={userSelected}
                                            onChange={(itemValue) => {
                                                setUserSelected(itemValue)
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.InputTexcContainer}>
                                <TextInput
                                    style={styles.input}
                                    onChangeText={handleChangeTextDescription}
                                    value={Description}
                                    placeholder="Describre la tarea a realizar"
                                    multiline={true}
                                />
                            </View>

                            <View style={{ width: '100%' }}>
                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                    <View style={styles.container}>
                                        {stage.map((item, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    styles.item,
                                                    {
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-around',
                                                        backgroundColor: selectedItemIndex === item.value ? '#4257DE' : (item.estado === selectedItemIndex ? '#4257DE' : 'transparent'),
                                                    },
                                                ]}
                                                onPress={() => handleButtonPress(item.value)}
                                            >
                                                <Text style={{ color: 'white' }}>{item.estado}</Text>
                                                <Icon name="circle" type="font-awesome" size={20} color={item.color} />
                                            </TouchableOpacity>
                                        ))}


                                    </View>
                                </ScrollView>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '80%' }}>
                                <Text >Sprint</Text>
                                <Text style={{ color: 'black', fontWeight: 600 }}>{`Desde: ${FormatDateSinHora(startDate)}`}</Text>
                                <Text style={{ color: 'black', fontWeight: 600 }}>{`Hasta: ${FormatDateSinHora(endDate)}`}</Text>

                            </View>
                            <View style={{ width: '80%', marginBottom: '2%' }}>
                                <Calendar
                                    markingType={'period'}
                                    markedDates={markedDates}
                                    initialDate={data.create_date}
                                    onDayPress={(day) => handleDayPress(day)}
                                    theme={{
                                        backgroundColor: 'transparent',
                                        calendarBackground: 'transparent',
                                        textSectionTitleColor: '#4257DE',
                                        selectedDayTextColor: 'transparent',
                                        todayTextColor: 'white',
                                        dayTextColor: '#2d4150',
                                        textDisabledColor: '#4257DE',
                                        arrowColor: '#4257DE',
                                        monthTextColor: '#4257DE',
                                    }}
                                />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                    <Text style={{ color: '#4257DE', fontWeight: 800 }}>{`Desde: ${FormatDateSinHora(startDate)}`}</Text>
                                    <Text style={{ color: '#4257DE', fontWeight: 800 }}>{`Hasta: ${FormatDateSinHora(endDate)}`}</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                                    <Text style={{ color: 'black', fontWeight: 600 }}>Soporte</Text>
                                    <CheckBox
                                        checked={selectedIndex === 0}
                                        onPress={() => setIndex(0)}
                                        checkedIcon="dot-circle-o"
                                        uncheckedIcon="circle-o"
                                        checkedColor="#4257DE"
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ color: 'black', fontWeight: 600 }}>Desarrollo</Text>
                                    <CheckBox
                                        checked={selectedIndex === 1}
                                        onPress={() => setIndex(1)}
                                        checkedIcon="dot-circle-o"
                                        uncheckedIcon="circle-o"
                                        checkedColor="#4257DE"
                                    />
                                </View>
                            </View>


                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, height: '5%' }}>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: 'black', fontWeight: '600' }}>Horas Estimadas</Text>
                                    <TextInput
                                        style={{ backgroundColor: '#D9D9D9', borderRadius: 20, width: '100%', fontSize: 20, textAlign: 'center', height: '70%' }}
                                        keyboardType="numeric"
                                        value={Hora}
                                        onChangeText={handleChangeTextHora}
                                    />
                                </View>
                                <View style={{ marginLeft: '7%', alignItems: 'center' }}>
                                    <Text style={{ color: 'black', fontWeight: '600' }}>Timer</Text>
                                    <Switch
                                        onValueChange={(val) => toggleSwitch(val)}
                                        inActiveText=''
                                        activeText=''
                                        innerCircleStyle={{ borderRadius: 20, height: '100%', width: '60%' }}
                                        backgroundActive='#D9D9D9'
                                        backgroundInactive='#D9D9D9'
                                        circleActiveColor='#5567DD'
                                        circleBorderWidth={0}
                                        barHeight={30}
                                        value={isEnabled}
                                        switchWidthMultiplier={3}
                                    />
                                </View>
                            </View>

                            {data && props.route.params.titulo !== 'Nueva Subtarea' && <View style={styles.InputTexcContainer}>
                                <TextInput
                                    style={styles.input}
                                    onChangeText={handleChangeTextDescripcion}
                                    value={Descripcion}
                                    placeholder="Qué fue lo que realizó"
                                    multiline={true}
                                />
                            </View>}

                            <View style={{ width: '84.7%' }}>
                                <View>
                                    <Text style={{ fontSize: 15, color: 'black', marginBottom: '2%', fontWeight: 200, }}>Estado</Text>
                                </View>
                                <View style={{ backgroundColor: '#D9D9D9', borderRadius: 20, width: '100%', alignSelf: 'center' }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                        <SearchPicker
                                            style={{ button: { borderColor: '#D9D9D9', width: '80%', borderRadius: 20 } }}
                                            items={status}
                                            value={statusSelected}
                                            onChange={(itemValue) => {
                                                setStatusSelected(itemValue)
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => save()}
                                style={{ width: '86.8%', height: 50, borderRadius: 70, justifyContent: 'center', backgroundColor: '#4257DE', marginTop: '5%', marginBottom: '5%' }}>
                                <Text style={{ alignSelf: 'center', fontSize: 17, color: 'white' }}>GUARDAR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Loading isVisible={loading} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>

    )
}
const styles = StyleSheet.create({
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
    container: {
        flexDirection: 'row',
        padding: 10,
    },
    backButton: {
        marginLeft: '5%',
        zIndex: 1,
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
    InputTexcContainer: {
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
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },

    input: {
        height: 80,
        borderRadius: 10,
        paddingHorizontal: 10,
        textAlign: "justify"
    },
})
