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
      campanhas: {
        Row: {
          conversoes: number | null
          custo_por_conversao: number | null
          data: string | null
          facebook_account_id: string | null
          facebook_budget: string | null
          facebook_objective: string | null
          facebook_status: string | null
          id: string
          investimento: number | null
          nome_campanha: string
          pixel_id: string
        }
        Insert: {
          conversoes?: number | null
          custo_por_conversao?: number | null
          data?: string | null
          facebook_account_id?: string | null
          facebook_budget?: string | null
          facebook_objective?: string | null
          facebook_status?: string | null
          id?: string
          investimento?: number | null
          nome_campanha: string
          pixel_id: string
        }
        Update: {
          conversoes?: number | null
          custo_por_conversao?: number | null
          data?: string | null
          facebook_account_id?: string | null
          facebook_budget?: string | null
          facebook_objective?: string | null
          facebook_status?: string | null
          id?: string
          investimento?: number | null
          nome_campanha?: string
          pixel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campanhas_pixel_id_fkey"
            columns: ["pixel_id"]
            isOneToOne: false
            referencedRelation: "pixels"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_auth_states: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          state: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          state: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      facebook_integrations: {
        Row: {
          access_token: string
          ad_accounts: Json | null
          connected_at: string | null
          facebook_user_email: string | null
          facebook_user_id: string
          facebook_user_name: string | null
          id: string
          is_active: boolean | null
          token_expires_in: number | null
          user_id: string
        }
        Insert: {
          access_token: string
          ad_accounts?: Json | null
          connected_at?: string | null
          facebook_user_email?: string | null
          facebook_user_id: string
          facebook_user_name?: string | null
          id?: string
          is_active?: boolean | null
          token_expires_in?: number | null
          user_id: string
        }
        Update: {
          access_token?: string
          ad_accounts?: Json | null
          connected_at?: string | null
          facebook_user_email?: string | null
          facebook_user_id?: string
          facebook_user_name?: string | null
          id?: string
          is_active?: boolean | null
          token_expires_in?: number | null
          user_id?: string
        }
        Relationships: []
      }
      pixels: {
        Row: {
          criado_em: string | null
          eventos_capturados: Json | null
          facebook_account_id: string | null
          facebook_creation_time: string | null
          facebook_last_fired_time: string | null
          id: string
          nome_pixel: string
          plataforma: string
          source: string | null
          status: string
          user_id: string
        }
        Insert: {
          criado_em?: string | null
          eventos_capturados?: Json | null
          facebook_account_id?: string | null
          facebook_creation_time?: string | null
          facebook_last_fired_time?: string | null
          id?: string
          nome_pixel: string
          plataforma: string
          source?: string | null
          status: string
          user_id: string
        }
        Update: {
          criado_em?: string | null
          eventos_capturados?: Json | null
          facebook_account_id?: string | null
          facebook_creation_time?: string | null
          facebook_last_fired_time?: string | null
          id?: string
          nome_pixel?: string
          plataforma?: string
          source?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
