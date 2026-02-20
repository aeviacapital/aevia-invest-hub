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
      audit_logs: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          description: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          target_id: string | null
          target_table: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          target_id?: string | null
          target_table?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          target_id?: string | null
          target_table?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      copy_trading: {
        Row: {
          copy_amount: number
          created_at: string | null
          id: string
          is_active: boolean | null
          total_profit: number | null
          trader_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          copy_amount: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          total_profit?: number | null
          trader_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          copy_amount?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          total_profit?: number | null
          trader_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "copy_trading_trader_id_fkey"
            columns: ["trader_id"]
            isOneToOne: false
            referencedRelation: "trader_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deposits: {
        Row: {
          amount: number
          confirmed_at: string | null
          created_at: string | null
          currency: string
          id: string
          status: string | null
          transaction_hash: string | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          created_at?: string | null
          currency: string
          id?: string
          status?: string | null
          transaction_hash?: string | null
          user_id: string
          wallet_address: string
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          created_at?: string | null
          currency?: string
          id?: string
          status?: string | null
          transaction_hash?: string | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      email_history: {
        Row: {
          admin_id: string | null
          body: string
          id: string
          recipient_email: string
          sent_at: string | null
          subject: string
          template: string
        }
        Insert: {
          admin_id?: string | null
          body: string
          id?: string
          recipient_email: string
          sent_at?: string | null
          subject: string
          template: string
        }
        Update: {
          admin_id?: string | null
          body?: string
          id?: string
          recipient_email?: string
          sent_at?: string | null
          subject?: string
          template?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_history_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      email_otps: {
        Row: {
          consumed: boolean | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          otp_hash: string
          purpose: string
          user_id: string | null
        }
        Insert: {
          consumed?: boolean | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          otp_hash: string
          purpose: string
          user_id?: string | null
        }
        Update: {
          consumed?: boolean | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          otp_hash?: string
          purpose?: string
          user_id?: string | null
        }
        Relationships: []
      }
      investment_plans: {
        Row: {
          created_at: string | null
          description: string
          duration_days: number
          expected_return_max: number
          expected_return_min: number
          features: string[]
          id: string
          investment_type: string
          is_active: boolean | null
          min_deposit: number
          risk_level: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          duration_days: number
          expected_return_max: number
          expected_return_min: number
          features: string[]
          id?: string
          investment_type: string
          is_active?: boolean | null
          min_deposit: number
          risk_level: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          duration_days?: number
          expected_return_max?: number
          expected_return_min?: number
          features?: string[]
          id?: string
          investment_type?: string
          is_active?: boolean | null
          min_deposit?: number
          risk_level?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invitation_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_used: boolean | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      kyc_documents: {
        Row: {
          created_at: string | null
          document_type: string
          document_url: string
          file_path: string | null
          id: string
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_type: string
          document_url: string
          file_path?: string | null
          id?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_type?: string
          document_url?: string
          file_path?: string | null
          id?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      loans: {
        Row: {
          approved_at: string | null
          collateral: string | null
          created_at: string | null
          credit_requirements: string | null
          default_terms: string | null
          disbursement_details: string | null
          due_date: string | null
          fees_charges: number | null
          id: string
          interest_rate: number
          loan_agreement: string | null
          loan_term_days: number
          loan_type: string
          principal_amount: number
          repayment_schedule: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          collateral?: string | null
          created_at?: string | null
          credit_requirements?: string | null
          default_terms?: string | null
          disbursement_details?: string | null
          due_date?: string | null
          fees_charges?: number | null
          id?: string
          interest_rate: number
          loan_agreement?: string | null
          loan_term_days: number
          loan_type: string
          principal_amount: number
          repayment_schedule: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          collateral?: string | null
          created_at?: string | null
          credit_requirements?: string | null
          default_terms?: string | null
          disbursement_details?: string | null
          due_date?: string | null
          fees_charges?: number | null
          id?: string
          interest_rate?: number
          loan_agreement?: string | null
          loan_term_days?: number
          loan_type?: string
          principal_amount?: number
          repayment_schedule?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_link: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          sent_by: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_link?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          sent_by?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_link?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          sent_by?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          otp_code: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          otp_code: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          otp_code?: string
        }
        Relationships: []
      }
      password_resets: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: number
          token_hash: string
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: number
          token_hash: string
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: number
          token_hash?: string
          used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "password_resets_email_fkey"
            columns: ["email"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["email"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          full_name: string | null
          id: string
          invitation_code: string | null
          is_verified: boolean | null
          kyc_status: string | null
          last_bonus_date: string | null
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          balance?: number | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          id?: string
          invitation_code?: string | null
          is_verified?: boolean | null
          kyc_status?: string | null
          last_bonus_date?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          balance?: number | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          id?: string
          invitation_code?: string | null
          is_verified?: boolean | null
          kyc_status?: string | null
          last_bonus_date?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_earned: number | null
          created_at: string | null
          first_investment_made: boolean | null
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          bonus_earned?: number | null
          created_at?: string | null
          first_investment_made?: boolean | null
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          bonus_earned?: number | null
          created_at?: string | null
          first_investment_made?: boolean | null
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      trader_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          followers_count: number | null
          id: string
          is_active: boolean | null
          max_copy_amount: number | null
          min_copy_amount: number | null
          roi_percentage: number | null
          total_trades: number | null
          updated_at: string | null
          username: string
          winning_trades: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          followers_count?: number | null
          id?: string
          is_active?: boolean | null
          max_copy_amount?: number | null
          min_copy_amount?: number | null
          roi_percentage?: number | null
          total_trades?: number | null
          updated_at?: string | null
          username: string
          winning_trades?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          followers_count?: number | null
          id?: string
          is_active?: boolean | null
          max_copy_amount?: number | null
          min_copy_amount?: number | null
          roi_percentage?: number | null
          total_trades?: number | null
          updated_at?: string | null
          username?: string
          winning_trades?: number | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          closed_at: string | null
          created_at: string | null
          current_price: number | null
          entry_price: number
          exit_price: number | null
          id: string
          is_copy_trade: boolean | null
          leverage: number | null
          lot_size: number
          margin: number | null
          margin_used: number | null
          market_type: string
          order_type: string | null
          profit_loss: number | null
          status: string | null
          stop_loss: number | null
          symbol: string
          take_profit: number | null
          trade_type: string
          trader_id: string | null
          unrealized_pnl: number | null
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          current_price?: number | null
          entry_price: number
          exit_price?: number | null
          id?: string
          is_copy_trade?: boolean | null
          leverage?: number | null
          lot_size: number
          margin?: number | null
          margin_used?: number | null
          market_type: string
          order_type?: string | null
          profit_loss?: number | null
          status?: string | null
          stop_loss?: number | null
          symbol: string
          take_profit?: number | null
          trade_type: string
          trader_id?: string | null
          unrealized_pnl?: number | null
          user_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          current_price?: number | null
          entry_price?: number
          exit_price?: number | null
          id?: string
          is_copy_trade?: boolean | null
          leverage?: number | null
          lot_size?: number
          margin?: number | null
          margin_used?: number | null
          market_type?: string
          order_type?: string | null
          profit_loss?: number | null
          status?: string | null
          stop_loss?: number | null
          symbol?: string
          take_profit?: number | null
          trade_type?: string
          trader_id?: string | null
          unrealized_pnl?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_trader_id_fkey"
            columns: ["trader_id"]
            isOneToOne: false
            referencedRelation: "trader_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number | null
          created_at: string
          id: string
          metadata: Json | null
          reference: string | null
          status: string
          type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          reference?: string | null
          status?: string
          type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          reference?: string | null
          status?: string
          type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_investments: {
        Row: {
          amount: number
          created_at: string | null
          end_date: string | null
          id: string
          is_visible: boolean
          plan_id: string
          returns_earned: number | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_visible?: boolean
          plan_id: string
          returns_earned?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_visible?: boolean
          plan_id?: string
          returns_earned?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "investment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          is_bonus_eligible: boolean | null
          is_linked: boolean | null
          last_bonus_date: string | null
          linked_at: string | null
          status: string | null
          updated_at: string
          user_id: string
          wallet_address: string | null
          wallet_keyphrase: string | null
          wallet_type: string | null
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          is_bonus_eligible?: boolean | null
          is_linked?: boolean | null
          last_bonus_date?: string | null
          linked_at?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          wallet_address?: string | null
          wallet_keyphrase?: string | null
          wallet_type?: string | null
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          is_bonus_eligible?: boolean | null
          is_linked?: boolean | null
          last_bonus_date?: string | null
          linked_at?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
          wallet_keyphrase?: string | null
          wallet_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          admin_notes: string | null
          amount: number
          approved_at: string | null
          created_at: string | null
          currency: string
          id: string
          processed_at: string | null
          rejected_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          approved_at?: string | null
          created_at?: string | null
          currency: string
          id?: string
          processed_at?: string | null
          rejected_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          approved_at?: string | null
          created_at?: string | null
          currency?: string
          id?: string
          processed_at?: string | null
          rejected_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_pending_trade: {
        Args: { p_current_price: number; p_trade_id: string }
        Returns: undefined
      }
      add_to_trade: {
        Args: {
          p_additional_lot: number
          p_current_price: number
          p_trade_id: string
          p_user_id: string
        }
        Returns: Json
      }
      admin_adjust_balance: {
        Args: {
          p_amount: number
          p_metadata?: Json
          p_reason: string
          p_reference?: string
          p_user_id: string
        }
        Returns: {
          new_balance: number
          tx_id: string
        }[]
      }
      close_trade: {
        Args: { p_exit_price: number; p_trade_id: string }
        Returns: undefined
      }
      create_transaction_atomic: {
        Args: {
          p_amount: number
          p_metadata?: Json
          p_reference?: string
          p_type: string
          p_user_id: string
          p_wallet_id: string
        }
        Returns: {
          new_balance: number
          tx_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      open_trade: {
        Args: {
          p_entry_price: number
          p_leverage: number
          p_lot_size: number
          p_market_type: string
          p_order_type: string
          p_stop_loss: number
          p_symbol: string
          p_take_profit: number
          p_trade_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      settle_matured_investments: { Args: never; Returns: undefined }
      update_trade_price: {
        Args: { new_current_price: number; trade_id: string }
        Returns: undefined
      }
      update_wallet_balance: {
        Args: { p_new_balance: number; p_user_id: string }
        Returns: undefined
      }
      update_wallet_pnl: { Args: { p_user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
