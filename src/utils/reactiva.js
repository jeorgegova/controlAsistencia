
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getDbConnection,getData,updateData} from '../database/db'
export const parseToString=(data)=>{
    let str = JSON.stringify(data).replace(/\\/g, '');
        str = str.replace('""""', '""');
        str = str.replace('"{', '{');
        str = str.replace('}"', '}');
        str = str.replace('""""', '""');
        str = str.replace('"{', '{');
        str = str.replace('}"', '}');
        const json = JSON.parse(str);
    return json    
}


  export const getDateOdoo=()=>{
    const d = new Date();
    let month=(d.getMonth()+1)
    let day=d.getDate()
    let horas=d.getHours()
    let min=d.getMinutes()
    let seg=d.getSeconds()
    if(month<10){
        month="0"+(d.getMonth()+1)
    }
    if(day<10){
        day="0"+d.getDate()
    }
    if(horas<10){
        horas="0"+d.getHours()
    }
    if(min<10){
        min="0"+d.getMinutes()
    }
    if(seg<10){
        seg="0"+d.getSeconds()
    }
    let fecha= d.getFullYear()+"-"+month+"-"+day
    let hora =horas + ':' + min + ':' + seg;
    let date = fecha+" "+hora
    return date
}

export const getDate=()=>{
    const d = new Date();
    let month=(d.getMonth()+1)
    let day=d.getDate()
    if(month<10){
        month="0"+(d.getMonth()+1)
    }
    if(day<10){
        day="0"+d.getDate()
    }
    let fecha= d.getFullYear()+"-"+month+"-"+day
    
    return fecha
}

export const verifyData=(type,valor,call)=>{
    
    if(!valor){
        call("este campo es obligatorio")
    }else if(type=="text"){
        if(valor.trim()==""){
            call("este campo es obligatorio")

        }else{
            call("")
        }
    }else if(type=="number"){
        if(valor==""){
            call("este campo es obligatorio")

        }else{
            call("")
        }
    }else{
        if(valor.trim()==""){
            call("este campo es obligatorio")
        }else if(!valor.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i) ){
            call("el formato es incorrecto")
        }else{
            call("")
        }
    }
}


export const getDateWithTime=()=>{
    const d = new Date();
    let month=addCero((d.getMonth()+1))
    let day=addCero(d.getDate())
    let horas=addCero(d.getHours())
    let min=addCero(d.getMinutes())
    let seg=addCero(d.getSeconds())
    
    let fecha= d.getFullYear()+"-"+month+"-"+day
    let hora =horas + ':' + min + ':' + seg;
    let date = fecha+" "+hora
    return date 
    
}  
export const addCero=(num)=>{
    if(num<10){
        num="0"+num
    }
   return num 
}
export const NumberWithCommas = (value) => {
    return parseInt(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const FormatMoney = (value) => {
    return '$ ' + NumberWithCommas(value);
};

export const FormatDateComplete = function (una_fecha) {
    const fecha = una_fecha ? new Date(una_fecha) : new Date(Date.now());
    const miFecha = fecha.getFullYear() + "-" + (((fecha.getMonth() + 1).toString().length == 1) ? "0" + (fecha.getMonth() + 1) : (fecha.getMonth() + 1)) + "-" + (((fecha.getDate()).toString().length == 1) ? "0" + (fecha.getDate()) : (fecha.getDate()));
    return miFecha;
};

export const FormatDateSinHora = function (fecha) {
    //console.log("fecha que entra", fecha);

    // Separar la parte de la fecha de la hora (asumiendo que la fecha está en formato 'YYYY-MM-DD HH:mm:ss')
    const fechaSinHoraString = fecha.split(' ')[0];
    const fechaConHora = new Date(fechaSinHoraString);

    // Devolver la fecha formateada sin la hora
    //console.log("fecha que sale", fechaSinHoraString);
    return fechaSinHoraString;
};


export const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);

        fileReader.onload = () => {
            resolve(fileReader.result);
        };

        fileReader.onerror = (error) => {
            reject(error);
        };
    });
};

