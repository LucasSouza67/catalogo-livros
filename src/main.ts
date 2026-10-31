// ===================== Tipos e modelagem =====================

type Status = "quero-ler" | "lendo" | "lido";

interface Livro {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  ano: number;
  status: Status;
  capa: string; // URL da imagem (pode ser vazia)
}

// Dados crus lidos do formulário (tudo string, ainda sem validação)
interface DadosFormulario {
  titulo: string;
  autor: string;
  categoria: string;
  ano: string;
  status: string;
  capa: string;
}

const CHAVE_STORAGE = "catalogo-livros";

const CATEGORIAS: string[] = [
  "Ficção",
  "Romance",
  "Fantasia",
  "Ciência",
  "Tecnologia",
  "Biografia",
  "História",
  "Outros",
];

const ROTULOS_STATUS: Record<Status, string> = {
  "quero-ler": "Quero ler",
  lendo: "Lendo",
  lido: "Lido",
};

// ===================== Estado (meu array tipado) =====================
let livros: Livro[] = carregarLivros();

// modo cadastro: null | número = id do livro que está sendo editado
let idEmEdicao: number | null = null;

// ===================== Acesso ao DOM =====================
function obterElemento<T extends HTMLElement>(id: string): T {
  const elemento = document.getElementById(id);
  if (elemento === null) {
    throw new Error(`Elemento #${id} não encontrado no HTML.`);
  }
  return elemento as T;
}

const formulario = obterElemento<HTMLFormElement>("form-livro");
const campoTitulo = obterElemento<HTMLInputElement>("titulo");
const campoAutor = obterElemento<HTMLInputElement>("autor");
const campoCategoria = obterElemento<HTMLSelectElement>("categoria");
const campoAno = obterElemento<HTMLInputElement>("ano");
const campoStatus = obterElemento<HTMLSelectElement>("status-livro");
const campoCapa = obterElemento<HTMLInputElement>("capa");
const caixaErros = obterElemento<HTMLUListElement>("erros");

const campoBusca = obterElemento<HTMLInputElement>("busca");
const filtroCategoria = obterElemento<HTMLSelectElement>("filtro-categoria");

const listaLivros = obterElemento<HTMLDivElement>("lista-livros");
const mensagemVazia = obterElemento<HTMLParagraphElement>("mensagem-vazia");

const resumoTotal = obterElemento<HTMLSpanElement>("resumo-total");
const resumoQueroLer = obterElemento<HTMLSpanElement>("resumo-quero-ler");
const resumoLendo = obterElemento<HTMLSpanElement>("resumo-lendo");
const resumoLido = obterElemento<HTMLSpanElement>("resumo-lido");

const botaoSalvar = obterElemento<HTMLButtonElement>("btn-salvar");
const botaoCancelar = obterElemento<HTMLButtonElement>("btn-cancelar");

// ===================== Persistência =====================
function ehStatus(valor: string): valor is Status {
  return valor === "quero-ler" || valor === "lendo" || valor === "lido";
}

function carregarLivros(): Livro[] {
  try {
    const texto = localStorage.getItem(CHAVE_STORAGE);
    if (texto === null) return [];
    const dados: unknown = JSON.parse(texto);
    return Array.isArray(dados) ? (dados as Livro[]) : [];
  } catch {
    return [];
  }
}

function salvarLivros(): void {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(livros));
  } catch {
  }
}

// ===================== Validação =====================
function validarDados(dados: DadosFormulario): string[] {
  const erros: string[] = [];
  const anoLimite: number = new Date().getFullYear() + 1;

  if (dados.titulo === "") erros.push("Informe o título do livro.");
  if (dados.autor === "") erros.push("Informe o autor do livro.");
  if (dados.categoria === "") erros.push("Escolha uma categoria.");

  if (dados.ano === "") {
    erros.push("Informe o ano de publicação.");
  } else {
    const ano = Number(dados.ano);
    if (!Number.isInteger(ano) || ano < 1000 || ano > anoLimite) {
      erros.push(`O ano deve ser um número inteiro entre 1000 e ${anoLimite}.`);
    }
  }

  if (!ehStatus(dados.status)) erros.push("Escolha um estado de leitura válido.");

  if (dados.capa !== "") {
    try {
      const url = new URL(dados.capa);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        erros.push("A URL da capa deve começar com http:// ou https://.");
      }
    } catch {
      erros.push("A URL da capa é inválida.");
    }
  }

  return erros;
}

