export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      movement_templates: {
        Row: {
          created_at: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          id: string
          instructions: string | null
          muscle_groups: string[]
          name: string
          tags: string[] | null
          tracking_type: Database["public"]["Enums"]["tracking_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          id?: string
          instructions?: string | null
          muscle_groups?: string[]
          name: string
          tags?: string[] | null
          tracking_type: Database["public"]["Enums"]["tracking_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          experience_level?: Database["public"]["Enums"]["experience_level"]
          id?: string
          instructions?: string | null
          muscle_groups?: string[]
          name?: string
          tags?: string[] | null
          tracking_type?: Database["public"]["Enums"]["tracking_type"]
          updated_at?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          achieved_at: string
          created_at: string
          id: string
          record_type: Database["public"]["Enums"]["record_type"]
          set_id: string
          user_id: string
          user_movement_id: string
          value: number
        }
        Insert: {
          achieved_at: string
          created_at?: string
          id?: string
          record_type: Database["public"]["Enums"]["record_type"]
          set_id: string
          user_id: string
          user_movement_id: string
          value: number
        }
        Update: {
          achieved_at?: string
          created_at?: string
          id?: string
          record_type?: Database["public"]["Enums"]["record_type"]
          set_id?: string
          user_id?: string
          user_movement_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_user_movement_id_fkey"
            columns: ["user_movement_id"]
            isOneToOne: false
            referencedRelation: "user_movements"
            referencedColumns: ["id"]
          },
        ]
      }
      sets: {
        Row: {
          created_at: string
          distance: number | null
          duration: number | null
          id: string
          notes: string | null
          reps: number | null
          rpe: number | null
          set_type: Database["public"]["Enums"]["set_type"]
          user_id: string
          user_movement_id: string
          weight: number | null
          workout_id: string | null
        }
        Insert: {
          created_at?: string
          distance?: number | null
          duration?: number | null
          id?: string
          notes?: string | null
          reps?: number | null
          rpe?: number | null
          set_type?: Database["public"]["Enums"]["set_type"]
          user_id: string
          user_movement_id: string
          weight?: number | null
          workout_id?: string | null
        }
        Update: {
          created_at?: string
          distance?: number | null
          duration?: number | null
          id?: string
          notes?: string | null
          reps?: number | null
          rpe?: number | null
          set_type?: Database["public"]["Enums"]["set_type"]
          user_id?: string
          user_movement_id?: string
          weight?: number | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sets_user_movement_id_fkey"
            columns: ["user_movement_id"]
            isOneToOne: false
            referencedRelation: "user_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sets_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_movements: {
        Row: {
          created_at: string
          custom_rest_timer: number | null
          id: string
          last_used_at: string | null
          manual_1rm: number | null
          muscle_groups: string[]
          name: string
          personal_notes: string | null
          template_id: string | null
          tracking_type: Database["public"]["Enums"]["tracking_type"]
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_rest_timer?: number | null
          id?: string
          last_used_at?: string | null
          manual_1rm?: number | null
          muscle_groups?: string[]
          name: string
          personal_notes?: string | null
          template_id?: string | null
          tracking_type: Database["public"]["Enums"]["tracking_type"]
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          custom_rest_timer?: number | null
          id?: string
          last_used_at?: string | null
          manual_1rm?: number | null
          muscle_groups?: string[]
          name?: string
          personal_notes?: string | null
          template_id?: string | null
          tracking_type?: Database["public"]["Enums"]["tracking_type"]
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_movements_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "movement_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_rest_timer: number
          display_name: string
          distance_unit: string
          id: string
          notification_preferences: Json
          privacy_settings: Json
          updated_at: string
          weight_unit: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_rest_timer?: number
          display_name: string
          distance_unit?: string
          id: string
          notification_preferences?: Json
          privacy_settings?: Json
          updated_at?: string
          weight_unit?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_rest_timer?: number
          display_name?: string
          distance_unit?: string
          id?: string
          notification_preferences?: Json
          privacy_settings?: Json
          updated_at?: string
          weight_unit?: string
        }
        Relationships: []
      }
      workout_movements: {
        Row: {
          created_at: string
          id: string
          order_index: number
          user_movement_id: string
          workout_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_index: number
          user_movement_id: string
          workout_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_index?: number
          user_movement_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_movements_user_movement_id_fkey"
            columns: ["user_movement_id"]
            isOneToOne: false
            referencedRelation: "user_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_movements_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          default_rest_timer: number | null
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_rest_timer?: number | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_rest_timer?: number | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reorder_workout_movements: {
        Args: { workout_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      experience_level: "Beginner" | "Intermediate" | "Advanced"
      operation_type: "INSERT" | "UPDATE" | "DELETE"
      record_type: "max_weight" | "max_reps" | "max_duration" | "max_volume"
      set_type: "warmup" | "working" | "drop" | "failure" | "rest_pause"
      tracking_type:
        | "weight"
        | "bodyweight"
        | "duration"
        | "distance"
        | "reps_only"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      experience_level: ["Beginner", "Intermediate", "Advanced"],
      operation_type: ["INSERT", "UPDATE", "DELETE"],
      record_type: ["max_weight", "max_reps", "max_duration", "max_volume"],
      set_type: ["warmup", "working", "drop", "failure", "rest_pause"],
      tracking_type: [
        "weight",
        "bodyweight",
        "duration",
        "distance",
        "reps_only",
      ],
    },
  },
} as const
