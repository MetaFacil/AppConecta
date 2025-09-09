/*
  # [Operação de Limpeza Definitiva]
  Remoção do gatilho de criação de perfil de usuário.

  ## Query Description: 
  Esta operação remove permanentemente o gatilho (trigger) e a função associada que criavam o perfil do usuário. Esta é uma etapa de limpeza crucial e segura para resolver o problema de cadastro de uma vez por todas. Estamos mudando para uma abordagem onde o próprio aplicativo cria o perfil, para maior controle e melhor diagnóstico de erros.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: false
  
  ## Structure Details:
  - Trigger a ser removido: on_auth_user_created em auth.users
  - Função a ser removida: public.handle_new_user()
  
  ## Security Implications:
  - RLS Status: Inalterado
  - Policy Changes: Não
  - Auth Requirements: Admin
  
  ## Performance Impact:
  - Triggers: Removido
  - Estimated Impact: Mínimo.
*/
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;
