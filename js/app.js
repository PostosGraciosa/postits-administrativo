/* ============================================
   POST-ITS ADMINISTRATIVOS
   SISTEMA DE LEMBRETES
============================================ */


/* ============================================
   CONFIGURAÇÕES
============================================ */

const CHAVE_STORAGE = "postits_administrativo_v1";

const TEMPO_ATUALIZACAO = 1000;

const LIMITE_PROXIMO_MINUTOS = 24 * 60;

const INTERVALO_NOTIFICACAO = 60 * 1000;


/* ============================================
   ESTADO DO SISTEMA
============================================ */

let postits = [];

let postitParaExcluir = null;

let mostrarHistorico = false;

let ultimaVerificacaoNotificacao = 0;


/* ============================================
   INICIALIZAÇÃO
============================================ */

document.addEventListener(
    "DOMContentLoaded",
    iniciarSistema
);


function iniciarSistema() {

    carregarPostits();

    configurarEventos();

    atualizarDataHora();

    atualizarInterface();

    setInterval(
        atualizarDataHora,
        TEMPO_ATUALIZACAO
    );

    setInterval(
        verificarSistema,
        TEMPO_ATUALIZACAO
    );

    verificarPermissaoNotificacao();

}


/* ============================================
   CARREGAR POST-ITS
============================================ */

function carregarPostits() {

    try {

        const dados =
            localStorage.getItem(CHAVE_STORAGE);

        if (!dados) {

            postits = [];

            return;
        }

        const dadosConvertidos =
            JSON.parse(dados);

        if (Array.isArray(dadosConvertidos)) {

            postits = dadosConvertidos;

        } else {

            postits = [];

        }

    } catch (erro) {

        console.error(
            "Erro ao carregar post-its:",
            erro
        );

        postits = [];

    }

}


/* ============================================
   SALVAR POST-ITS
============================================ */

function salvarPostits() {

    try {

        localStorage.setItem(
            CHAVE_STORAGE,
            JSON.stringify(postits)
        );

    } catch (erro) {

        console.error(
            "Erro ao salvar post-its:",
            erro
        );

        mostrarNotificacao(
            "Erro",
            "Não foi possível salvar os dados."
        );

    }

}


/* ============================================
   EVENTOS
============================================ */

function configurarEventos() {


    /* ================================
       NOVO POST-IT
    ================================= */

    document
        .getElementById("btnNovoPostit")
        ?.addEventListener(
            "click",
            () => abrirModal()
        );


    document
        .getElementById("btnNovoPostitVazio")
        ?.addEventListener(
            "click",
            () => abrirModal()
        );


    /* ================================
       FECHAR MODAL
    ================================= */

    document
        .getElementById("btnFecharModal")
        ?.addEventListener(
            "click",
            fecharModal
        );


    document
        .getElementById("btnCancelarModal")
        ?.addEventListener(
            "click",
            fecharModal
        );


    /* ================================
       FUNDO DO MODAL
    ================================= */

    document
        .querySelector("#modalPostit .modal-fundo")
        ?.addEventListener(
            "click",
            fecharModal
        );


    document
        .querySelector("#modalConfirmacao .modal-fundo")
        ?.addEventListener(
            "click",
            fecharModalConfirmacao
        );


    /* ================================
       FORMULÁRIO
    ================================= */

    document
        .getElementById("formPostit")
        ?.addEventListener(
            "submit",
            salvarFormulario
        );


    /* ================================
       PESQUISA
    ================================= */

    document
        .getElementById("campoPesquisa")
        ?.addEventListener(
            "input",
            atualizarInterface
        );


    /* ================================
       FILTROS
    ================================= */

    document
        .getElementById("filtroStatus")
        ?.addEventListener(
            "change",
            atualizarInterface
        );


    document
        .getElementById("filtroPrioridade")
        ?.addEventListener(
            "change",
            atualizarInterface
        );


    document
        .getElementById("filtroCategoria")
        ?.addEventListener(
            "change",
            atualizarInterface
        );


    /* ================================
       HISTÓRICO
    ================================= */

    document
        .getElementById("btnToggleHistorico")
        ?.addEventListener(
            "click",
            alternarHistorico
        );


    /* ================================
       EXCLUSÃO
    ================================= */

    document
        .getElementById("btnCancelarExclusao")
        ?.addEventListener(
            "click",
            fecharModalConfirmacao
        );


    document
        .getElementById("btnConfirmarExclusao")
        ?.addEventListener(
            "click",
            confirmarExclusao
        );


    /* ================================
       NOTIFICAÇÃO
    ================================= */

    document
        .getElementById("btnFecharNotificacao")
        ?.addEventListener(
            "click",
            esconderNotificacao
        );


    /* ================================
       TECLA ESC
    ================================= */

    document.addEventListener(
        "keydown",
        function (evento) {

            if (evento.key !== "Escape") {
                return;
            }

            fecharModal();

            fecharModalConfirmacao();

        }
    );

}


