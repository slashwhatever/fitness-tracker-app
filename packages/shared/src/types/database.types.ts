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
      movement_last_sets: {
        Row: {
          last_set_date: string | null
          movement_name: string
          total_sets: number | null
          updated_at: string | null
          user_id: string
          user_movement_id: string
        }
        Insert: {
          last_set_date?: string | null
          movement_name: string
          total_sets?: number | null
          updated_at?: string | null
          user_id: string
          user_movement_id: string
        }
        Update: {
          last_set_date?: string | null
          movement_name?: string
          total_sets?: number | null
          updated_at?: string | null
          user_id?: string
          user_movement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movement_last_sets_user_movement_id_fkey"
            columns: ["user_movement_id"]
            isOneToOne: true
            referencedRelation: "user_movements"
            referencedColumns: ["id"]
          },
        ]
      }
      movement_template_muscle_groups: {
        Row: {
          created_at: string | null
          id: string
          movement_template_id: string
          muscle_group_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          movement_template_id: string
          muscle_group_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          movement_template_id?: string
          muscle_group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movement_template_muscle_groups_movement_template_id_fkey"
            columns: ["movement_template_id"]
            isOneToOne: false
            referencedRelation: "movement_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movement_template_muscle_groups_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      movement_templates: {
        Row: {
          created_at: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          id: string
          instructions: string | null
          name: string
          tags: string[] | null
          tracking_type_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          id?: string
          instructions?: string | null
          name: string
          tags?: string[] | null
          tracking_type_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          experience_level?: Database["public"]["Enums"]["experience_level"]
          id?: string
          instructions?: string | null
          name?: string
          tags?: string[] | null
          tracking_type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "movement_templates_tracking_type_id_fkey"
            columns: ["tracking_type_id"]
            isOneToOne: false
            referencedRelation: "tracking_types"
            referencedColumns: ["id"]
          },
        ]
      }
      muscle_groups: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
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
      tracking_types: {
        Row: {
          created_at: string | null
          default_unit: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_unit?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_unit?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_movement_muscle_groups: {
        Row: {
          created_at: string | null
          id: string
          muscle_group_id: string
          user_movement_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          muscle_group_id: string
          user_movement_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          muscle_group_id?: string
          user_movement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_movement_muscle_groups_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_movement_muscle_groups_user_movement_id_fkey"
            columns: ["user_movement_id"]
            isOneToOne: false
            referencedRelation: "user_movements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_movements: {
        Row: {
          created_at: string
          custom_rest_timer: number | null
          customized_at: string | null
          experience_level: Database["public"]["Enums"]["experience_level"]
          id: string
          is_reverse_weight: boolean
          last_used_at: string | null
          manual_1rm: number | null
          migrated_from_template: boolean | null
          migration_date: string | null
          name: string
          original_template_id: string | null
          personal_notes: string | null
          tags: string[] | null
          template_id: string | null
          tracking_type_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_rest_timer?: number | null
          customized_at?: string | null
          experience_level?: Database["public"]["Enums"]["experience_level"]
          id?: string
          is_reverse_weight?: boolean
          last_used_at?: string | null
          manual_1rm?: number | null
          migrated_from_template?: boolean | null
          migration_date?: string | null
          name: string
          original_template_id?: string | null
          personal_notes?: string | null
          tags?: string[] | null
          template_id?: string | null
          tracking_type_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_rest_timer?: number | null
          customized_at?: string | null
          experience_level?: Database["public"]["Enums"]["experience_level"]
          id?: string
          is_reverse_weight?: boolean
          last_used_at?: string | null
          manual_1rm?: number | null
          migrated_from_template?: boolean | null
          migration_date?: string | null
          name?: string
          original_template_id?: string | null
          personal_notes?: string | null
          tags?: string[] | null
          template_id?: string | null
          tracking_type_id?: string
          updated_at?: string
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
            foreignKeyName: "user_movements_tracking_type_id_fkey"
            columns: ["tracking_type_id"]
            isOneToOne: false
            referencedRelation: "tracking_types"
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
          theme: string
          timer_pin_enabled: boolean
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
          theme?: string
          timer_pin_enabled?: boolean
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
          theme?: string
          timer_pin_enabled?: boolean
          updated_at?: string
          weight_unit?: string
        }
        Relationships: []
      }
      workout_groups: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_groups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_movement_counts: {
        Row: {
          movement_count: number | null
          updated_at: string | null
          user_id: string
          workout_id: string
        }
        Insert: {
          movement_count?: number | null
          updated_at?: string | null
          user_id: string
          workout_id: string
        }
        Update: {
          movement_count?: number | null
          updated_at?: string | null
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_movement_counts_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: true
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_movements: {
        Row: {
          created_at: string
          id: string
          order_index: number
          user_movement_id: string
          workout_id: string
          workout_notes: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_index: number
          user_movement_id: string
          workout_id: string
          workout_notes?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_index?: number
          user_movement_id?: string
          workout_id?: string
          workout_notes?: string | null
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
          archived: boolean
          created_at: string
          default_rest_timer: number | null
          description: string | null
          group_id: string | null
          id: string
          name: string
          order_index: number
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          default_rest_timer?: number | null
          description?: string | null
          group_id?: string | null
          id?: string
          name: string
          order_index: number
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          default_rest_timer?: number | null
          description?: string | null
          group_id?: string | null
          id?: string
          name?: string
          order_index?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "workout_groups"
            referencedColumns: ["id"]
          },
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
      cleanup_migration_backup_24: { Args: never; Returns: number }
      get_home_stats: { Args: never; Returns: Json }
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
    },
  },
} as const
