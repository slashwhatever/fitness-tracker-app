import type { Database } from "@/lib/supabase/client";
import { SupabaseService } from "@/services/supabaseService";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

export class UserPreferences {
  static async getProfile(userId: string): Promise<UserProfile | null> {
    return await SupabaseService.getUserProfile(userId);
  }

  static async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    const current = await this.getProfile(userId);
    if (!current) return null;

    const updatedProfile = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return await SupabaseService.saveUserProfile(updatedProfile);
  }

  // Convenience methods for specific preferences
  static async getWeightUnit(userId: string): Promise<string> {
    const profile = await this.getProfile(userId);
    return profile?.weight_unit || "lbs";
  }

  static async getDistanceUnit(userId: string): Promise<string> {
    const profile = await this.getProfile(userId);
    return profile?.distance_unit || "miles";
  }

  static async setWeightUnit(userId: string, unit: string): Promise<void> {
    await this.updateProfile(userId, { weight_unit: unit });
  }

  static async setDistanceUnit(userId: string, unit: string): Promise<void> {
    await this.updateProfile(userId, { distance_unit: unit });
  }
}
