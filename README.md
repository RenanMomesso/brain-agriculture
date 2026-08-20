# Brain Agriculture API

API REST para gestão de **produtores rurais**, suas **fazendas**, **safras** e **culturas plantadas**, com dashboard de indicadores. Desenvolvida em **NestJS + TypeScript + TypeORM + PostgreSQL**, com testes unitários e de integração, observabilidade por logs e distribuição via **Docker**.

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![NestJS](https://img.shields.io/badge/NestJS-11-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Testes](https://img.shields.io/badge/tests-37%20passing-brightgreen)

### Demo ao vivo

**Swagger UI:** <https://brain-agriculture-uhic.onrender.com/api/docs>

A API está publicada no Render: <https://brain-agriculture-uhic.onrender.com/api>

> A instância é do plano gratuito e **hiberna após 15 minutos sem tráfego** — a primeira requisição depois disso leva ~30–50s para responder. As seguintes são normais.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Regras de negócio](#regras-de-negócio)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Endpoints](#endpoints)
- [Como rodar](#como-rodar)
  - [Docker (recomendado)](#docker-recomendado)
  - [Local (sem Docker)](#local-sem-docker)
- [Deploy na nuvem (Render)](#deploy-na-nuvem-render)
- [Seed (dados mockados)](#seed-dados-mockados)
- [Testes](#testes)
- [Observabilidade](#observabilidade)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Documentação da API](#documentação-da-api)

---

## Funcionalidades

- Cadastro, edição e exclusão de produtores rurais (CPF ou CNPJ)
- Um produtor pode possuir **0, 1 ou mais fazendas**
- Cada fazenda registra cidade, estado (UF), área total, área agricultável e área de vegetação (em hectares)
- Cada fazenda possui **0, 1 ou mais safras**, e cada safra **0, 1 ou mais culturas** (Soja, Milho, Algodão, Café, Cana de Açúcar)
- Dashboard com:
  - Total de fazendas cadastradas
  - Total de hectares registrados
  - Dados para gráfico de pizza **por estado**
  - Dados para gráfico de pizza **por cultura plantada**
  - Dados para gráfico de pizza **por uso do solo** (agricultável × vegetação)
- Paginação na listagem de produtores
- Validação de CPF/CNPJ com dígitos verificadores (aceita com ou sem pontuação)
- Documentação OpenAPI (Swagger) gerada automaticamente

## Regras de negócio

| Regra | Onde é validada |
|---|---|
| CPF/CNPJ deve ser **válido** (algoritmo dos dígitos verificadores) | DTO (`IsCpfOrCnpj`) |
| `área agricultável + área de vegetação ≤ área total` | DTO (`FarmAreasValid`) |
| `estado` deve ser uma **UF brasileira** válida | DTO (`IsIn(STATE_UFS)`) |
| Documento **não pode ser duplicado** | Service (`ConflictException 409`) |
| Culturas restritas ao catálogo: `SOJA, MILHO, ALGODAO, CAFE, CANA_DE_ACUCAR` | DTO (`IsIn`) |
| Exclusão de produtor remove cascata: fazendas → safras → culturas | ORM (`ON DELETE CASCADE`) |

## Arquitetura

A aplicação segue **arquitetura em camadas** (Controller → Service → Repository/Entity) com injeção de dependência nativa do NestJS:

```
┌─────────────────────────────────────────────────────────────┐
│                        Cliente HTTP                         │
│          (Dashboard / integrações / Swagger UI)             │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST (JSON)
┌──────────────────────────▼──────────────────────────────────┐
│                    API (NestJS) :3000                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ RequestLoggerMiddleware  (logs estruturados por request)│  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ GlobalValidationPipe  (whitelist + transform)          │  │
│  ├──────────────────────┬─────────────────────────────────┤  │
│  │ ProducersModule      │ DashboardModule                 │  │
│  │  Controller          │  Controller                     │  │
│  │  Service (regras)    │  Service (agregações SQL)       │  │
│  │  DTOs (validação)    │                                 │  │
│  ├──────────────────────┴─────────────────────────────────┤  │
│  │ TypeORM (Repository pattern + QueryBuilder)            │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ PostgreSQL (TCP 5432)
┌──────────────────────────▼──────────────────────────────────┐
│  PostgreSQL 16                                             │
│  producers 1──∞ farms 1──∞ harvests ∞──∞ crops             │
└─────────────────────────────────────────────────────────────┘
```

### Modelo de dados

```
┌──────────────┐     ┌────────────────┐     ┌────────────────┐     ┌───────────────┐
│  producers   │     │     farms      │     │   harvests     │     │     crops     │
├──────────────┤     ├────────────────┤     ├────────────────┤     ├───────────────┤
│ id (PK uuid) │1──∞ │ id (PK uuid)   │1──∞ │ id (PK uuid)   │ ∞──∞ │ id (PK uuid)  │
│ document     │     │ name           │     │ label          │      │ name (unique) │
│ name         │     │ city           │     │ year           │      └───────────────┘
│ created_at   │     │ state (UF)     │     │ farm_id (FK)   │
│ updated_at   │     │ total_area     │     └────────────────┘
│              │     │ agricultural_  │      harvest_crops (join):
│              │     │   area         │      harvestsId × cropsId
│              │     │ vegetation_    │
│              │     │   area         │
│              │     │ producer_id(FK)│
└──────────────┘     └────────────────┘
```

> Diagrama fonte: `docs/architecture.md` (diagrama em Mermaid).

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 24, TypeScript 5.7 |
| Framework | NestJS 11 |
| ORM | TypeORM (+ migrations versionadas) |
| Banco | PostgreSQL 16 |
| Validação | class-validator + class-transformer |
| API Docs | @nestjs/swagger (OpenAPI 3) |
| Testes | Jest (unit) + Supertest (e2e) |
| Container | Docker (multi-stage) + docker-compose |

## Endpoints

Todos os endpoints são prefixados com `/api`.

### Produtores — `/api/producers`

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/producers` | Cadastra produtor (documento, nome, fazendas opcionais) → `201` |
| `GET` | `/producers?page=1&limit=10` | Lista produtores paginado → `200` |
| `GET` | `/producers/:id` | Busca produtor por id → `200` / `404` |
| `PATCH` | `/producers/:id` | Edita nome e/ou substitui lista de fazendas → `200` / `404` |
| `DELETE` | `/producers/:id` | Exclui produtor e dados dependentes → `204` / `404` |

### Dashboard — `/api/dashboard`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/dashboard` | Indicadores do dashboard → `200` |

Exemplo de resposta do dashboard:

```json
{
  "totalFarms": 8,
  "totalAreaHectares": 13340,
  "farmsByState": [
    { "state": "MG", "farmCount": 3 },
    { "state": "MT", "farmCount": 1 }
  ],
  "farmsByCrop": [
    { "crop": "SOJA", "farmCount": 7 },
    { "crop": "MILHO", "farmCount": 4 }
  ],
  "landUse": {
    "agriculturalAreaHectares": 8320,
    "vegetationAreaHectares": 5020
  }
}
```

### Saúde — `/api/health`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Verifica se a aplicação está no ar → `200` |

## Como rodar

### Pré-requisitos

- Docker + Docker Compose (ou Node 20+ e PostgreSQL local)

### Docker (recomendado)

```bash
# sobe postgres + api, executa migrations automaticamente
cp .env.example .env        # ajuste usuário/senha se necessário
docker compose up --build -d

# (opcional) popula o banco com dados mockados
docker compose exec api node dist/database/seeds/seed.js
```

A API fica em `http://localhost:3000/api` e o Swagger em `http://localhost:3000/api/docs`.

### Local (sem Docker)

```bash
cp .env.example .env        # ajuste DB_USER/DB_PASS para o seu Postgres
createdb brain_agriculture
npm install

npm run migration:run       # cria o schema
npm run seed                # (opcional) dados mockados
npm run start:dev           # http://localhost:3000/api
```

### Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta da API |
| `NODE_ENV` | `development` | `synchronize` só é ligado em `development`; demais ambientes usam migrations |
| `DB_HOST` | `localhost` | Host do Postgres |
| `DB_PORT` | `5432` | Porta do Postgres |
| `DB_USER` | `postgres` | Usuário do banco |
| `DB_PASS` | `postgres` | Senha do banco |
| `DB_NAME` | `brain_agriculture` | Nome do banco |
| `DATABASE_URL` | - | Connection string completa; se definida, **tem prioridade** sobre `DB_HOST/PORT/USER/PASS/NAME` (usada em provedores gerenciados) |
| `DB_SSL` | `false` | `true` quando o Postgres exige TLS (provedores gerenciados) |
| `DB_LOGGING` | `false` | `true` habilita log de queries SQL |
| `MIGRATIONS_RUN_ON_START` | - | `true` executa migrations no boot (usado no Docker/nuvem) |

## Deploy na nuvem (Render)

O repositório já traz um [`render.yaml`](render.yaml) — um *blueprint* que cria o Postgres gerenciado e a API em um único deploy, injetando as credenciais do banco no serviço automaticamente.

1. Suba este repositório para o GitHub.
2. No [dashboard do Render](https://dashboard.render.com): **New → Blueprint** e selecione o repositório.
3. Confirme. O Render cria `brain-agriculture-db` (Postgres) e `brain-agriculture-api` (Docker), lê o `Dockerfile` e faz o build.
4. No boot, `MIGRATIONS_RUN_ON_START=true` aplica as migrations pendentes — não é preciso rodar nada manualmente.
5. O health check aponta para `/api/health`; quando ficar verde, a API está no ar em `https://<seu-servico>.onrender.com/api` e o Swagger em `/api/docs`.

O deploy deste repositório está publicado em <https://brain-agriculture-uhic.onrender.com/api/docs>.

Para popular o banco com os dados mockados: o Shell do Render só existe em planos pagos, então rode o seed **da sua máquina** apontando para a *External Database URL* do banco (Render → banco → *Connections*):

```bash
DATABASE_URL='<External Database URL>' DB_SSL=true npm run seed
```

### Variáveis já definidas pelo blueprint

`NODE_ENV=production` (desliga `synchronize`, o schema vem só das migrations), `DB_SSL=true` (o Postgres do Render exige TLS), `MIGRATIONS_RUN_ON_START=true` e `DATABASE_URL` injetada a partir do banco via `fromDatabase`.

### Limitações do plano gratuito

- A instância web **hiberna após 15 minutos sem tráfego**; a primeira requisição depois disso leva ~30–50s para responder.
- O Postgres gratuito do Render **expira em 30 dias**. Para uma demo de longa duração, aponte `DB_HOST/USER/PASS/NAME` para um Postgres externo sem prazo (ex.: Neon) e remova o bloco `databases` do `render.yaml`.

## Seed (dados mockados)

O seed (`npm run seed`) insere **4 produtores** (2 CPF + 2 CNPJ), **8 fazendas**, safras de 2022 a 2024 e as 5 culturas do catálogo, distribuídas entre os estados SP, MG, PR, GO, MS e MT — ideais para visualizar o dashboard. O seed não sobrescreve dados existentes.

## Testes

| Suíte | Comando | Cobertura |
|---|---|---|
| Unitários | `npm test` | Validação CPF/CNPJ (dígitos verificadores), validação de áreas, services de produtores e dashboard (22 testes) |
| Integração (e2e) | `npm run test:e2e` | CRUD completo, validações (409/400/404), paginação, dashboard (15 testes) contra um Postgres real (`brain_agriculture_test`) |

O banco de teste é **recriado a partir das migrations** a cada execução (`dropSchema` + `migrationsRun`), então a suíte de integração também valida que o schema versionado continua fiel às entidades.

```bash
npm test          # 22 testes unitários
npm run test:e2e  # 15 testes de integração (requer Postgres local ou Docker)
```

## Observabilidade

- **Logs estruturados por request**: `RequestLoggerMiddleware` registra método, URL, status, duração (ms) e user-agent; erros 4xx como *warn* e 5xx como *error*.
- **Logs de domínio**: criação, atualização e remoção de produtores, consultas ao dashboard.
- **Log de queries SQL**: opcional via `DB_LOGGING=true`.

Exemplo:

```
LOG  {"method":"GET","url":"/api/producers?page=1&limit=2","statusCode":200,"durationMs":4,"userAgent":"curl/8.7.1"}
WARN GET /api/producers/<id> -> 404 (1ms)
```

## Estrutura do projeto

```
src/
├── main.ts                      # bootstrap, pipes globais, Swagger
├── app.module.ts                # módulo raiz (config + TypeORM + features)
├── app.controller.ts            # endpoint /health
├── common/
│   ├── enums/crop-type.enum.ts  # catálogo de culturas e UFs
│   ├── middleware/              # RequestLoggerMiddleware
│   └── validators/              # CPF/CNPJ + validação de áreas
├── modules/
│   ├── producers/               # entidades, DTOs, service, controller, módulo
│   └── dashboard/               # service, controller, módulo
└── database/
    ├── data-source.ts           # DataSource para CLI (migrations/seed)
    ├── migrations/              # schema versionado
    └── seeds/seed.ts            # dados mockados
test/
├── setup-env.ts                 # aponta e2e para o banco de teste
└── app.e2e-spec.ts              # testes de integração
docs/architecture.md             # diagramas Mermaid
Dockerfile                       # build multi-stage
docker-compose.yml               # postgres + api
```

## Documentação da API

**Produção (Render)**

- **Swagger UI**: <https://brain-agriculture-uhic.onrender.com/api/docs>
- **OpenAPI JSON**: <https://brain-agriculture-uhic.onrender.com/api/docs-json>
- **Health check**: <https://brain-agriculture-uhic.onrender.com/api/health>

**Local**

- **Swagger UI**: `http://localhost:3000/api/docs`
- **OpenAPI JSON**: `http://localhost:3000/api/docs-json`

---

Projeto criado como teste técnico **Brain Agriculture v2** — backend Node com NestJS, TypeORM, PostgreSQL, Docker, testes e observabilidade.
