import {View,Text, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export function LoginScreen(){
    return(
        <View style={styles.container}>
            <Text>Login Screen</Text>
        </View>
    );
}