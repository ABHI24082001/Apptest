import React, { useState } from 'react';
import { View, Image, StyleSheet, Modal, Platform } from 'react-native';
import { Button, Text, IconButton, ActivityIndicator } from 'react-native-paper';
import { selectImageFromDocuments } from '../utils/FaceDetectionUtils';

const ImageUploadModal = ({ visible, onDismiss, onImageSelected }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [faceDetection, setFaceDetection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSelectImage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await selectImageFromDocuments();
      
      if (result.cancelled) {
        setIsLoading(false);
        return;
      }
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setSelectedImage(result.image);
      setFaceDetection(result.faceDetection);
      
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      setError(`Image selection failed: ${e.message}`);
      console.error('Image selection error details:', e);
    }
  };
  
  const handleConfirm = () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }
    
    if (!faceDetection || !faceDetection.found) {
      setError('No face detected in the image. Please select another photo.');
      return;
    }
    
    onImageSelected({
      image: selectedImage,
      faceDetection: faceDetection
    });
    
    // Reset state
    setSelectedImage(null);
    setFaceDetection(null);
  };
  
  const renderFaceOverlay = () => {
    if (!selectedImage || !faceDetection || !faceDetection.found) return null;
    
    const face = faceDetection.faces[0];
    
    // Calculate position relative to the image dimensions
    const imageWidth = selectedImage.width;
    const imageHeight = selectedImage.height;
    
    // Adjust for the container/display size
    const containerWidth = 300; // Approximate width of the image container
    const scale = containerWidth / imageWidth;
    
    const overlayStyle = {
      position: 'absolute',
      left: face.bounds.x * scale,
      top: face.bounds.y * scale,
      width: face.bounds.width * scale,
      height: face.bounds.height * scale,
      borderWidth: 2,
      borderColor: '#4CAF50',
      borderRadius: 8,
      backgroundColor: 'rgba(76, 175, 80, 0.15)',
    };
    
    return <View style={overlayStyle} />;
  };
  
  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      transparent
      animationType="slide"
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.heading}>Upload Photo</Text>
            <IconButton 
              icon="close" 
              size={24} 
              onPress={onDismiss} 
            />
          </View>
          
          <View style={styles.imageContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#2196F3" />
            ) : selectedImage ? (
              <View style={styles.selectedImageContainer}>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.selectedImage}
                  resizeMode="contain"
                />
                {renderFaceOverlay()}
                
                <View style={styles.faceDetectionStatus}>
                  <IconButton
                    icon={faceDetection?.found ? "face-recognition" : "face-outline"}
                    size={24}
                    color={faceDetection?.found ? "#4CAF50" : "#F44336"}
                  />
                  <Text style={{ 
                    color: faceDetection?.found ? "#4CAF50" : "#F44336",
                    fontWeight: 'bold'
                  }}>
                    {faceDetection?.found ? "Face Detected" : "No Face Detected"}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <IconButton icon="image-plus" size={40} color="#BDBDBD" />
                <Text style={styles.placeholderText}>
                  Select a photo with your face clearly visible
                </Text>
              </View>
            )}
          </View>
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          
          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={handleSelectImage}
              style={styles.button}
              loading={isLoading}
              disabled={isLoading}
            >
              Select Image
            </Button>
            
            <Button
              mode="contained"
              onPress={handleConfirm}
              style={styles.button}
              disabled={!selectedImage || !faceDetection?.found || isLoading}
            >
              Confirm
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  placeholderText: {
    textAlign: 'center',
    color: '#757575',
    marginTop: 8,
  },
  selectedImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  faceDetectionStatus: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  errorText: {
    color: '#F44336',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default ImageUploadModal;
