import React from 'react';
import { View, StyleSheet  } from "react-native";
import {  Button,  } from 'react-native-elements';


export const Item = (props) => {
    const { item = { label: '', value: '' }, onPress = () => { }} = props;
    //console.log("item", props)
    return (
        <View>
            <Button
                title={item.label}
                type="clear"
                titleStyle={{ color: 'black', textAlign:'left', width:'100%', fontFamily: 'Poppins-Regular' }}
                onPress={() => {
                    onPress(item);
                }} />
        </View>
    );
}

var styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        borderBottomColor: "#BEBEBE",
        borderBottomWidth: 1,
        marginHorizontal: 10,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    label: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular'
    }
});