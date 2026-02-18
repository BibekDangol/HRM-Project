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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in_comment: string | null
          check_in_lat: number | null
          check_in_lng: number | null
          check_in_time: string | null
          check_out_comment: string | null
          check_out_lat: number | null
          check_out_lng: number | null
          check_out_time: string | null
          created_at: string
          date: string
          id: string
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          check_in_comment?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_time?: string | null
          check_out_comment?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_time?: string | null
          created_at?: string
          date: string
          id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          check_in_comment?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_time?: string | null
          check_out_comment?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_time?: string | null
          created_at?: string
          date?: string
          id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          created_at: string
          id: number
          leave_limit: number | null
          name: string | null
          organization_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          leave_limit?: number | null
          name?: string | null
          organization_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          leave_limit?: number | null
          name?: string | null
          organization_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      leaves: {
        Row: {
          action_taken_by: string | null
          created_at: string
          day_type: string
          days_count: number | null
          end_date: string
          id: string
          leave_type_id: number | null
          organization_id: number | null
          reason: string | null
          start_date: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          action_taken_by?: string | null
          created_at?: string
          day_type: string
          days_count?: number | null
          end_date: string
          id?: string
          leave_type_id?: number | null
          organization_id?: number | null
          reason?: string | null
          start_date: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          action_taken_by?: string | null
          created_at?: string
          day_type?: string
          days_count?: number | null
          end_date?: string
          id?: string
          leave_type_id?: number | null
          organization_id?: number | null
          reason?: string | null
          start_date?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaves_approved_by_fkey"
            columns: ["action_taken_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization: {
        Row: {
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          organization_id: number
          role: string
          status: string | null
          supervisor_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id: number
          role?: string
          status?: string | null
          supervisor_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: number
          role?: string
          status?: string | null
          supervisor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      attendance_punch_type: "check_in" | "check_out"
      attendance_status: "absent" | "present" | "on_leave" | "incomplete"
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
      attendance_punch_type: ["check_in", "check_out"],
      attendance_status: ["absent", "present", "on_leave", "incomplete"],
    },
  },
} as const
