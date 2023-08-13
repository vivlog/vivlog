import { useMutation } from '@tanstack/react-query';
import { H1, H2 } from 'app/design/typography';
import { registerUser } from 'app/services/api';
import { useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';

export const UserRegisterScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { mutate, data, isLoading, isError, error } = useMutation(['register'], registerUser);





    const handleRegister = () => {
        const registerData = {
            username: username,
            password: password
        };
        mutate(registerData);
    };

    return (
        <View style={styles.container}>
            <H1>Vivlog</H1>
            <H2>Register</H2>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={text => setUsername(text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={text => setPassword(text)}
            />
            <Button
                title="Register"
                onPress={handleRegister}
            />
            {isLoading && <p> loading...</p>}
            {isError && <p className='text-red-500'> Error: {(error as Error).message ?? 'unknown error'}</p >}
            {data && <p>Registration successful!</p>}
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
    },
});

export default UserRegisterScreen;
