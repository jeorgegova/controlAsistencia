import { Alert } from "react-native";
import { clienConect } from "../../utils/reactiva"
import { xmlrpcAuthService, xmlrpcServices } from "../../utils/xmlrpc"


export const GetTaskProject = async (data, callback) => {

    try {
        const config = await clienConect();
        console.log("data config", config);
        const args = [0, { project_id: parseInt(data) }]
        const params = {
            model: 'project.webservice',
            method: 'obtener_tareas_proyecto',
            args: args,
            kwargs: {}
        }
        xmlrpcServices(params, async (err, response) => {
            //console.log("response get task", err, response);
            if (err) {
                Alert.alert("Error:", "No se obtivieron datos del servidor.")
                return callback(false)
            }
            return callback(true, response)
        })

    } catch (error) {
        console.error("error del obtener tareas por proyecto", error);
    }

}

export const GetOwnTask = async (callback) => {
    try {
        const config = await clienConect();
        console.log("data config", config);
        const args = [0]
        const params = {
            model: 'project.webservice',
            method: 'obtener_tareas_propias',
            args: args,
            kwargs: {}
        }
        xmlrpcServices(params, async (err, response) => {
            //console.log("response get task propias", err, response);
            if (err) {
                Alert.alert("Error:", "No se obtivieron datos del servidor.")
                return callback(false)
            }
            return callback(true, response)
        })
    } catch (error) {
        console.error("error del obtener tareas por proyecto", error);
    }
}

export const ActivateTask = async (id, callback) => {
    try {
        const args = [0, { id: parseInt(id) }]
        const params = {
            model: 'project.webservice',
            method: 'activar_tarea',
            args: args,
            kwargs: {}
        }
        xmlrpcServices(params, async (err, response) => {
            console.log("response activar tarea", err, response);
            if (err) {
                Alert.alert("Error:", "No se obtivieron datos del servidor.")
                return callback(false)
            }
            return callback(true, response)
        })
    }
    catch (error) {
        console.error("error al activar tarea", error);
    }

}

export const EditTask = async (dataDB, callback) => {
    try {
        const args = [0, dataDB]
        const params = {
            model: 'project.webservice',
            method: 'editar_tareas',
            args: args,
            kwargs: {}
        }
        xmlrpcServices(params, async (err, response) => {
            //console.log("response get task propias", err, response);
            if (err) {
                Alert.alert("Error:", "No se obtivieron datos del servidor.")
                return callback(false)
            }
            return callback(true, response)
        })
    } catch (error) {
        console.error("error al editar la tarea", error);
    }

}

export const CreateNewTask = async (dataDB, callback) => {
    try {
        console.log('dataDB en createNewTask', dataDB);
        const args = [0, dataDB]
        const params = {
            model: 'project.webservice',
            method: 'crear_tareas',
            args: args,
            kwargs: {}
        }
        xmlrpcServices(params, async (err, response) => {
            //console.log("response get task propias", err, response);
            if (err) {
                Alert.alert("Error:", "No se obtivieron datos del servidor.")
                return callback(false)
            }
            return callback(true, response)
        })
    } catch (error) {
        console.error("error al crear usuario", error);
    }

}

export const obtenerMensajes = async (id, callback) => {
    try {
        const args = [0, { id: parseInt(id) }]
        const params = {
            model: 'project.webservice',
            method: 'obtener_mensajes',
            args: args,
            kwargs: {}
        }
        //console.log("args obtener mensajes", args);
        xmlrpcServices(params, async (err, response) => {
            //console.log("response obtener mensajes", err, response);
            if (err) {
                Alert.alert("Error:", "No se obtivieron datos del servidor.")
                return callback(false)
            }
            return callback(true, response)
        })
    } catch (error) {
        console.error("error al crear usuario", error);
    }

}

export const crearMensajes = async (id, contenido, selectedFile, callback) => {
    try {
        const args = [0, { id: parseInt(id), contenido:contenido, archivos: selectedFile ?  [selectedFile] : ''}]
        const params = {
            model: 'project.webservice',
            method: 'crear_mensaje',
            args: args,
            kwargs: {}
        }
        console.log("args crear mensajes", args);
        xmlrpcServices(params, async (err, response) => {
            //console.log("response obtener mensajes", err, response);
            if (err) {
                Alert.alert("Error:", "No se obtivieron datos del servidor.")
                return callback(false)
            }
            return callback(true, response)
        })
    } catch (error) {
        console.error("error al crear usuario", error);
    }

}

export const recoverPassword = async (email, callback) => {
    try {
        const config = await clienConect();
        const args = email

        console.log('los args reset password', email);
        const url = `http://${config.host}:${config.port}/reset_password/`;
        const options = { method: 'POST', body: args };
        const res = await fetch(url, options);
        console.log('ressss', res);

        if (res) {
            return callback(true, response)
        }

    } catch (error) {
        console.error("error al reestablecer el password", error);
    }

}