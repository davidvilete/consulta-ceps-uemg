/**
 * Consulta Canônica de CEPs — Sistemas de Informação UEMG Carangola
 * JavaScript Vanilla (ES6+) | Consumo Fetch Local, Autocomplete (3+ chars) e Modais Acessíveis
 */

document.addEventListener("DOMContentLoaded", () => {
  let cepsData = [];
  let sugestoesAtuais = [];
  let indiceAtivo = -1;
  let cidadeAtual = "Carangola";
  let ufAtual = "MG";

  const searchInput = document.getElementById("search-input");
  const suggestionsList = document.getElementById("suggestions-list");
  const resultsSection = document.getElementById("results-section");
  const clearBtn = document.getElementById("clear-btn");
  const statusMessage = document.getElementById("status-message");

  const headerCityBadge = document.getElementById("header-city-badge");
  const heroCityTag = document.getElementById("hero-city-tag");
  const heroCityName = document.getElementById("hero-city-name");

  /**
   * Normaliza texto removendo acentos/diacríticos e convertendo para minúsculas.
   */
  const normalizar = (texto) =>
    String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  /**
   * Escapa caracteres especiais HTML para evitar injeção no DOM.
   */
  const escaparHtml = (texto) =>
    String(texto || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  /**
   * Destaca visualmente com <mark> o trecho correspondente na sugestão, preservando acentos.
   */
  function destacarTermo(textoOriginal, termoNormalizado) {
    if (!termoNormalizado) {
      return escaparHtml(textoOriginal);
    }

    const texto = String(textoOriginal || "");
    const mapaIndices = [];
    let textoSemAcento = "";

    for (let i = 0; i < texto.length; i++) {
      const charLimpo = texto[i]
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      for (let j = 0; j < charLimpo.length; j++) {
        textoSemAcento += charLimpo[j];
        mapaIndices.push(i);
      }
    }

    const posInicio = textoSemAcento.indexOf(termoNormalizado);
    if (posInicio === -1) {
      return escaparHtml(texto);
    }

    const posFim = posInicio + termoNormalizado.length - 1;
    const inicioReal = mapaIndices[posInicio];
    const fimReal = mapaIndices[posFim] + 1;

    return (
      escaparHtml(texto.slice(0, inicioReal)) +
      "<mark>" +
      escaparHtml(texto.slice(inicioReal, fimReal)) +
      "</mark>" +
      escaparHtml(texto.slice(fimReal))
    );
  }

  /**
   * Identifica o tipo do logradouro para exibição de selo semântico no card.
   */
  function obterTipoLogradouro(logradouro) {
    const norm = normalizar(logradouro);
    if (norm.startsWith("rua ")) return "Rua";
    if (norm.startsWith("avenida ")) return "Avenida";
    if (norm.startsWith("praca ")) return "Praça";
    if (norm.startsWith("travessa ")) return "Travessa";
    if (norm.startsWith("beco ")) return "Beco";
    if (norm.startsWith("alameda ")) return "Alameda";
    if (norm.startsWith("rodovia ")) return "Rodovia";
    if (norm.startsWith("ladeira ")) return "Ladeira";
    if (norm.startsWith("estrada ")) return "Estrada";
    if (norm.startsWith("largo ")) return "Largo";
    if (norm.startsWith("vila ")) return "Vila";
    return "Logradouro";
  }

  /**
   * Atualiza dinamicamente os textos da interface caso a base JSON seja de outro município.
   */
  function sincronizarMunicipioInterface() {
    if (cepsData.length === 0) return;

    const primeiro = cepsData[0];
    if (primeiro.localidade) cidadeAtual = primeiro.localidade;
    if (primeiro.uf) ufAtual = primeiro.uf;

    if (headerCityBadge) headerCityBadge.textContent = `${cidadeAtual} / ${ufAtual}`;
    if (heroCityTag) heroCityTag.textContent = `${cidadeAtual} - ${ufAtual}`;
    if (heroCityName) heroCityName.textContent = cidadeAtual;
    document.title = `Consulta de CEPs — ${cidadeAtual}/${ufAtual} | Sistemas de Informação UEMG`;

    if (normalizar(cidadeAtual) !== "carangola") {
      const exemplos = cepsData
        .slice(0, 3)
        .map((item) => item.logradouro)
        .join(", ");
      if (exemplos) {
        searchInput.placeholder = `Ex.: ${exemplos}...`;
      }
    }
  }

  /**
   * 1. Carrega de forma assíncrona a base local ./data/ceps.json via Fetch API.
   */
  async function carregarBaseLocal() {
    try {
      statusMessage.classList.remove("is-error");
      statusMessage.textContent = "Carregando base local de logradouros...";

      const resposta = await fetch("./data/ceps.json");
      if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status}`);
      }

      const dados = await resposta.json();
      if (!Array.isArray(dados)) {
        throw new Error("Formato inválido em ./data/ceps.json (esperado um array JSON).");
      }

      cepsData = dados;
      sincronizarMunicipioInterface();
      statusMessage.textContent = `${cepsData.length} logradouros consolidados disponíveis para consulta em ${cidadeAtual}/${ufAtual}.`;
    } catch (erro) {
      console.error("Erro ao carregar ./data/ceps.json:", erro);
      statusMessage.classList.add("is-error");
      statusMessage.textContent =
        "Não foi possível carregar ./data/ceps.json. Abra o projeto via servidor local (ex.: Live Server) ou hospedagem estática.";
    }
  }

  /**
   * 2. Renderiza os dados completos do logradouro selecionado com destaque absoluto ao CEP.
   */
  function renderizarLogradouroSelecionado(listaItens) {
    resultsSection.innerHTML = "";

    if (!listaItens || listaItens.length === 0) {
      resultsSection.innerHTML = `
        <div class="empty-state">
          Nenhum logradouro encontrado para o termo informado. Verifique a grafia e tente novamente.
        </div>
      `;
      return;
    }

    listaItens.forEach((item) => {
      const tipo = obterTipoLogradouro(item.logradouro);
      const bairroTexto = item.bairro ? escaparHtml(item.bairro) : "Não especificado / Geral";
      const localidadeUf = `${escaparHtml(item.localidade || cidadeAtual)} / ${escaparHtml(item.uf || ufAtual)}`;

      let camposExtras = "";
      if (item.complemento) {
        camposExtras += `
          <div class="meta-item">
            <dt>Complemento / Trecho</dt>
            <dd>${escaparHtml(item.complemento)}</dd>
          </div>
        `;
      }
      if (item.unidade) {
        camposExtras += `
          <div class="meta-item">
            <dt>Unidade Postal</dt>
            <dd>${escaparHtml(item.unidade)}</dd>
          </div>
        `;
      }

      const card = document.createElement("article");
      card.className = "result-card";
      card.innerHTML = `
        <div class="result-details">
          <span class="result-badge-type">${escaparHtml(tipo)}</span>
          <h3 class="result-logradouro">${escaparHtml(item.logradouro)}</h3>
          <dl class="result-meta-grid">
            <div class="meta-item">
              <dt>Bairro</dt>
              <dd>${bairroTexto}</dd>
            </div>
            <div class="meta-item">
              <dt>Localidade / UF</dt>
              <dd>${localidadeUf}</dd>
            </div>
            ${camposExtras}
          </dl>
        </div>

        <div class="cep-spotlight" aria-label="Código de Endereçamento Postal em destaque">
          <span class="cep-label">CEP Oficial</span>
          <strong class="cep-value">${escaparHtml(item.cep)}</strong>
          <button type="button" class="copy-cep-btn" data-cep="${escaparHtml(item.cep)}">
            Copiar CEP
          </button>
        </div>
      `;

      resultsSection.appendChild(card);
    });

    resultsSection.querySelectorAll(".copy-cep-btn").forEach((botao) => {
      botao.addEventListener("click", async () => {
        const cep = botao.getAttribute("data-cep") || "";
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(cep);
          } else {
            const areaTemp = document.createElement("textarea");
            areaTemp.value = cep;
            document.body.appendChild(areaTemp);
            areaTemp.select();
            document.execCommand("copy");
            document.body.removeChild(areaTemp);
          }
          botao.textContent = "CEP Copiado!";
          botao.classList.add("is-copied");
          setTimeout(() => {
            botao.textContent = "Copiar CEP";
            botao.classList.remove("is-copied");
          }, 1800);
        } catch (err) {
          console.error("Falha ao copiar CEP:", err);
        }
      });
    });
  }

  /**
   * Seleciona um item do menu de autocomplete e exibe seus dados completos.
   */
  function selecionarSugestao(item) {
    if (!item) return;
    searchInput.value = item.logradouro;
    clearBtn.hidden = false;
    fecharSugestoes();
    renderizarLogradouroSelecionado([item]);
    statusMessage.textContent = `Exibindo dados completos para "${item.logradouro}" (${item.cep}).`;
  }

  /**
   * Atualiza o destaque visual de navegação por teclado na lista de autocomplete.
   */
  function atualizarItemAtivo() {
    const itensDom = suggestionsList.querySelectorAll(".suggestion-item");
    itensDom.forEach((el, idx) => {
      if (idx === indiceAtivo) {
        el.classList.add("is-active");
        el.setAttribute("aria-selected", "true");
        searchInput.setAttribute("aria-activedescendant", el.id);
        el.scrollIntoView({ block: "nearest" });
      } else {
        el.classList.remove("is-active");
        el.setAttribute("aria-selected", "false");
      }
    });

    if (indiceAtivo < 0) {
      searchInput.removeAttribute("aria-activedescendant");
    }
  }

  /**
   * 3. Renderiza o menu suspenso flutuante (Dropdown / Autocomplete).
   */
  function abrirSugestoes(correspondencias, termoNormalizado) {
    suggestionsList.innerHTML = "";
    sugestoesAtuais = correspondencias.slice(0, 60);
    indiceAtivo = -1;

    if (sugestoesAtuais.length === 0) {
      fecharSugestoes();
      return;
    }

    sugestoesAtuais.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "suggestion-item";
      li.setAttribute("role", "option");
      li.setAttribute("id", `suggestion-opt-${index}`);
      li.setAttribute("aria-selected", "false");

      const detalhesSecundarios = [item.bairro, item.unidade || item.complemento]
        .filter(Boolean)
        .join(" • ");

      li.innerHTML = `
        <span class="suggestion-main">${destacarTermo(item.logradouro, termoNormalizado)}</span>
        <span class="suggestion-sub">
          <span>${destacarTermo(detalhesSecundarios || item.localidade, termoNormalizado)}</span>
          <span class="suggestion-cep-tag">${escaparHtml(item.cep)}</span>
        </span>
      `;

      li.addEventListener("click", () => selecionarSugestao(item));
      suggestionsList.appendChild(li);
    });

    suggestionsList.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  }

  function fecharSugestoes() {
    suggestionsList.innerHTML = "";
    suggestionsList.hidden = true;
    sugestoesAtuais = [];
    indiceAtivo = -1;
    searchInput.setAttribute("aria-expanded", "false");
    searchInput.removeAttribute("aria-activedescendant");
  }

  /**
   * Filtra a base de dados priorizando correspondências no nome do logradouro.
   */
  function filtrarLogradouros(termoBruto) {
    const termoNorm = normalizar(termoBruto);

    const filtrados = cepsData.filter((item) => {
      const logNorm = normalizar(item.logradouro);
      const bairroNorm = normalizar(item.bairro);
      const cepLimpo = normalizar(item.cep).replace("-", "");
      const termoCep = termoNorm.replace("-", "");

      return (
        logNorm.includes(termoNorm) ||
        bairroNorm.includes(termoNorm) ||
        (termoCep.length >= 3 && cepLimpo.includes(termoCep))
      );
    });

    filtrados.sort((a, b) => {
      const aLog = normalizar(a.logradouro);
      const bLog = normalizar(b.logradouro);
      const aInicia = aLog.startsWith(termoNorm) ? 0 : aLog.includes(termoNorm) ? 1 : 2;
      const bInicia = bLog.startsWith(termoNorm) ? 0 : bLog.includes(termoNorm) ? 1 : 2;
      if (aInicia !== bInicia) return aInicia - bInicia;
      return aLog.localeCompare(bLog, "pt-BR");
    });

    return { filtrados, termoNorm };
  }

  /**
   * 4. Evento reativo de digitação (sensibilidade obrigatória a partir de 3 caracteres).
   */
  searchInput.addEventListener("input", (evento) => {
    const valorDigitado = evento.target.value;
    const valorUtil = valorDigitado.trim();

    clearBtn.hidden = valorDigitado.length === 0;

    if (valorUtil.length < 3) {
      fecharSugestoes();
      resultsSection.innerHTML = "";

      if (valorUtil.length === 0) {
        statusMessage.textContent = `${cepsData.length} logradouros consolidados disponíveis para consulta em ${cidadeAtual}/${ufAtual}.`;
      } else {
        statusMessage.textContent = "Digite ao menos 3 caracteres para acionar o filtro de logradouros.";
      }
      return;
    }

    const { filtrados, termoNorm } = filtrarLogradouros(valorUtil);

    if (filtrados.length === 0) {
      fecharSugestoes();
      renderizarLogradouroSelecionado([]);
      statusMessage.textContent = `Nenhuma correspondência encontrada para "${valorUtil}".`;
      return;
    }

    abrirSugestoes(filtrados, termoNorm);
    statusMessage.textContent = `${filtrados.length} logradouro(s) encontrado(s). Selecione uma opção na lista para exibir o CEP em destaque.`;
  });

  /**
   * Navegação acessível por teclado no Autocomplete (Setas, Enter e Escape).
   */
  searchInput.addEventListener("keydown", (evento) => {
    if (suggestionsList.hidden || sugestoesAtuais.length === 0) {
      if (evento.key === "Enter" && searchInput.value.trim().length >= 3) {
        evento.preventDefault();
        const { filtrados } = filtrarLogradouros(searchInput.value.trim());
        if (filtrados.length > 0) {
          selecionarSugestao(filtrados[0]);
        }
      }
      return;
    }

    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      indiceAtivo = (indiceAtivo + 1) % sugestoesAtuais.length;
      atualizarItemAtivo();
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault();
      indiceAtivo = (indiceAtivo - 1 + sugestoesAtuais.length) % sugestoesAtuais.length;
      atualizarItemAtivo();
    } else if (evento.key === "Enter") {
      evento.preventDefault();
      const escolhido = indiceAtivo >= 0 ? sugestoesAtuais[indiceAtivo] : sugestoesAtuais[0];
      selecionarSugestao(escolhido);
    } else if (evento.key === "Escape") {
      fecharSugestoes();
    }
  });

  // Botão limpar campo
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.hidden = true;
    fecharSugestoes();
    resultsSection.innerHTML = "";
    statusMessage.textContent = `${cepsData.length} logradouros consolidados disponíveis para consulta em ${cidadeAtual}/${ufAtual}.`;
    searchInput.focus();
  });

  // Fecha menu suspenso ao clicar fora do combobox
  document.addEventListener("click", (evento) => {
    if (!searchInput.contains(evento.target) && !suggestionsList.contains(evento.target)) {
      fecharSugestoes();
    }
  });

  /**
   * 5. Controle das Janelas Flutuantes / Modais (<dialog>).
   */
  document.querySelectorAll(".modal-trigger").forEach((gatilho) => {
    gatilho.addEventListener("click", () => {
      const modalId = gatilho.getAttribute("data-modal");
      const modal = document.getElementById(modalId);
      if (modal && typeof modal.showModal === "function") {
        modal.showModal();
      }
    });
  });

  document.querySelectorAll(".modal-close, .modal-close-btn").forEach((botaoFechar) => {
    botaoFechar.addEventListener("click", () => {
      const dialog = botaoFechar.closest("dialog");
      if (dialog) {
        dialog.close();
      }
    });
  });

  // Fecha o modal ao clicar sobre o overlay (backdrop) externo à .modal-box
  document.querySelectorAll(".app-modal").forEach((dialog) => {
    dialog.addEventListener("click", (evento) => {
      if (evento.target === dialog) {
        dialog.close();
      }
    });
  });

  carregarBaseLocal();
});

