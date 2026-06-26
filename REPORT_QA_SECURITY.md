# ╔══════════════════════════════════════════════════════════════╗
# ║           RELATÓRIO DE QA & SECURITY — NATHIEL GAMES         ║
# ║                    Gerado em: 26 de Junho de 2026            ║
# ╚══════════════════════════════════════════════════════════════╝

### 📋 SUMÁRIO EXECUTIVO

O projeto da Nathiel Games consiste em uma landing page estática para a loja e um painel administrativo (`painel/index.html`) para gerenciamento de produtos integrado com o Supabase. O layout atual é moderno, porém apresenta um design genérico com estrutura comum de templates gerados por inteligência artificial ("cara de IA"). 

A segurança do projeto depende diretamente das políticas de Row Level Security (RLS) configuradas no Supabase, dado que as chaves públicas (anon) estão expostas no front-end. Há redundâncias de configuração e falta de componentização (arquivos HTML gigantescos contendo CSS e JS).

**Score Geral de Saúde do Projeto**: `6.5/10`

| Dimensão              | Score  | Status     |
|-----------------------|--------|------------|
| Qualidade de Código   | `5.0/10` | 🔴 Redundante e monolítico |
| Segurança             | `7.5/10` | 🟡 Chaves expostas e help de login hardcoded |
| Performance           | `8.0/10` | 🟢 Leve (sem frameworks pesados) |
| Cobertura de Testes   | `0.0/10` | 🔴 Sem testes |
| Arquitetura           | `5.5/10` | 🟡 Falta de componentização |

---

### 🚨 VULNERABILIDADES DE SEGURANÇA

