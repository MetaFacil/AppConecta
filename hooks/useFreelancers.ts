import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

export function useFreelancers() {
  const [freelancers, setFreelancers] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFreelancers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('tipo', 'freelancer')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFreelancers(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('nome');

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadFreelancers(), loadCategories()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const searchFreelancers = async (query: string, categoryId?: string) => {
    try {
      let queryBuilder = supabase
        .from('profiles')
        .select('*')
        .eq('tipo', 'freelancer');

      if (query) {
        queryBuilder = queryBuilder.or(
          `nome.ilike.%${query}%,descricao.ilike.%${query}%`
        );
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) throw error;
      setFreelancers(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    freelancers,
    categories,
    loading,
    error,
    searchFreelancers,
    refreshFreelancers: loadFreelancers,
  };
}
