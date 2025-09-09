/*
# Criação do Schema Completo do App Conecta
Criação de todas as tabelas necessárias para a plataforma de freelancers

## Query Description: 
Este script cria o schema completo do banco de dados para a plataforma App Conecta, incluindo tabelas para perfis de usuários, categorias, serviços, projetos, chats, mensagens, avaliações e transações. Todas as tabelas incluem políticas RLS para segurança e triggers para funcionalidades automáticas como criação de perfis.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- profiles: Dados dos usuários (clientes e freelancers)
- categories: Categorias de serviços disponíveis
- services: Serviços oferecidos pelos freelancers
- projects: Projetos/contratos entre clientes e freelancers
- chats: Conversas entre usuários
- messages: Mensagens individuais dos chats
- reviews: Avaliações dos serviços
- transactions: Transações financeiras

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: Authenticated users only

## Performance Impact:
- Indexes: Added for foreign keys and search fields
- Triggers: Added for automatic profile creation
- Estimated Impact: Minimal for small to medium scale
*/

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para tipo de usuário
CREATE TYPE user_type AS ENUM ('cliente', 'freelancer');

-- Enum para status do projeto
CREATE TYPE project_status AS ENUM ('pendente', 'em_andamento', 'concluido', 'cancelado');

-- Enum para status da transação
CREATE TYPE transaction_status AS ENUM ('pendente', 'processando', 'concluida', 'falhou');

-- Tabela de perfis dos usuários
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    nome TEXT NOT NULL,
    telefone TEXT,
    foto_url TEXT,
    cidade TEXT NOT NULL,
    tipo user_type NOT NULL DEFAULT 'cliente',
    descricao TEXT,
    preco_minimo DECIMAL(10,2),
    preco_maximo DECIMAL(10,2),
    disponivel BOOLEAN DEFAULT true,
    avaliacao_media DECIMAL(3,2) DEFAULT 0,
    total_avaliacoes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de categorias
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    icone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de serviços oferecidos pelos freelancers
CREATE TABLE services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    freelancer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de projetos/contratos
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cliente_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    freelancer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    comissao DECIMAL(10,2) DEFAULT 0,
    status project_status DEFAULT 'pendente',
    prazo TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de chats
CREATE TABLE chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cliente_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    freelancer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cliente_id, freelancer_id)
);

-- Tabela de mensagens
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    conteudo TEXT NOT NULL,
    lida BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de avaliações
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    avaliador_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    avaliado_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    nota INTEGER CHECK (nota >= 1 AND nota <= 5) NOT NULL,
    comentario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, avaliador_id)
);

-- Tabela de transações
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    cliente_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    freelancer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    valor_freelancer DECIMAL(10,2) NOT NULL,
    comissao DECIMAL(10,2) NOT NULL,
    status transaction_status DEFAULT 'pendente',
    payment_method TEXT,
    external_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir categorias padrão
INSERT INTO categories (nome, descricao) VALUES
('Serviços para o Lar', 'Eletricistas, encanadores, pintores e mais'),
('Beleza e Bem-Estar', 'Maquiadores, cabeleireiros, personal trainers'),
('Eventos', 'Fotógrafos, DJs, garçons para eventos'),
('Aulas Particulares', 'Professores de idiomas, música, reforço escolar'),
('Cuidados', 'Babás, cuidadores de idosos, pet sitters'),
('Design e Criação', 'Designers gráficos, editores de vídeo'),
('Marketing Digital', 'Gestores de redes sociais, especialistas em SEO'),
('Redação e Tradução', 'Redatores, revisores, tradutores'),
('Tecnologia', 'Desenvolvedores, programadores, analistas');

-- Índices para performance
CREATE INDEX idx_profiles_tipo ON profiles(tipo);
CREATE INDEX idx_profiles_cidade ON profiles(cidade);
CREATE INDEX idx_profiles_disponivel ON profiles(disponivel);
CREATE INDEX idx_services_freelancer ON services(freelancer_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_projects_cliente ON projects(cliente_id);
CREATE INDEX idx_projects_freelancer ON projects(freelancer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_reviews_avaliado ON reviews(avaliado_id);
CREATE INDEX idx_transactions_project ON transactions(project_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at 
    BEFORE UPDATE ON chats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, nome, cidade, tipo)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'cidade', 'São Paulo'),
        COALESCE(NEW.raw_user_meta_data->>'tipo', 'cliente')::user_type
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- Trigger para atualizar avaliação média
CREATE OR REPLACE FUNCTION update_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles 
    SET 
        avaliacao_media = (
            SELECT ROUND(AVG(nota), 1)
            FROM reviews 
            WHERE avaliado_id = NEW.avaliado_id
        ),
        total_avaliacoes = (
            SELECT COUNT(*)
            FROM reviews 
            WHERE avaliado_id = NEW.avaliado_id
        )
    WHERE id = NEW.avaliado_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rating_trigger
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_average_rating();

-- Trigger para atualizar timestamp do chat
CREATE OR REPLACE FUNCTION update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats 
    SET updated_at = NOW() 
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_timestamp_trigger
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_chat_timestamp();

-- RLS Policies

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver todos os perfis" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem atualizar próprio perfil" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver categorias" ON categories
    FOR SELECT USING (true);

-- Services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver serviços ativos" ON services
    FOR SELECT USING (ativo = true);

CREATE POLICY "Freelancers podem gerenciar próprios serviços" ON services
    FOR ALL USING (auth.uid() = freelancer_id);

-- Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprios projetos" ON projects
    FOR SELECT USING (
        auth.uid() = cliente_id OR 
        auth.uid() = freelancer_id
    );

CREATE POLICY "Clientes podem criar projetos" ON projects
    FOR INSERT WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Participantes podem atualizar projetos" ON projects
    FOR UPDATE USING (
        auth.uid() = cliente_id OR 
        auth.uid() = freelancer_id
    );

-- Chats
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprios chats" ON chats
    FOR SELECT USING (
        auth.uid() = cliente_id OR 
        auth.uid() = freelancer_id
    );

CREATE POLICY "Usuários podem criar chats" ON chats
    FOR INSERT WITH CHECK (
        auth.uid() = cliente_id OR 
        auth.uid() = freelancer_id
    );

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver mensagens dos próprios chats" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.cliente_id = auth.uid() OR chats.freelancer_id = auth.uid())
        )
    );

CREATE POLICY "Usuários podem enviar mensagens nos próprios chats" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.cliente_id = auth.uid() OR chats.freelancer_id = auth.uid())
        )
    );

CREATE POLICY "Usuários podem marcar mensagens como lidas" ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.cliente_id = auth.uid() OR chats.freelancer_id = auth.uid())
        )
    );

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver avaliações" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem avaliar próprios projetos" ON reviews
    FOR INSERT WITH CHECK (
        auth.uid() = avaliador_id AND
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = reviews.project_id 
            AND (projects.cliente_id = auth.uid() OR projects.freelancer_id = auth.uid())
            AND projects.status = 'concluido'
        )
    );

-- Transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprias transações" ON transactions
    FOR SELECT USING (
        auth.uid() = cliente_id OR 
        auth.uid() = freelancer_id
    );

CREATE POLICY "Sistema pode gerenciar transações" ON transactions
    FOR ALL USING (true);
