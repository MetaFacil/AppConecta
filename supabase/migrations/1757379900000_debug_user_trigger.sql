/*
# [DEBUG] Simplificar Gatilho de Criação de Usuário
Este script substitui o gatilho (trigger) que cria um perfil de usuário por uma versão de depuração muito simples.

## Descrição da Query:
- A função `handle_new_user` será alterada para inserir valores fixos ("hardcoded") na tabela de perfis sempre que um novo usuário for criado.
- Isso é um passo de diagnóstico para isolar a causa do problema no cadastro. Se o cadastro funcionar com este gatilho, saberemos que o problema está na forma como os dados (nome, cidade) são passados para o banco de dados. Se ainda assim não funcionar, o problema é mais profundo.
- Esta é uma alteração temporária. Os perfis criados terão o nome "TESTE TRIGGER".

## Metadados:
- Categoria-Schema: "Structural"
- Nível-Impacto: "Medium"
- Requer-Backup: false
- Reversível: true

## Detalhes da Estrutura:
- Afeta a função: `public.handle_new_user()`
- Afeta o gatilho: `on_auth_user_created` na tabela `auth.users`

## Implicações de Segurança:
- RLS Status: Inalterado
- Mudanças de Política: Não
- Requisitos de Autenticação: N/A

## Impacto no Desempenho:
- Gatilhos: Modificado
- Impacto Estimado: Nenhum.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- DEBUG: Inserir valores fixos para isolar o problema.
  -- Isso remove a dependência de `raw_user_meta_data` por enquanto.
  INSERT INTO public.profiles (id, email, nome, cidade, tipo)
  VALUES (
    new.id,
    new.email,
    'TESTE TRIGGER', -- Valor Fixo para Teste
    'TESTE CIDADE',  -- Valor Fixo para Teste
    'cliente'        -- Valor Fixo para Teste
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garante que o gatilho na tabela de autenticação use a função atualizada.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