/* ============================================
   DATA E HORA
============================================ */

function atualizarDataHora() {

    const agora = new Date();


    /* ================================
       DIA DA SEMANA
    ================================= */

    const dias = [
        "domingo",
        "segunda-feira",
        "terça-feira",
        "quarta-feira",
        "quinta-feira",
        "sexta-feira",
        "sábado"
    ];


    const elementoDia =
        document.getElementById("diaSemana");


    if (elementoDia) {

        elementoDia.textContent =
            dias[agora.getDay()];

    }


    /* ================================
       DATA
    ================================= */

    const elementoData =
        document.getElementById("dataAtual");


    if (elementoData) {

        elementoData.textContent =
            formatarData(agora);

    }


    /* ================================
       HORA
    ================================= */

    const elementoHora =
        document.getElementById("horaAtual");


    if (elementoHora) {

        elementoHora.textContent =
            formatarHora(agora);

    }

}


/* ============================================
   VERIFICAÇÃO AUTOMÁTICA
============================================ */

function verificarSistema() {

    atualizarInterface();

    verificarNotificacoes();

}


/* ============================================
   ABRIR MODAL
============================================ */

function abrirModal(id = null) {

    const modal =
        document.getElementById("modalPostit");

    const tituloModal =
        document.getElementById("tituloModal");

    const formulario =
        document.getElementById("formPostit");


    if (!modal || !formulario) {
        return;
    }


    formulario.reset();


    document.getElementById(
        "postitId"
    ).value = "";


    if (id) {

        const postit =
            postits.find(
                item => item.id === id
            );


        if (!postit) {
            return;
        }


        tituloModal.textContent =
            "Editar Post-it";


        document.getElementById(
            "postitId"
        ).value = postit.id;


        document.getElementById(
            "titulo"
        ).value = postit.titulo || "";


        document.getElementById(
            "descricao"
        ).value = postit.descricao || "";


        document.getElementById(
            "data"
        ).value = postit.data || "";


        document.getElementById(
            "hora"
        ).value = postit.hora || "";


        document.getElementById(
            "prioridade"
        ).value =
            postit.prioridade || "normal";


        document.getElementById(
            "categoria"
        ).value =
            postit.categoria || "administrativo";


        document.getElementById(
            "aviso"
        ).value =
            String(postit.aviso ?? 30);

    } else {

        tituloModal.textContent =
            "Novo Post-it";


        const agora = new Date();


        document.getElementById(
            "data"
        ).value =
            formatarDataInput(agora);


        document.getElementById(
            "hora"
        ).value =
            formatarHoraInput(agora);

    }


    modal.classList.add("aberto");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    setTimeout(
        () => {

            document
                .getElementById("titulo")
                ?.focus();

        },
        100
    );

}


/* ============================================
   FECHAR MODAL
============================================ */

