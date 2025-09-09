/*
          # [Operação de Restauração]
          Restaura a função e o gatilho `handle_new_user` para a sua versão final e correta.

          ## Query Description: [Esta operação substitui o gatilho de diagnóstico pela versão de produção. A função agora lê corretamente os metadados do usuário (nome, cidade, tipo) durante o cadastro e os insere na tabela `profiles`. Isso resolve o problema de cadastros silenciosamente falhos.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Afeta a função: `public.handle_new_user`
          - Afeta o gatilho: `on_auth_user_created` na tabela `auth.users`
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [No]
          - Auth Requirements: [Nenhum]
          
          ## Performance Impact:
          - Indexes: [N/A]
          - Triggers: [Modified]
          - Estimated Impact: [Mínimo, afeta apenas a criação de novos usuários.]
          */

-- 1. Remover o gatilho e a função de diagnóstico temporários.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Criar a função final e correta que lê os metadados do usuário.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, cidade, tipo, foto_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'nome',
    NEW.raw_user_meta_data ->> 'cidade',
    (NEW.raw_user_meta_data ->> 'tipo')::public.user_type,
    'https://i.pravatar.cc/150?u=' || NEW.id::text
  );
  RETURN NEW;
END;
$$;

-- 3. Recriar o gatilho para usar a nova função.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
