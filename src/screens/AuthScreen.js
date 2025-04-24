import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { auth } from '../utils/firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  useEffect(() => {
    const loadCredentials = async () => {
      const savedEmail = await AsyncStorage.getItem('saved_email');
      const savedPassword = await AsyncStorage.getItem('saved_password');
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
      }
    };
    loadCredentials();
  }, []);

  const showError = (msg) => {
    Toast.show({ type: 'error', text1: 'Error', text2: msg });
  };

  const validateInputs = () => {
    if (!email || !password) {
      showError('Please fill in all fields');
      return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      showError('Invalid email address');
      return false;
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return false;
    }
    if (isRegister) {
      if (email !== emailConfirm) {
        showError('Emails do not match');
        return false;
      }
      if (password !== passwordConfirm) {
        showError('Passwords do not match');
        return false;
      }
    }
    return true;
  };

  const saveCredentials = async () => {
    if (rememberMe) {
      await AsyncStorage.setItem('saved_email', email);
      await AsyncStorage.setItem('saved_password', password);
    } else {
      await AsyncStorage.removeItem('saved_email');
      await AsyncStorage.removeItem('saved_password');
    }
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        Toast.show({ type: 'success', text1: 'Account created successfully' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        Toast.show({ type: 'success', text1: 'Welcome back!' });
      }
      await saveCredentials();
    } catch (err) {
      showError(err.message.replace('Firebase:', '').trim());
    }
  };

  const handleGuest = async () => {
    try {
      await signInAnonymously(auth);
      Toast.show({ type: 'success', text1: 'Continuing as guest' });
    } catch (err) {
      showError('Could not sign in as guest');
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
    <Text
  style={{
    fontFamily: 'Helvetica-Bold',
    fontSize: 30, // equivalent to text-3xl
    textAlign: 'center',
    color: '#fbbf24', // amber-400
    marginBottom: 32, // mb-8
  }}
>
  {isRegister ? 'Register' : 'Hayotse'}
</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        className="bg-white rounded-xl px-4 py-2 mb-3 text-black"
      />

      {isRegister && (
        <TextInput
          placeholder="Confirm Email"
          placeholderTextColor="#aaa"
          value={emailConfirm}
          onChangeText={setEmailConfirm}
          className="bg-white rounded-xl px-4 py-2 mb-3 text-black"
        />
      )}

      <View className="relative mb-3">
        <TextInput
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          secureTextEntry={!showPassword}
          onChangeText={setPassword}
          className="bg-white rounded-xl px-4 py-2 text-black pr-10"
        />
        <TouchableOpacity
          className="absolute right-4 top-3"
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      {isRegister && (
        <View className="relative mb-3">
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#aaa"
            value={passwordConfirm}
            secureTextEntry={!showPasswordConfirm}
            onChangeText={setPasswordConfirm}
            className="bg-white rounded-xl px-4 py-2 text-black pr-10"
          />
          <TouchableOpacity
            className="absolute right-4 top-3"
            onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
          >
            <Ionicons
              name={showPasswordConfirm ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="gray"
            />
          </TouchableOpacity>
        </View>
      )}

      <View className="flex-row items-center mb-4">
        <TouchableOpacity
          onPress={() => setRememberMe((prev) => !prev)}
          className={`w-5 h-5 rounded border mr-2 ${
            rememberMe ? 'bg-amber-400 border-amber-500' : 'bg-white border-gray-300'
          }`}
        />
        <Text className="text-white">Remember Me</Text>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-amber-400 py-3 rounded-xl mb-3"
      >
        <Text className="text-center font-bold text-black text-lg">
          {isRegister ? 'Create Account' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsRegister(!isRegister)}
        className="mb-4"
      >
        <Text className="text-white text-center">
          {isRegister
            ? 'Already have an account? Login'
            : "Don't have an account? Register"}
        </Text>
      </TouchableOpacity>

      <View className="bg-blue-500/10 border border-blue-400 px-4 py-2 rounded-xl mb-4 mx-2">
  <Text className="text-blue-300 text-center font-medium text-sm italic">
    Sign in to save your players — or continue as guest without saving.
  </Text>
</View>


      <TouchableOpacity
        onPress={handleGuest}
        className="py-3 px-4 border border-white rounded-xl mb-10"
      >
        <Text className="text-white text-center font-semibold text-lg">Continue as Guest</Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
}