function fecharModal() {

    const modal =
        document.getElementById("modalPostit");


    if (!modal) {
        return;
    }


    modal.classList.remove("aberto");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* ============================================
   SALVAR FORMULÁRIO
============================================ */

function salvarFormulario(evento) {

    evento.preventDefault();


    const id =
        document
            .getElementById("postitId")
            .value;


    const titulo =
        document
            .getElementById("titulo")
            .value
            .trim();


    const descricao =
        document
            .getElementById("descricao")
            .value
            .trim();


    const data =
        document
            .getElementById("data")
            .value;


    const hora =
        document
            .getElementById("hora")
            .value;


    const prioridade =
        document
            .getElementById("prioridade")
            .value;


    const categoria =
        document
            .getElementById("categoria")
            .value;


    const aviso =
        Number(
            document
                .getElementById("aviso")
                .value
        );


    if (!titulo) {

        mostrarNotificacao(
            "Atenção",
            "Digite um título para o post-it."
        );

        return;
    }


    if (!data) {

        mostrarNotificacao(
            "Atenção",
            "Informe a data."
        );

        return;
    }


    if (!hora) {

        mostrarNotificacao(
            "Atenção",
            "Informe o horário."
        );

        return;
    }


    /* ================================
       EDITAR
    ================================= */

    if (id) {

        const indice =
            postits.findIndex(
                item => item.id === id
            );


        if (indice !== -1) {

            postits[indice].titulo =
                titulo;

            postits[indice].descricao =
                descricao;

            postits[indice].data =
                data;

            postits[indice].hora =
                hora;

            postits[indice].prioridade =
                prioridade;

            postits[indice].categoria =
                categoria;

            postits[indice].aviso =
                aviso;

            postits[indice].atualizadoEm =
                new Date().toISOString();

        }

        mostrarNotificacao(
            "Post-it atualizado",
            titulo
        );

    }


    /* ================================
       NOVO
    ================================= */

    else {

        const novoPostit = {

            id: gerarId(),

            titulo,

            descricao,

            data,

            hora,

            prioridade,

            categoria,

            aviso,

            concluido: false,

            criadoEm:
                new Date().toISOString(),

            atualizadoEm:
                new Date().toISOString(),

            concluidoEm: null

        };


        postits.push(novoPostit);


        mostrarNotificacao(
            "Post-it criado",
            titulo
        );

    }


    salvarPostits();

    fecharModal();

    atualizarInterface();

}


/* ============================================
   ATUALIZAR INTERFACE
============================================ */

function atualizarInterface() {

    atualizarResumo();

    atualizarPostits();

    atualizarHistorico();

}


/* ============================================
   ATUALIZAR RESUMO
============================================ */

function atualizarResumo() {

    const ativos =
        postits.filter(
            postit => !postit.concluido
        );


    const atrasados =
        ativos.filter(
            postit =>
                obterStatus(postit) === "atrasado"
        );


    const hoje =
        ativos.filter(
            postit =>
                obterStatus(postit) === "hoje"
        );


    const proximos =
        ativos.filter(
            postit =>
                obterStatus(postit) === "proximo"
        );


    const concluidos =
        postits.filter(
            postit => postit.concluido
        );


    definirTexto(
        "totalPostits",
        ativos.length
    );


    definirTexto(
        "totalAtrasados",
        atrasados.length
    );


    definirTexto(
        "totalHoje",
        hoje.length
    );


    definirTexto(
        "totalProximos",
        proximos.length
    );


    definirTexto(
        "totalConcluidos",
        concluidos.length
    );

}


/* ============================================
   ATUALIZAR POST-ITS
============================================ */

function atualizarPostits() {

    const container =
        document.getElementById(
            "listaPostits"
        );


    const estadoVazio =
        document.getElementById(
            "estadoVazio"
        );


    if (!container) {
        return;
    }


    const resultados =
        filtrarPostits();


    container.innerHTML = "";


    resultados.forEach(
        postit => {

            container.appendChild(
                criarElementoPostit(postit)
            );

        }
    );


    const quantidade =
        resultados.length;


    definirTexto(
        "contadorExibidos",
        quantidade === 1
            ? "1 registro"
            : `${quantidade} registros`
    );


    if (estadoVazio) {

        estadoVazio.classList.toggle(
            "visivel",
            quantidade === 0
        );

    }

}


/* ============================================
   FILTRAR POST-ITS
============================================ */

function filtrarPostits() {

    const campoPesquisa =
        document.getElementById(
            "campoPesquisa"
        );


    const filtroStatus =
        document.getElementById(
            "filtroStatus"
        );


    const filtroPrioridade =
        document.getElementById(
            "filtroPrioridade"
        );


    const filtroCategoria =
        document.getElementById(
            "filtroCategoria"
        );


    const pesquisa =
        (
            campoPesquisa?.value || ""
        )
            .trim()
            .toLowerCase();


    const statusSelecionado =
        filtroStatus?.value || "todos";


    const prioridadeSelecionada =
        filtroPrioridade?.value || "todas";


    const categoriaSelecionada =
        filtroCategoria?.value || "todas";


    let resultados =
        [...postits];


    /* ================================
       PESQUISA
    ================================= */

    if (pesquisa) {

        resultados =
            resultados.filter(
                postit => {

                    const texto = [

                        postit.titulo,

                        postit.descricao,

                        postit.categoria,

                        postit.prioridade

                    ]
                        .join(" ")
                        .toLowerCase();


                    return texto.includes(
                        pesquisa
                    );

                }
            );

    }


    /* ================================
       STATUS
    ================================= */

    if (statusSelecionado !== "todos") {

        resultados =
            resultados.filter(
                postit => {

                    if (
                        statusSelecionado ===
                        "concluido"
                    ) {

                        return postit.concluido;

                    }


                    if (postit.concluido) {
                        return false;
                    }


                    return (
                        obterStatus(postit) ===
                        statusSelecionado
                    );

                }
            );

    }


    /* ================================
       PRIORIDADE
    ================================= */

    if (
        prioridadeSelecionada !==
        "todas"
    ) {

        resultados =
            resultados.filter(
                postit =>
                    postit.prioridade ===
                    prioridadeSelecionada
            );

    }


    /* ================================
       CATEGORIA
    ================================= */

    if (
        categoriaSelecionada !==
        "todas"
    ) {

        resultados =
            resultados.filter(
                postit =>
                    postit.categoria ===
                    categoriaSelecionada
            );

    }


    /* ================================
       ORDEM
    ================================= */

    resultados.sort(
        compararPostits
    );


    return resultados;

}


/* ============================================
   ORDENAR POST-ITS
============================================ */

function compararPostits(a, b) {

    if (
        a.concluido &&
        !b.concluido
    ) {

        return 1;

    }


    if (
        !a.concluido &&
        b.concluido
    ) {

        return -1;

    }


    if (
        !a.concluido &&
        !b.concluido
    ) {

        const statusA =
            obterStatus(a);

        const statusB =
            obterStatus(b);


        const ordemStatus = {

            atrasado: 1,

            hoje: 2,

            proximo: 3,

            pendente: 4

        };


        const diferencaStatus =
            (
                ordemStatus[statusA] || 99
            ) -
            (
                ordemStatus[statusB] || 99
            );


        if (diferencaStatus !== 0) {

            return diferencaStatus;

        }

    }


    return obterDataHora(a) -
        obterDataHora(b);

}


/* ============================================
   CRIAR ELEMENTO POST-IT
============================================ */

function criarElementoPostit(postit) {

    const elemento =
        document.createElement("article");


    const status =
        postit.concluido
            ? "concluido"
            : obterStatus(postit);


    elemento.className =
        `postit ${status}`;


    const prioridade =
        obterTextoPrioridade(
            postit.prioridade
        );


    const categoria =
        obterTextoCategoria(
            postit.categoria
        );


    const statusInfo =
        obterTextoStatus(
            status,
            postit
        );


    elemento.innerHTML = `

        <div class="postit-cabecalho">

            <h3 class="postit-titulo">
                ${escaparHTML(postit.titulo)}
            </h3>

            <span class="
                postit-prioridade
                prioridade-${postit.prioridade}
            ">
                ${prioridade}
            </span>

        </div>


        <div class="postit-descricao">

            ${
                postit.descricao
                    ? escaparHTML(
                        postit.descricao
                    )
                    : "Sem descrição."
            }

        </div>


        <div class="postit-informacoes">

            <div class="postit-info">

                <span class="icone">
                    📅
                </span>

                <span>
                    <strong>
                        ${formatarDataBR(
                            postit.data
                        )}
                    </strong>
                </span>

            </div>


            <div class="postit-info">

                <span class="icone">
                    ⏰
                </span>

                <span>
                    <strong>
                        ${postit.hora}
                    </strong>

                    ${
                        obterTempoRestante(
                            postit
                        )
                    }
                </span>

            </div>


            <div class="postit-info">

                <span class="icone">
                    📂
                </span>

                <span>
                    ${categoria}
                </span>

            </div>

        </div>


        <span class="
            postit-status
            status-${status}
        ">
            ${statusInfo}
        </span>


        <div class="postit-acoes">

            ${
                postit.concluido

                    ? `
                        <button
                            type="button"
                            class="btn-editar"
                            data-acao="editar"
                            data-id="${postit.id}"
                        >
                            ✏️ Editar
                        </button>

                        <button
                            type="button"
                            class="btn-excluir"
                            data-acao="excluir"
                            data-id="${postit.id}"
                        >
                            🗑️ Excluir
                        </button>
                    `

                    : `
                        <button
                            type="button"
                            class="btn-concluir"
                            data-acao="concluir"
                            data-id="${postit.id}"
                        >
                            ✅ Concluir
                        </button>

                        <button
                            type="button"
                            class="btn-editar"
                            data-acao="editar"
                            data-id="${postit.id}"
                        >
                            ✏️ Editar
                        </button>

                        <button
                            type="button"
                            class="btn-excluir"
                            data-acao="excluir"
                            data-id="${postit.id}"
                        >
                            🗑️ Excluir
                        </button>
                    `
            }

        </div>

    `;


    elemento
        .querySelectorAll(
            "[data-acao]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    function () {

                        const acao =
                            this.dataset.acao;

                        const id =
                            this.dataset.id;


                        executarAcao(
                            acao,
                            id
                        );

                    }
                );

            }
        );


    return elemento;

}


