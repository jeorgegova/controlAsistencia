import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text } from "react-native";
import { Item } from './item';
import { SearchBar } from './searchBar';

export const Options = (props) => {
    const { data = [], onEndReached, onEndReachedThreshold = 0.5, initialNumToRender, onPress } = props;    
    const [search, setSearch] = useState("");
    const uniqueValues = new Set();
    const dataSinDuplicados = data.filter((item) => {
        const { value } = item;
        if (!uniqueValues.has(value)) {
          uniqueValues.add(value);
          return true; // Mantener este elemento
        }
        return false; // Descartar este elemento
      });
    const [list, setList] = useState(dataSinDuplicados);

    //console.log("datoss", dataSinDuplicados)
    const searchItems = (searchedValue) => {
        if (searchedValue === "") {
            setSearch(searchedValue);
            setList(dataSinDuplicados);
            return;
        }
        const newList = dataSinDuplicados.filter((item) =>
            item.label.toLowerCase().includes(searchedValue.toLowerCase())
        );
        setSearch(searchedValue);
        setList(newList);
    }
    return (
        <View style={{ marginTop: 10, height: '80%', backgroundColor: 'white', padding: 30, borderRadius: 30 }}>
            <Text style={{ color: '#4257DE', fontFamily: 'Poppins-Bold', fontSize: 20, left: 7 }}>Buscar</Text>
            <SearchBar
                value={search}
                onChangeText={(value) => searchItems(value)}
            >
            </SearchBar>
            <FlatList
                data={list}
                renderItem={({ item }) =>
                    <Item item={item} onPress={onPress} />
                }
                keyExtractor={item => "key" + item.value}
                onEndReached={onEndReached}
                onEndReachedThreshold={onEndReachedThreshold}
                initialNumToRender={initialNumToRender}
            />
        </View>

    );
}

var styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#81a925'
    },
    header: {
        flexDirection: 'row',
        borderBottomColor: "black",
        borderBottomWidth: 1,
        borderTopLeftRadius: 9,
        borderTopRightRadius: 10,
        padding: 10,
        alignItems: 'center',
        backgroundColor: 'black'
    },
    label: {
        fontSize: 15,
        width: '30%',
        fontWeight: 'bold',
        color: 'white'
    },
    containerHorizontal: {
        flexDirection: "row",
        backgroundColor: 'rgba(7,162,186,0.5)',

    },
    searchBarInput: {
        backgroundColor: 'white',
        color: 'black'
    },
    searchBarContainer: {
        borderRadius: 8,
        marginHorizontal: 5,
        backgroundColor: 'white',
        padding: 0,
    }
});