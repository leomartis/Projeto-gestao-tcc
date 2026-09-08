# Gestão Jeans

Sistema web de gestão desenvolvido para um projeto de TCC, com interface em português e módulos para finanças, estoque, pessoas, agenda e produção de uma confecção.

A aplicação utiliza **TypeScript** no frontend Vue e no backend Express. Os dados são armazenados em um servidor **MySQL**, separado do código do projeto.

## Funcionalidades

| Módulo | Recursos |
| --- | --- |
| Login | Acesso por e-mail e senha, sessão com JWT e proteção das páginas internas. |
| Dashboard | Indicadores financeiros, saldo realizado e projetado, contas a pagar e receber, estoque, produção e gráficos com filtros de período e busca. |
| Agenda | Cadastro, consulta, edição e exclusão de compromissos; filtros por tipo, status e texto. |
| Estoque | Controle de peças por referência, cor e quantidade; busca, edição e exclusão. |
| Pessoas | Cadastro de clientes, fornecedores e colaboradores, contatos e situação ativa/inativa. |
| Financeiro | Receitas, despesas e investimentos, com categoria, vencimento, status, indicadores e gráficos. |
| Produção / Vendas | Registros de facção, firma, corte, peças enviadas e recebidas, preço por peça e acompanhamento da meta diária. |

A tela `VendasView.vue` utiliza o recurso de **produção** da API. A meta diária fica no estado da tela e não é persistida no banco.

## Tecnologias

- **Frontend:** Vue 3, TypeScript, Vite, Vue Router e Pinia.
- **Interface:** CSS, Lucide, Chart.js e vue-chartjs.
- **Backend:** Node.js, Express 4 e TypeScript.
- **Banco:** MySQL e mysql2, com pool de conexões.
- **Autenticação:** bcryptjs para hashes de senha e jsonwebtoken para tokens JWT.
- **Configuração:** dotenv e concurrently.

O servidor executa arquivos `.ts` diretamente com Node.js. O build verifica seus tipos, mas não gera uma distribuição JavaScript do backend.

## Requisitos

- Node.js **24 ou superior**, com npm.
- MySQL Server instalado e em execução.
- Uma exportação do banco do projeto para configurar uma instalação nova.
- Git para clonar e versionar o código.
- MySQL Workbench, opcional, para administrar o banco.

XAMPP não é necessário. O Workbench é uma interface de administração; o MySQL Server é o serviço que armazena os dados.

## Instalação

### 1. Obter o código

```powershell
git clone https://github.com/leomartis/Projeto-gestao-tcc.git
cd Projeto-gestao-tcc
npm.cmd ci
```

Se já tiver o projeto, abra o terminal na pasta existente e execute apenas `npm.cmd ci`. Esse comando instala as versões registradas em `package-lock.json`.

Os exemplos utilizam PowerShell no Windows. Em outros terminais, use `npm` no lugar de `npm.cmd`.

### 2. Importar o banco

**O repositório atual não contém o SQL de criação das tabelas nem um comando de migração.** Clonar o projeto não cria o banco automaticamente.

Para usar outro computador, obtenha uma exportação do banco com o responsável pelo projeto. No Workbench:

1. Na conexão de origem, utilize **Server → Data Export** para exportar a estrutura e, quando necessário, os dados.
2. Na conexão de destino, utilize **Server → Data Import** para importar o arquivo.
3. Confira o banco e suas tabelas antes de iniciar a aplicação.

Guarde o backup separadamente do repositório público. O banco padrão é `gestao_jeans`, com estas tabelas:

| Tabela | Finalidade |
| --- | --- |
| `users` | Usuários e hashes de senha. |
| `agenda` | Compromissos. |
| `estoque` | Referências, cores e quantidades. |
| `financeiro` | Lançamentos financeiros. |
| `pessoas` | Clientes, fornecedores e colaboradores. |
| `producao` | Registros de facção e movimentação de peças. |

Para conferir no Workbench:

```sql
USE gestao_jeans;
SHOW TABLES;
```

As tabelas e os registros ficam no MySQL. Os arquivos do servidor mantêm a conexão e as consultas necessárias para acessá-los.

### 3. Configurar o servidor

Na primeira instalação, copie o modelo:

```powershell
Copy-Item server/.env.example server/.env
```

Se `server/.env` já existir, edite-o sem sobrescrever a configuração. Preencha os valores locais:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD="sua-senha-do-mysql"
DB_NAME=gestao_jeans
JWT_SECRET=uma-chave-aleatoria-gerada-localmente
PORT=3001
```

| Variável | Uso |
| --- | --- |
| `DB_HOST` | Endereço do servidor MySQL. |
| `DB_PORT` | Porta do MySQL, normalmente 3306. |
| `DB_USER` | Usuário autorizado a acessar o banco. |
| `DB_PASSWORD` | Senha desse usuário do MySQL. |
| `DB_NAME` | Nome do banco importado. |
| `JWT_SECRET` | Chave para assinar e verificar tokens de sessão. |
| `PORT` | Porta HTTP da API, normalmente 3001. |

Gere uma chave e copie o resultado para `JWT_SECRET`:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

O arquivo `server/.env` está ignorado pelo Git e não deve ser publicado. A senha do MySQL é independente da senha usada para entrar na interface.

### 4. Criar o usuário de desenvolvimento

Com o banco importado e o servidor configurado:

```powershell
npm.cmd run server:seed
```

O comando cria ou atualiza o acesso:

- **E-mail:** `gestao@email.com`
- **Senha:** `123456`

A senha é gravada como hash na tabela `users`. Executar o script novamente redefine a senha desse usuário para o valor acima. Esse acesso é destinado ao desenvolvimento; ajuste as credenciais antes de disponibilizar a aplicação publicamente.

### 5. Rodar o projeto

```powershell
npm.cmd run dev:all
```

- Interface: normalmente http://localhost:5173.
- API: normalmente http://localhost:3001/api.
- Se a porta da interface estiver ocupada, abra o endereço informado pelo Vite, por exemplo http://localhost:5174.

Deixe o terminal aberto durante o uso. Para encerrar, pressione **Ctrl + C**.

Também é possível usar dois terminais, executando `npm.cmd run dev` em um e `npm.cmd run server` no outro.

## Comandos disponíveis

| Comando | Resultado |
| --- | --- |
| `npm.cmd start` | Inicia somente a interface em desenvolvimento. |
| `npm.cmd run dev` | Inicia somente a interface em desenvolvimento. |
| `npm.cmd run server` | Executa a API a partir de `server/index.ts`. |
| `npm.cmd run dev:all` | Executa interface e API juntas. |
| `npm.cmd run server:seed` | Cria ou redefine o usuário de desenvolvimento. |
| `npm.cmd run build` | Verifica os tipos do backend e frontend e gera a interface em `dist/`. |
| `npm.cmd run preview` | Disponibiliza uma prévia local da interface compilada. |

Não há comando de testes automatizados configurado atualmente. A compilação verifica tipos, mas não substitui a validação dos fluxos com API e banco em execução.

## Estrutura

```text
public/                       Arquivos estáticos, incluindo favicon
src/
  api/client.ts               Cliente HTTP e envio do token
  layouts/AppLayout.vue       Estrutura visual das páginas internas
  router/index.ts             Rotas e proteção de navegação
  stores/authStore.ts         Estado de autenticação
  views/                      Telas e estilos específicos
  App.vue                     Componente principal
  main.ts                     Inicialização do Vue
  style.css                   Estilos compartilhados
server/
  middleware/
    asyncHandler.ts           Encaminhamento de falhas assíncronas
    auth.ts                   Validação de JWT
    errorHandler.ts           Respostas para erros da API
  routes/
    auth.ts                   Login e consulta da sessão
    resource.ts               Operações dos módulos de dados
  scripts/seed.ts             Usuário inicial de desenvolvimento
  db.ts                       Pool de conexões MySQL
  index.ts                    Inicialização e registro das rotas
  .env.example                Modelo sem credenciais reais
  .env                        Configuração local ignorada pelo Git
