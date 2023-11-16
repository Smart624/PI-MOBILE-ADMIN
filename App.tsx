import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import whyDidYouRender from '@welldone-software/why-did-you-render';
import QueueControl from "./src/screens/QueueControl";
import Home from "./src/screens/Home";
import AdminLogin from "./src/screens/AdminLogin";

if (process.env.NODE_ENV === 'development') {
    whyDidYouRender(React, {
        trackAllPureComponents: false,
    });
}

const Stack = createStackNavigator();

const App: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={AdminLogin} />
                <Stack.Screen name={'QueueControl'} component={QueueControl} />
                <Stack.Screen name={'Home'} component={Home} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;
