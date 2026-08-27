/* ============================================
   POST-ITS ADMINISTRATIVOS
   SISTEMA DE LEMBRETES
============================================ */


/* ============================================
   CONFIGURAÇÕES
============================================ */

const CHAVE_STORAGE =
    "postits_administrativo_v1";


const TEMPO_ATUALIZACAO =
    1000;


const LIMITE_PROXIMO_MINUTOS =
    24 * 60;


const INTERVALO_NOTIFICACAO =
    60 * 1000;


/* ============================================
   ESTADO
============================================ */

let postits = [];

let postitParaExcluir = null;

let mostrarHistorico = false;

let ultimaVerificacaoNotificacao = 0;

let temporizadorNotificacao = null;


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

    verificarPermissaoNotificacao();


    setInterval(
        atualizarDataHora,
        TEMPO_ATUALIZACAO
    );


    setInterval(
        verificarSistema,
        TEMPO_ATUALIZACAO
    );

}


/* ============================================
   CARREGAR
============================================ */

function carregarPostits() {

    try {

        const dados =
            localStorage.getItem(
                CHAVE_STORAGE
            );


        if (!dados) {

            postits = [];

            return;

        }


        const convertidos =
            JSON.parse(dados);


        postits =
            Array.isArray(convertidos)
                ? convertidos
                : [];


    } catch (erro) {

        console.error(
            "Erro ao carregar:",
            erro
        );

        postits = [];

    }

}


/* ============================================
   SALVAR
============================================ */

function salvarPostits() {

    try {

        localStorage.setItem(
            CHAVE_STORAGE,
            JSON.stringify(postits)
        );

    } catch (erro) {

        console.error(
            "Erro ao salvar:",
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


    document
        .querySelector(
            "#modalPostit .modal-fundo"
        )
        ?.addEventListener(
            "click",
            fecharModal
        );


    document
        .querySelector(
            "#modalConfirmacao .modal-fundo"
        )
        ?.addEventListener(
            "click",
            fecharModalConfirmacao
        );


    document
        .getElementById("formPostit")
        ?.addEventListener(
            "submit",
            salvarFormulario
        );


    document
        .getElementById("campoPesquisa")
        ?.addEventListener(
            "input",
            atualizarInterface
        );


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


    document
        .getElementById("btnToggleHistorico")
        ?.addEventListener(
            "click",
            alternarHistorico
        );


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


    document
        .getElementById("btnFecharNotificacao")
        ?.addEventListener(
            "click",
            esconderNotificacao
        );


    document
        .getElementById("btnAtivarNotificacoes")
        ?.addEventListener(
            "click",
            solicitarPermissaoNotificacao
        );


    document.addEventListener(
        "keydown",
        function (evento) {

            if (
                evento.key ===
                "Escape"
            ) {

                fecharModal();

                fecharModalConfirmacao();

            }

        }
    );

}


/* ============================================
   DATA E HORA
============================================ */

function atualizarDataHora() {

    const agora = new Date();


    const dias = [

        "domingo",

        "segunda-feira",

        "terça-feira",

        "quarta-feira",

        "quinta-feira",

        "sexta-feira",

        "sábado"

    ];


    const dia =
        document.getElementById(
            "diaSemana"
        );


    const data =
        document.getElementById(
            "dataAtual"
        );


    const hora =
        document.getElementById(
            "horaAtual"
        );


    if (dia) {

        dia.textContent =
            dias[
                agora.getDay()
            ];

    }


    if (data) {

        data.textContent =
            formatarData(
                agora
            );

    }


    if (hora) {

        hora.textContent =
            formatarHora(
                agora
            );

    }

}


/* ============================================
   VERIFICAÇÃO
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
        document.getElementById(
            "modalPostit"
        );


    const formulario =
        document.getElementById(
            "formPostit"
        );


    const tituloModal =
        document.getElementById(
            "tituloModal"
        );


    if (
        !modal ||
        !formulario
    ) {

        return;

    }


    formulario.reset();


    document.getElementById(
        "postitId"
    ).value = "";


    if (id) {

        const postit =
            postits.find(
                item =>
                    item.id === id
            );


        if (!postit) {
            return;
        }


        tituloModal.textContent =
            "Editar Post-it";


        document.getElementById(
            "postitId"
        ).value =
            postit.id;


        document.getElementById(
            "titulo"
        ).value =
            postit.titulo || "";


        document.getElementById(
            "descricao"
        ).value =
            postit.descricao || "";


        document.getElementById(
            "data"
        ).value =
            postit.data || "";


        document.getElementById(
            "hora"
        ).value =
            postit.hora || "";


        document.getElementById(
            "prioridade"
        ).value =
            postit.prioridade ||
            "normal";


        document.getElementById(
            "categoria"
        ).value =
            postit.categoria ||
            "administrativo";


        document.getElementById(
            "aviso"
        ).value =
            String(
                postit.aviso ?? 10
            );

    } else {

        tituloModal.textContent =
            "Novo Post-it";


        const agora =
            new Date();


        document.getElementById(
            "data"
        ).value =
            formatarDataInput(
                agora
            );


        document.getElementById(
            "hora"
        ).value =
            formatarHoraInput(
                agora
            );

    }


    modal.classList.add(
        "aberto"
    );


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
        document.getElementById(
            "modalPostit"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "aberto"
    );


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
            "Digite um título."
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


    if (id) {

        const indice =
            postits.findIndex(
                item =>
                    item.id === id
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
                new Date()
                    .toISOString();

        }


        mostrarNotificacao(
            "Post-it atualizado",
            titulo
        );

    } else {

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
                new Date()
                    .toISOString(),

            atualizadoEm:
                new Date()
                    .toISOString(),

            concluidoEm: null

        };


        postits.push(
            novoPostit
        );


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
   INTERFACE
============================================ */

function atualizarInterface() {

    atualizarResumo();

    atualizarPostits();

    atualizarHistorico();

}


/* ============================================
   RESUMO
============================================ */

function atualizarResumo() {

    const ativos =
        postits.filter(
            postit =>
                !postit.concluido
        );


    const atrasados =
        ativos.filter(
            postit =>
                obterStatus(
                    postit
                ) === "atrasado"
        );


    const hoje =
        ativos.filter(
            postit =>
                obterStatus(
                    postit
                ) === "hoje"
        );


    const proximos =
        ativos.filter(
            postit =>
                obterStatus(
                    postit
                ) === "proximo"
        );


    const concluidos =
        postits.filter(
            postit =>
                postit.concluido
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
   LISTA
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
                criarElementoPostit(
                    postit
                )
            );

        }
    );


    definirTexto(
        "contadorExibidos",
        resultados.length === 1
            ? "1 registro"
            : `${resultados.length} registros`
    );


    if (estadoVazio) {

        estadoVazio.classList.toggle(
            "visivel",
            resultados.length === 0
        );

    }

}


