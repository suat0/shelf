import {View, Text, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export function CatalogScreen(){
    return(
        <View style={styles.container}>
            <Text>Catalog Screen</Text>
        </View>
    );
}