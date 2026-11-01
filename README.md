# Consulta Canônica de CEPs — UEMG Sistemas de Informação

Landing page canônica e responsiva para consulta rápida e offline de logradouros e Códigos de Endereçamento Postal (CEPs) do município de **Carangola — MG**, desenvolvida como atividade prática da disciplina de **Programação 2 (2º Período)** do curso de **Bacharelado em Sistemas de Informação** da **Universidade do Estado de Minas Gerais (UEMG) — Unidade Acadêmica de Carangola**.

---

## 🔗 Links Oficiais

- **Aplicação Online (GitHub Pages):** https://davidvilete.github.io/consulta-ceps-uemg/
- **Repositório Público (GitHub):** https://github.com/davidvilete/consulta-ceps-uemg

---

## 🛠️ Arquitetura e Tecnologias (100% Vanilla Web)

Em conformidade estrita com as restrições técnicas da atividade, o projeto foi construído **sem o uso de bibliotecas ou frameworks externos**:

- **HTML5 Semântico:** Estruturação acessível com `<header>`, `<main>`, `<section>`, `<article>`, `<dl>`, `<footer>`, atributos WAI-ARIA (`combobox`, `listbox`, `aria-live`) e janelas flutuantes nativas com `<dialog>`.
- **CSS3 Moderno (Mobile-First):** Design adaptativo para smartphones, tablets (`@media (min-width: 640px)`) e desktops (`@media (min-width: 1024px)`), variáveis CSS, alto contraste no banner Hero e ênfase tipográfica/visual no CEP renderizado.
- **JavaScript Vanilla (ES6+):** Consumo assíncrono local (`fetch("./data/ceps.json")`), normalização Unicode (`NFD`) insensível a acentos, busca reativa por autocomplete acionada a partir de **3 caracteres** (com suporte a mouse e teclado) e cópia rápida para a área de transferência.

---

## 📁 Estrutura de Diretórios

```text
consulta-ceps-uemg/
├── index.html              # Documento principal em HTML5 semântico
├── css/
│   └── styles.css          # Estilização completa Mobile-First e responsividade
├── js/
│   └── app.js              # Consumo do JSON via fetch, autocomplete e modais
├── data/
│   └── ceps.json           # Base unificada e deduplicada (Rua, Avenida e Praça)
├── assets/
│   ├── logo-si.png         # Logotipo institucional de Sistemas de Informação
│   ├── logo-uemg.png       # Logotipo institucional da UEMG Unidade Carangola
│   └── hero-cidade.jpg     # Fotografia panorâmica representativa do município
├── scripts/
│   └── coletar_ceps.py     # Utilitário Python para coleta e higienização no ViaCEP
└── README.md               # Documentação técnica e autoria do projeto
```

---

## 🚀 Como Executar Localmente

Como a aplicação consome `./data/ceps.json` via `fetch`, abra a raiz do projeto em um servidor HTTP estático local:

- **Opção 1 (VS Code):** Instale a extensão **Live Server**, clique com o botão direito em `index.html` e selecione **Open with Live Server**.
- **Opção 2 (Python):** Execute no terminal na raiz do projeto:
  ```bash
  python -m http.server 8000
  ```
  Em seguida, acesse `http://localhost:8000` no navegador.

### 🔄 Como trocar de cidade (caso outra unidade UEMG seja atribuída)

A interface adapta automaticamente o nome da cidade e os exemplos de busca a partir do conteúdo de `data/ceps.json`. Para mudar o município atendido:

1. Execute o script coletor passando o nome da cidade mineira:
   ```bash
   python scripts/coletar_ceps.py "Divinópolis"
   ```
   *(O script consulta automaticamente `Rua`, `Avenida` e `Praca` na API pública do ViaCEP, elimina duplicatas e salva o novo `data/ceps.json`).*
2. Substitua a imagem `assets/hero-cidade.jpg` por uma foto em alta resolução representativa da nova cidade.

---

## 👤 Autoria

- **Davi da Silva Fonseca Vilete**
  - GitHub: [@davidvilete](https://github.com/davidvilete)
  - LinkedIn: [davi-vilete-434bb6292](https://www.linkedin.com/in/davi-vilete-434bb6292)

*(Caso novos integrantes entrem no grupo, adicione-os também na seção "Equipe de Desenvolvimento" do modal `Sobre` em `index.html` e como colaboradores no GitHub).*

---

## 🤖 Nota de Transparência sobre o Uso de IA

Em consonância com os princípios de integridade acadêmica e transparência tecnológica da UEMG, declara-se que ferramentas de Inteligência Artificial generativa foram utilizadas como suporte na estruturação do script de consolidação e deduplicação da base ViaCEP, na depuração de rotinas de filtragem acento-insensível do JavaScript e na revisão sintática de responsividade e acessibilidade do HTML5/CSS3, sendo toda a arquitetura, lógica de negócios e validação final revisadas e auditadas pelo autor.

---

## 📢 Modelo Pronto para Publicação no LinkedIn (Entrega — Seção 5.3)

> 🚀 **Desenvolvimento Front-End Vanilla: Consulta Inteligente de CEPs com JavaScript Puro!**
>
> Como parte das atividades práticas da disciplina de Programação 2 (2º Período) do curso de Bacharelado em Sistemas de Informação da Universidade do Estado de Minas Gerais (UEMG Carangola), desenvolvi uma landing page canônica para busca interativa de logradouros da cidade de Carangola - MG.
>
> Principais desafios e soluções técnicas implementadas:
> - Manipulação de JSON local consolidado via requisições assíncronas (Fetch API);
> - Algoritmo de busca reativa (autocomplete) sensível a partir de 3 caracteres digitados;
> - Interface limpa e totalmente responsiva (Mobile-First) construída com HTML5 Semântico e CSS3 puro;
> - Arquitetura 100% Vanilla (zero dependências, sem o uso de frameworks);
> - Modais nativos acessíveis para apresentação do projeto, termos de uso e política de privacidade.
>
> 🔗 Acesse a aplicação online: https://davidvilete.github.io/consulta-ceps-uemg/
> 💻 Confira o código-fonte no GitHub: https://github.com/davidvilete/consulta-ceps-uemg
>
> Agradecimento especial ao nosso professor pela condução da disciplina.
>
> #sistemasuemgcarangola2p20262 #DesenvolvimentoWeb #JavaScript #VanillaJS #HTML5 #CSS3 #SistemasDeInformacao #UEMGCarangola #FrontEnd #TechStudents