package.json                  Dependências e comandos
tsconfig.server.json          Verificação de tipos do backend
tsconfig.app.json             Configuração TypeScript do frontend
tsconfig.node.json            Configuração TypeScript do Vite
vite.config.ts                Vite e proxy para a API
```

## Comunicação e autenticação

1. A interface envia e-mail e senha para `POST /api/login`.
2. A API consulta `users` e compara o hash da senha.
3. O servidor retorna um JWT com validade de sete dias.
4. O frontend guarda o token em `localStorage` e o envia em `Authorization: Bearer <token>`.
5. As rotas protegidas validam o token antes de consultar ou alterar dados.

O cliente HTTP usa `/api` por padrão. Durante o desenvolvimento, o proxy de `vite.config.ts` encaminha as requisições para `http://localhost:3001`.

Para outro endereço de API, configure `VITE_API_BASE_URL` em um `.env` na raiz. Variáveis com prefixo `VITE_` ficam disponíveis no navegador e não devem conter segredos. Ao mudar a porta da API, ajuste também o proxy. Para chamadas diretas entre origens, revise o CORS em `server/index.ts`, atualmente configurado para `http://localhost:5173`.

## Rotas da API

| Método | Caminho | Autenticação | Finalidade |
| --- | --- | --- | --- |
| POST | `/api/login` | Não | Recebe `email` e `senha` e devolve token e usuário. |
| GET | `/api/me` | Sim | Consulta o usuário da sessão. |
| GET | `/api/{recurso}` | Sim | Lista registros. |
| POST | `/api/{recurso}` | Sim | Cria um registro. |
| PUT | `/api/{recurso}/:id` | Sim | Atualiza os campos do registro. |
| DELETE | `/api/{recurso}/:id` | Sim | Exclui um registro. |

Recursos: `agenda`, `financeiro`, `pessoas`, `estoque` e `producao`.

As rotas utilizam listas de colunas definidas no servidor e parâmetros para os valores SQL. Falhas reconhecidas de conexão ou estrutura do banco retornam HTTP 503; erros inesperados retornam HTTP 500.

## Compilação e implantação

```powershell
npm.cmd run build
```

O conteúdo de `dist/` corresponde somente à interface. Publicá-lo não inicia a API nem transfere o banco. A implantação precisa executar o backend com Node.js, disponibilizar o MySQL e encaminhar `/api` para o servidor. `preview` serve para inspecionar a interface compilada localmente.

O banco requer backup próprio. O GitHub armazena o código, sem copiar automaticamente os registros do MySQL. `node_modules/`, `dist/` e os arquivos locais de credenciais são ignorados pelo Git.

## Solução de problemas

### Node.js, npm ou Git não reconhecido no Windows

Confirme a instalação e feche todas as janelas do VS Code antes de abri-lo novamente. Para atualizar temporariamente o terminal atual, quando os programas estiverem nos caminhos padrão:

```powershell
$env:Path = "C:\Program Files\nodejs;C:\Program Files\Git\cmd;$env:Path"
node -v
npm.cmd -v
git --version
```

Se o PowerShell bloquear `npm.ps1`, use `npm.cmd`, como nos exemplos.

### ECONNREFUSED ou banco indisponível

Confira se o serviço MySQL está iniciado, se host e porta estão corretos em `server/.env` e se o banco foi importado. Se o erro aparecer no proxy do Vite, confira também se a API está em execução na porta 3001.

### Acesso negado ao MySQL

Confira `DB_USER` e `DB_PASSWORD`. A senha de login da interface não configura a senha do MySQL.

### Banco ou tabela não encontrado

Confira `DB_NAME` e a importação das seis tabelas. `server:seed` cria o usuário, mas não cria o banco ou suas tabelas.

### Credenciais inválidas na interface

Confira o usuário do login. Em desenvolvimento, `npm.cmd run server:seed` restaura o acesso padrão, redefinindo a senha desse usuário.

### Porta ocupada

Para a interface, abra a porta indicada pelo Vite. Para a API, encerre a instância anterior ou altere `PORT` e o proxy em conjunto.

## Contribuições

1. Faça as alterações em uma branch de trabalho.
2. Execute `npm.cmd run build`.
3. Valide o fluxo alterado no navegador, com API e MySQL em execução.
4. Confira o diff para não incluir credenciais, backups ou dados pessoais.
5. Crie um commit descritivo e envie a branch para revisão.

Repositório: https://github.com/leomartis/Projeto-gestao-tcc
