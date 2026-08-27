export type Roll = 'ordforande'
export type ProjektStatus = 'pagaende' | 'klar' | 'godkand' | 'underkand'
export type StegStatus = 'ej_paborjad' | 'klar' | 'godkand' | 'underkand'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; roll: Roll; namn: string; email: string; skapad_tid: string }
        Insert: { id: string; roll: Roll; namn: string; email: string }
        Update: { roll?: Roll; namn?: string }
      }
      mallar: {
        Row: { id: string; namn: string; beskrivning: string | null; skapad_tid: string }
        Insert: { namn: string; beskrivning?: string }
        Update: { namn?: string; beskrivning?: string }
      }
      mall_steg: {
        Row: { id: string; mall_id: string; ordning: number; rubrik: string; instruktion: string; skapad_tid: string }
        Insert: { mall_id: string; ordning: number; rubrik: string; instruktion: string }
        Update: { ordning?: number; rubrik?: string; instruktion?: string }
      }
      projekt: {
        Row: { id: string; mall_id: string; brf_adress: string; status: ProjektStatus; skapad_av: string; skapad_tid: string }
        Insert: { mall_id: string; brf_adress: string; skapad_av: string; status?: ProjektStatus }
        Update: { status?: ProjektStatus; brf_adress?: string }
      }
      projekt_steg: {
        Row: { id: string; projekt_id: string; mall_steg_id: string; bild_url: string | null; signerad_av: string | null; signerad_tid: string | null; status: StegStatus; kommentar: string | null; uppdaterad_tid: string }
        Insert: { projekt_id: string; mall_steg_id: string }
        Update: { bild_url?: string; signerad_av?: string; signerad_tid?: string; status?: StegStatus; kommentar?: string; uppdaterad_tid?: string }
      }
      pdf_dokument: {
        Row: { id: string; projekt_id: string; fil_url: string; skapad_tid: string }
        Insert: { projekt_id: string; fil_url: string }
        Update: never
      }
    }
  }
}
