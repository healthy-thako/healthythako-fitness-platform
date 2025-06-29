export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: string | null
          id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: string | null
          id?: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: string | null
          id?: string
        }
        Relationships: []
      }
      auth_logs: {
        Row: {
          action: string
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone_number: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
          user_type: string | null
          anonymized: boolean | null
          anonymized_at: string | null
          data_retention_expires_at: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          phone_number?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_type?: string | null
          anonymized?: boolean | null
          anonymized_at?: string | null
          data_retention_expires_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone_number?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_type?: string | null
          anonymized?: boolean | null
          anonymized_at?: string | null
          data_retention_expires_at?: string | null
        }
        Relationships: []
      }
      trainers: {
        Row: {
          id: string
          user_id: string | null
          gym_id: string | null
          name: string
          image_url: string | null
          specialty: string | null
          experience: string | null
          rating: number | null
          reviews: number | null
          description: string | null
          certifications: string[] | null
          specialties: string[] | null
          availability: Json | null
          contact_phone: string | null
          contact_email: string | null
          location: string | null
          pricing: Json | null
          created_at: string | null
          updated_at: string | null
          status: string | null
          total_earnings: number | null
          average_rating: number | null
          total_reviews: number | null
          monthly_bookings: number | null
          client_count: number | null
          commission_rate: number | null
          bio: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          gym_id?: string | null
          name: string
          image_url?: string | null
          specialty?: string | null
          experience?: string | null
          rating?: number | null
          reviews?: number | null
          description?: string | null
          certifications?: string[] | null
          specialties?: string[] | null
          availability?: Json | null
          contact_phone?: string | null
          contact_email?: string | null
          location?: string | null
          pricing?: Json | null
          created_at?: string | null
          updated_at?: string | null
          status?: string | null
          total_earnings?: number | null
          average_rating?: number | null
          total_reviews?: number | null
          monthly_bookings?: number | null
          client_count?: number | null
          commission_rate?: number | null
          bio?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          gym_id?: string | null
          name?: string
          image_url?: string | null
          specialty?: string | null
          experience?: string | null
          rating?: number | null
          reviews?: number | null
          description?: string | null
          certifications?: string[] | null
          specialties?: string[] | null
          availability?: Json | null
          contact_phone?: string | null
          contact_email?: string | null
          location?: string | null
          pricing?: Json | null
          created_at?: string | null
          updated_at?: string | null
          status?: string | null
          total_earnings?: number | null
          average_rating?: number | null
          total_reviews?: number | null
          monthly_bookings?: number | null
          client_count?: number | null
          commission_rate?: number | null
          bio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainers_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          }
        ]
      }
      trainer_bookings: {
        Row: {
          id: string
          user_id: string
          trainer_id: string
          session_date: string
          session_time: string
          duration_minutes: number
          total_amount: number
          status: string | null
          payment_status: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
          session_type: string | null
          rating: number | null
          client_feedback: string | null
          trainer_notes: string | null
          reminder_sent: boolean | null
          no_show: boolean | null
          payment_method: string | null
          payment_transaction_id: string | null
          trainer_user_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          trainer_id: string
          session_date: string
          session_time: string
          duration_minutes?: number
          total_amount: number
          status?: string | null
          payment_status?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          session_type?: string | null
          rating?: number | null
          client_feedback?: string | null
          trainer_notes?: string | null
          reminder_sent?: boolean | null
          no_show?: boolean | null
          payment_method?: string | null
          payment_transaction_id?: string | null
          trainer_user_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          trainer_id?: string
          session_date?: string
          session_time?: string
          duration_minutes?: number
          total_amount?: number
          status?: string | null
          payment_status?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          session_type?: string | null
          rating?: number | null
          client_feedback?: string | null
          trainer_notes?: string | null
          reminder_sent?: boolean | null
          no_show?: boolean | null
          payment_method?: string | null
          payment_transaction_id?: string | null
          trainer_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_bookings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          }
        ]
      }
      gyms: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string
          location_lat: number | null
          location_lng: number | null
          phone: string | null
          email: string | null
          website: string | null
          rating: number | null
          is_gym_pass_enabled: boolean | null
          created_at: string | null
          updated_at: string | null
          owner_id: string | null
          ht_verified: boolean | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address: string
          location_lat?: number | null
          location_lng?: number | null
          phone?: string | null
          email?: string | null
          website?: string | null
          rating?: number | null
          is_gym_pass_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          owner_id?: string | null
          ht_verified?: boolean | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string
          location_lat?: number | null
          location_lng?: number | null
          phone?: string | null
          email?: string | null
          website?: string | null
          rating?: number | null
          is_gym_pass_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          owner_id?: string | null
          ht_verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "gyms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_memberships: {
        Row: {
          id: string
          user_id: string | null
          gym_id: string | null
          plan_id: string | null
          start_date: string
          end_date: string
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          gym_id?: string | null
          plan_id?: string | null
          start_date: string
          end_date: string
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          gym_id?: string | null
          plan_id?: string | null
          start_date?: string
          end_date?: string
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_memberships_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          }
        ]
      }
      membership_plans: {
        Row: {
          id: string
          gym_id: string | null
          name: string
          description: string | null
          price: number
          duration_days: number
          features: Json | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          gym_id?: string | null
          name: string
          description?: string | null
          price: number
          duration_days: number
          features?: Json | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          gym_id?: string | null
          name?: string
          description?: string | null
          price?: number
          duration_days?: number
          features?: Json | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_plans_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_conversations: {
        Row: {
          id: string
          user_id: string
          trainer_id: string
          booking_id: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
          last_message_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          trainer_id: string
          booking_id?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_message_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          trainer_id?: string
          booking_id?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_message_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "trainer_bookings"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          sender_type: string
          message_text: string
          message_type: string | null
          attachment_url: string | null
          read_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          sender_type: string
          message_text: string
          message_type?: string | null
          attachment_url?: string | null
          read_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          sender_type?: string
          message_text?: string
          message_type?: string | null
          attachment_url?: string | null
          read_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Functions: {
      search_trainers: {
        Args: {
          search_query?: string
          specialty_filter?: string
          gym_id_filter?: string
          min_rating?: number
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          name: string
          image_url: string
          specialty: string
          experience: string
          rating: number
          reviews: number
          description: string
          certifications: string[]
          specialties: string[]
          contact_phone: string
          contact_email: string
          location: string
          pricing: Json
          gym_name: string
          gym_address: string
        }[]
      }
      search_gyms: {
        Args: {
          search_query?: string
          min_rating?: number
          has_gym_pass?: boolean
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          name: string
          description: string
          address: string
          location_lat: number
          location_lng: number
          phone: string
          email: string
          website: string
          rating: number
          is_gym_pass_enabled: boolean
          ht_verified: boolean
          primary_image: string
          amenities: Json
          membership_plans: Json
        }[]
      }
      book_trainer_session: {
        Args: {
          p_user_id: string
          p_trainer_id: string
          p_session_date: string
          p_session_time: string
          p_duration_minutes: number
          p_total_amount: number
        }
        Returns: Json
      }
      get_user_trainer_bookings: {
        Args: {
          p_user_id: string
          p_status?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          booking_id: string
          trainer_id: string
          trainer_name: string
          trainer_image_url: string
          session_date: string
          session_time: string
          duration_minutes: number
          total_amount: number
          status: string
          payment_status: string
          has_chat_access: boolean
          conversation_id: string
          created_at: string
        }[]
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
