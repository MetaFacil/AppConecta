import { faker } from '@faker-js/faker/locale/pt_BR';
import { Freelancer, Cliente, Projeto, Chat, Mensagem } from '../types';

faker.seed(123); // Para dados consistentes

// Categorias de serviços
export const CATEGORIAS = [
  'Serviços para o Lar',
  'Beleza e Bem-Estar', 
  'Eventos',
  'Aulas Particulares',
  'Cuidados',
  'Design e Criação',
  'Marketing Digital',
  'Redação e Tradução',
  'Tecnologia'
];

// Serviços por categoria
export const SERVICOS_POR_CATEGORIA = {
  'Serviços para o Lar': ['Eletricista', 'Encanador', 'Montador de Móveis', 'Pintor', 'Técnico em Ar Condicionado'],
  'Beleza e Bem-Estar': ['Maquiador', 'Cabeleireiro', 'Manicure', 'Personal Trainer', 'Massagista'],
  'Eventos': ['Fotógrafo', 'DJ', 'Garçom', 'Bartender', 'Decorador'],
  'Aulas Particulares': ['Professor de Inglês', 'Professor de Matemática', 'Professor de Música', 'Tutor Acadêmico'],
  'Cuidados': ['Babá', 'Cuidador de Idosos', 'Pet Sitter', 'Acompanhante'],
  'Design e Criação': ['Designer Gráfico', 'Editor de Vídeo', 'Ilustrador', 'Fotógrafo'],
  'Marketing Digital': ['Gestor de Redes Sociais', 'Especialista em SEO', 'Redator Publicitário'],
  'Redação e Tradução': ['Redator', 'Revisor', 'Tradutor', 'Copywriter'],
  'Tecnologia': ['Desenvolvedor Web', 'Programador Mobile', 'Analista de Sistemas', 'Designer UX/UI']
};

export const CIDADES = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Salvador',
  'Fortaleza', 'Recife', 'Porto Alegre', 'Curitiba', 'Goiânia'
];

// Gerar freelancers mock
export const gerarFreelancers = (quantidade: number = 20): Freelancer[] => {
  return Array.from({ length: quantidade }, () => {
    const categoria = faker.helpers.arrayElement(CATEGORIAS);
    const servicos = faker.helpers.arrayElements(
      SERVICOS_POR_CATEGORIA[categoria as keyof typeof SERVICOS_POR_CATEGORIA],
      { min: 1, max: 3 }
    );
    
    return {
      id: faker.string.uuid(),
      nome: faker.person.fullName(),
      email: faker.internet.email(),
      telefone: faker.phone.number(),
      foto: `https://i.pravatar.cc/150?u=${faker.string.uuid()}`,
      cidade: faker.helpers.arrayElement(CIDADES),
      tipo: 'freelancer' as const,
      criadoEm: faker.date.past(),
      descricao: faker.lorem.paragraph(),
      servicos,
      avaliacaoMedia: Number(faker.number.float({ min: 3.5, max: 5.0 }).toFixed(1)),
      totalAvaliacoes: faker.number.int({ min: 5, max: 150 }),
      preco: {
        minimo: faker.number.int({ min: 50, max: 200 }),
        maximo: faker.number.int({ min: 300, max: 1000 })
      },
      disponivel: faker.datatype.boolean(),
      categoria
    };
  });
};

// Gerar cliente mock (usuário atual)
export const clienteAtual: Cliente = {
  id: 'cliente-atual',
  nome: 'João Silva',
  email: 'joao@email.com',
  telefone: '(11) 99999-9999',
  foto: 'https://i.pravatar.cc/150?u=cliente-atual',
  cidade: 'São Paulo',
  tipo: 'cliente',
  criadoEm: new Date()
};

// Freelancers mock
export const freelancers = gerarFreelancers();

// Gerar mensagens mock
export const gerarMensagens = (freelancerId: string): Mensagem[] => {
  return Array.from({ length: faker.number.int({ min: 3, max: 10 }) }, (_, index) => ({
    id: faker.string.uuid(),
    remetenteId: index % 2 === 0 ? clienteAtual.id : freelancerId,
    destinatarioId: index % 2 === 0 ? freelancerId : clienteAtual.id,
    conteudo: faker.lorem.sentence(),
    enviadaEm: faker.date.recent(),
    lida: faker.datatype.boolean()
  }));
};

// Chats mock
export const chats: Chat[] = freelancers.slice(0, 5).map(freelancer => {
  const mensagens = gerarMensagens(freelancer.id);
  return {
    id: faker.string.uuid(),
    participantes: [clienteAtual.id, freelancer.id],
    ultimaMensagem: mensagens[mensagens.length - 1],
    mensagens
  };
});
