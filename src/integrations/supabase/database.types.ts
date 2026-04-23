 
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
      appointments: {
        Row: {
          assigned_to: string | null
          cancellation_reason: string | null
          client_id: string
          company_id: string
          created_at: string | null
          created_by: string | null
          duration_minutes: number
          id: string
          notes: string | null
          reminder_sent_at: string | null
          scheduled_at: string
          service_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          cancellation_reason?: string | null
          client_id: string
          company_id: string
          created_at?: string | null
          created_by?: string | null
          duration_minutes: number
          id?: string
          notes?: string | null
          reminder_sent_at?: string | null
          scheduled_at: string
          service_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          cancellation_reason?: string | null
          client_id?: string
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          reminder_sent_at?: string | null
          scheduled_at?: string
          service_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "public_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      client_conditions: {
        Row: {
          client_id: string
          company_id: string
          condition_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          severity: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          company_id: string
          condition_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          severity?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          company_id?: string
          condition_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          severity?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_conditions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_conditions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_conditions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "public_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_conditions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          assigned_to: string | null
          auth_user_id: string | null
          avatar_url: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          custom_fields: Json | null
          deleted_at: string | null
          email: string | null
          id: string
          last_contact_at: string | null
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          assigned_to?: string | null
          auth_user_id?: string | null
          avatar_url?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          last_contact_at?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          assigned_to?: string | null
          auth_user_id?: string | null
          avatar_url?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          last_contact_at?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "public_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_notes: {
        Row: {
          appointment_id: string | null
          client_id: string
          company_id: string
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_private: boolean | null
          note_type: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          client_id: string
          company_id: string
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_private?: boolean | null
          note_type: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          client_id?: string
          company_id?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_private?: boolean | null
          note_type?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "public_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          country_code: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          logo_url: string | null
          metadata: Json | null
          name: string
          phone: string | null
          plan_id: string | null
          plan_status: string | null
          settings: Json | null
          slug: string
          status: string | null
          subscription_ends_at: string | null
          subscription_started_at: string | null
          suspended_at: string | null
          suspended_reason: string | null
          timezone: string | null
          trial_ends_at: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          country_code?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          metadata?: Json | null
          name: string
          phone?: string | null
          plan_id?: string | null
          plan_status?: string | null
          settings?: Json | null
          slug: string
          status?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          country_code?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          phone?: string | null
          plan_id?: string | null
          plan_status?: string | null
          settings?: Json | null
          slug?: string
          status?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      company_modules: {
        Row: {
          activated_at: string | null
          company_id: string | null
          config: Json | null
          created_at: string | null
          deactivated_at: string | null
          id: string
          is_active: boolean | null
          module_id: string | null
        }
        Insert: {
          activated_at?: string | null
          company_id?: string | null
          config?: Json | null
          created_at?: string | null
          deactivated_at?: string | null
          id?: string
          is_active?: boolean | null
          module_id?: string | null
        }
        Update: {
          activated_at?: string | null
          company_id?: string | null
          config?: Json | null
          created_at?: string | null
          deactivated_at?: string | null
          id?: string
          is_active?: boolean | null
          module_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_modules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_modules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "public_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      company_users: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          permissions: Json | null
          role: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          permissions?: Json | null
          role?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          permissions?: Json | null
          role?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "public_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          base_price: number | null
          config_schema: Json | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_core: boolean | null
          key: string
          name: string
        }
        Insert: {
          base_price?: number | null
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_core?: boolean | null
          key: string
          name: string
        }
        Update: {
          base_price?: number | null
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_core?: boolean | null
          key?: string
          name?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          client_id: string
          company_id: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          external_transaction_id: string | null
          id: string
          internal_notes: string | null
          paid_at: string | null
          payment_method: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          client_id: string
          company_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          external_transaction_id?: string | null
          id?: string
          internal_notes?: string | null
          paid_at?: string | null
          payment_method: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          client_id?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          external_transaction_id?: string | null
          id?: string
          internal_notes?: string | null
          paid_at?: string | null
          payment_method?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "public_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          limits: Json | null
          name: string
          price_monthly: number | null
          price_yearly: number | null
          slug: string
          sort_order: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          slug: string
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          slug?: string
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      schedules: {
        Row: {
          company_id: string
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          start_time: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "public_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          buffer_minutes: number | null
          color: string | null
          company_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          max_advance_days: number | null
          name: string
          price: number | null
          requires_approval: boolean | null
          updated_at: string | null
        }
        Insert: {
          buffer_minutes?: number | null
          color?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          max_advance_days?: number | null
          name: string
          price?: number | null
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Update: {
          buffer_minutes?: number | null
          color?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          max_advance_days?: number | null
          name?: string
          price?: number | null
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "public_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      superadmin_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          target_company_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_company_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_company_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "superadmin_actions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "superadmin_actions_target_company_id_fkey"
            columns: ["target_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "superadmin_actions_target_company_id_fkey"
            columns: ["target_company_id"]
            isOneToOne: false
            referencedRelation: "public_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "superadmin_actions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_superadmin: boolean | null
          last_login_at: string | null
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_superadmin?: boolean | null
          last_login_at?: string | null
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_superadmin?: boolean | null
          last_login_at?: string | null
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_companies: {
        Row: {
          branding: Json | null
          created_at: string | null
          description: Json | null
          id: string | null
          logo_url: string | null
          name: string | null
          slug: string | null
          website: string | null
        }
        Insert: {
          branding?: never
          created_at?: string | null
          description?: never
          id?: string | null
          logo_url?: string | null
          name?: string | null
          slug?: string | null
          website?: string | null
        }
        Update: {
          branding?: never
          created_at?: string | null
          description?: never
          id?: string | null
          logo_url?: string | null
          name?: string | null
          slug?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_slug_available: { Args: { p_slug: string }; Returns: boolean }
      company_allows_registration: {
        Args: { p_slug: string }
        Returns: boolean
      }
      generate_slug: { Args: { p_name: string }; Returns: string }
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