/* ============================================
   EXECUTAR AÇÃO
============================================ */

function executarAcao(
    acao,
    id
) {

    switch (acao) {

        case "concluir":

            concluirPostit(id);

            break;


        case "editar":

            abrirModal(id);

            break;


        case "excluir":

            abrirConfirmacaoExclusao(id);

            break;

    }

}


/* ============================================
   CONCLUIR POST-IT
============================================ */

function concluirPostit(id) {

    const postit =
        postits.find(
            item => item.id === id
        );


    if (!postit) {
        return;
    }


    postit.concluido = true;

    postit.concluidoEm =
        new Date().toISOString();


    postit.atualizadoEm =
        new Date().toISOString();


    salvarPostits();

    atualizarInterface();


    mostrarNotificacao(
        "Concluído",
        `${postit.titulo} foi concluído.`
    );

}


/* ============================================
   REABRIR POST-IT
============================================ */

function reabrirPostit(id) {

    const postit =
        postits.find(
            item => item.id === id
        );


    if (!postit) {
        return;
    }


    postit.concluido = false;

    postit.concluidoEm = null;

    postit.atualizadoEm =
        new Date().toISOString();


    salvarPostits();

    atualizarInterface();

}


/* ============================================
   MODAL DE EXCLUSÃO
============================================ */

