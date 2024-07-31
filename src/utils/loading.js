import React from 'react';
import { Modal, View } from "react-native"
import {
    BallIndicator,
    BarIndicator,
    DotIndicator,
    MaterialIndicator,
    PacmanIndicator,
    PulseIndicator,
    SkypeIndicator,
    UIActivityIndicator,
    WaveIndicator,
} from 'react-native-indicators';


/* import LoaderKit from 'react-native-loader-kit' */

export const Loading = (props) => {
    const { isVisible } = props

    return (

        <Modal
            children={1}
            visible={isVisible}
            transparent={true}
        >
            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)', height: '100%', width: '100%' }}>
                <PacmanIndicator size={100} color='#333333' />

                {/* <LoaderKit
                    style={{ width: 80, height: 80 }}
                    name={'BallClipRotateMultiple'} // Optional: see list of animations below
                    color={'#000000'} // Optional: color can be: 'red', 'green',... or '#ddd', '#ffffff',...
                /> */}
            </View>
        </Modal>
    )
}