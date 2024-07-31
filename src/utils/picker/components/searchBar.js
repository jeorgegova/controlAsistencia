import React, { useState } from 'react';
import { Keyboard, StyleSheet, TextInput, View, Text} from 'react-native';
import { Button, Icon, } from 'react-native-elements';

export const SearchBar = (props) => {
    const { value = "", onChangeText = () => { }, placeholder = ""} = props;
    const [leftIcon, setLeftIcon] = useState("search");
    const [viewRightIcon, setViewRightIcon] = useState(false);
    const handleChange = (value) => {
        if (value === "") {
            setViewRightIcon(false)
        } else {
            setViewRightIcon(true);
        }
        setLeftIcon("arrow-left");
        onChangeText(value);
    }
    const resetSearchBar = () => {
        handleChange("");
        Keyboard.dismiss();
        setLeftIcon('search');
    }
    return (
        <View style={styles.container}>
            <Button type="clear" containerStyle={{ width: '18%' }} icon={<Icon name={leftIcon} size={28} onPress={resetSearchBar} color={'#4257DE'}></Icon>}></Button>
            <View style={{width:'60%'}}>
                <TextInput
                    placeholder={placeholder}
                    color={'black'}
                    value={value}
                    onChangeText={(value) => { handleChange(value) }}
                    style={styles.input}
                />
            </View>
            {viewRightIcon && <Button containerStyle={{ width: '18%' }}  type="clear" icon={<Icon name="times" type='font-awesome-5' size={28} color='#4257DE'></Icon>} onPress={() => { handleChange("") }}></Button>}

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 25,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#4257DE',
        flexDirection: 'row',
        marginHorizontal: 5,
        padding: 5,
    },
    input: {
        fontSize: 15,
        width: '80%'
    }
})