export const clienConect=async()=>{
    
        const db = await getDbConnection();
        try{
            
        const data = await getData(db,`select * from parametrizacion`);
        //console.log("aqui estamos", data);
        let sendToOdoo=`{` 
        for(let i=0;i<data.length;i++){
            if(data[i].nombre=="reactiva.bdxmlrpc"&&data[i].valor!==""){
                sendToOdoo+=`"database":"${data[i].valor}",`
            }else if(data[i].nombre=="login"&&data[i].valor!==""){
                
                sendToOdoo+=`"username":"${data[i].valor}",`
            }else if(data[i].nombre=="password"&&data[i].valor!==""){
               
                sendToOdoo+=`"password":"${data[i].valor}",`
            }else if(data[i].nombre=="URL"&&data[i].valor!==""){
               
                sendToOdoo+=`"host":"${data[i].valor.substr(0,data[i].valor.length-5)}",`
                sendToOdoo+=`"port":"${data[i].valor.substr(data[i].valor.length-4,data[i].valor.length)}",`
            }
        }
        
        sendToOdoo+=`}`
        sendToOdoo = sendToOdoo.replace(',}', '}');
        const obj=JSON.parse(sendToOdoo);
        
        return obj
        }catch(error){
            console.log("error en la consulta del cliente",error)
        }
}
export const Capitalize = (value) => {
    return (value.charAt(0).toUpperCase() + value.slice(1));
}

export const closeSession = async (session) => {
    const db = await getDbConnection();
    const iscloseSecion = await deleteDataAplication(db)

    if (iscloseSecion) {
        console.log('iscloseSecion');
        const sessionString = JSON.stringify(session);
        AsyncStorage.removeItem(sessionString);
        return true;
    } else {
        return false;
    }
};

export const deleteDataAplication = async (db) => {
    console.log("esto ingreso al deleteDataAplication")

    try {
        await db.executeSql("update writeDate set valor=NULL where id=1")
        await db.executeSql("update writeDate set valor=NULL where id=2")
        //await db.executeSql("update parametrizacion set valor = NULL where id in(2,3)") // borra bd, user
        /* await db.executeSql("update writeDate set valor=NULL where id=2")
        await db.executeSql("update writeDate set valor=NULL where id=3") */
        const tables = await getData(db, `SELECT group_concat(name) as f FROM sqlite_master
        WHERE type='table' and name not in('writeDate','sqlite_sequence','parametrizacion','dataBases')
        ORDER BY name`);

        var arrayString = tables[0]["f"].split(",");
        for (var i = 0; i < arrayString.length; i++) {
            //console.log("query deleted", "DELETE FROM  " + arrayString[i] + ";")
            db.executeSql("DELETE FROM  " + arrayString[i] + ";")
        }
        
        await db.executeSql(`update parametrizacion set valor = NULL where id = 4`);
        await AsyncStorage.removeItem('session');
        return true

    } catch (error) {
        console.log("error deleteReloadData", error)
        return false
    }
}

export const deleteReloadData =async (db)=>{
    try{
        await db.executeSql("update writeDate set valor=NULL where id=1")
        await db.executeSql("update writeDate set valor=NULL where id=2")
        await db.executeSql("update writeDate set valor=NULL where id=3")
        await db.executeSql("update writeDate set valor=NULL where id=4")
        const tables = await getData(db, `SELECT group_concat(name) as f FROM sqlite_master
        WHERE type='table' and name not in('writeDate','sqlite_sequence','parametrizacion','dataBases')
        ORDER BY name`);
        //await db.executeSql("delete from pagos where  id>0") se comentó porque se daña la trazabilidad si lo vuelve a habilitar por favor explicar porqué, muchas gracias.
        var arrayString = tables[0]["f"].split(",");
        for(var i=0; i<arrayString.length; i++){
            db.executeSql("DELETE FROM  "+arrayString[i]+";")
        }
        
        return true

        }catch(error){
            console.log("error deleteReloadData",error)
            return false
        }
}

export const OdooErrorToReact = (error) => {
	const errorSplit = error.split("'")[1];
	return errorSplit;
}
export const IdInsertion=async()=>{
    const db = await getDbConnection();
    let id=0
    try{
    const personal= await getData(db,`select min(id) as id from infoPersonalCliente`)
    const pagos= await getData(db,`select min(id) as id from pagos`)
    const conceptos= await getData(db,`select min(id) as id from conceptos`)
    var z = Math.min(personal[0].id==null ? 0:parseInt(personal[0].id),pagos[0].id==null ? 0:parseInt(pagos[0].id),conceptos[0].id==null ? 0:parseInt(conceptos[0].id));   
    if(z>0){
        id=0
    }else{
        id=z  
    }
    return id-1

    }catch(err){
        console.log("error al ibtener el id negativo",err)

    }
}
