import { parseString } from 'react-native-xml2js';
import { clienConect } from './reactiva';
import { getData, getDbConnection } from '../database/db';

export const xmlrpcAuthService = async (client, callback) => {
  try {
    const config = await clienConect();
    const xmlParams = buildXmlParams(client, 'authenticate');

    const url = `http://${config.host}:${config.port}/xmlrpc/2/common`;
    const options = { method: 'POST', body: xmlParams };

    const res = await fetch(url, options);
    const data = await res.text();

    parseXmlResponse(data, callback);

  } catch (error) {
    handleError('xmlrpcAuthService', error, callback);
  }
};

export const xmlrpcServices = async (params, callback) => {
  try {
    const db = await getDbConnection();
    const idUser = await getData(db, `select * from parametrizacion where id=5`);
    const config = await clienConect();

    const xmlParams = buildXmlFromParams(params, idUser, config);

    const url = `http://${config.host}:${config.port}/xmlrpc/2/object`;
    const options = { method: 'POST', body: xmlParams };

    const res = await fetch(url, options);
    const data = await res.text();

    parseXmlResponse(data, callback);

  } catch (error) {
    handleError('xmlrpcServices', error, callback);
  }
};

function buildXmlParams(client, methodName) {
  const { database, username, password } = client;
  return `
    <methodCall>
      <methodName>${methodName}</methodName>
      <params>
        <string>${database}</string>
        <string>${username.trim()}</string>
        <string>${password}</string>
        <value></value>
      </params>
    </methodCall>
  `;
}

function buildXmlFromParams(params, idUser, config) {
    const { model, method, args } = params;

    const buildValueXml = (value) => {
      if (value === null || value === undefined) {
        return '<value><nil/></value>';
      } else if (typeof value === 'object') {
        if (Array.isArray(value)) {
          // If it's an array, handle each element separately
          return `
                  <value>
                    <array>
                      <data>
                        ${value.map(item => buildValueXml(item)).join('')}
                      </data>
                    </array>
                  </value>`;
        } else {
          // If it's an object, treat it as a struct
          return `
                  <value>
                    <struct>
                      ${Object.keys(value).map(key => `
                        <member>
                          <name>${key}</name>
                          ${buildValueXml(value[key])}
                        </member>`).join('')}
                    </struct>
                  </value>`;
        }
      } else {
        // For non-object values, use the regular <value> tag
        // Check the type and generate the corresponding tag
        if (Number.isInteger(value)) {
          return `<value><int>${value}</int></value>`;
        } else if (typeof value === 'string') {
          return `<value><string>${value}</string></value>`;
        } else if (typeof value === 'boolean') {
          return `<value><boolean>${value ? '1' : '0'}</boolean></value>`;
        } else {
          // If the type is not recognized, use <string> as a fallback
          return `<value><string>${value}</string></value>`;
        }
      }
    };

    const arrayPart = args.length > 0
      ? `
          <array>
            <data>
              ${args.map(value => buildValueXml(value)).join('')}
            </data>
          </array>
        `
      : '';

    const xmlString = `
      <methodCall>
        <methodName>execute_kw</methodName>
        <params>
          <string>${config.database}</string>
          <int>${idUser[0].valor}</int>
          <string>${config.password}</string>
          <string>${model}</string>
          <string>${method}</string>
          ${arrayPart}
        </params>
      </methodCall>
    `;
    //console.log("salida xml", xmlString);
    return xmlString;
}


function parseXmlResponse(data, callback) {
  parseString(data, (error, result) => {
    if (error) {
      console.error('Error al convertir XML a JSON:', error);
      callback(error, null);
    } else {
      
      try {
        const methodResponse = result.methodResponse;

        if (methodResponse && methodResponse.fault) {
          // Handle fault response
          const fault = methodResponse.fault[0].value[0].struct[0].member;
          const faultResult = {};

          fault.forEach(faultMember => {
            const faultMemberName = faultMember.name[0];
            const faultMemberValue = convertValue(faultMember.value[0]);
            faultResult[faultMemberName] = faultMemberValue;
          });

          callback({ fault: faultResult }, null);
        } else if (methodResponse && methodResponse.params && methodResponse.params[0] && methodResponse.params[0].param) {
          const params = methodResponse.params[0].param;

          if (params.length === 1 && params[0].value) {
            const valueElement = params[0].value[0];
            if (valueElement.array && valueElement.array[0].data && valueElement.array[0].data[0].value) {
              const arrayValues = valueElement.array[0].data[0].value;

              // Mapea los valores de la matriz y convierte cada elemento
              const finalResult = arrayValues.map(item => {
                return convertValue(item);
              });

              // console.log("Salida json respuesta", JSON.stringify(finalResult, null, 2));
              callback(null, finalResult);
            } else {
              const singleValue = convertValue(valueElement); // Ajustado para manejar el caso cuando el valor no es una matriz
              // console.log("Salida json respuesta", JSON.stringify(singleValue, null, 2));
              callback(null, singleValue);
            }
          } else {
            console.error("La estructura de la respuesta no es la esperada. No se encontró 'params' o 'param'.");
            callback("La estructura de la respuesta no es la esperada.", null);
          }
        } else {
          console.error("La estructura de la respuesta no es la esperada. No se encontró 'params' o 'param'.");
          callback("La estructura de la respuesta no es la esperada.", null);
        }
      } catch (err) {
        console.error("Error al procesar la respuesta JSON:", err);
        callback(err, null);
      }
    }
  });

  function convertValue(value) {
    if (value.hasOwnProperty('string')) {
      return value.string[0];
    } else if (value.hasOwnProperty('int')) {
      return parseInt(value.int[0]);
    } else if (value.hasOwnProperty('double')) {
      return parseFloat(value.double[0]);
    } else if (value.hasOwnProperty('boolean')) {
      return value.boolean[0] === '1'; // Convertir a booleano
    } else if (value.hasOwnProperty('struct') && value.struct[0].member) {
      const innerMembers = value.struct[0].member;
      const structResult = {};
  
      innerMembers.forEach(innerMember => {
        const memberName = innerMember.name[0];
        const memberValue = convertValue(innerMember.value[0]);
        structResult[memberName] = memberValue;
      });
  
      return structResult;
    } else if (value.hasOwnProperty('array') && value.array[0].data) {
      const innerValues = value.array[0].data[0].value || [];
      return innerValues.map(innerValue => convertValue(innerValue));
    } else if (value.hasOwnProperty('value')) {
      // Manejar múltiples elementos <valor>
      return value.value.map(innerValue => convertValue(innerValue));
    } else {
      return null;
    }
  }

}

function handleError(context, error, callback) {
  console.error(`Error en ${context}:`, error);
  callback(error, null);
}




