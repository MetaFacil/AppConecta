/*
# [Operation Name]
Tornar o Gatilho de Criação de Perfil Mais Robusto

## Query Description: [Esta operação atualiza a função do banco de dados `handle_new_user` para torná-la mais resiliente a dados de entrada ausentes durante o cadastro de um novo usuário. A principal alteração é o uso da função `COALESCE` para garantir que a coluna `nome` na tabela `profiles` nunca receba um valor nulo, o que estava causando a falha silenciosa do processo de cadastro. Se o nome não for fornecido, a parte do e-mail antes do "@" será usada como um fallback. Não há risco de perda de dados existentes, pois isso afeta apenas a criação de novos usuários.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Function affected: `public.handle_new_user`

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [No]
- Auth Requirements: [N/A]

## Performance Impact:
- Indexes: [No change]
- Triggers: [No change]
- Estimated Impact: [Nenhum impacto de performance esperado.]
*/

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome, cidade, tipo, foto_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'cidade', 'Não informado'),
    coalesce((new.raw_user_meta_data->>'tipo')::public.user_type, 'cliente'),
    'https://i.pravatar.cc/150?u=' || new.id::text
  );
  return new;
end;
$$;
