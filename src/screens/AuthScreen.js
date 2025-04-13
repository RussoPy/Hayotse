import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { auth } from '../utils/firebaseConfig';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInAnonymously,
} from 'firebase/auth';
import { Image } from 'react-native';

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [rememberMe, setRememberMe] = useState(true);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const toast = (msg, type = 'error') => Toast.show({ type, text1: msg });

    const handleAuth = async () => {
        if (!email || !password) {
            return toast('Fill in all required fields');
        }

        if (!validateEmail(email)) {
            return toast('Invalid email format');
        }

        if (!isLogin) {
            if (email !== confirmEmail) {
                return toast('Emails do not match');
            }
            if (password !== confirmPassword) {
                return toast('Passwords do not match');
            }
            if (password.length < 6) {
                return toast('Password must be at least 6 characters');
            }
        }

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            toast(err.message);
        }
    };

    const handleGuest = async () => {
        try {
            await signInAnonymously(auth);
        } catch (err) {
            toast('Could not sign in as guest');
        }
    };

    return (
        <View className="flex-1 bg-zinc-900 justify-center px-6">
            <Image
                source={require('../../assets/logo.png')}
                style={{
                    width: 100,
                    height: 100,
                    borderRadius: 20,
                    alignSelf: 'center',
                    marginBottom: 12,
                }}
            />
            <Text className="text-3xl font-bold text-center text-amber-400 mb-8">
                {isLogin ? 'Login' : 'Sign Up'}
            </Text>

            <TextInput
                className="bg-white rounded-xl px-4 py-3 mb-4 text-black"
                placeholder="Email"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            {!isLogin && (
                <TextInput
                    className="bg-white rounded-xl px-4 py-3 mb-4 text-black"
                    placeholder="Confirm Email"
                    placeholderTextColor="#aaa"
                    value={confirmEmail}
                    onChangeText={setConfirmEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            )}

            <TextInput
                className="bg-white rounded-xl px-4 py-3 mb-4 text-black"
                placeholder="Password"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            {!isLogin && (
                <TextInput
                    className="bg-white rounded-xl px-4 py-3 mb-6 text-black"
                    placeholder="Confirm Password"
                    placeholderTextColor="#aaa"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
            )}

            <TouchableOpacity
                className="mb-4 flex-row items-center"
                onPress={() => setRememberMe(prev => !prev)}
            >
                <View className={`w-5 h-5 rounded border border-white mr-2 ${rememberMe ? 'bg-white' : ''}`} />
                <Text className="text-white">Remember Me</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleAuth}
                className="bg-amber-400 rounded-xl py-3 mb-4"
            >
                <Text className="text-center text-black font-bold text-lg">
                    {isLogin ? 'Login' : 'Sign Up'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} className="mb-6">
                <Text className="text-center text-gray-300">
                    {isLogin
                        ? "Don't have an account? Sign up"
                        : 'Already have an account? Login'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleGuest}
                className="bg-gray-600 rounded-xl py-3"
            >
                <Text className="text-center text-white font-semibold">
                    Continue as Guest
                </Text>
            </TouchableOpacity>

            <Toast />
        </View>
    );
}