#### [SEC-001] — Chaves e URL do Supabase Duplicadas e Hardcoded
- **Severidade**: `MÉDIA`
- **CVSS Score estimado**: `4.3`
- **Arquivo/Localização**: [config.js](file:///c:/Users/Alisson%20Inovar/Desktop/Guilherme/1.1.a/3-%20TESTES/Nathiel%20Games/config.js#L1-L2) e [painel/index.html](file:///c:/Users/Alisson%20Inovar/Desktop/Guilherme/1.1.a/3-%20TESTES/Nathiel%20Games/painel/index.html#L903-L904)
- **Descrição**: O arquivo `config.js` define as credenciais globais do Supabase. Porém, no painel do administrador, as credenciais `SUPABASE_URL` e `SUPABASE_KEY` foram redefinidas de forma redundante.
- **Evidência**:
  ```javascript
  const SUPABASE_URL = 'https://axlnprjnkydkuelenkje.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  ```
- **Impacto**: Duplicidade dificulta a manutenção (caso a chave mude, é preciso alterar em múltiplos arquivos). Chaves anon e de banco de dados devem ser gerenciadas via variáveis de ambiente sempre que possível, ou centralizadas em um único arquivo de configuração.
- **Recomendação**: Remover a definição duplicada no painel administrativo e importar/utilizar apenas os valores configurados no arquivo `config.js`.

#### [SEC-002] — Exposição de Credenciais Administrativas de Teste no Layout
- **Severidade**: `MÉRIA`
- **CVSS Score estimado**: `3.5`
- **Arquivo/Localização**: [painel/index.html](file:///c:/Users/Alisson%20Inovar/Desktop/Guilherme/1.1.a/3-%20TESTES/Nathiel%20Games/painel/index.html#L739-L743)
- **Descrição**: Há um box de ajuda com as credenciais de administrador de teste escritas diretamente no código HTML exposto publicamente no navegador.
- **Evidência**:
  ```html
  <div class="login-helper">
    Credenciais de teste:<br>
    E-mail: <code>admin@nathielgames.com</code><br>
    Senha: <code>admin123</code>
  </div>
  ```
- **Impacto**: Usuários finais que acessarem a URL do painel verão as credenciais e poderão acessar o gerenciamento de produtos da loja.
- **Recomendação**: Remover a div `.login-helper` antes de subir o sistema para produção ou restringir sua exibição apenas a ambientes locais.

---

### 🐛 BUGS E PROBLEMAS FUNCIONAIS

#### [BUG-001] — Data Estática no Contador do Torneio
- **Severidade**: `BAIXO`
- **Localização**: [index.html:2671](file:///c:/Users/Alisson%20Inovar/Desktop/Guilherme/1.1.a/3-%20TESTES/Nathiel%20Games/index.html#L2671)
- **Descrição**: O contador de dias/horas para o torneio ativo utiliza uma data fixa em `2025-07-19`, que expirará ou já expirou dependendo do momento.
- **Impacto**: O relógio mostrará valores estáticos (`--` ou zerados), dando aspecto de site quebrado.
- **Correção sugerida**: Como a tela do torneio será removida, este bug será eliminado por consequência.

---

### ⚠️ CODE SMELLS E DÍVIDA TÉCNICA

#### Dívida Crítica (impacta manutenibilidade severamente)
- [ ] [index.html](file:///c:/Users/Alisson%20Inovar/Desktop/Guilherme/1.1.a/3-%20TESTES/Nathiel%20Games/index.html) — Arquivo monolítico com mais de 2.700 linhas, misturando mais de 1.900 linhas de estilos CSS (`<style>`), estrutura HTML e mais de 800 linhas de JavaScript. Dificulta a legibilidade e a manutenção simultânea entre sócios.
- [ ] [painel/index.html](file:///c:/Users/Alisson%20Inovar/Desktop/Guilherme/1.1.a/3-%20TESTES/Nathiel%20Games/painel/index.html) — Arquivo monolítico com mais de 1.200 linhas, misturando estilos CSS administrativos, estrutura HTML e rotinas CRUD de JavaScript.

#### Dívida Moderada (impacta produtividade do time)
- [ ] Estilo "Cara de IA" — O design do site se apoia em efeitos comuns (grades em movimento, neon exagerado, emojis ao invés de ícones ou imagens vetorizadas estruturadas) que dão uma aparência genérica de template gerado automaticamente.

---

### ⚡ OPORTUNIDADES DE MELHORIA DE PERFORMANCE

#### [PERF-001] — Divisão e Minificação de Recursos
- **Impacto estimado**: Médio
- **Localização**: Estrutura geral
- **Situação atual**: Estilos e scripts embutidos bloqueiam a renderização progressiva do HTML.
- **Solução proposta**: Separar os estilos em um arquivo `style.css` e scripts em `app.js` e `admin.js`.
- **Ganho esperado**: Melhor legibilidade para os desenvolvedores e caching de CSS/JS pelo navegador do cliente.

---

### 🏗️ RECOMENDAÇÕES ARQUITETURAIS

1. **Separar Arquivos em Módulos (Organização do Projeto)**:
   Mover todo o CSS interno de [index.html](file:///c:/Users/Alisson%20Inovar/Desktop/Guilherme/1.1.a/3-%20TESTES/Nathiel%20Games/index.html) e [painel/index.html](file:///c:/Users/Alisson%20Inovar/Desktop/Guilherme/1.1.a/3-%20TESTES/Nathiel%20Games/painel/index.html) para arquivos CSS externos. O mesmo vale para o JavaScript.
   
2. **Refatoração Visual (Anti-IA)**:
   Substituir emojis genéricos por componentes de ícones SVG e adotar um layout mais polido, focando em tipografia gamer moderna, cards com cantos suaves, melhor contraste, espaçamento orgânico e animações mais discretas e premium.

---

### 🧪 GAPS DE COBERTURA DE TESTES
- **Cobertura estimada atual**: `0%`
- **Cobertura recomendada mínima**: `80%` para rotinas críticas (como a calculadora de preço e integração com Supabase).

---

### ✅ PONTOS POSITIVOS
- ✅ **Rapidez de Carregamento**: Utiliza Vanilla JS puro, sem frameworks pesados, resultando em carregamento instantâneo.
- ✅ **Integração Supabase**: O uso direto da API do Supabase resolve bem a sincronização em tempo real de produtos da loja.

---

### 🗺️ PLANO DE AÇÃO PRIORIZADO

#### 🔴 Imediato (Resolver antes do próximo deploy)
1. **[TASK-01]** Remover Seção de Torneios Ativos (HTML, CSS e JavaScript associados).
2. **[TASK-02]** Remover a exibição pública de credenciais administrativas de teste no painel.

#### 🟡 Curto Prazo (Esta etapa/Sprint)
1. **[TASK-03]** Refatorar o Design do Configurador "Monte seu PC Gamer".
2. **[TASK-04]** Modificar o design geral da Landing Page para retirar a aparência de IA (tornando-o premium, mais limpo, usando boas práticas de tipografia e espaçamento).
3. **[TASK-05]** Organizar a codebase extraindo estilos e scripts para arquivos específicos (`style.css`, `app.js`, `admin.css`, `admin.js`).

---

### 📊 MÉTRICAS FINAIS
* Total de issues encontradas: `5`
* Vulnerabilidades: `2` (Médias)
* Bugs críticos: `0`
* Dívidas técnicas identificadas: `3`
* Estimativa total de correção: `10 horas`

---

*Relatório gerado por Gemini QA Engineer Skill | Versão 1.0*