function abrirConfirmacaoExclusao(id) {

    postitParaExcluir = id;


    const modal =
        document.getElementById(
            "modalConfirmacao"
        );


    if (!modal) {
        return;
    }


    modal.classList.add("aberto");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


function fecharModalConfirmacao() {

    const modal =
        document.getElementById(
            "modalConfirmacao"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove("aberto");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    postitParaExcluir = null;

}


/* ============================================
   CONFIRMAR EXCLUSÃO
============================================ */

function confirmarExclusao() {

    if (!postitParaExcluir) {
        return;
    }


    const postit =
        postits.find(
            item =>
                item.id ===
                postitParaExcluir
        );


    if (!postit) {

        fecharModalConfirmacao();

        return;
    }


    postits =
        postits.filter(
            item =>
                item.id !==
                postitParaExcluir
        );


    salvarPostits();

    atualizarInterface();

    fecharModalConfirmacao();


    mostrarNotificacao(
        "Post-it excluído",
        postit.titulo
    );

}


/* ============================================
   HISTÓRICO
============================================ */

function alternarHistorico() {

    mostrarHistorico =
        !mostrarHistorico;


    const lista =
        document.getElementById(
            "historicoLista"
        );


    const botao =
        document.getElementById(
            "btnToggleHistorico"
        );


    if (!lista || !botao) {
        return;
    }


    lista.classList.toggle(
        "visivel",
        mostrarHistorico
    );


    botao.textContent =
        mostrarHistorico
            ? "Ocultar histórico"
            : "Mostrar histórico";


    if (mostrarHistorico) {

        atualizarHistorico();

    }

}


/* ============================================
   ATUALIZAR HISTÓRICO
============================================ */

function atualizarHistorico() {

    const lista =
        document.getElementById(
            "historicoLista"
        );


    if (!lista) {
        return;
    }


    lista.innerHTML = "";


    if (!mostrarHistorico) {
        return;
    }


    const concluidos =
        postits
            .filter(
                postit =>
                    postit.concluido
            )
            .sort(
                (a, b) =>
                    new Date(
                        b.concluidoEm
                    ) -
                    new Date(
                        a.concluidoEm
                    )
            );


    if (concluidos.length === 0) {

        lista.innerHTML = `

            <div class="historico-item">

                <div class="historico-icone">
                    📋
                </div>

                <div class="historico-info">

                    <strong>
                        Nenhum registro concluído
                    </strong>

                    <span>
                        Os post-its concluídos aparecerão aqui.
                    </span>

                </div>

            </div>

        `;

        return;
    }


    concluidos.forEach(
        postit => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "historico-item";


            item.innerHTML = `

                <div class="historico-icone">
                    ✅
                </div>

                <div class="historico-info">

                    <strong>
                        ${escaparHTML(
                            postit.titulo
                        )}
                    </strong>

                    <span>
                        Concluído em
                        ${
                            formatarDataHora(
                                postit.concluidoEm
                            )
                        }
                    </span>

                </div>

            `;


            lista.appendChild(item);

        }
    );

}


/* ============================================
   STATUS DO POST-IT
============================================ */

function obterStatus(postit) {

    if (postit.concluido) {

        return "concluido";

    }


    const dataHora =
        obterDataHora(postit);


    const agora =
        new Date();


    const diferenca =
        dataHora.getTime() -
        agora.getTime();


    const minutos =
        diferenca /
        1000 /
        60;


    if (minutos < 0) {

        return "atrasado";

    }


    const dataHoje =
        formatarDataInput(agora);


    if (postit.data === dataHoje) {

        return "hoje";

    }


    if (
        minutos <=
        LIMITE_PROXIMO_MINUTOS
    ) {

        return "proximo";

    }


    return "pendente";

}


/* ============================================
   TEXTO DO STATUS
============================================ */

function obterTextoStatus(
    status,
    postit
) {

    switch (status) {

        case "atrasado":

            return "🔴 Atrasado";


        case "hoje":

            return "🟠 Hoje";


        case "proximo":

            return "🔵 Próximo";


        case "concluido":

            return "🟢 Concluído";


        default:

            return "🟡 Pendente";

    }

}


/* ============================================
   TEMPO RESTANTE
============================================ */

function obterTempoRestante(postit) {

    if (postit.concluido) {

        return "";

    }


    const dataHora =
        obterDataHora(postit);


    const agora =
        new Date();


    const diferenca =
        dataHora.getTime() -
        agora.getTime();


    const minutos =
        Math.floor(
            Math.abs(diferenca) /
            1000 /
            60
        );


    if (diferenca < 0) {

        if (minutos < 60) {

            return `
                <span>
                    • atrasado há ${minutos} min
                </span>
            `;

        }


        const horas =
            Math.floor(
                minutos / 60
            );


        return `
            <span>
                • atrasado há ${horas}h
            </span>
        `;

    }


    if (minutos === 0) {

        return `
            <span>
                • agora
            </span>
        `;

    }


    if (minutos < 60) {

        return `
            <span>
                • em ${minutos} min
            </span>
        `;

    }


    const horas =
        Math.floor(
            minutos / 60
        );


    if (horas < 24) {

        return `
            <span>
                • em ${horas}h
            </span>
        `;

    }


    const dias =
        Math.floor(
            horas / 24
        );


    return `
        <span>
            • em ${dias} dia${dias !== 1 ? "s" : ""}
        </span>
    `;

}


/* ============================================
   NOTIFICAÇÕES DO NAVEGADOR
============================================ */

function verificarPermissaoNotificacao() {

    if (
        !("Notification" in window)
    ) {

        return;

    }


    if (
        Notification.permission ===
        "default"
    ) {

        /*
            O navegador só solicita
            permissão quando o usuário
            interagir com o sistema.
        */

        return;

    }

}


function solicitarPermissaoNotificacao() {

    if (
        !("Notification" in window)
    ) {

        mostrarNotificacao(
            "Notificações",
            "Seu navegador não suporta notificações."
        );

        return;

    }


    if (
        Notification.permission ===
        "granted"
    ) {

        mostrarNotificacao(
            "Notificações ativadas",
            "Você receberá avisos dos seus lembretes."
        );

        return;

    }


    Notification.requestPermission()
        .then(
            permissao => {

                if (
                    permissao ===
                    "granted"
                ) {

                    mostrarNotificacao(
                        "Notificações ativadas",
                        "Os avisos estão habilitados."
                    );

                }

            }
        );

}


/* ============================================
   VERIFICAR NOTIFICAÇÕES
============================================ */

function verificarNotificacoes() {

    const agoraTimestamp =
        Date.now();


    if (
        agoraTimestamp -
        ultimaVerificacaoNotificacao
        <
        INTERVALO_NOTIFICACAO
    ) {

        return;

    }


    ultimaVerificacaoNotificacao =
        agoraTimestamp;


    const agora =
        new Date();


    postits
        .filter(
            postit =>
                !postit.concluido
        )
        .forEach(
            postit => {

                verificarNotificacaoPostit(
                    postit,
                    agora
                );

            }
        );

}


/* ============================================
   VERIFICAR NOTIFICAÇÃO DO POST-IT
============================================ */

function verificarNotificacaoPostit(
    postit,
    agora
) {

    const dataHora =
        obterDataHora(postit);


    const diferenca =
        dataHora.getTime() -
        agora.getTime();


    const minutos =
        diferenca /
        1000 /
        60;


    const aviso =
        Number(postit.aviso || 0);


    if (
        minutos >= 0 &&
        minutos <= aviso
    ) {

        const chave =
            `notificacao_${postit.id}_${postit.data}_${postit.hora}`;


        const jaNotificado =
            localStorage.getItem(chave);


        if (jaNotificado) {
            return;
        }


        localStorage.setItem(
            chave,
            "true"
        );


        const mensagem =
            minutos <= 1
                ? "Seu lembrete está começando agora."
                : `Começa em aproximadamente ${Math.ceil(minutos)} minutos.`;


        mostrarNotificacao(
            `🔔 ${postit.titulo}`,
            mensagem
        );


        enviarNotificacaoNavegador(
            postit.titulo,
            mensagem
        );

    }

}


/* ============================================
   NOTIFICAÇÃO DO NAVEGADOR
============================================ */

function enviarNotificacaoNavegador(
    titulo,
    mensagem
) {

    if (
        !("Notification" in window)
    ) {

        return;

    }


    if (
        Notification.permission !==
        "granted"
    ) {

        return;

    }


    try {

        new Notification(
            titulo,
            {
                body: mensagem,
                icon: "📝"
            }
        );

    } catch (erro) {

        console.warn(
            "Não foi possível criar notificação:",
            erro
        );

    }

}


/* ============================================
   NOTIFICAÇÃO INTERNA
============================================ */

let temporizadorNotificacao = null;


function mostrarNotificacao(
    titulo,
    mensagem
) {

    const notificacao =
        document.getElementById(
            "notificacao"
        );


    const tituloElemento =
        document.getElementById(
            "notificacaoTitulo"
        );


    const mensagemElemento =
        document.getElementById(
            "notificacaoMensagem"
        );


    if (
        !notificacao ||
        !tituloElemento ||
        !mensagemElemento
    ) {

        return;

    }


    tituloElemento.textContent =
        titulo;


    mensagemElemento.textContent =
        mensagem;


    notificacao.classList.add(
        "visivel"
    );


    clearTimeout(
        temporizadorNotificacao
    );


    temporizadorNotificacao =
        setTimeout(
            esconderNotificacao,
            6000
        );

}


function esconderNotificacao() {

    const notificacao =
        document.getElementById(
            "notificacao"
        );


    if (!notificacao) {
        return;
    }


    notificacao.classList.remove(
        "visivel"
    );

}


/* ============================================
   UTILITÁRIOS
============================================ */

function gerarId() {

    if (
        window.crypto &&
        crypto.randomUUID
    ) {

        return crypto.randomUUID();

    }


    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2)
    );

}


