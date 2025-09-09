/*
          # [Operação de Remoção]
          Remove o gatilho de criação de perfil automático.

          ## Query Description: [Esta operação remove o gatilho 'on_auth_user_created' e a função 'create_profile_for_new_user'. A lógica de criação de perfil será movida para o código do aplicativo para maior controle e melhor tratamento de erros. Esta é uma etapa segura e necessária para resolver o problema de cadastro.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Remove trigger: on_auth_user_created on auth.users
          - Remove function: public.create_profile_for_new_user()
          
          ## Security Implications:
          - RLS Status: [No Change]
          - Policy Changes: [No]
          - Auth Requirements: [N/A]
          
          ## Performance Impact:
          - Indexes: [No Change]
          - Triggers: [Removed]
          - Estimated Impact: [Melhora a confiabilidade do processo de cadastro.]
          */

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user();