function mostrarErros(erros: string[]): void {
  caixaErros.replaceChildren(
    ...erros.map((mensagem: string): HTMLLIElement => {
      const item = document.createElement("li");
      item.textContent = mensagem;
      return item;
    })
  );
  caixaErros.hidden = erros.length === 0;
}

// ===================== Ações sobre os dados =====================
function gerarId(): number {
  return livros.reduce((maior: number, l: Livro) => Math.max(maior, l.id), 0) + 1;
}

function adicionarLivro(dados: DadosFormulario): void {
  if (!ehStatus(dados.status)) return;
  const novo: Livro = {
    id: gerarId(),
    titulo: dados.titulo,
    autor: dados.autor,
    categoria: dados.categoria,
    ano: Number(dados.ano),
    status: dados.status,
    capa: dados.capa,
  };
  livros.push(novo);
  salvarLivros();
  atualizarTela();
}

function atualizarLivro(id: number, dados: DadosFormulario ): void {
  const livro = livros.find((l: Livro) => l.id === id);

  if (livro === undefined || !ehStatus(dados.status)) return;

  livro.titulo = dados.titulo;
  livro.autor = dados.autor;
  livro.categoria = dados.categoria;
  livro.ano = Number(dados.ano);
  livro.status = dados.status;
  livro.capa = dados.capa;

  salvarLivros();
  atualizarTela();
}

function iniciarEdicao(livro: Livro): void {
  idEmEdicao = livro.id;

  campoTitulo.value = livro.titulo;
  campoAutor.value = livro.autor;
  campoCategoria.value = livro.categoria;
  campoAno.value = String(livro.ano);
  campoStatus.value = livro.status;
  campoCapa.value = livro.capa;

  botaoSalvar.textContent = "Salvar alterações";
  botaoCancelar.hidden = false;
  mostrarErros([]);
  formulario.scrollIntoView({ behavior: "smooth" })
  campoTitulo.focus();
}

function finalizarEdicao(): void {
  idEmEdicao = null;
  formulario.reset();
  botaoSalvar.textContent = "Adicionar livro";
  botaoCancelar.hidden = true;
  mostrarErros([]);
}

function alterarStatus(id: number, novoStatus: Status): void {
  const livro = livros.find((l: Livro) => l.id === id);
  if (livro === undefined) return;
  livro.status = novoStatus;
  salvarLivros();
  atualizarTela();
}

function removerLivro(id: number): void {
  if (idEmEdicao === id) finalizarEdicao();
  livros = livros.filter((l: Livro) => l.id !== id);
  salvarLivros();
  atualizarTela();
}

// ===================== Busca e filtro =====================
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function filtrarLivros(): Livro[] {
  const termo: string = normalizar(campoBusca.value.trim());
  const categoria: string = filtroCategoria.value;
  return livros.filter((l: Livro): boolean => {
    const bateBusca =
      termo === "" ||
      normalizar(l.titulo).includes(termo) ||
      normalizar(l.autor).includes(termo);
    const bateCategoria = categoria === "" || l.categoria === categoria;
    return bateBusca && bateCategoria;
  });
}

// ===================== Renderização =====================
function criarCapaPadrao(livro: Livro): HTMLDivElement {
  const capa = document.createElement("div");
  capa.className = "capa capa-padrao";
  capa.textContent = livro.titulo.charAt(0).toUpperCase();
  capa.setAttribute("aria-label", `Sem capa: ${livro.titulo}`);
  return capa;
}
function criarCapa(livro: Livro): HTMLElement {
  if (livro.capa === "") return criarCapaPadrao(livro);
  const imagem = document.createElement("img");
  imagem.className = "capa";
  imagem.src = livro.capa;
  imagem.alt = `Capa do livro ${livro.titulo}`;
  imagem.loading = "lazy";
  imagem.addEventListener("error", (): void => {
    imagem.replaceWith(criarCapaPadrao(livro));
  });
  return imagem;
}