/* ============================================
   DATA DO POST-IT
============================================ */

function obterDataHora(postit) {

    if (
        !postit.data ||
        !postit.hora
    ) {

        return new Date(0);

    }


    const [
        ano,
        mes,
        dia
    ] =
        postit.data
            .split("-")
            .map(Number);


    const [
        hora,
        minuto
    ] =
        postit.hora
            .split(":")
            .map(Number);


    return new Date(
        ano,
        mes - 1,
        dia,
        hora,
        minuto,
        0,
        0
    );

}


/* ============================================
   FORMATAÇÃO DE DATA
============================================ */

function formatarData(data) {

    return data.toLocaleDateString(
        "pt-BR"
    );

}


function formatarDataBR(dataString) {

    if (!dataString) {
        return "--/--/----";
    }


    const partes =
        dataString.split("-");


    if (partes.length !== 3) {

        return dataString;

    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


function formatarDataInput(data) {

    const ano =
        data.getFullYear();


    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");


    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");


    return `${ano}-${mes}-${dia}`;

}


/* ============================================
   FORMATAÇÃO DE HORA
============================================ */

function formatarHora(data) {

    return data.toLocaleTimeString(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function formatarHoraInput(data) {

    const hora =
        String(
            data.getHours()
        ).padStart(2, "0");


    const minuto =
        String(
            data.getMinutes()
        ).padStart(2, "0");


    return `${hora}:${minuto}`;

}


/* ============================================
   DATA + HORA
============================================ */

function formatarDataHora(valor) {

    if (!valor) {
        return "--/--/---- --:--";
    }


    const data =
        new Date(valor);


    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return "--/--/---- --:--";

    }


    return `${formatarData(data)} às ${formatarHora(data)}`;

}


/* ============================================
   TEXTOS
============================================ */

function obterTextoPrioridade(
    prioridade
) {

    const textos = {

        urgente: "Urgente",

        importante: "Importante",

        normal: "Normal",

        baixa: "Baixa"

    };


    return (
        textos[prioridade] ||
        "Normal"
    );

}


function obterTextoCategoria(
    categoria
) {

    const textos = {

        administrativo:
            "Administrativo",

        financeiro:
            "Financeiro",

        rh:
            "RH",

        pista:
            "Pista",

        conveniencia:
            "Loja de Conveniência",

        outros:
            "Outros"

    };


    return (
        textos[categoria] ||
        "Outros"
    );

}


/* ============================================
   ESCAPAR HTML
============================================ */

function escaparHTML(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(valor)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ============================================
   DEFINIR TEXTO
============================================ */

function definirTexto(
    id,
    texto
) {

    const elemento =
        document.getElementById(id);


    if (elemento) {

        elemento.textContent =
            texto;

    }

}


/* ============================================
   EXPOSIÇÃO PARA DEBUG
============================================ */

window.PostitsApp = {

    listar: () =>
        [...postits],

    salvar: salvarPostits,

    recarregar: () => {

        carregarPostits();

        atualizarInterface();

    },

    limparTudo: () => {

        localStorage.removeItem(
            CHAVE_STORAGE
        );

        postits = [];

        atualizarInterface();

    }

};
