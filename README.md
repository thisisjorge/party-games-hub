# Party Games Hub · RC1

Sete jogos de sala em PT-BR e Jungle Gap Solo com o mesmo núcleo de cenários, mapa e avaliação. Versão `1.0.0-rc.1`, destinada ao beta privado entre amigos.

## Executar

Requer Node.js 22 ou superior. `npm start` abre o servidor em `http://127.0.0.1:8080`. Abra esse endereço no navegador; Jungle Solo está em `/jungle.html`. O host cria a sala e compartilha o código. Os participantes entram, escolhem personagem e marcam READY. O host inicia.

## Verificar

`npm ci`, depois `npm test`. Os testes de navegador usam Microsoft Edge instalado; `npm run test:browser`, `npm run test:multiplayer`, `npm run test:responsive` e `npm run test:map` precisam do servidor local ativo. A suíte multiplayer cria três participantes reais no PeerJS; precisa de internet. Os relógios de partidas são avançados pela suíte para testar resultados sem esperar minutos em cada rodada.

`HUB_URL` e `SOLO_URL` permitem testar os sites publicados. O teste visual de regressão usa fixtures locais e o teste de calibração é exclusivo do ambiente de desenvolvimento. O painel `/tests/map-calibration.html` permite comparar os 52 cenários e estados de estruturas; `?mapdebug=1` ativa coordenadas e camadas apenas quando solicitado.

## Gerar os dois sites

`npm run build` produz `dist/hub` e `dist/jungle`. Antes do build final, defina `PGH_HUB_URL` com a URL HTTPS publicada do Hub, para o link “Jogar com amigos” funcionar no standalone. O build verifica igualdade dos cinco arquivos centrais compartilhados e gera manifestos SHA-256. Apenas arquivos necessários entram nos sites.

Veja `DEPLOY.md`, `RC1-REPORT.md` e `THIRD-PARTY.md` para publicação, limites conhecidos e créditos. Os testes não dependem de um servidor de produção privado.
