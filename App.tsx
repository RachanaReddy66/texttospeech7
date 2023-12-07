import Slider from '@react-native-community/slider';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Button,
  FlatList,
  TextInput,
} from 'react-native';
import Tts from 'react-native-tts';

const App = () => {
  const [voices, setVoices] = useState([]);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<{
    id: string;
    name: string;
    language: string;
  }[]>([]);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [ttsStatus, setTtsStatus] = useState('initialized');
  const [text, setText] = useState('Hello, React Native TTS!');

  useEffect(() => {
    const initTts = async () => {
      try {
        // List available TTS engines
        const engines = await Tts.engines();
        console.log('Available TTS Engines:', engines);

        // Set the default TTS engine
        await Tts.setDefaultEngine(engines[0].name);

        // List available TTS voices
        const voices = await Tts.voices();
        console.log('Available TTS Voices:', voices);

        const availableVoices = voices
          .filter((v) => !v.networkConnectionRequired && !v.notInstalled)
          .map((v) => ({
            id: v.id,
            name: v.name,
            language: v.language,
          }));

        let selectedVoice = null;
        if (voices && voices.length > 0) {
          selectedVoice = voices[0].id;

          // Set the default TTS voice
          await Tts.setDefaultVoice(selectedVoice);

          setAvailableVoices(availableVoices);
          setSelectedVoice(selectedVoice);
          setTtsStatus('initialized');
        } else {
          setTtsStatus('initialized');
        }
      } catch (error) {
        console.error('Error initializing TTS:', error);
      }
    };

    initTts();
  }, []);
  const readText = async () => {
    Tts.stop();

    // Set the default voice using setDefaultVoice
    await Tts.setDefaultVoice(selectedVoice);

    // Set the speech rate using setDefaultRate
    await Tts.setDefaultRate(speechRate);

    // Speak the text
    Tts.speak(text);
  };

  const updateSpeechRate = async (rate: number) => {
    await Tts.setDefaultRate(rate);
    setSpeechRate(rate);
  };

  const onVoicePress = async (voice: { id: string; language: string }) => {
    try {
      await Tts.setDefaultLanguage(voice.language);
    } catch (err) {
      console.log('setDefaultLanguage error', err);
    }
    await Tts.setDefaultVoice(voice.id);

    // Ensure that selectedVoice is a string or null
    setSelectedVoice(voice.id);
  };

  const renderVoiceItem = ({ item }: { item: { id: string; name: string; language: string } }) => {
    return (
      <TouchableOpacity
        style={{
          backgroundColor:
            selectedVoice === item.id ? '#DDA0DD' : '#5F9EA0',
          padding: 10,
          margin: 5,
        }}
        onPress={() => onVoicePress(item)}>
        <Text style={{ color: 'white' }}>
          {`${item.language} - ${item.name || item.id}`}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Text to Speech Demo</Text>
      <Button title="Read Text" onPress={readText} />
      <TextInput
        style={{
          borderColor: 'gray',
          borderWidth: 1,
          margin: 10,
          padding: 5,
        }}
        onChangeText={(text: React.SetStateAction<string>) => setText(text)}
        value={text}
      />
      <Text>Speech Rate: {speechRate.toFixed(2)}</Text>
      <Slider
        minimumValue={0.5}
        maximumValue={2.0}
        step={0.1}
        value={speechRate}
        onValueChange={updateSpeechRate}
      />
      <Text>Speech Pitch: {speechPitch.toFixed(2)}</Text>
      <Slider
        minimumValue={0.5}
        maximumValue={2.0}
        step={0.1}
        value={speechPitch}
        onValueChange={(value: React.SetStateAction<number>) => setSpeechPitch(value)}
      />
      <FlatList
        data={availableVoices}
        renderItem={renderVoiceItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default App;