// Setting.js
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import {InferenceSession, Tensor} from 'onnxruntime-react-native';
import RNFS from 'react-native-fs';
import * as ImagePicker from 'react-native-image-picker';
import {Buffer} from 'buffer';
import jpeg from 'jpeg-js';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {request, PERMISSIONS} from 'react-native-permissions';

/* ================= CONSTANTS ================= */

const INPUT_SIZE = 224;
const COSINE_THRESHOLD = 0.7;
const EUCLIDEAN_THRESHOLD = 0.85;

const ANDROID_MODEL = 'mobilefacenet.onnx';
const IOS_MODEL = 'tiny_model.onnx';

/* ================= COMPONENT ================= */

export default function Setting() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /* ================= MODEL LOADER ================= */

  useEffect(() => {
    console.log('🚀 Setting screen mounted');
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      console.log('📦 Starting ONNX model load...');
      setIsLoading(true);

      let modelPath = '';

      if (Platform.OS === 'android') {
        console.log('🤖 Platform: ANDROID');

        modelPath = `${RNFS.DocumentDirectoryPath}/${ANDROID_MODEL}`;
        const exists = await RNFS.exists(modelPath);

        console.log('🤖 Android model path:', modelPath);
        console.log('🤖 Exists:', exists);

        if (!exists) {
          console.log('📥 Copying model from assets...');
          await RNFS.copyFileAssets(ANDROID_MODEL, modelPath);
          console.log('✅ Android model copied');
        }

      } else {
        console.log('🍎 Platform: iOS');

        const rawPath = `${RNFS.MainBundlePath}/${IOS_MODEL}`;

        console.log('🍎 MainBundlePath:', RNFS.MainBundlePath);
        console.log('🍎 iOS model path:', rawPath);

        const exists = await RNFS.exists(rawPath);
        console.log('🍎 Exists:', exists);

        if (!exists) {
          console.log('❌ iOS model NOT found');
          Alert.alert(
            'iOS Error',
            'ONNX model not found. Please add it to Copy Bundle Resources.',
          );
          return;
        }

        modelPath = rawPath; // ❗ NO file://
      }

      console.log('🧠 Creating InferenceSession...');
      const s = await InferenceSession.create(modelPath, {
        executionProviders: ['cpu'],
      });

      console.log('✅ ONNX Model Loaded');
      console.log('➡️ Input names:', s.inputNames);
      console.log('➡️ Output names:', s.outputNames);

      setSession(s);

    } catch (error) {
      console.error('❌ Model load failed:', error);
      Alert.alert('Model Error', error.message);
    } finally {
      setIsLoading(false);
      console.log('📦 Model load process finished');
    }
  };

  /* ================= IMAGE HELPERS ================= */

  const preprocessImage = async base64 => {
    console.log('🖼️ Preprocessing image...');
    const clean = base64.replace(/^data:image\/\w+;base64,/, '');
    const tempPath = `${RNFS.CachesDirectoryPath}/img_${Date.now()}.jpg`;

    await RNFS.writeFile(tempPath, clean, 'base64');

    const resized = await ImageResizer.createResizedImage(
      tempPath,
      INPUT_SIZE,
      INPUT_SIZE,
      'JPEG',
      100,
    );

    const resizedPath = resized.uri.replace('file://', '');
    const resizedBase64 = await RNFS.readFile(resizedPath, 'base64');

    await RNFS.unlink(tempPath);
    await RNFS.unlink(resizedPath);

    console.log('✅ Image resized & normalized');
    return resizedBase64;
  };

  const normalize = vec => {
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    return vec.map(v => v / norm);
  };

  const getEmbedding = async imageBase64 => {
    if (!session) {
      console.log('❌ Session not ready');
      return null;
    }

    console.log('🧬 Generating embedding...');
    const processed = await preprocessImage(imageBase64);

    const raw = jpeg.decode(Buffer.from(processed, 'base64'), {
      useTArray: true,
    });

    const floatData = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE);

    for (let y = 0; y < INPUT_SIZE; y++) {
      for (let x = 0; x < INPUT_SIZE; x++) {
        const idx = (y * INPUT_SIZE + x) * 3;
        floatData[y * INPUT_SIZE + x] = raw.data[idx] / 255;
        floatData[INPUT_SIZE * INPUT_SIZE + y * INPUT_SIZE + x] =
          raw.data[idx + 1] / 255;
        floatData[2 * INPUT_SIZE * INPUT_SIZE + y * INPUT_SIZE + x] =
          raw.data[idx + 2] / 255;
      }
    }

    const tensor = new Tensor('float32', floatData, [
      1,
      3,
      INPUT_SIZE,
      INPUT_SIZE,
    ]);

    console.log('📊 Running inference...');
    const output = await session.run({
      [session.inputNames[0]]: tensor,
    });

    console.log('✅ Inference completed');
    return normalize(Array.from(output[session.outputNames[0]].data));
  };

  /* ================= MATCH ================= */

  const cosineSimilarity = (a, b) =>
    a.reduce((s, v, i) => s + v * b[i], 0);

  const euclideanDistance = (a, b) =>
    Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));

  const matchFaces = async () => {
    if (!image1 || !image2 || !session) {
      console.log('❌ Missing images or session');
      return;
    }

    console.log('🔍 Matching faces...');
    setIsProcessing(true);

    const e1 = await getEmbedding(image1);
    const e2 = await getEmbedding(image2);

    const similarity = cosineSimilarity(e1, e2);
    const distance = euclideanDistance(e1, e2);

    console.log('📈 Similarity:', similarity);
    console.log('📏 Distance:', distance);

    setMatchResult({
      isMatch:
        similarity >= COSINE_THRESHOLD &&
        distance <= EUCLIDEAN_THRESHOLD,
      similarity,
      distance,
    });

    setIsProcessing(false);
  };

  /* ================= IMAGE PICKER ================= */

  const pickImage = async setter => {
    console.log('📸 Opening image picker');

    if (Platform.OS === 'ios') {
      await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    } else {
      await PermissionsAndroid.request(
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
    }

    const result = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
    });

    if (result.assets?.[0]?.base64) {
      console.log('✅ Image selected');
      setter(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  /* ================= UI ================= */

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Face Matching</Text>

      {isLoading && <ActivityIndicator size="large" />}

      <View style={styles.row}>
        <Image source={{uri: image1}} style={styles.image} />
        <Image source={{uri: image2}} style={styles.image} />
      </View>

      <TouchableOpacity style={styles.btn} onPress={() => pickImage(setImage1)}>
        <Text>Select Image 1</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={() => pickImage(setImage2)}>
        <Text>Select Image 2</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.matchBtn]}
        onPress={matchFaces}>
        <Text style={{color: '#fff'}}>
          {isProcessing ? 'Processing...' : 'Match Faces'}
        </Text>
      </TouchableOpacity>

      {matchResult && (
        <Text style={styles.result}>
          {matchResult.isMatch ? '✅ MATCH' : '❌ NO MATCH'}
        </Text>
      )}
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20},
  title: {fontSize: 22, textAlign: 'center', marginBottom: 20},
  row: {flexDirection: 'row', justifyContent: 'space-around'},
  image: {width: 140, height: 140, backgroundColor: '#ccc'},
  btn: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#ddd',
    alignItems: 'center',
    borderRadius: 6,
  },
  matchBtn: {backgroundColor: '#2ecc71'},
  result: {marginTop: 20, fontSize: 18, textAlign: 'center'},
});
