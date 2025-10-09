// App.js
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
import {check, request, PERMISSIONS} from 'react-native-permissions';
import * as ImagePicker from 'react-native-image-picker';
import {Buffer} from 'buffer';
import jpeg from 'jpeg-js';
import ImageResizer from '@bam.tech/react-native-image-resizer';

// Constants
const INPUT_SIZE = 112;
const COSINE_THRESHOLD = 0.7;
const EUCLIDEAN_THRESHOLD = 0.85;

export default function Setting() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ Load ONNX model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        const modelPath = `${RNFS.MainBundlePath}/tiny_model.onnx`;
        const exists = await RNFS.exists(modelPath);
        if (!exists) {
          Alert.alert('Error', 'Model file not found in bundle');
          return;
        }
        const s = await InferenceSession.create(modelPath);
        setSession(s);
        console.log('✅ Model loaded');
      } catch (e) {
        console.log('❌ Failed to create session:', e.message);
        Alert.alert('Error', `Failed to load model: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadModel();
  }, []);

  // ✅ Normalize vector
  const normalize = vec => {
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    return norm === 0 ? vec : vec.map(v => v / norm);
  };

  // ✅ Preprocess image
  const preprocessImage = async base64Image => {
    try {
      const pureBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const filePath = `${RNFS.CachesDirectoryPath}/temp_${Date.now()}.jpg`;
      await RNFS.writeFile(filePath, pureBase64, 'base64');
      const resized = await ImageResizer.createResizedImage(
        filePath,
        INPUT_SIZE,
        INPUT_SIZE,
        'JPEG',
        100,
      );
      const resizedPath = resized.uri.replace('file://', '');
      const resizedBase64 = await RNFS.readFile(resizedPath, 'base64');
      await RNFS.unlink(filePath);
      await RNFS.unlink(resizedPath);
      return resizedBase64;
    } catch (err) {
      console.error('❌ Preprocessing error:', err);
      return null;
    }
  };

  // ✅ Get embedding
  const getEmbedding = async base64Image => {
    try {
      if (!session) throw new Error('Model not initialized');
      const processedBase64 = await preprocessImage(base64Image);
      if (!processedBase64) throw new Error('Image preprocessing failed');
      const raw = jpeg.decode(Buffer.from(processedBase64, 'base64'), {
        useTArray: true,
        formatAsRGBA: false,
      });
      const mean = [0.5, 0.5, 0.5];
      const std = [0.5, 0.5, 0.5];
      const floatData = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE);
      for (let y = 0; y < INPUT_SIZE; y++) {
        for (let x = 0; x < INPUT_SIZE; x++) {
          const idx = (y * INPUT_SIZE + x) * 3;
          const r = (raw.data[idx] / 255.0 - mean[0]) / std[0];
          const g = (raw.data[idx + 1] / 255.0 - mean[1]) / std[1];
          const b = (raw.data[idx + 2] / 255.0 - mean[2]) / std[2];
          floatData[y * INPUT_SIZE + x] = r;
          floatData[INPUT_SIZE * INPUT_SIZE + y * INPUT_SIZE + x] = g;
          floatData[2 * INPUT_SIZE * INPUT_SIZE + y * INPUT_SIZE + x] = b;
        }
      }
      const tensor = new Tensor('float32', floatData, [
        1,
        3,
        INPUT_SIZE,
        INPUT_SIZE,
      ]);
      const feeds = {[session.inputNames[0]]: tensor};
      const results = await session.run(feeds);
      const embedding = results[session.outputNames[0]].data;
      return normalize(embedding);
    } catch (err) {
      console.error('❌ Embedding error:', err);
      return null;
    }
  };

  // ✅ Cosine similarity
  const cosineSimilarity = (a, b) => {
    let dot = 0,
      normA = 0,
      normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  // ✅ Euclidean distance
  const euclideanDistance = (a, b) => {
    let sum = 0;
    for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
    return Math.sqrt(sum);
  };

  // ✅ Combined Camera + Gallery Picker
  const handleImagePick = async (setter, source = 'gallery') => {
    try {
      // iOS Permissions
      if (Platform.OS === 'ios') {
        const permission =
          source === 'camera'
            ? PERMISSIONS.IOS.CAMERA
            : PERMISSIONS.IOS.PHOTO_LIBRARY;
        const result = await request(permission);
        if (result === 'blocked' || result === 'denied') {
          Alert.alert(
            'Permission Required',
            `Please enable ${
              source === 'camera' ? 'Camera' : 'Photo Library'
            } access in Settings.`,
          );
          return;
        }
      }

      // Android Permissions
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          );
        } else {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          );
        }
      }

      const options = {
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.8,
      };

      const callback = response => {
        if (response.didCancel) return;
        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets[0].base64) {
          setter(`data:image/jpeg;base64,${response.assets[0].base64}`);
        }
      };

      if (source === 'camera') {
        ImagePicker.launchCamera(options, callback);
      } else {
        ImagePicker.launchImageLibrary(options, callback);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Failed to open camera or gallery');
    }
  };

  // ✅ Match faces
  const matchFaces = async () => {
    if (!session) return Alert.alert('Error', 'Model not loaded');
    if (!image1 || !image2)
      return Alert.alert('Error', 'Both images are required');

    setIsProcessing(true);
    setMatchResult(null);

    try {
      const [emb1, emb2] = await Promise.all([
        getEmbedding(image1),
        getEmbedding(image2),
      ]);
      const similarity = cosineSimilarity(emb1, emb2);
      const distance = euclideanDistance(emb1, emb2);
      const isMatch =
        similarity >= COSINE_THRESHOLD && distance <= EUCLIDEAN_THRESHOLD;

      const confidence =
        similarity >= 0.75 && distance <= 0.6
          ? 'HIGH'
          : similarity >= 0.7 && distance <= 0.7
          ? 'MEDIUM'
          : 'LOW';

      setMatchResult({isMatch, similarity, distance, confidence});
    } catch (error) {
      Alert.alert('Error', 'Face matching failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Face Matching</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Text style={{textAlign: 'center'}}>
          Model Status: {session ? '✅ Loaded' : '❌ Not Loaded'}
        </Text>
      )}

      <View style={styles.imageContainer}>
        {/* IMAGE 1 */}
        <View style={styles.imageBox}>
          <Text style={styles.imageLabel}>Image 1</Text>
          {image1 ? (
            <Image source={{uri: image1}} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage} />
          )}
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => handleImagePick(setImage1, 'gallery')}>
            <Text style={styles.buttonText}>Select from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectButton, {backgroundColor: '#27ae60'}]}
            onPress={() => handleImagePick(setImage1, 'camera')}>
            <Text style={styles.buttonText}>Capture from Camera</Text>
          </TouchableOpacity>
        </View>

        {/* IMAGE 2 */}
        <View style={styles.imageBox}>
          <Text style={styles.imageLabel}>Image 2</Text>
          {image2 ? (
            <Image source={{uri: image2}} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage} />
          )}
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => handleImagePick(setImage2, 'gallery')}>
            <Text style={styles.buttonText}>Select from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectButton, {backgroundColor: '#27ae60'}]}
            onPress={() => handleImagePick(setImage2, 'camera')}>
            <Text style={styles.buttonText}>Capture from Camera</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.matchButton,
          (!image1 || !image2 || isProcessing) && styles.disabledButton,
        ]}
        onPress={matchFaces}
        disabled={!image1 || !image2 || isProcessing}>
        <Text style={styles.matchButtonText}>
          {isProcessing ? 'Processing...' : 'Match Faces'}
        </Text>
      </TouchableOpacity>

      {matchResult && (
        <View
          style={[
            styles.resultContainer,
            matchResult.isMatch ? styles.matchSuccess : styles.matchFailure,
          ]}>
          <Text style={styles.resultTitle}>
            {matchResult.isMatch ? '✅ FACE MATCHED' : '❌ FACE NOT MATCHED'}
          </Text>
          <Text>Similarity: {matchResult.similarity.toFixed(4)}</Text>
          <Text>Distance: {matchResult.distance.toFixed(4)}</Text>
          <Text>Confidence: {matchResult.confidence}</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ✅ STYLES
const styles = StyleSheet.create({
  container: {flex: 1, paddingTop: 70, backgroundColor: '#f5f5f5'},
  title: {fontSize: 24, fontWeight: 'bold', marginBottom: 40, textAlign: 'center'},
  imageContainer: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20},
  imageBox: {flex: 1, alignItems: 'center', marginHorizontal: 5},
  imageLabel: {fontSize: 16, fontWeight: 'bold', marginBottom: 8},
  image: {width: 150, height: 150, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', marginBottom: 10},
  placeholderImage: {width: 150, height: 150, borderRadius: 10, backgroundColor: '#ddd', marginBottom: 10},
  selectButton: {backgroundColor: '#3498db', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5, marginVertical: 5},
  buttonText: {color: '#fff', fontWeight: 'bold'},
  matchButton: {backgroundColor: '#2ecc71', paddingVertical: 12, borderRadius: 5, alignItems: 'center', margin: 20},
  disabledButton: {backgroundColor: '#95a5a6'},
  matchButtonText: {color: 'white', fontSize: 16, fontWeight: 'bold'},
  resultContainer: {padding: 15, borderRadius: 10, marginBottom: 20, alignItems: 'center'},
  resultTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 8},
  matchSuccess: {backgroundColor: '#d4edda', borderColor: '#28a745', borderWidth: 1},
  matchFailure: {backgroundColor: '#f8d7da', borderColor: '#dc3545', borderWidth: 1},
});
