
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Login } from "../screens/login/login";
import Home from "../screens/Home";
import Recoverpassword from "../screens/login/recoverPassword/recoverpassword";
import ItemTask from "../screens/tasks/components/itemTask";
import { CreateTask } from "../screens/tasks/components/createTask";

const Stack = createNativeStackNavigator();
export default function navigation() {
    

    return (
        <Stack.Navigator initialRouteName='Login'>
            <Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />
            <Stack.Screen name='Home' component={Home} options={{ headerShown: false }} />
            <Stack.Screen name='ItemTask' component={ItemTask} options={{ headerShown: false }} />
            <Stack.Screen name='CreateTask' component={CreateTask} options={{ headerShown: false }} />
            <Stack.Screen name='Recoverpassword' component={Recoverpassword} options={{ headerShown: false }} />

        </Stack.Navigator>
    )
}