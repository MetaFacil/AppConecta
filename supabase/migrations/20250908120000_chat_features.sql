/*
          # [Chat Features]
          Adiciona funcionalidades avançadas ao chat, como upload de imagens e indicador de "digitando...".

          ## Query Description: Esta operação adicionará novas colunas à tabela `messages` e criará políticas de segurança para um novo bucket de armazenamento.
          - **Impacto nos Dados:** Nenhum dado existente será perdido. A coluna `message_type` terá 'text' como padrão.
          - **Riscos:** Baixo. As alterações são aditivas.
          - **Precauções:** Recomenda-se que você crie um novo bucket no Supabase Storage chamado `chat_media` antes de aplicar as políticas.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - **Tabela `messages`:**
            - Adiciona a coluna `message_type` (TEXT, default 'text') para diferenciar texto de imagem.
            - Adiciona a coluna `media_url` (TEXT) para armazenar a URL de imagens.
          - **Storage Bucket `chat_media`:**
            - Adiciona políticas de segurança (RLS) para permitir que apenas participantes de um chat possam ver e enviar mídias.
          
          ## Security Implications:
          - RLS Status: Habilitado para o novo bucket de storage.
          - Policy Changes: Sim, novas políticas para o bucket `chat_media`.
          - Auth Requirements: As políticas exigem que o usuário esteja autenticado e seja participante do chat.
          
          ## Performance Impact:
          - Indexes: Nenhum índice novo.
          - Triggers: Nenhum trigger novo.
          - Estimated Impact: Mínimo.
          */

-- 1. Adicionar colunas na tabela de mensagens
ALTER TABLE public.messages
ADD COLUMN message_type TEXT NOT NULL DEFAULT 'text',
ADD COLUMN media_url TEXT;

COMMENT ON COLUMN public.messages.message_type IS 'Tipo da mensagem, ex: text, image, file.';
COMMENT ON COLUMN public.messages.media_url IS 'URL para a mídia, se aplicável.';

-- 2. Políticas de Segurança para o Storage Bucket 'chat_media'
-- IMPORTANTE: Crie manualmente um bucket chamado 'chat_media' no seu painel Supabase antes de continuar.

-- Permitir que usuários vejam arquivos de chats dos quais participam
CREATE POLICY "Allow read access to chat participants"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat_media' AND
  EXISTS (
    SELECT 1
    FROM public.chats
    WHERE (
      chats.id::text = (storage.foldername(name))[1] AND
      (chats.cliente_id = auth.uid() OR chats.freelancer_id = auth.uid())
    )
  )
);

-- Permitir que usuários enviem arquivos para chats dos quais participam
CREATE POLICY "Allow insert access to chat participants"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat_media' AND
  EXISTS (
    SELECT 1
    FROM public.chats
    WHERE (
      chats.id::text = (storage.foldername(name))[1] AND
      (chats.cliente_id = auth.uid() OR chats.freelancer_id = auth.uid())
    )
  )
);
