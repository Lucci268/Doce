## Como o projeto está organizado

```
flor-de-acucar/
├── backend/                 → API em Node.js/Express + banco de dados
│   ├── server.js            → ponto de entrada (é o que você roda)
│   ├── src/
│   │   ├── app.js           → configuração central do Express
│   │   ├── config/          → variáveis de ambiente e conexão com o banco
│   │   ├── models/          → tabelas do banco (Item, Order, Settings, Admin...)
│   │   ├── controllers/     → a lógica de cada funcionalidade
│   │   ├── routes/          → quais URLs existem e o que elas chamam
│   │   ├── middleware/      → login (JWT), upload de imagem, limites de uso
│   │   ├── utils/           → validações e helpers
│   │   └── seed/            → script que cria os dados iniciais
│   ├── uploads/              → imagens enviadas pelo admin ficam aqui
│   ├── data/                 → o banco de dados (arquivo .sqlite) fica aqui
│   └── .env                  → configurações e senhas (você preenche)
│
└── frontend/                 → site que o navegador carrega
    ├── index.html             → página pública (vitrine)
    ├── admin.html              → painel administrativo
    ├── css/                    → estilos, separados por responsabilidade
    └── js/                     → lógica, separada por responsabilidade
        └── admin/               → só o que é exclusivo do painel admin
```

**Regra geral do projeto:** o front-end (pasta `frontend`) nunca fala
diretamente com o banco de dados — ele só faz pedidos HTTP para a API
(pasta `backend`). Isso é o que separa "o que o cliente vê" de "onde
os dados realmente ficam guardados", e é a base de qualquer site
profissional.

---

## Rodando o projeto localmente (primeira vez)

Pré-requisito: ter o [Node.js](https://nodejs.org) instalado (versão 18
ou mais recente). Para checar, rode `node -v` no terminal.

```bash
# 1. Entre na pasta do backend
cd backend

# 2. Instale as dependências (só precisa fazer isso uma vez, ou quando
#    o package.json mudar)
npm install

# 3. Copie o arquivo de exemplo de configuração
cp .env.example .env

# 4. Abra o .env e ajuste pelo menos:
#    - JWT_SECRET (troque por uma string aleatória longa)
#    - ADMIN_PASSWORD (a senha que você vai usar para logar no admin)

# 5. Crie o banco de dados e os dados iniciais
npm run seed

# 6. Suba o servidor
npm start
```

Depois disso, abra no navegador:

- **Site:** http://localhost:3000
- **Painel admin:** http://localhost:3000/admin.html
  (usuário: o que estiver em `ADMIN_USERNAME` no `.env`, padrão `admin`;
  senha: o que estiver em `ADMIN_PASSWORD`)

Durante o desenvolvimento, use `npm run dev` em vez de `npm start` —
ele reinicia o servidor sozinho a cada alteração de código (usa o
pacote `nodemon`).

> O `npm run seed` é seguro de rodar mais de uma vez: ele nunca apaga
> ou duplica dados, só cria o que ainda não existe.

---

## Como o site funciona por dentro (resumo rápido)

- **Vitrine (`index.html`)** busca o cardápio e as configurações da
  API assim que a página carrega (`js/main.js` → `js/catalog.js`).
- **Carrinho** fica salvo no navegador do cliente (`js/cart.js`), então
  sobrevive a um F5 na página — só é enviado ao servidor quando o
  cliente finaliza o pedido.
- **Checkout** (`js/checkout.js`) manda o pedido para a API. Importante:
  o **preço final é sempre calculado no servidor**, nunca confiando no
  que o navegador envia — isso impede que alguém manipule o pedido para
  pagar menos.
- **Painel admin (`admin.html`)** loga via usuário/senha, recebe um
  token de sessão (JWT) e usa esse token em toda ação administrativa
  (criar/editar/excluir itens, ver pedidos, mudar configurações).
- Tudo que o admin muda (cardápio, promoções, contato, taxa de entrega)
  fica salvo no banco de dados e aparece automaticamente pra quem
  visitar o site depois.

---

## Tarefas comuns de manutenção

### Adicionar, editar ou remover um item do cardápio
Não precisa mexer em código — faça tudo pelo painel admin, aba
**Cardápio**. Dá pra subir imagem, marcar promoção, e ativar/desativar
um item sem excluir (por exemplo, quando algo fica temporariamente em
falta).

