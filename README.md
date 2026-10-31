# 📚 Catálogo de Livros

Aplicação web para organizar um catálogo de livros, desenvolvida com HTML, CSS e TypeScript como projeto da disciplina de **Desenvolvimento Web**.

## 👤 Autor

- **SEU NOME COMPLETO** — [@seu-usuario-github](https://github.com/seu-usuario-github)

**Instituição:** Instituto Federal do Ceará - Campus Tianguá  
**Disciplina:** Tópicos Especiais em Projeto e Desenvolvimento Web  
**Professor(a):** Ana Bratriz Moreira Campos Fontenele

## 🎥 Vídeo de apresentação

[Assista ao vídeo no YouTube/Drive](https://youtu.be/GKcdFM9Zl4o)

## 🎯 Objetivo

Permitir que o usuário organize suas leituras em um só lugar, cadastrando livros com capa, buscando, filtrando e acompanhando o estado de leitura de cada um. O projeto aplica os conteúdos estudados em aula: tipos, interfaces, funções, arrays, manipulação do DOM e eventos, tudo com TypeScript.

## ✨ Funcionalidades

- **Cadastro de livros** com título, autor, categoria, ano de publicação, estado de leitura (*Quero ler*, *Lendo* ou *Lido*) e URL da capa (opcional).
- **Validação do formulário:** campos obrigatórios, ano como número inteiro dentro de um intervalo válido e URL de capa em formato válido. Os erros aparecem na tela.
- **Catálogo em cards** com capa, título, autor, categoria e ano. Livros sem capa (ou com imagem que não carrega) mostram um bloco colorido com a inicial do título.
- **Mensagens de lista vazia:** uma quando não há livros cadastrados e outra quando a busca ou o filtro não retornam resultados.
- **Busca** por título ou autor (ignora acentos e maiúsculas) e **filtro por categoria**, com atualização imediata da lista.
- **Alteração do estado de leitura** direto no card.
- **Edição** dos dados de um livro já cadastrado, reaproveitando o formulário de cadastro.
- **Exclusão** de livros, com confirmação.
- **Resumo** com o total de livros e a quantidade em cada estado, atualizado a cada mudança.
- **Persistência** no `localStorage` do navegador: os dados continuam ao recarregar a página.

## 🛠️ Tecnologias

- HTML5
- CSS3 (Grid, Flexbox e layout responsivo)
- TypeScript (modo `strict`)
- Node.js e npm (apenas para instalar e executar o compilador do TypeScript)

## 🧩 Conceitos de TypeScript aplicados

- `interface` para modelar o livro (`Livro`) e os dados do formulário (`DadosFormulario`).
- *Union type* para o estado de leitura (`Status`) e `Record<Status, string>` para os rótulos.
- Array tipado (`Livro[]`) como fonte dos dados.
- Funções com parâmetros e retornos tipados, sem uso de `any`.
- *Type guard* (`ehStatus`) para validar valores vindos do formulário.
- Função genérica `obterElemento<T>()`, que trata elementos `null` do DOM.
- Eventos tipados (`Event`) para formulário, busca, filtro e botões.

## 📁 Estrutura do projeto

```
catalogo-livros/
├── src/
│   └── main.ts        # código-fonte em TypeScript
├── dist/
│   └── main.js        # JavaScript gerado pela compilação
├── index.html         # estrutura da página
├── style.css          # estilos
├── tsconfig.json      # configuração do compilador
├── package.json       # scripts e dependências
└── README.md
```

## 🚀 Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior) com npm
- Um navegador atual (Chrome, Edge, Firefox etc.)

### 1. Clonar o repositório

```bash
git clone https://github.com/LucasSouza67/catalogo-livros.git
cd catalogo-livros
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Compilar o TypeScript

```bash
npm run build
```

O comando gera o arquivo `dist/main.js` a partir de `src/main.ts`.

Durante o desenvolvimento, é possível recompilar automaticamente a cada alteração:

```bash
npm run watch
```

### 4. Abrir a aplicação

Abra o arquivo `index.html` no navegador (clique duas vezes nele ou use a extensão *Live Server* do VS Code).

## 🖱️ Como usar

1. Preencha o formulário e clique em **Adicionar livro**. Os campos marcados com `*` são obrigatórios.
2. Use a busca e o filtro de categoria acima dos cards para encontrar livros.
3. Mude o estado de leitura pelo seletor do card.
4. Clique em **Editar** para alterar os dados de um livro e em **Salvar alterações** para confirmar (ou em **Cancelar edição**).
5. Clique em **Excluir** para remover um livro.
6. Acompanhe as quantidades no painel **Resumo**.

## 💡 Possíveis melhorias

- Dividir o `main.ts` em módulos (tipos, dados e interface).
- Buscar a capa automaticamente por uma API a partir do título.
- Ordenar os livros por título ou ano.
- Impedir o cadastro de livros duplicados.
