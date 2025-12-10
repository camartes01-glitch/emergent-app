import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface ImagePickerComponentProps {
  minFiles: number;
  maxFiles: number;
  images: string[];
  onImagesChange: (images: string[]) => void;
  label?: string;
}

export default function ImagePickerComponent({
  minFiles,
  maxFiles,
  images,
  onImagesChange,
  label = 'Upload Work'
}: ImagePickerComponentProps) {
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload images.'
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    if (images.length >= maxFiles) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxFiles} files`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        onImagesChange([...images, base64Image]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} (Min: {minFiles}, Max: {maxFiles})
      </Text>
      <Text style={styles.helperText}>Only PNG or JPEG formats</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close-circle" size={24} color={Colors.error} />
            </TouchableOpacity>
          </View>
        ))}

        {images.length < maxFiles && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={pickImage}
            disabled={loading}
          >
            <Ionicons name="add-circle" size={48} color={Colors.primary} />
            <Text style={styles.addButtonText}>
              {loading ? 'Loading...' : 'Add Image'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Text style={styles.counterText}>
        {images.length} / {maxFiles} uploaded
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 12,
  },
  imageScroll: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: Colors.border,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  counterText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 8,
  },
});