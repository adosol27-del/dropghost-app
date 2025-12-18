export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          week_start_date: string;
          day_of_week: number;
          order_in_day: number;
          video_url: string;
          title: string;
          description: string;
          image_url: string;
          sales_summary: string;
          external_urls: ExternalUrl[];
          sales_angles: string[];
          facebook_ad_copies: string[];
          user_id: string;
          country: string;
          product_name: string;
          ranking_us: number | null;
          ranking_category: number | null;
          per_product: number | null;
          per_global: number | null;
          sales_yesterday: string;
          sales_7_days: string;
          total_sales: string;
          total_gmv: string;
          impressions: string;
          video_count: string;
          product_image_url: string;
          sales_image_url: string;
          store_link: string;
          publication_date: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          week_start_date: string;
          day_of_week: number;
          order_in_day?: number;
          video_url: string;
          title?: string;
          description?: string;
          image_url?: string;
          sales_summary?: string;
          external_urls?: ExternalUrl[];
          sales_angles?: string[];
          facebook_ad_copies?: string[];
          user_id: string;
          country?: string;
          product_name?: string;
          ranking_us?: number | null;
          ranking_category?: number | null;
          per_product?: number | null;
          per_global?: number | null;
          sales_yesterday?: string;
          sales_7_days?: string;
          total_sales?: string;
          total_gmv?: string;
          impressions?: string;
          video_count?: string;
          product_image_url?: string;
          sales_image_url?: string;
          store_link?: string;
          publication_date?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          week_start_date?: string;
          day_of_week?: number;
          order_in_day?: number;
          video_url?: string;
          title?: string;
          description?: string;
          image_url?: string;
          sales_summary?: string;
          external_urls?: ExternalUrl[];
          sales_angles?: string[];
          facebook_ad_copies?: string[];
          user_id?: string;
          country?: string;
          product_name?: string;
          ranking_us?: number | null;
          ranking_category?: number | null;
          per_product?: number | null;
          per_global?: number | null;
          sales_yesterday?: string;
          sales_7_days?: string;
          total_sales?: string;
          total_gmv?: string;
          impressions?: string;
          video_count?: string;
          product_image_url?: string;
          sales_image_url?: string;
          store_link?: string;
          publication_date?: string | null;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          subscription_type: 'daily' | 'monthly_offer' | 'monthly_standard';
          status: 'active' | 'expired' | 'cancelled';
          price: number;
          stripe_session_id: string | null;
          is_lifetime_offer: boolean;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_type: 'daily' | 'monthly_offer' | 'monthly_standard';
          status?: 'active' | 'expired' | 'cancelled';
          price: number;
          stripe_session_id?: string | null;
          is_lifetime_offer?: boolean;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_type?: 'daily' | 'monthly_offer' | 'monthly_standard';
          status?: 'active' | 'expired' | 'cancelled';
          price?: number;
          stripe_session_id?: string | null;
          is_lifetime_offer?: boolean;
          created_at?: string;
          expires_at?: string | null;
        };
      };
      subscription_stats: {
        Row: {
          id: string;
          lifetime_offer_count: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lifetime_offer_count?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lifetime_offer_count?: number;
          updated_at?: string;
        };
      };
    };
  };
}

export interface ExternalUrl {
  label: string;
  url: string;
}

export type Video = Database['public']['Tables']['videos']['Row'];
