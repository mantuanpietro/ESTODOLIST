// Seletores
const inputNovaTarefa = document.getElementById("nova-tarefa-input");
const botaoAdicionar = document.getElementById("adicionar-btn");
const listaTarefas = document.getElementById("lista-tarefas");
const inputPesquisa = document.getElementById("filtro-input");
const botoesFiltro = document.querySelectorAll(".filtro-btn");
const btnModo = document.getElementById("btn-modo");
const erroMsg = document.createElement("p"); // Novo elemento para mensagens de erro
erroMsg.className = "text-red-500 dark:text-red-400 mt-2 hidden";
document.querySelector(".flex.gap-3.items-center").appendChild(erroMsg); // Adiciona ao DOM próximo ao input

let tarefas = [];
let filtroAtual = "todas";

// Inicialização
document.addEventListener("DOMContentLoaded", function() {
  carregarTarefasSalvas();
  carregarModo();
  botoesFiltro[0].classList.add("ativo"); // Marca "TODAS" como ativo inicialmente
});

// Eventos
botaoAdicionar.addEventListener("click", adicionarTarefa);
inputNovaTarefa.addEventListener("keydown", function(e) { if(e.key==="Enter") adicionarTarefa(); });
inputPesquisa.addEventListener("input", function() { renderizarTarefas(filtroAtual, inputPesquisa.value); });

botoesFiltro.forEach(function(btn, idx) {
  btn.addEventListener("click", function() {
    botoesFiltro.forEach(function(b) { b.classList.remove("ativo"); });
    btn.classList.add("ativo");
    filtroAtual = ["todas","ativos","concluidas"][idx];
    renderizarTarefas(filtroAtual, inputPesquisa.value);
  });
});

btnModo.addEventListener("click", alternarModo);

// Funções de tarefas
function adicionarTarefa(){
  const texto = inputNovaTarefa.value.trim();
  if(!texto) {
    mostrarErro("Digite uma tarefa válida!");
    return;
  }
  tarefas.push({id: Date.now(), texto, concluida: false});
  salvarTarefas();
  renderizarTarefas(filtroAtual, inputPesquisa.value);
  inputNovaTarefa.value = "";
  esconderErro();
}

function mostrarErro(msg) {
  erroMsg.textContent = msg;
  erroMsg.classList.remove("hidden");
}

function esconderErro() {
  erroMsg.classList.add("hidden");
}

function salvarTarefas(){
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

function carregarTarefasSalvas(){
  const salvas = localStorage.getItem("tarefas");
  if(salvas) tarefas = JSON.parse(salvas);
  renderizarTarefas();
}

function renderizarTarefas(filtro, termo){
  if (filtro === undefined) filtro = "todas";
  if (termo === undefined) termo = "";
  listaTarefas.innerHTML = "";
  let filtradas = [...tarefas];

  if(filtro==="ativos") filtradas = filtradas.filter(function(t){ return !t.concluida; });
  else if(filtro==="concluidas") filtradas = filtradas.filter(function(t){ return t.concluida; });

  if(termo) filtradas = filtradas.filter(function(t){ return t.texto.toLowerCase().includes(termo.toLowerCase()); });

  filtradas.forEach(function(t){
    const li = document.createElement("li");
    li.className="flex justify-between items-center p-3 rounded-xl shadow-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition";

    const span = document.createElement("span");
    span.textContent = t.texto;
    span.setAttribute("data-id", t.id); // Corrigido: adiciona data-id para facilitar edição
    span.className = t.concluida ? "line-through text-gray-400 dark:text-gray-300 cursor-pointer" : "text-gray-800 dark:text-gray-100 cursor-pointer";
    span.addEventListener("click", function(){
      t.concluida = !t.concluida;
      salvarTarefas();
      renderizarTarefas(filtroAtual, inputPesquisa.value);
    });

    const divBotoes = document.createElement("div");

    const btnEditar = document.createElement("button");
    btnEditar.textContent="🖊";
    btnEditar.className="py-1 px-3 rounded-lg text-gray-600 dark:text-gray-200 hover:bg-yeloow-500 dark:hover:bg-yeloow-700";
    btnEditar.setAttribute("aria-label", "Editar tarefa");
    btnEditar.addEventListener("click", function(e){
      e.stopPropagation();
      editarTarefa(t); // Nova função para edição inline
    });

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent="🗑";
    btnExcluir.className="py-1 px-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700";
    btnExcluir.setAttribute("aria-label", "Excluir tarefa");
    btnExcluir.addEventListener("click", function(e){
      e.stopPropagation();
      tarefas = tarefas.filter(function(x){ return x.id !== t.id; });
      salvarTarefas();
      renderizarTarefas(filtroAtual, inputPesquisa.value);
    });

    divBotoes.appendChild(btnEditar);
    divBotoes.appendChild(btnExcluir);

    li.appendChild(span);
    li.appendChild(divBotoes);
    listaTarefas.appendChild(li);
  });
}

function editarTarefa(tarefa) {
  const span = listaTarefas.querySelector('span[data-id="' + tarefa.id + '"]'); // Corrigido: usa data-id para selecionar
  if (!span) return;
  const inputEdit = document.createElement("input");
  inputEdit.type = "text";
  inputEdit.value = tarefa.texto;
  inputEdit.className = "flex-grow p-2 border rounded";
  span.replaceWith(inputEdit);
  inputEdit.focus();
  inputEdit.addEventListener("blur", function() { salvarEdicao(inputEdit, tarefa); });
  inputEdit.addEventListener("keydown", function(e) {
    if (e.key === "Enter") salvarEdicao(inputEdit, tarefa);
    if (e.key === "Escape") cancelarEdicao(inputEdit, tarefa);
  });
}

function salvarEdicao(input, tarefa) {
  const novoTexto = input.value.trim();
  if (novoTexto) tarefa.texto = novoTexto;
  salvarTarefas();
  renderizarTarefas(filtroAtual, inputPesquisa.value);
}

function cancelarEdicao(input, tarefa) {
  renderizarTarefas(filtroAtual, inputPesquisa.value); // Re-renderiza para cancelar
}

// Funções modo claro/escuro
function alternarModo(){
  document.documentElement.classList.toggle("dark");
  const modo = document.documentElement.classList.contains("dark") ? "escuro" : "claro";
  localStorage.setItem("modo", modo);
  btnModo.textContent = modo === "escuro" ? "☀️ Claro" : "🌙 Escuro";
}

function carregarModo(){
  const modo = localStorage.getItem("modo");
  if(modo === "escuro"){
    document.documentElement.classList.add("dark");

    btnModo.textContent = "☀️ Claro";
  } else {
    document.documentElement.classList.remove("dark");
    btnModo.textContent = "🌙 Escuro";
  }
}
