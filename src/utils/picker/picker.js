import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';
import { Icon } from 'react-native-elements';
import Modal from "react-native-modal";
import { Options } from './components/options';
import iconArrow from '../../assets/iconArrow.png'
export const SearchPicker = (props) => {
    const { items = timeOptions, value = items[0] ?? '', onChange = () => { }, style = { button: {} }, placeholder } = props
    //console.log("items del picker", items)
    const [showOptions, setShowOptions] = useState(false);
    const selectItem = (item) => {
        onChange(item);
        setShowOptions(false);
    }
    return (
        <>

            <TouchableOpacity onPress={() => { setShowOptions(true) }} style={[styles.button, style.button]}>
                {value.label == 'Buscar Proyectos...' && <Icon name="search" type="font-awesome" size={20} color='black' containerStyle={{ marginLeft: 10, width: '15%', justifyContent: 'center' }}></Icon>}
                <Text style={{ color: 'black', marginLeft: '2%', width: '95%', alignSelf: 'center', fontFamily: 'Poppins-Regular', fontSize: 17 }}>{value.label ? value.label : placeholder}</Text>
                <View style={{ marginLeft: '-15%', justifyContent: 'center', width: '15%' }}>
                    <Image source={iconArrow} style={{ width: 30, height: 20 }} />
                </View>
            </TouchableOpacity>
            <Modal
                style={{ flex: 1 }}
                isVisible={showOptions}
                onRequestClose={() => {
                    setShowOptions(false);
                }}
                onBackButtonPress={() => {
                    setShowOptions(false);
                }}
                onBackdropPress={() => {
                    setShowOptions(false);
                }}
            >

                <Options data={items} onPress={selectItem}></Options>
            </Modal>
        </>
    )
}
export const SearchPickerEconomi = (props) => {
    const { items = timeOptions, value = items[0] ?? '', onChange = () => { }, style = { button: {} } } = props
    const [showOptions, setShowOptions] = useState(false);
    const selectItem = (item) => {
        onChange(item);
        setShowOptions(false);
    }
    return (
        <>

            <TouchableOpacity onPress={() => { setShowOptions(true) }} style={[styles.button2, style.button2]}>
                <Text style={{ width: '80%', alignSelf: 'center', marginLeft: 16, fontFamily: 'Poppins-Regular', fontSize: 18 }}>{value.label}</Text>
                <Icon name="sort-down" type="font-awesome-5" size={16} color='#606060' containerStyle={{ width: '20%', paddingRight: 16, marginTop: 0, justifyContent: 'center' }}></Icon>
            </TouchableOpacity>
            <Modal
                style={{ flex: 1 }}
                isVisible={showOptions}
                onRequestClose={() => {
                    setShowOptions(false);
                }}
                onBackButtonPress={() => {
                    setShowOptions(false);
                }}
                onBackdropPress={() => {
                    setShowOptions(false);
                }}
            >
                <Options data={items} onPress={selectItem}></Options>
            </Modal>
        </>
    )
}
const styles = StyleSheet.create({
    button: { borderWidth: 1, marginHorizontal: 5, borderRadius: 10, justifyContent: 'space-between', height: 50, flexDirection: 'row' },
    button2: { borderWidth: 1, marginHorizontal: 5, borderRadius: 10, justifyContent: 'space-between', height: 100, flexDirection: 'row' }

})