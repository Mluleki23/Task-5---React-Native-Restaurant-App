import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { FoodItem } from '../types';
import { db } from './firebase';

export const foodService = {
  async getAllFoodItems(): Promise<FoodItem[]> {
    try {
      const foodQuery = query(
        collection(db, 'foodItems'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(foodQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as FoodItem[];
    } catch (error) {
      console.error('Error fetching food items:', error);
      throw error;
    }
  },

  async getFoodItemById(id: string): Promise<FoodItem | null> {
    try {
      const docRef = doc(db, 'foodItems', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        } as FoodItem;
      }
      return null;
    } catch (error) {
      console.error('Error fetching food item:', error);
      throw error;
    }
  },

  async createFoodItem(item: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<FoodItem> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'foodItems'), {
        ...item,
        createdAt: now,
        updatedAt: now,
      });
      
      return {
        id: docRef.id,
        ...item,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      console.error('Error creating food item:', error);
      throw error;
    }
  },

  async updateFoodItem(id: string, updates: Partial<FoodItem>): Promise<void> {
    try {
      const docRef = doc(db, 'foodItems', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating food item:', error);
      throw error;
    }
  },

  async deleteFoodItem(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'foodItems', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting food item:', error);
      throw error;
    }
  }
};
