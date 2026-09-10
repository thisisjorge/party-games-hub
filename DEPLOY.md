# Publicação e operação

Dois projetos Cloudflare Pages, com upload dos diretórios `dist/hub` e `dist/jungle`. O repositório fica na conta `thisisjorge`; a conta Cloudflare é a associada a `ejorgeotavares@gmail.com`. Confirme `gh api user` e `wrangler whoami` antes de publicar. Nunca inclua credenciais, diretórios de autenticação ou `.env` no repositório.

## Atualização por upload direto

1. Rode os testes e gere um commit/tag.
2. Defina `PGH_HUB_URL` com o endereço HTTPS do Hub e execute `npm run build`.
3. Execute `wrangler pages deploy dist/hub --project-name <projeto-hub> --branch main`.
4. Execute `wrangler pages deploy dist/jungle --project-name <projeto-jungle> --branch main`.
5. Teste as URLs reais, inclusive sala com três participantes e o desafio solo completo em celular.

As URLs e os nomes efetivamente criados ficam em `RC1-REPORT.md`. A implantação usa upload direto: um push no GitHub, sozinho, não faz deploy automático. É possível adotar integração Git depois, seguindo a documentação oficial: https://developers.cloudflare.com/pages/get-started/git-integration/ . O build estático e os diretórios são os descritos acima.

## Domínio futuro

O beta pode usar `pages.dev`. Para `play.seudominio` e `jg.seudominio`, adicione primeiro cada domínio no projeto Pages correspondente e siga a instrução DNS apresentada. Não crie apenas um CNAME isolado: a associação ao projeto é necessária. https://developers.cloudflare.com/pages/configuration/custom-domains/

## Multiplayer

O sinalizador atual é o PeerJS Cloud padrão da biblioteca vendorizada. `config.js` permite configurar um PeerServer próprio com `host`, `port:443`, `path` e `secure:true`. Os dados de sala trafegam em WebRTC entre participantes; o host mantém o estado autoritativo.

Não foi criado serviço próprio nem TURN privado. O funcionamento entre os contextos reais testados não garante redes móveis, VPNs ou NATs restritivos. Caso necessário, configure `iceEndpoint` com um endpoint HTTPS que emita `{iceServers, expiresAt}`; `expiresAt` é Unix em milissegundos, com validade mínima de 30 segundos. Credenciais TURN permanentes nunca vão para o frontend. Documentação PeerServer: https://github.com/peers/peerjs-server

Uma reconexão de cliente cancela a rodada em andamento e retorna a sala ao lobby preservando pontos já concluídos. Saída definitiva do host fecha a sala; não há migração de host no meio do jogo. O beta assume amigos confiáveis: código, listas e estado local do host são inspecionáveis; não existe promessa de proteção contra trapaça ou ranking competitivo.

O botão de diagnóstico permite copiar versão, estado de conexão e erros recentes sem respostas privadas. Perfis, conquistas e recordes são locais ao navegador; não há conta central nem sincronização de progresso entre dispositivos.

## Reverter

Use uma implantação anterior no painel Pages ou gere novamente a tag anterior e envie os dois diretórios. Preserve o mesmo `PGH_HUB_URL` ao reconstruir. A tag `pre-rc1-final-pass` preserva o ponto de segurança local anterior à calibração final.

## Sites desta RC1

- Hub: https://party-games-hub-jorge.pages.dev (`party-games-hub-jorge`).
- Jungle: https://jungle-gap-jorge.pages.dev (`jungle-gap-jorge`).
- Fonte: https://github.com/thisisjorge/party-games-hub (privado).

Wrangler usado: 4.130.0, com acesso somente de leitura de conta/usuário e escrita em Pages. Na criação inicial, essa versão tentou delegar para Workers; os projetos foram criados explicitamente no Pages. Atualizações destes projetos existentes usam `pages deploy` normalmente, sem ampliar permissões.