/* ============================================
   FILTROS
============================================ */

function filtrarPostits() {

    const pesquisa =
        (
            document
                .getElementById(
                    "campoPesquisa"
                )
                ?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const statusSelecionado =
        document
            .getElementById(
                "filtroStatus"
            )
            ?.value ||
        "todos";


    const prioridadeSelecionada =
        document
            .getElementById(
                "filtroPrioridade"
            )
            ?.value ||
        "todas";


    const categoriaSelecionada =
        document
            .getElementById(
                "filtroCategoria"
            )
            ?.value ||
        "todas";


    let resultados =
        [...postits];


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


    if (
        statusSelecionado !==
        "todos"
    ) {

        resultados =
            resultados.filter(
                postit => {

                    if (
                        statusSelecionado ===
                        "concluido"
                    ) {

                        return postit.concluido;

                    }


                    if (
                        postit.concluido
                    ) {

                        return false;

                    }


                    return (
                        obterStatus(
                            postit
                        ) ===
                        statusSelecionado
                    );

                }
            );

    }


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


    resultados.sort(
        compararPostits
    );


    return resultados;

}


/* ============================================
   ORDENAÇÃO
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

        const ordem = {

            atrasado: 1,

            hoje: 2,

            proximo: 3,

            pendente: 4

        };


        const diferenca =
            (
                ordem[
                    obterStatus(a)
                ] || 99
            ) -
            (
                ordem[
                    obterStatus(b)
                ] || 99
            );


        if (diferenca !== 0) {

            return diferenca;

        }

    }


    return (
        obterDataHora(a) -
        obterDataHora(b)
    );

}


/* ============================================
   CRIAR POST-IT
============================================ */

function criarElementoPostit(
    postit
) {

    const elemento =
        document.createElement(
            "article"
        );


    const status =
        postit.concluido
            ? "concluido"
            : obterStatus(
                postit
            );


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
            status
        );


    elemento.innerHTML = `

        <div class="postit-cabecalho">

            <h3 class="postit-titulo">
                ${escaparHTML(
                    postit.titulo
                )}
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

                    ${obterTempoRestante(
                        postit
                    )}

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

                        executarAcao(
                            this.dataset.acao,
                            this.dataset.id
                        );

                    }
                );

            }
        );


    return elemento;

}


/* ============================================
   AÇÕES
============================================ */

function executarAcao(
    acao,
    id
) {

    if (
        acao === "concluir"
    ) {

        concluirPostit(id);

        return;

    }


    if (
        acao === "editar"
    ) {

        abrirModal(id);

        return;

    }


    if (
        acao === "excluir"
    ) {

        abrirConfirmacaoExclusao(id);

    }

}


/* ============================================
   CONCLUIR
============================================ */

function concluirPostit(id) {

    const postit =
        postits.find(
            item =>
                item.id === id
        );


    if (!postit) {
        return;
    }


    postit.concluido =
        true;


    postit.concluidoEm =
        new Date()
            .toISOString();


    postit.atualizadoEm =
        new Date()
            .toISOString();


    salvarPostits();

    atualizarInterface();


    mostrarNotificacao(
        "✅ Concluído",
        `${postit.titulo} foi concluído.`
    );

}


/* ============================================
   REABRIR
============================================ */

function reabrirPostit(id) {

    const postit =
        postits.find(
            item =>
                item.id === id
        );


    if (!postit) {
        return;
    }


    postit.concluido =
        false;


    postit.concluidoEm =
        null;


    postit.atualizadoEm =
        new Date()
            .toISOString();


    salvarPostits();

    atualizarInterface();

}


/* ============================================
   EXCLUSÃO
============================================ */

function abrirConfirmacaoExclusao(
    id
) {

    postitParaExcluir =
        id;


    const modal =
        document.getElementById(
            "modalConfirmacao"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "aberto"
    );


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


    modal.classList.remove(
        "aberto"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    postitParaExcluir =
        null;

}


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


    if (
        concluidos.length === 0
    ) {

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
                        ${formatarDataHora(
                            postit.concluidoEm
                        )}
                    </span>

                </div>

            `;


            lista.appendChild(
                item
            );

        }
    );

}


