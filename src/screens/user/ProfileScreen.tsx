import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';

import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';

interface UserProfileData {
  name?: string;
  surname?: string;
  email?: string;
  contactNumber?: string;
  address?: string;
  cardNumber?: string;
  role?: string;
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, 'users', user.uid));
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfileData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        Alert.alert('Error', 'Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.uid]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout },
    ]);
  };

  const fullName =
    [profile?.name, profile?.surname].filter(Boolean).join(' ') ||
    user?.displayName ||
    'User';

  const maskedCard =
    profile?.cardNumber && profile.cardNumber.length >= 4
      ? `**** **** **** ${profile.cardNumber.slice(-4)}`
      : 'No saved card';

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#102a43" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#102a43" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{fullName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.nameText}>{fullName}</Text>
          <Text style={styles.emailText}>{profile?.email || user?.email || 'No email'}</Text>
          <Text style={styles.roleBadge}>{profile?.role || 'customer'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <ProfileRow label="Phone Number" value={profile?.contactNumber || 'Not provided'} />
          <ProfileRow label="Address" value={profile?.address || 'Not provided'} />
          <ProfileRow label="Saved Card" value={maskedCard} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <Button
            title="Back To Dashboard"
            onPress={() => navigation.goBack()}
            style={styles.primaryButton}
          />
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={styles.secondaryButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ProfileRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.profileRow}>
    <Text style={styles.profileLabel}>{label}</Text>
    <Text style={styles.profileValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f6',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef2f6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#52606d',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#102a43',
  },
  headerSpacer: {
    width: 42,
  },
  heroCard: {
    backgroundColor: '#102a43',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#f7c873',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#102a43',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  emailText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 16,
  },
  profileRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f6',
  },
  profileLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#627d98',
    marginBottom: 6,
  },
  profileValue: {
    fontSize: 15,
    color: '#102a43',
    fontWeight: '600',
  },
  primaryButton: {
    marginBottom: 12,
    borderRadius: 14,
  },
  secondaryButton: {
    borderRadius: 14,
  },
});
