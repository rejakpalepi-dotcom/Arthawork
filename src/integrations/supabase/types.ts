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
      business_settings: {
        Row: {
          accent_color: string | null
          account_name: string | null
          account_number: string | null
          address: string | null
          bank_name: string | null
          business_name: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          payment_notes: string | null
          phone: string | null
          primary_color: string | null
          routing_number: string | null
          stripe_connected: boolean | null
          tagline: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          accent_color?: string | null
          account_name?: string | null
          account_number?: string | null
          address?: string | null
          bank_name?: string | null
          business_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          payment_notes?: string | null
          phone?: string | null
          primary_color?: string | null
          routing_number?: string | null
          stripe_connected?: boolean | null
          tagline?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          accent_color?: string | null
          account_name?: string | null
          account_number?: string | null
          address?: string | null
          bank_name?: string | null
          business_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          payment_notes?: string | null
          phone?: string | null
          primary_color?: string | null
          routing_number?: string | null
          stripe_connected?: boolean | null
          tagline?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          service_id: string | null
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          service_id?: string | null
          total?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          service_id?: string | null
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string | null
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          payment_token: string | null
          status: string
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          payment_token?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          payment_token?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          has_completed_onboarding: boolean
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          has_completed_onboarding?: boolean
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          has_completed_onboarding?: boolean
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          status: string
          title: string
          total: number
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title: string
          total?: number
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title?: string
          total?: number
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          unit: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price?: number
          unit?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean
          task_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean
          task_text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean
          task_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_business_payment_info_by_token: {
        Args: { p_token: string }
        Returns: {
          account_name: string
          account_number: string
          bank_name: string
          payment_notes: string
        }[]
      }
      get_guest_invoice_by_token: {
        Args: { p_token: string }
        Returns: {
          client_company: string
          client_name: string
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          total: number
        }[]
      }
      get_guest_invoice_items: {
        Args: { p_invoice_id: string; p_token: string }
        Returns: {
          description: string
          id: string
          quantity: number
          total: number
          unit_price: number
        }[]
      }
      get_public_invoice_by_token: {
        Args: { token: string }
        Returns: {
          due_date: string
          invoice_number: string
          issue_date: string
          status: string
          total: number
        }[]
      }
      invoice_has_payment_token: {
        Args: { invoice_uuid: string }
        Returns: boolean
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
