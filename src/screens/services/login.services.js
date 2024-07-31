import { Alert, ToastAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Odoo from 'react-native-odoo';
import { clienConect } from "../../utils/reactiva";
import { getData, getDbConnection, insertData, updateData } from "../../database/db";
import { xmlrpcAuthService, xmlrpcServices } from "../../utils/xmlrpc";

const _storeData = async (key, session) => {
    try {
        await AsyncStorage.setItem(key, session);//guarda la sesion
    } catch (error) {
        Alert.alert("Error", 'Error al almacenar datos de sesión.');
    }
};

export const AuthService = async (data, callback) => {
    try {
        const config = await clienConect();
        const client = {
            host: config.host,
            port: config.port,
            database: config.database,
            username: data.username.valor.trim(),
            password: data.password.valor
        }

        console.log('cliente', client);
        xmlrpcAuthService(client, async (err, response) => {
            console.log(" log authservice", err, response);
            if (err) {
                Alert.alert("Error", "No se obtuvieron datos del servidor" + err);
                console.log("error del AuthService", err)
                callback(false);
                return;
            }
            if (!response) {
                Alert.alert("Error", "Usuario y/o contraseña incorrectos");
                callback(false);
                return;
            }
            client.uid = response;
            await saveClient(client)
            await _storeData('session', JSON.stringify(client));
            InitializeData(callback);
        })
    } catch (error) {
        console.log('error login service', error);
        callback(false);
        return;
    }
}

export const InitializeData = async (callBack) => {
    const args = [0]
    const params = {
        model: 'project.webservice',
        method: 'obtenerDatos',
        args: args,
        kwargs: {}
    }
    return xmlrpcServices(params, async (err, response) => {
        //console.log("respuesta obtener datos", err, response);
        if (err) {
            Alert.alert("Error", "No se obtuvieron datos del servidor");
            return callBack(false)
        }
        const okData = await Save(response);
        if (okData) {
            await getProjects(async (flag, response) => {
                //console.log("respuesta getprojects", flag, response);
                if (flag) {
                    const saveProject = await saveProjects(response);
                    if (saveProject) {
                        return callBack(true)
                    }
                    else {
                        return (flag, response)
                    }
                }
                else {
                    return false
                }
            })
        }
        else {
            return false
        }
    })
}

const getProjects = async (callback) => {
    const args = [0]
    const params = {
        model: 'project.webservice',
        method: 'obtener_proyectos',
        args: args,
        kwargs: {}
    }
    return xmlrpcServices(params, async (err, response) => {
        if (err) {
            Alert.alert("Error", "Error al obtener los proyectos");
            return callback(false)
        }
        return callback(true, response)
    })
}

const Save = async (data) => {
    const db = await getDbConnection();
    try {
        console.log("data tag", data['tag']);
        console.log("data stage", data['stages']);
        console.log("data status", data['status']);

        await insertData(db, "users", data['users'])
        await insertData(db, "tag_stage", await orderTableContent("tag", data['tag']))
        await insertData(db, "tag_stage", await orderTableContent("stages", data['stages']))
        await insertData(db, "tag_stage", await orderTableContent("status", data['status']))

        const idUser = await getData(db, `select * from tag_stage`);
        console.log("haber que inserto", idUser);
        return true;
    } catch (error) {
        console.log("error del Save", error)
        return false
    }
}
const saveProjects = async (data) => {
    const db = await getDbConnection();
    try {
        await insertData(db, 'projects', data['projects'])
        return true
    } catch (error) {
        console.log("error save projects", error);
    }
}

const saveClient = async (client) => {
    const db = await getDbConnection();
    try {
        await updateData(db, 'parametrizacion', { id: '1', valor: client.host + ':' + client.port });
        await updateData(db, 'parametrizacion', { id: '2', valor: client.database });
        await updateData(db, 'parametrizacion', { id: '3', valor: client.username });
        await updateData(db, 'parametrizacion', { id: '4', valor: client.password });
        await updateData(db, 'parametrizacion', { id: '5', valor: client.uid });

        return true

    } catch (error) {
        console.log("error de saveclient", error)
        return false
    }
}

const orderTableContent = async (name, data) => {
    const tableContent = []
    if (name == 'tag' || name == 'stages') {
        data.forEach(element => {
            tableContent.push({
                id: element.id,
                name: element.name,
                value: name
            })
        });
    } else {
        data.forEach(element => {
            tableContent.push({
                name: element[0],
                value: 'status'
            })
        });
    }
    return tableContent;
}