/* ============================================
   STATUS
============================================ */

function obterStatus(postit) {

    if (postit.concluido) {

        return "concluido";

    }


    const dataHora =
        obterDataHora(
            postit
        );


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
        formatarDataInput(
            agora
        );


    if (
        postit.data ===
        dataHoje
    ) {

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
   TEXTO STATUS
============================================ */

function obterTextoStatus(
    status
) {

    const textos = {

        atrasado:
            "🔴 Atrasado",

        hoje:
            "🟠 Hoje",

        proximo:
            "🔵 Próximo",

        concluido:
            "🟢 Concluído",

        pendente:
            "🟡 Pendente"

    };


    return (
        textos[status] ||
        "🟡 Pendente"
    );

}


/* ============================================
   TEMPO RESTANTE
============================================ */

function obterTempoRestante(
    postit
) {

    if (postit.concluido) {

        return "";

    }


    const dataHora =
        obterDataHora(
            postit
        );


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
            • em ${dias}
            ${dias !== 1 ? "dias" : "dia"}
        </span>
    `;

}


/* ============================================
   NOTIFICAÇÕES
============================================ */

function verificarPermissaoNotificacao() {

    const botao =
        document.getElementById(
            "btnAtivarNotificacoes"
        );


    if (
        !("Notification" in window)
    ) {

        if (botao) {

            botao.textContent =
                "🔕 Não suportado";

            botao.disabled =
                true;

        }

        return;

    }


    if (
        Notification.permission ===
        "granted"
    ) {

        if (botao) {

            botao.textContent =
                "🔔 Notificações ativas";

            botao.classList.add(
                "ativo"
            );

        }

        return;

    }


    if (botao) {

        botao.textContent =
            "🔔 Ativar notificações";

        botao.classList.remove(
            "ativo"
        );

    }

}


/* ============================================
   SOLICITAR PERMISSÃO
============================================ */

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
            "Notificações já estão ativas",
            "Você receberá os avisos dos seus lembretes."
        );

        verificarPermissaoNotificacao();

        return;

    }


    Notification.requestPermission()
        .then(
            permissao => {

                verificarPermissaoNotificacao();


                if (
                    permissao ===
                    "granted"
                ) {

                    mostrarNotificacao(
                        "🔔 Notificações ativadas",
                        "Agora você receberá os avisos dos seus lembretes."
                    );


                    enviarNotificacaoNavegador(
                        "Post-its Administrativos",
                        "As notificações foram ativadas com sucesso."
                    );

                } else {

                    mostrarNotificacao(
                        "Notificações bloqueadas",
                        "Permita as notificações nas configurações do navegador."
                    );

                }

            }
        )
        .catch(
            erro => {

                console.error(
                    "Erro ao solicitar permissão:",
                    erro
                );

            }
        );

}


/* ============================================
   VERIFICAR LEMBRETES
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
   VERIFICAR POST-IT
============================================ */

function verificarNotificacaoPostit(
    postit,
    agora
) {

    const dataHora =
        obterDataHora(
            postit
        );


    const diferenca =
        dataHora.getTime() -
        agora.getTime();


    const minutos =
        diferenca /
        1000 /
        60;


    const aviso =
        Number(
            postit.aviso || 10
        );


    if (
        minutos >= 0 &&
        minutos <= aviso
    ) {

        const chave =
            `notificacao_${postit.id}_${postit.data}_${postit.hora}`;


        const jaNotificado =
            localStorage.getItem(
                chave
            );


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
            `📝 ${postit.titulo}`,
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
                body: mensagem
            }
        );

    } catch (erro) {

        console.warn(
            "Erro na notificação:",
            erro
        );

    }

}


/* ============================================
   NOTIFICAÇÃO INTERNA
============================================ */

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
            20000
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
   DATA/HORA POST-IT
============================================ */

function obterDataHora(
    postit
) {

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
   FORMATAÇÃO
============================================ */

function formatarData(
    data
) {

    return data.toLocaleDateString(
        "pt-BR"
    );

}


function formatarDataBR(
    dataString
) {

    if (!dataString) {

        return "--/--/----";

    }


    const partes =
        dataString.split("-");


    if (
        partes.length !== 3
    ) {

        return dataString;

    }


    return `
        ${partes[2]}/${partes[1]}/${partes[0]}
    `;

}


function formatarDataInput(
    data
) {

    const ano =
        data.getFullYear();


    const mes =
        String(
            data.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const dia =
        String(
            data.getDate()
        ).padStart(
            2,
            "0"
        );


    return `
        ${ano}-${mes}-${dia}
    `.trim();

}


function formatarHora(
    data
) {

    return data.toLocaleTimeString(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function formatarHoraInput(
    data
) {

    const hora =
        String(
            data.getHours()
        ).padStart(
            2,
            "0"
        );


    const minuto =
        String(
            data.getMinutes()
        ).padStart(
            2,
            "0"
        );


    return `${hora}:${minuto}`;

}


function formatarDataHora(
    valor
) {

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


    return `
        ${formatarData(data)}
        às
        ${formatarHora(data)}
    `;

}


/* ============================================
   TEXTOS
============================================ */

function obterTextoPrioridade(
    prioridade
) {

    const textos = {

        urgente:
            "Urgente",

        importante:
            "Importante",

        normal:
            "Normal",

        baixa:
            "Baixa"

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
   SEGURANÇA HTML
============================================ */

function escaparHTML(
    valor
) {

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
        document.getElementById(
            id
        );


    if (elemento) {

        elemento.textContent =
            texto;

    }

}


/* ============================================
   ACESSO PARA TESTES
============================================ */

window.PostitsApp = {

    listar: () =>
        [...postits],


    salvar:
        salvarPostits,


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