function criarCard(livro: Livro): HTMLElement {
  const card = document.createElement("article");
  card.className = "card";
  const corpo = document.createElement("div");
  corpo.className = "card-corpo";
  const titulo = document.createElement("h3");
  titulo.textContent = livro.titulo;
  const autor = document.createElement("p");
  autor.className = "autor";
  autor.textContent = livro.autor;
  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `${livro.categoria} · ${livro.ano}`;
  const seletor = document.createElement("select");
  seletor.setAttribute("aria-label", `Estado de leitura de ${livro.titulo}`);
  (Object.keys(ROTULOS_STATUS) as Status[]).forEach((valor: Status): void => {
    const opcao = document.createElement("option");
    opcao.value = valor;
    opcao.textContent = ROTULOS_STATUS[valor];
    opcao.selected = valor === livro.status;
    seletor.appendChild(opcao);
  });
  seletor.addEventListener("change", (): void => {
    if (ehStatus(seletor.value)) alterarStatus(livro.id, seletor.value);
  });

  const botaoRemover = document.createElement("button");
  botaoRemover.type = "button";
  botaoRemover.className = "btn-remover";
  botaoRemover.textContent = "Excluir";
  botaoRemover.addEventListener("click", (): void => {
    if (confirm(`Excluir "${livro.titulo}" do catálogo?`)) removerLivro(livro.id);
  });

  const botaoEditar = document.createElement("button");
  botaoEditar.type = "button";
  botaoEditar.className = "btn-editar";
  botaoEditar.textContent = "Editar";
  botaoEditar.addEventListener("click", (): void => iniciarEdicao(livro));

  corpo.append(titulo, autor, meta, seletor, botaoEditar, botaoRemover);

  card.append(criarCapa(livro), corpo);
  return card;
}

function renderizarCatalogo(): void {
  const visiveis: Livro[] = filtrarLivros();
  listaLivros.replaceChildren(...visiveis.map(criarCard));

  if (livros.length === 0) {
    mensagemVazia.textContent = "Nenhum livro cadastrado ainda. Use o formulário para adicionar o primeiro!";
    mensagemVazia.hidden = false;
  } else if (visiveis.length === 0) {
    mensagemVazia.textContent = "Nenhum livro encontrado para essa busca ou filtro.";
    mensagemVazia.hidden = false;
  } else {
    mensagemVazia.hidden = true;
  }
}

function contarPorStatus(alvo: Status): number {
  return livros.filter((l: Livro) => l.status === alvo).length;
}

function renderizarResumo(): void {
  resumoTotal.textContent = String(livros.length);
  resumoQueroLer.textContent = String(contarPorStatus("quero-ler"));
  resumoLendo.textContent = String(contarPorStatus("lendo"));
  resumoLido.textContent = String(contarPorStatus("lido"));
}

function atualizarTela(): void {
  renderizarCatalogo();
  renderizarResumo();
}

// ===================== Inicialização e eventos =====================
function preencherCategorias(): void {
  CATEGORIAS.forEach((nome: string): void => {
    campoCategoria.add(new Option(nome, nome));
    filtroCategoria.add(new Option(nome, nome));
  });
}
function lerFormulario(): DadosFormulario {
  return {
    titulo: campoTitulo.value.trim(),
    autor: campoAutor.value.trim(),
    categoria: campoCategoria.value,
    ano: campoAno.value.trim(),
    status: campoStatus.value,
    capa: campoCapa.value.trim(),
  };
}

formulario.addEventListener("submit", (evento: Event): void => {
  evento.preventDefault();
  const dados = lerFormulario();
  const erros = validarDados(dados);
  mostrarErros(erros);
  if (erros.length > 0) return;

  if (idEmEdicao !== null){
    atualizarLivro(idEmEdicao, dados);
    finalizarEdicao();
  } else {
    adicionarLivro(dados);
    formulario.reset();
  }
  campoTitulo.focus();
});

campoBusca.addEventListener("input", renderizarCatalogo);
filtroCategoria.addEventListener("change", renderizarCatalogo);
botaoCancelar.addEventListener("click", finalizarEdicao);

preencherCategorias();
atualizarTela();
