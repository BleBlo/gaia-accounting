export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'owner' | 'employee'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'owner' | 'employee'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'owner' | 'employee'
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name_en: string
          name_tr: string | null
          default_price: number
          min_price: number | null
          max_price: number | null
          is_variable_price: boolean
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name_en: string
          name_tr?: string | null
          default_price: number
          min_price?: number | null
          max_price?: number | null
          is_variable_price?: boolean
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name_en?: string
          name_tr?: string | null
          default_price?: number
          min_price?: number | null
          max_price?: number | null
          is_variable_price?: boolean
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          customer_type: 'individual' | 'brand' | 'company'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          email?: string | null
          customer_type?: 'individual' | 'brand' | 'company'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          email?: string | null
          customer_type?: 'individual' | 'brand' | 'company'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          sale_date: string
          customer_id: string | null
          service_id: string | null
          custom_description: string | null
          quantity: number
          unit_price: number
          subtotal: number
          vat_amount: number
          total_amount: number
          payment_method: 'cash' | 'bank_transfer' | 'card'
          payment_status: 'paid' | 'partial' | 'pending'
          deposit_amount: number
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          synced_at: string | null
        }
        Insert: {
          id?: string
          sale_date?: string
          customer_id?: string | null
          service_id?: string | null
          custom_description?: string | null
          quantity?: number
          unit_price: number
          subtotal: number
          vat_amount: number
          total_amount: number
          payment_method: 'cash' | 'bank_transfer' | 'card'
          payment_status?: 'paid' | 'partial' | 'pending'
          deposit_amount?: number
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
        }
        Update: {
          id?: string
          sale_date?: string
          customer_id?: string | null
          service_id?: string | null
          custom_description?: string | null
          quantity?: number
          unit_price?: number
          subtotal?: number
          vat_amount?: number
          total_amount?: number
          payment_method?: 'cash' | 'bank_transfer' | 'card'
          payment_status?: 'paid' | 'partial' | 'pending'
          deposit_amount?: number
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
        }
      }
      expense_categories: {
        Row: {
          id: string
          name_en: string
          name_tr: string | null
          icon: string | null
          is_active: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          name_en: string
          name_tr?: string | null
          icon?: string | null
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          id?: string
          name_en?: string
          name_tr?: string | null
          icon?: string | null
          is_active?: boolean
          sort_order?: number
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          contact_info: string | null
          category: string | null
          notes: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          email?: string | null
          contact_info?: string | null
          category?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          email?: string | null
          contact_info?: string | null
          category?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          expense_date: string
          category_id: string | null
          supplier_id: string | null
          description: string | null
          amount: number
          vat_amount: number
          total_amount: number
          payment_method: 'cash' | 'bank_transfer' | 'card'
          reference_number: string | null
          receipt_url: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          synced_at: string | null
        }
        Insert: {
          id?: string
          expense_date?: string
          category_id?: string | null
          supplier_id?: string | null
          description?: string | null
          amount: number
          vat_amount?: number
          total_amount?: number
          payment_method: 'cash' | 'bank_transfer' | 'card'
          reference_number?: string | null
          receipt_url?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          synced_at?: string | null
        }
        Update: {
          id?: string
          expense_date?: string
          category_id?: string | null
          supplier_id?: string | null
          description?: string | null
          amount?: number
          vat_amount?: number
          total_amount?: number
          payment_method?: 'cash' | 'bank_transfer' | 'card'
          reference_number?: string | null
          receipt_url?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          synced_at?: string | null
        }
      }
      employees: {
        Row: {
          id: string
          name: string
          name_ar: string | null
          job_title: string
          salary_amount: number
          salary_currency: string
          salary_day: number
          phone: string | null
          visa_expiry_date: string | null
          emirates_id: string | null
          start_date: string | null
          is_active: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          name_ar?: string | null
          job_title: string
          salary_amount: number
          salary_currency?: string
          salary_day?: number
          phone?: string | null
          visa_expiry_date?: string | null
          emirates_id?: string | null
          start_date?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_ar?: string | null
          job_title?: string
          salary_amount?: number
          salary_currency?: string
          salary_day?: number
          phone?: string | null
          visa_expiry_date?: string | null
          emirates_id?: string | null
          start_date?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      salary_payments: {
        Row: {
          id: string
          employee_id: string
          payment_date: string
          period_month: number
          period_year: number
          base_salary: number
          deductions: number
          advances: number
          net_amount: number
          payment_method: 'cash' | 'bank_transfer'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          payment_date: string
          period_month: number
          period_year: number
          base_salary: number
          deductions?: number
          advances?: number
          net_amount: number
          payment_method?: 'cash' | 'bank_transfer'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          payment_date?: string
          period_month?: number
          period_year?: number
          base_salary?: number
          deductions?: number
          advances?: number
          net_amount?: number
          payment_method?: 'cash' | 'bank_transfer'
          notes?: string | null
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          updated_at?: string
        }
      }
      sync_queue: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: 'insert' | 'update' | 'delete'
          data: Json
          created_at: string
          synced_at: string | null
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: 'insert' | 'update' | 'delete'
          data: Json
          created_at?: string
          synced_at?: string | null
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: 'insert' | 'update' | 'delete'
          data?: Json
          created_at?: string
          synced_at?: string | null
        }
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
  }
}

// Helper types for easier access
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Sale = Database['public']['Tables']['sales']['Row']
export type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row']
export type Supplier = Database['public']['Tables']['suppliers']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type Employee = Database['public']['Tables']['employees']['Row']
export type SalaryPayment = Database['public']['Tables']['salary_payments']['Row']
export type Settings = Database['public']['Tables']['settings']['Row']

// Insert types
export type ServiceInsert = Database['public']['Tables']['services']['Insert']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type SaleInsert = Database['public']['Tables']['sales']['Insert']
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
export type SupplierInsert = Database['public']['Tables']['suppliers']['Insert']
export type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
export type SalaryPaymentInsert = Database['public']['Tables']['salary_payments']['Insert']

// Extended types with relations
export type SaleWithRelations = Sale & {
  customer?: Customer | null
  service?: Service | null
}

export type ExpenseWithRelations = Expense & {
  category?: ExpenseCategory | null
  supplier?: Supplier | null
}

export type EmployeeWithPayments = Employee & {
  salary_payments?: SalaryPayment[]
}
