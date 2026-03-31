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
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          type?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          category: string | null
          content_el: string | null
          content_en: string | null
          created_at: string
          excerpt_el: string | null
          excerpt_en: string | null
          featured_image: string | null
          id: string
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          tags: string[]
          title_el: string | null
          title_en: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content_el?: string | null
          content_en?: string | null
          created_at?: string
          excerpt_el?: string | null
          excerpt_en?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          tags?: string[]
          title_el?: string | null
          title_en: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content_el?: string | null
          content_en?: string | null
          created_at?: string
          excerpt_el?: string | null
          excerpt_en?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          tags?: string[]
          title_el?: string | null
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_items: {
        Row: {
          booking_id: string
          created_at: string
          equipment_id: string
          id: string
          num_days: number
          price_per_day: number
          quantity: number
          subtotal: number
        }
        Insert: {
          booking_id: string
          created_at?: string
          equipment_id: string
          id?: string
          num_days: number
          price_per_day: number
          quantity?: number
          subtotal: number
        }
        Update: {
          booking_id?: string
          created_at?: string
          equipment_id?: string
          id?: string
          num_days?: number
          price_per_day?: number
          quantity?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_number: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          delivery_address: string | null
          delivery_fee: number
          delivery_notes: string | null
          delivery_time_slot: string | null
          delivery_zone_id: string | null
          deposit_amount: number
          discount_amount: number
          id: string
          internal_notes: string | null
          num_days: number
          payment_status: string
          rental_end: string
          rental_start: string
          review_requested_at: string | null
          special_requirements: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subtotal: number
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          booking_number: string
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_fee?: number
          delivery_notes?: string | null
          delivery_time_slot?: string | null
          delivery_zone_id?: string | null
          deposit_amount?: number
          discount_amount?: number
          id?: string
          internal_notes?: string | null
          num_days: number
          payment_status?: string
          rental_end: string
          rental_start: string
          review_requested_at?: string | null
          special_requirements?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          booking_number?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_fee?: number
          delivery_notes?: string | null
          delivery_time_slot?: string | null
          delivery_zone_id?: string | null
          deposit_amount?: number
          discount_amount?: number
          id?: string
          internal_notes?: string | null
          num_days?: number
          payment_status?: string
          rental_end?: string
          rental_start?: string
          review_requested_at?: string | null
          special_requirements?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_inquiries: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
          source: string
          subject: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
          source?: string
          subject?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
          source?: string
          subject?: string | null
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          created_at: string
          delivery_fee: number
          estimated_time: string | null
          id: string
          is_active: boolean
          name_el: string | null
          name_en: string
          pickup_fee: number
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          delivery_fee?: number
          estimated_time?: string | null
          id?: string
          is_active?: boolean
          name_el?: string | null
          name_en: string
          pickup_fee?: number
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          delivery_fee?: number
          estimated_time?: string | null
          id?: string
          is_active?: boolean
          name_el?: string | null
          name_en?: string
          pickup_fee?: number
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      equipment: {
        Row: {
          availability: string
          category_id: string
          created_at: string
          deposit_amount: number
          description_el: string | null
          description_en: string | null
          id: string
          images: string[]
          is_active: boolean
          is_popular: boolean
          meta_description: string | null
          meta_title: string | null
          name_el: string | null
          name_en: string
          price_tier1: number
          price_tier2: number
          price_tier3: number
          price_tier4: number
          quantity_total: number
          slug: string
          specifications: Json
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          availability?: string
          category_id: string
          created_at?: string
          deposit_amount?: number
          description_el?: string | null
          description_en?: string | null
          id?: string
          images?: string[]
          is_active?: boolean
          is_popular?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name_el?: string | null
          name_en: string
          price_tier1: number
          price_tier2: number
          price_tier3: number
          price_tier4: number
          quantity_total?: number
          slug: string
          specifications?: Json
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          availability?: string
          category_id?: string
          created_at?: string
          deposit_amount?: number
          description_el?: string | null
          description_en?: string | null
          id?: string
          images?: string[]
          is_active?: boolean
          is_popular?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name_el?: string | null
          name_en?: string
          price_tier1?: number
          price_tier2?: number
          price_tier3?: number
          price_tier4?: number
          quantity_total?: number
          slug?: string
          specifications?: Json
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "equipment_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_availability: {
        Row: {
          booking_id: string | null
          created_at: string
          date: string
          equipment_id: string
          id: string
          quantity_booked: number
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          date: string
          equipment_id: string
          id?: string
          quantity_booked?: number
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          date?: string
          equipment_id?: string
          id?: string
          quantity_booked?: number
        }
        Relationships: [
          {
            foreignKeyName: "equipment_availability_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_availability_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_categories: {
        Row: {
          created_at: string
          description_el: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name_el: string | null
          name_en: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_el?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_el?: string | null
          name_en: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_el?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_el?: string | null
          name_en?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          preferred_language: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_language?: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          id: string
          is_published: boolean
          rating: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          rating: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          rating?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value?: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      admin_dashboard_stats: {
        Row: {
          active_rentals: number | null
          pending_requests: number | null
          todays_deliveries: number | null
          todays_revenue: number | null
          upcoming_pickups: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_booking: {
        Args: {
          p_availability: Json
          p_booking_number: string
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_delivery_address: string
          p_delivery_fee: number
          p_delivery_notes: string
          p_delivery_time_slot: string
          p_delivery_zone_id: string
          p_items: Json
          p_num_days: number
          p_rental_end: string
          p_rental_start: string
          p_subtotal: number
          p_total_amount: number
          p_user_id: string
        }
        Returns: {
          booking_id: string
          booking_number: string
        }[]
      }
      get_booking_by_number: {
        Args: { p_booking_number: string }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
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
