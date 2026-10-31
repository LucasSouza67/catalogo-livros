"use strict";
// ===================== Tipos e modelagem =====================
const CHAVE_STORAGE = "catalogo-livros";
const CATEGORIAS = [
    "Ficção",
    "Romance",
    "Fantasia",
    "Ciência",
    "Tecnologia",
    "Biografia",
    "História",
    "Outros",
];
const ROTULOS_STATUS = {
    "quero-ler": "Quero ler",
    lendo: "Lendo",
    lido: "Lido",
};
// ===================== Estado (meu array tipado) =====================
let livros = carregarLivros();
// modo cadastro: null | número = id do livro que está sendo editado
let idEmEdicao = null;
// ===================== Acesso ao DOM =====================
function obterElemento(id) {
    const elemento = document.getElementById(id);
    if (elemento === null) {
        throw new Error(`Elemento #${id} não encontrado no HTML.`);
    }
    return elemento;
}
const formulario = obterElemento("form-livro");
const campoTitulo = obterElemento("titulo");
const campoAutor = obterElemento("autor");
const campoCategoria = obterElemento("categoria");
const campoAno = obterElemento("ano");
const campoStatus = obterElemento("status-livro");
const campoCapa = obterElemento("capa");
const caixaErros = obterElemento("erros");
const campoBusca = obterElemento("busca");
const filtroCategoria = obterElemento("filtro-categoria");
const listaLivros = obterElemento("lista-livros");
const mensagemVazia = obterElemento("mensagem-vazia");
const resumoTotal = obterElemento("resumo-total");
const resumoQueroLer = obterElemento("resumo-quero-ler");
const resumoLendo = obterElemento("resumo-lendo");
const resumoLido = obterElemento("resumo-lido");
const botaoSalvar = obterElemento("btn-salvar");
const botaoCancelar = obterElemento("btn-cancelar");
// ===================== Persistência =====================
function ehStatus(valor) {
    return valor === "quero-ler" || valor === "lendo" || valor === "lido";
}
function carregarLivros() {
    try {
        const texto = localStorage.getItem(CHAVE_STORAGE);
        if (texto === null)
            return [];
        const dados = JSON.parse(texto);
        return Array.isArray(dados) ? dados : [];
    }
    catch {
        return [];
    }
}
function salvarLivros() {
    try {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(livros));
    }
    catch {
    }
}
// ===================== Validação =====================
function validarDados(dados) {
    const erros = [];
    const anoLimite = new Date().getFullYear() + 1;
    if (dados.titulo === "")
        erros.push("Informe o título do livro.");
    if (dados.autor === "")
        erros.push("Informe o autor do livro.");
    if (dados.categoria === "")
        erros.push("Escolha uma categoria.");
    if (dados.ano === "") {
        erros.push("Informe o ano de publicação.");
    }
    else {
        const ano = Number(dados.ano);
        if (!Number.isInteger(ano) || ano < 1000 || ano > anoLimite) {
            erros.push(`O ano deve ser um número inteiro entre 1000 e ${anoLimite}.`);
        }
    }
    if (!ehStatus(dados.status))
        erros.push("Escolha um estado de leitura válido.");
    if (dados.capa !== "") {
        try {
            const url = new URL(dados.capa);
            if (url.protocol !== "http:" && url.protocol !== "https:") {
                erros.push("A URL da capa deve começar com http:// ou https://.");
            }
        }
        catch {
            erros.push("A URL da capa é inválida.");
        }
    }
    return erros;
}
function mostrarErros(erros) {
    caixaErros.replaceChildren(...erros.map((mensagem) => {
        const item = document.createElement("li");
        item.textContent = mensagem;
        return item;
    }));
    caixaErros.hidden = erros.length === 0;
}
// ===================== Ações sobre os dados =====================
function gerarId() {
    return livros.reduce((maior, l) => Math.max(maior, l.id), 0) + 1;
}
function adicionarLivro(dados) {
    if (!ehStatus(dados.status))
        return;
    const novo = {
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
function atualizarLivro(id, dados) {
    const livro = livros.find((l) => l.id === id);
    if (livro === undefined || !ehStatus(dados.status))
        return;
    livro.titulo = dados.titulo;
    livro.autor = dados.autor;
    livro.categoria = dados.categoria;
    livro.ano = Number(dados.ano);
    livro.status = dados.status;
    livro.capa = dados.capa;
    salvarLivros();
    atualizarTela();
}
function iniciarEdicao(livro) {
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
    formulario.scrollIntoView({ behavior: "smooth" });
    campoTitulo.focus();
}
function finalizarEdicao() {
    idEmEdicao = null;
    formulario.reset();
    botaoSalvar.textContent = "Adicionar livro";
    botaoCancelar.hidden = true;
    mostrarErros([]);
}
function alterarStatus(id, novoStatus) {
    const livro = livros.find((l) => l.id === id);
    if (livro === undefined)
        return;
    livro.status = novoStatus;
    salvarLivros();
    atualizarTela();
}
function removerLivro(id) {
    if (idEmEdicao === id)
        finalizarEdicao();
    livros = livros.filter((l) => l.id !== id);
    salvarLivros();
    atualizarTela();
}
// ===================== Busca e filtro =====================
function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}
function filtrarLivros() {
    const termo = normalizar(campoBusca.value.trim());
    const categoria = filtroCategoria.value;
    return livros.filter((l) => {
        const bateBusca = termo === "" ||
            normalizar(l.titulo).includes(termo) ||
            normalizar(l.autor).includes(termo);
        const bateCategoria = categoria === "" || l.categoria === categoria;
        return bateBusca && bateCategoria;
    });
}
// ===================== Renderização =====================
function criarCapaPadrao(livro) {
    const capa = document.createElement("div");
    capa.className = "capa capa-padrao";
    capa.textContent = livro.titulo.charAt(0).toUpperCase();
    capa.setAttribute("aria-label", `Sem capa: ${livro.titulo}`);
    return capa;
}
function criarCapa(livro) {
    if (livro.capa === "")
        return criarCapaPadrao(livro);
    const imagem = document.createElement("img");
    imagem.className = "capa";
    imagem.src = livro.capa;
    imagem.alt = `Capa do livro ${livro.titulo}`;
    imagem.loading = "lazy";
    imagem.addEventListener("error", () => {
        imagem.replaceWith(criarCapaPadrao(livro));
    });
    return imagem;
}
function criarCard(livro) {
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
    Object.keys(ROTULOS_STATUS).forEach((valor) => {
        const opcao = document.createElement("option");
        opcao.value = valor;
        opcao.textContent = ROTULOS_STATUS[valor];
        opcao.selected = valor === livro.status;
        seletor.appendChild(opcao);
    });
    seletor.addEventListener("change", () => {
        if (ehStatus(seletor.value))
            alterarStatus(livro.id, seletor.value);
    });
    const botaoRemover = document.createElement("button");
    botaoRemover.type = "button";
    botaoRemover.className = "btn-remover";
    botaoRemover.textContent = "Excluir";
    botaoRemover.addEventListener("click", () => {
        if (confirm(`Excluir "${livro.titulo}" do catálogo?`))
            removerLivro(livro.id);
    });
    const botaoEditar = document.createElement("button");
    botaoEditar.type = "button";
    botaoEditar.className = "btn-editar";
    botaoEditar.textContent = "Editar";
    botaoEditar.addEventListener("click", () => iniciarEdicao(livro));
    corpo.append(titulo, autor, meta, seletor, botaoEditar, botaoRemover);
    card.append(criarCapa(livro), corpo);
    return card;
}
function renderizarCatalogo() {
    const visiveis = filtrarLivros();
    listaLivros.replaceChildren(...visiveis.map(criarCard));
    if (livros.length === 0) {
        mensagemVazia.textContent = "Nenhum livro cadastrado ainda. Use o formulário para adicionar o primeiro!";
        mensagemVazia.hidden = false;
    }
    else if (visiveis.length === 0) {
        mensagemVazia.textContent = "Nenhum livro encontrado para essa busca ou filtro.";
        mensagemVazia.hidden = false;
    }
    else {
        mensagemVazia.hidden = true;
    }
}
function contarPorStatus(alvo) {
    return livros.filter((l) => l.status === alvo).length;
}
function renderizarResumo() {
    resumoTotal.textContent = String(livros.length);
    resumoQueroLer.textContent = String(contarPorStatus("quero-ler"));
    resumoLendo.textContent = String(contarPorStatus("lendo"));
    resumoLido.textContent = String(contarPorStatus("lido"));
}
function atualizarTela() {
    renderizarCatalogo();
    renderizarResumo();
}
// ===================== Inicialização e eventos =====================
function preencherCategorias() {
    CATEGORIAS.forEach((nome) => {
        campoCategoria.add(new Option(nome, nome));
        filtroCategoria.add(new Option(nome, nome));
    });
}
function lerFormulario() {
    return {
        titulo: campoTitulo.value.trim(),
        autor: campoAutor.value.trim(),
        categoria: campoCategoria.value,
        ano: campoAno.value.trim(),
        status: campoStatus.value,
        capa: campoCapa.value.trim(),
    };
}
formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const dados = lerFormulario();
    const erros = validarDados(dados);
    mostrarErros(erros);
    if (erros.length > 0)
        return;
    if (idEmEdicao !== null) {
        atualizarLivro(idEmEdicao, dados);
        finalizarEdicao();
    }
    else {
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
