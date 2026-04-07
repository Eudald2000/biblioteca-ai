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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      carrito: {
        Row: {
          cantidad: number
          creado_en: string
          id: string
          libro_id: string
          tipo: Database["public"]["Enums"]["tipo_item_carrito"]
          usuario_id: string
        }
        Insert: {
          cantidad?: number
          creado_en?: string
          id?: string
          libro_id: string
          tipo: Database["public"]["Enums"]["tipo_item_carrito"]
          usuario_id: string
        }
        Update: {
          cantidad?: number
          creado_en?: string
          id?: string
          libro_id?: string
          tipo?: Database["public"]["Enums"]["tipo_item_carrito"]
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carrito_libro_id_fkey"
            columns: ["libro_id"]
            isOneToOne: false
            referencedRelation: "libros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrito_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          actualizado_en: string
          creado_en: string
          descripcion: string | null
          id: string
          nombre: string
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          descripcion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          descripcion?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      compras: {
        Row: {
          creado_en: string
          id: string
          libro_id: string
          precio_compra: number
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          id?: string
          libro_id: string
          precio_compra: number
          usuario_id: string
        }
        Update: {
          creado_en?: string
          id?: string
          libro_id?: string
          precio_compra?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compras_libro_id_fkey"
            columns: ["libro_id"]
            isOneToOne: false
            referencedRelation: "libros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      editoriales: {
        Row: {
          actualizado_en: string
          creado_en: string
          id: string
          logo_url: string | null
          nombre: string
          pais: string | null
          sitio_web: string | null
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          id?: string
          logo_url?: string | null
          nombre: string
          pais?: string | null
          sitio_web?: string | null
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          id?: string
          logo_url?: string | null
          nombre?: string
          pais?: string | null
          sitio_web?: string | null
        }
        Relationships: []
      }
      libros: {
        Row: {
          actualizado_en: string
          autor: string
          creado_en: string
          descripcion: string | null
          editorial_id: string
          eliminado_en: string | null
          id: string
          isbn: string | null
          portada_url: string | null
          precio_compra: number
          precio_prestamo: number
          stock: number
          titulo: string
          visible: boolean
        }
        Insert: {
          actualizado_en?: string
          autor: string
          creado_en?: string
          descripcion?: string | null
          editorial_id: string
          eliminado_en?: string | null
          id?: string
          isbn?: string | null
          portada_url?: string | null
          precio_compra?: number
          precio_prestamo?: number
          stock?: number
          titulo: string
          visible?: boolean
        }
        Update: {
          actualizado_en?: string
          autor?: string
          creado_en?: string
          descripcion?: string | null
          editorial_id?: string
          eliminado_en?: string | null
          id?: string
          isbn?: string | null
          portada_url?: string | null
          precio_compra?: number
          precio_prestamo?: number
          stock?: number
          titulo?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "libros_editorial_id_fkey"
            columns: ["editorial_id"]
            isOneToOne: false
            referencedRelation: "editoriales"
            referencedColumns: ["id"]
          },
        ]
      }
      libros_categorias: {
        Row: {
          categoria_id: string
          libro_id: string
        }
        Insert: {
          categoria_id: string
          libro_id: string
        }
        Update: {
          categoria_id?: string
          libro_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "libros_categorias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "libros_categorias_libro_id_fkey"
            columns: ["libro_id"]
            isOneToOne: false
            referencedRelation: "libros"
            referencedColumns: ["id"]
          },
        ]
      }
      prestamos: {
        Row: {
          creado_en: string
          estado: Database["public"]["Enums"]["estado_prestamo"]
          fecha_devolucion: string | null
          fecha_prestamo: string
          fecha_vencimiento: string
          id: string
          libro_id: string
          precio_prestamo: number
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          estado?: Database["public"]["Enums"]["estado_prestamo"]
          fecha_devolucion?: string | null
          fecha_prestamo?: string
          fecha_vencimiento?: string
          id?: string
          libro_id: string
          precio_prestamo?: number
          usuario_id: string
        }
        Update: {
          creado_en?: string
          estado?: Database["public"]["Enums"]["estado_prestamo"]
          fecha_devolucion?: string | null
          fecha_prestamo?: string
          fecha_vencimiento?: string
          id?: string
          libro_id?: string
          precio_prestamo?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prestamos_libro_id_fkey"
            columns: ["libro_id"]
            isOneToOne: false
            referencedRelation: "libros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prestamos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          actualizado_en: string
          avatar_url: string | null
          baneado: boolean
          creado_en: string
          id: string
          nombre_completo: string | null
          rol: Database["public"]["Enums"]["rol_usuario"]
        }
        Insert: {
          actualizado_en?: string
          avatar_url?: string | null
          baneado?: boolean
          creado_en?: string
          id: string
          nombre_completo?: string | null
          rol?: Database["public"]["Enums"]["rol_usuario"]
        }
        Update: {
          actualizado_en?: string
          avatar_url?: string | null
          baneado?: boolean
          creado_en?: string
          id?: string
          nombre_completo?: string | null
          rol?: Database["public"]["Enums"]["rol_usuario"]
        }
        Relationships: []
      }
    }
    Views: {
      usuarios_con_email: {
        Row: {
          actualizado_en: string | null
          avatar_url: string | null
          baneado: boolean | null
          creado_en: string | null
          email: string | null
          id: string | null
          nombre_completo: string | null
          rol: Database["public"]["Enums"]["rol_usuario"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      detalle_usuario_admin: {
        Args: { p_usuario_id: string }
        Returns: {
          baneado: boolean
          creado_en: string
          email: string
          id: string
          nombre_completo: string
          rol: Database["public"]["Enums"]["rol_usuario"]
        }[]
      }
      es_admin: { Args: never; Returns: boolean }
      listar_usuarios_admin: {
        Args: {
          p_busqueda?: string
          p_limite?: number
          p_offset?: number
          p_rol?: string
        }
        Returns: {
          baneado: boolean
          creado_en: string
          email: string
          id: string
          nombre_completo: string
          rol: Database["public"]["Enums"]["rol_usuario"]
          total: number
        }[]
      }
      marcar_prestamos_vencidos: { Args: never; Returns: undefined }
      puede_ver_usuarios_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      estado_prestamo: "activo" | "devuelto" | "vencido"
      rol_usuario: "admin" | "usuario"
      tipo_item_carrito: "prestamo" | "compra"
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
      estado_prestamo: ["activo", "devuelto", "vencido"],
      rol_usuario: ["admin", "usuario"],
      tipo_item_carrito: ["prestamo", "compra"],
    },
  },
} as const
