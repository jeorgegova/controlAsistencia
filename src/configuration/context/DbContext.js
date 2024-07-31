import React, { createContext, useContext, useEffect, useState } from 'react';
//import {createTables, getDbConnection} from '../utils/db';
import { createTables, getDbConnection } from '../../database/db';
import { Text } from 'react-native';

const DbContext = createContext();

export function useDbContext() {
  return useContext(DbContext);
}
export function DbContextProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [db, setDb] = useState(null);

  useEffect(function () {
    // permite declarar varianles que estan limitadas al alcance de una declaracion de bloque 
    let _db = null;
    // async devuelve una promesa en lugar de un valor
    async function getConnection() {
      _db = await getDbConnection();
      // awit espera una promisa de la funcion async
      await createTables();
      setDb(_db);
      setIsLoading(false);
    }
    getConnection();
    return function () {
      if (_db != null) {
        _db.close();
      }
    };
  }, []);

  if (isLoading) {
    return <Text>Cargando...</Text>;
  }
  // el .Provider permite que los componenetes que lo consumen se suscriban a cambios del contexto
  return <DbContext.Provider value={db}>{children}</DbContext.Provider>;
}