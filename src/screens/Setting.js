// App.js
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  StyleSheet,
  Image, 
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import RNFS from 'react-native-fs';
import * as ImagePicker from 'react-native-image-picker';
import { Buffer } from 'buffer';
import jpeg from 'jpeg-js';
import ImageResizer from '@bam.tech/react-native-image-resizer';

// Constants for face matching
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

  // Load ONNX model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        const modelPath = `${RNFS.MainBundlePath}/tiny_model.onnx`;
        const exists = await RNFS.exists(modelPath);
        if (!exists) {
          console.log('❌ Model not found at', modelPath);
          Alert.alert('Error', 'Model file not found in bundle');
          return;
        }

        const s = await InferenceSession.create(modelPath);
        setSession(s);
        console.log('✅ Model loaded!');
        console.log('Inputs:', s.inputNames);  // e.g., ["input"]
        console.log('Outputs:', s.outputNames); // e.g., ["output"]
      } catch (e) {
        console.log('❌ Failed to create session:', e.message);
        Alert.alert('Error', `Failed to load model: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
  }, []);

  // Normalize embeddings
  const normalize = (vec) => {
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    if (norm === 0) return vec;
    const normalized = new Float32Array(vec.length);
    for (let i = 0; i < vec.length; i++) {
      normalized[i] = vec[i] / norm;
    }
    return normalized;
  };

  // Preprocess image
  const preprocessImage = async (base64Image) => {
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
        0,
        null,
        false,
        {mode: 'cover', onlyScaleDown: false},
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

  // Get embedding
  const getEmbedding = async (base64Image) => {
    try {
      if (!session) throw new Error('ONNX session not initialized');

      const processedBase64 = await preprocessImage(base64Image);
      if (!processedBase64) throw new Error('Image preprocessing failed');

      const raw = jpeg.decode(Buffer.from(processedBase64, 'base64'), {
        useTArray: true,
        formatAsRGBA: false,
      });

      if (!raw || !raw.data) throw new Error('JPEG decode failed');

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

  // Cosine similarity
  const cosineSimilarity = (a, b) => {
    let dot = 0,
      normA = 0,
      normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    if (normA === 0 || normB === 0) return 0;
    return Math.max(-1, Math.min(1, dot / (normA * normB)));
  };

  // Euclidean distance
  const euclideanDistance = (a, b) => {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  };

  // Pick image from gallery
  const pickImage = async (setter) => {
    try {
      ImagePicker.launchImageLibrary(
        {
          mediaType: 'photo',
          includeBase64: true,
          maxWidth: 500,
          maxHeight: 500,
          quality: 0.8,
        },
        (response) => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorCode) {
            console.log('ImagePicker Error: ', response.errorMessage);
            Alert.alert('Error', response.errorMessage);
          } else if (response.assets && response.assets[0].base64) {
            setter(`data:image/jpeg;base64,${response.assets[0].base64}`);
          }
        },
      );
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Match faces
  const matchFaces = async () => {
    if (!session) {
      Alert.alert('Error', 'Model not loaded yet');
      return;
    }
    if (!image1 || !image2) {
      Alert.alert('Error', 'Both images are required for matching');
      return;
    }

    setIsProcessing(true);
    setMatchResult(null);

    try {
      const [emb1, emb2] = await Promise.all([
        getEmbedding(image1),
        getEmbedding(image2),
      ]);

      if (!emb1 || !emb2) {
        Alert.alert('Error', 'Failed to generate face embeddings');
        setIsProcessing(false);
        return;
      }

      const similarity = cosineSimilarity(emb1, emb2);
      const distance = euclideanDistance(emb1, emb2);

      const isMatch =
        similarity >= COSINE_THRESHOLD && distance <= EUCLIDEAN_THRESHOLD;

      let confidence = 'LOW';
      if (similarity >= 0.75 && distance <= 0.6) confidence = 'HIGH';
      else if (similarity >= 0.7 && distance <= 0.7) confidence = 'MEDIUM';

      const result = {isMatch, similarity, distance, confidence};
      setMatchResult(result);
      
      console.log('Face matching result:', result);
    } catch (error) {
      console.error('❌ Matching error:', error);
      Alert.alert('Error', 'Face matching failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Run model with sample data (this replaces the missing runModel function)
  const runImageClassification = async () => {
    if (!session) {
      Alert.alert('Error', 'Model not loaded yet');
      return;
    }
    
    try {
      // Check your model's input name
      const inputName = session.inputNames[0];
      const outputName = session.outputNames[0];

      // Prepare a dummy input tensor (MobileNetV2 expects [1,3,224,224])
      const inputShape = [1, 3, 224, 224];
      const inputData = new Float32Array(inputShape.reduce((a, b) => a * b)).fill(0.5);

      const inputTensor = new Tensor('float32', inputData, inputShape);
      const feeds = { [inputName]: inputTensor };

      console.log('🚀 Running inference...');
      const results = await session.run(feeds);
      console.log('🟢 Inference done! Output keys:', Object.keys(results));

      const outputTensor = results[outputName];
      console.log('Output shape:', outputTensor.dims);
      console.log('Output values (first 10):', outputTensor.data.slice(0, 10));
      
      Alert.alert('Success', 'Model ran successfully. Check console for output.');
    } catch (err) {
      console.log('❌ Inference error:', err.message);
      Alert.alert('Error', `Inference failed: ${err.message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Face Matching</Text>
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.modelStatus}>
          <Text>
            Model Status: {session ? '✅ Loaded' : '❌ Not Loaded'}
          </Text>
        </View>
      )}
      
      <View style={styles.imageContainer}>
        <View style={styles.imageBox}>
          <Text style={styles.imageLabel}>Image 1</Text>
          {image1 ? (
            <Image source={{uri: image1}} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage} />
          )}
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => pickImage(setImage1)}>
            <Text style={styles.buttonText}>Select Image 1</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageBox}>
          <Text style={styles.imageLabel}>Image 2</Text>
          {image2 ? (
            <Image source={{uri: image2}} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage} />
          )}
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => pickImage(setImage2)}>
            <Text style={styles.buttonText}>Select Image 2</Text>
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
            matchResult.isMatch
              ? styles.matchSuccess
              : styles.matchFailure,
          ]}>
          <Text style={styles.resultTitle}>
            {matchResult.isMatch
              ? '✅ FACE MATCHED'
              : '❌ FACE NOT MATCHED'}
          </Text>
          <Text>Similarity: {matchResult.similarity.toFixed(4)}</Text>
          <Text>Distance: {matchResult.distance.toFixed(4)}</Text>
          <Text>Confidence: {matchResult.confidence}</Text>
        </View>
      )}

      <View style={styles.divider} />
      
      <Text style={styles.subtitle}>Run Image Classification</Text>
      <TouchableOpacity 
        style={styles.classifyButton} 
        onPress={runImageClassification}
        disabled={!session}>
        <Text style={styles.buttonText}>Run Classification</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modelStatus: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageBox: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  matchButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  matchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  matchSuccess: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
    borderWidth: 1,
  },
  matchFailure: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
    borderWidth: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  classifyButton: {
    backgroundColor: '#9b59b6',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
});