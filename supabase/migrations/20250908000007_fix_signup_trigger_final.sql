/*
# [Operação de Correção do Gatilho de Cadastro]
Este script substitui os gatilhos de criação de perfil de usuário anteriores por uma versão final e robusta. Ele garante que o cadastro de novos usuários funcione corretamente, extraindo os dados do formulário (nome, cidade, tipo) e inserindo-os na tabela de perfis.

## Descrição da Query:
- **DROP...**: Remove todas as versões antigas e de depuração das funções e gatilhos (`handle_new_user`, `handle_new_user_fallback`, `handle_new_user_debug`) para evitar conflitos.
- **CREATE FUNCTION handle_new_user**: Cria a nova função que será executada quando um usuário se cadastra. Ela é responsável por ler os metadados do novo usuário (nome, cidade, tipo) e criar a entrada correspondente na tabela `public.profiles`. Inclui lógicas de fallback (ex: usar parte do e-mail se o nome não for fornecido) para evitar falhas.
- **CREATE TRIGGER on_auth_user_created**: Conecta a nova função ao evento de inserção na tabela `auth.users`, garantindo que a criação do perfil seja automática e confiável.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true

## Detalhes da Estrutura:
- **Afeta**: `auth.users` (triggers), `public.profiles` (inserções), `public.functions` (criação/substituição).
- **Objetos Criados/Modificados**:
  - Função: `public.handle_new_user()`
  - Gatilho: `on_auth_user_created` na tabela `auth.users`
- **Objetos Removidos**:
  - Funções: `handle_new_user_fallback`, `handle_new_user_debug` (se existirem)
  - Gatilhos: `on_auth_user_created_fallback`, `on_auth_user_created_debug` (se existirem)

## Implicações de Segurança:
- RLS Status: Não alterado. A função é executada com `security definer` para ter permissão de inserir na tabela `profiles`, o que é uma prática padrão e segura para este caso de uso.
- Alterações de Política: Nenhuma.
- Requisitos de Autenticação: Nenhuma alteração no fluxo de autenticação do usuário.

## Impacto no Desempenho:
- Índices: Nenhum.
- Gatilhos: Substitui gatilhos existentes. O impacto na performance de inserção na tabela `auth.users` é mínimo e esperado para esta funcionalidade.
- Impacto Estimado: Baixo.
*/

-- Passo 1: Remover as funções e gatilhos antigos para evitar conflitos.
-- A cláusula "if exists" garante que o script não falhe se eles já tiverem sido removidos.
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_created_fallback on auth.users;
drop trigger if exists on_auth_user_created_debug on auth.users;
drop trigger if exists on_auth_user_created_final on auth.users;

drop function if exists public.handle_new_user();
drop function if exists public.handle_new_user_fallback();
drop function if exists public.handle_new_user_debug();
drop function if exists public.handle_new_user_final();

-- Passo 2: Criar a função final e robusta para lidar com a criação de novos usuários.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome, cidade, tipo)
  values (
    new.id,
    new.email,
    -- Usa o nome fornecido no cadastro, ou a parte do e-mail antes do '@' como fallback.
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    -- Usa a cidade fornecida no cadastro, ou 'Não informado' como fallback.
    coalesce(new.raw_user_meta_data ->> 'cidade', 'Não informado'),
    -- Usa o tipo de conta fornecido, ou 'cliente' como fallback.
    coalesce((new.raw_user_meta_data ->> 'tipo')::public.user_role, 'cliente')
  );
  return new;
end;
$$;

-- Passo 3: Criar o gatilho que executa a função acima sempre que um novo usuário é criado.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