### Mudar cor, fonte ou visual do site
As cores e fontes ficam centralizadas em
`frontend/css/variables.css` — trocar as variáveis ali (ex:
`--rose-dark`) muda a cor em todo o site de uma vez.
O restante do visual está dividido em `base.css` (estilos gerais),
`components.css` (botões, formulários, carrinho) e `site.css`
(seções específicas da vitrine, como o hero e o cardápio).

### Mudar textos fixos (não vindos do banco)
Textos como o título da seção "Sobre nós" ou o rodapé estão
diretamente no `frontend/index.html`. Textos que o admin edita pelo
painel (endereço, telefone, texto da faixa de promoção) **não** devem
ser editados no HTML — eles vêm do banco de dados.

### Trocar a senha do admin
Pelo próprio painel: aba **Configurações → Alterar senha de acesso**.
Não precisa mexer no `.env` depois da primeira vez.

### Esqueceu a senha do admin?
Edite `ADMIN_PASSWORD` no `.env` do servidor, rode `npm run seed`
de novo — mas isso só recria o admin se ele **não existir mais** no
banco. Como o seed nunca sobrescreve um admin existente, o jeito mais
direto de "resetar" a senha é apagar a linha do admin no banco
(`backend/data/database.sqlite`, usando qualquer visualizador de
SQLite) e então rodar `npm run seed` novamente.

### Fazer backup dos dados
Basta copiar o arquivo `backend/data/database.sqlite` — ele contém
todo o cardápio, pedidos e configurações. Faça isso periodicamente,
principalmente antes de qualquer atualização grande.

---

## Colocando o site no ar (hospedagem)

Este projeto é um servidor Node.js comum, então funciona em qualquer
serviço que rode Node — por exemplo **Render**, **Railway**, um VPS
próprio (DigitalOcean, Hetzner) ou um servidor com painel tipo
cPanel que suporte Node.js.

Passos gerais (o nome exato de cada opção varia por serviço):

1. Suba o conteúdo da pasta `backend/` para o serviço escolhido
   (a pasta `frontend/` também precisa estar disponível um nível
   acima dela, exatamente como está neste projeto — o servidor a
   serve automaticamente).
2. Configure as variáveis de ambiente do `.env` diretamente no painel
   do serviço de hospedagem (nunca suba o arquivo `.env` real para um
   repositório público).
3. Rode `npm install` e depois `npm run seed` (a maioria dos serviços
   faz isso automaticamente ao fazer deploy; alguns exigem rodar o
   seed manualmente uma vez, pelo terminal do próprio serviço).
4. Configure o comando de start como `npm start`.
5. Aponte seu domínio (ex: `www.suaconfeitaria.com.br`) para o
   endereço fornecido pelo serviço de hospedagem.

**Checklist de segurança antes de ir para produção:**
- [ ] Trocou `JWT_SECRET` no `.env` por um valor aleatório e único
- [ ] Trocou `ADMIN_PASSWORD` (ou já trocou a senha pelo painel)
- [ ] Ajustou `CORS_ORIGIN` para o domínio real do site
- [ ] Configurou `NODE_ENV=production`
- [ ] Fez backup do `.env` em um lugar seguro (gerenciador de senhas),
      fora do código

O arquivo `backend/data/database.sqlite` (o banco em si) é criado
automaticamente e não precisa ser versionado no Git — o `.gitignore`
já está configurado para isso.

---

## Stack técnica (para quem for dar manutenção)

- **Backend:** Node.js, Express, Sequelize (ORM), SQLite (banco de
  dados em arquivo único — não exige instalar um servidor de banco
  separado)
- **Autenticação:** JWT (JSON Web Token) + senha com hash bcrypt
- **Upload de imagens:** Multer, com redimensionamento no navegador
  antes do envio (mantém os arquivos leves)
- **Front-end:** HTML, CSS e JavaScript puro (sem framework/bundler),
  usando módulos ES nativos do navegador — abre em qualquer navegador
  moderno sem passo de build
- **Responsivo:** testado para funcionar bem tanto em celular quanto
  em desktop (menu de navegação, cardápio, carrinho e painel admin
  se adaptam à largura da tela)

