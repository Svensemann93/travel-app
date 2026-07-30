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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      journal_entries: {
        Row: {
          body: string | null
          created_at: string
          entry_date: string | null
          id: string
          journal_id: string
          place_id: string | null
          place_photo_ids: string[] | null
          position: number
          title: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          entry_date?: string | null
          id?: string
          journal_id: string
          place_id?: string | null
          place_photo_ids?: string[] | null
          position?: number
          title?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          entry_date?: string | null
          id?: string
          journal_id?: string
          place_id?: string | null
          place_photo_ids?: string[] | null
          position?: number
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "journals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entry_photos: {
        Row: {
          created_at: string
          entry_id: string
          id: string
          position: number
          thumb_url: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          id?: string
          position?: number
          thumb_url?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          id?: string
          position?: number
          thumb_url?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_photos_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_shares: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          journal_id: string
          last_accessed_at: string | null
          token: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          journal_id: string
          last_accessed_at?: string | null
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          journal_id?: string
          last_accessed_at?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_shares_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: true
            referencedRelation: "journals"
            referencedColumns: ["id"]
          },
        ]
      }
      journals: {
        Row: {
          cover_focus_x: number
          cover_focus_y: number
          cover_photo_path: string | null
          created_at: string
          description: string | null
          id: string
          title: string
          trip_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_focus_x?: number
          cover_focus_y?: number
          cover_photo_path?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title: string
          trip_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_focus_x?: number
          cover_focus_y?: number
          cover_photo_path?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          trip_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journals_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_storage_deletions: {
        Row: {
          created_at: string
          id: string
          path: string
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
        }
        Relationships: []
      }
      place_photos: {
        Row: {
          created_at: string | null
          id: string
          is_public: boolean
          place_id: string
          position: number
          thumb_url: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_public?: boolean
          place_id: string
          position?: number
          thumb_url?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_public?: boolean
          place_id?: string
          position?: number
          thumb_url?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_photos_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      place_visits: {
        Row: {
          created_at: string
          id: string
          place_category: string | null
          place_country_code: string | null
          place_id: string | null
          place_name: string | null
          price_level: number | null
          rating: number | null
          user_id: string
          visited_on: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          place_category?: string | null
          place_country_code?: string | null
          place_id?: string | null
          place_name?: string | null
          price_level?: number | null
          rating?: number | null
          user_id: string
          visited_on?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          place_category?: string | null
          place_country_code?: string | null
          place_id?: string | null
          place_name?: string | null
          price_level?: number | null
          rating?: number | null
          user_id?: string
          visited_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_visits_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_wishes: {
        Row: {
          created_at: string
          id: string
          place_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          place_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          place_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_wishes_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          adopted: boolean
          category: string
          country_code: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean
          latitude: number
          longitude: number
          name: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          adopted?: boolean
          category?: string
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          latitude: number
          longitude: number
          name: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          adopted?: boolean
          category?: string
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          latitude?: number
          longitude?: number
          name?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_focus_x: number
          avatar_focus_y: number
          avatar_path: string | null
          bio: string | null
          cover_focus_x: number
          cover_focus_y: number
          cover_path: string | null
          created_at: string | null
          display_name: string | null
          entry_label: string | null
          entry_latitude: number | null
          entry_longitude: number | null
          id: string
          interests: string[]
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_focus_x?: number
          avatar_focus_y?: number
          avatar_path?: string | null
          bio?: string | null
          cover_focus_x?: number
          cover_focus_y?: number
          cover_path?: string | null
          created_at?: string | null
          display_name?: string | null
          entry_label?: string | null
          entry_latitude?: number | null
          entry_longitude?: number | null
          id: string
          interests?: string[]
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_focus_x?: number
          avatar_focus_y?: number
          avatar_path?: string | null
          bio?: string | null
          cover_focus_x?: number
          cover_focus_y?: number
          cover_path?: string | null
          created_at?: string | null
          display_name?: string | null
          entry_label?: string | null
          entry_latitude?: number | null
          entry_longitude?: number | null
          id?: string
          interests?: string[]
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      trip_places: {
        Row: {
          created_at: string
          notes: string | null
          place_category: string | null
          place_country_code: string | null
          place_id: string
          place_latitude: number | null
          place_longitude: number | null
          place_name: string | null
          planned_date: string | null
          position: number
          trip_id: string
        }
        Insert: {
          created_at?: string
          notes?: string | null
          place_category?: string | null
          place_country_code?: string | null
          place_id: string
          place_latitude?: number | null
          place_longitude?: number | null
          place_name?: string | null
          planned_date?: string | null
          position?: number
          trip_id: string
        }
        Update: {
          created_at?: string
          notes?: string | null
          place_category?: string | null
          place_country_code?: string | null
          place_id?: string
          place_latitude?: number | null
          place_longitude?: number | null
          place_name?: string | null
          planned_date?: string | null
          position?: number
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_places_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          cover_focus_x: number
          cover_focus_y: number
          cover_photo_path: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_focus_x?: number
          cover_focus_y?: number
          cover_photo_path?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_focus_x?: number
          cover_focus_y?: number
          cover_photo_path?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_journal_share: {
        Args: { p_journal_id: string }
        Returns: {
          created_at: string
          expires_at: string
          id: string
          journal_id: string
          last_accessed_at: string | null
          token: string
        }
        SetofOptions: {
          from: "*"
          to: "journal_shares"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_my_place_stats: {
        Args: never
        Returns: {
          avg_price: number
          avg_rating: number
          place_id: string
          visit_count: number
        }[]
      }
      get_my_public_place_visit_stats: {
        Args: never
        Returns: {
          category: string
          country_code: string
          created_at: string
          latitude: number
          longitude: number
          name: string
          place_id: string
          rating: number
          visited_on: string
        }[]
      }
      get_public_place_photos: {
        Args: { place_ids: string[] }
        Returns: {
          id: string
          place_id: string
          position: number
          thumb_url: string
          url: string
        }[]
      }
      get_public_places: {
        Args: {
          max_lat?: number
          max_lng?: number
          max_rows?: number
          min_lat?: number
          min_lng?: number
          only_wished?: boolean
        }
        Returns: {
          avg_price: number
          avg_rating: number
          category: string
          country_code: string
          description: string
          id: string
          latitude: number
          longitude: number
          my_price: number
          my_rating: number
          my_visited_on: string
          name: string
          photos: Json
          username: string
          visit_count: number
          visited_by_me: boolean
          website_url: string
          wished_by_me: boolean
          wished_on: string
        }[]
      }
      get_shared_journal: { Args: { p_token: string }; Returns: Json }
      is_public_photo_object: {
        Args: { object_name: string }
        Returns: boolean
      }
      is_username_available: { Args: { p_username: string }; Returns: boolean }
      is_visitable_place: { Args: { p_place_id: string }; Returns: boolean }
      move_trip_place: {
        Args: {
          p_notes: string
          p_ordered_place_ids: string[]
          p_place_id: string
          p_planned_date: string
          p_trip_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
