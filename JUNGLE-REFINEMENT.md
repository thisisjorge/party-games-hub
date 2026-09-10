# Jungle Gap — refinamento RC1.2

Refinamento sobre a RC1.1 publicada, sem reestruturar o Hub ou alterar os outros seis jogos.

## Comportamento

- Champions identificados usam os retratos originais do Riot Data Dragon: 118 PNGs locais, com 119 nomes/aliases. Aro azul para aliados, rosa para inimigos e destaque dourado para o jogador.
- A lateral usa o mesmo retrato do mapa. Última visão tem retrato esmaecido, aro tracejado e `?`. Campeões não especificados nos dados continuam como `JG`; não foi inventada uma identidade. Imagens indisponíveis mostram a abreviação do nome.
- Padrão de **50 segundos em todas as cinco rodadas normais**, no solo e no Hub. O antigo corte automático da última rodada para 10s foi removido. Os modificadores explicitamente escolhidos `INSTINCT_ALL` (10s) e `NO_THINK` (8s) permanecem. Ajuste central em `PGH_CONFIG.jungle.roundSeconds`; mantém-se a tolerância de 2s para renderização inicial, sem exibir tempo acima do padrão.
- Doze camps discretos: Gromp, Blue, Lobos, Acuâminas, Red e Krugs em cada lado. Dois aronguejos e os dois pits têm referências permanentes. Esses símbolos indicam localização, não que o monstro está vivo; disponibilidade e spawn continuam exclusivamente no estado do cenário.
- A marca dos Kindred exige `target: {kind, id}`. Pode seguir camp, objetivo ou ator; estruturas e alvos inexistentes são rejeitados. Marcar um ator sem visão não revela sua posição. No `jg-09`, a marca fica exatamente no Gromp inimigo; no `jg-36`, Olaf fica na entrada da invasão ao Blue de Evelynn.
- Buffs e camps foram recolocados nas clareiras correspondentes. O Blue aliado é no quadrante superior esquerdo; o Red aliado no inferior. O aronguejo inferior saiu da margem para o centro da faixa de água. Entradas de pits, pontos de rotação e dois lugares de formação no jungle azul foram ajustados para não cair em paredes.
- As 30 estruturas mantêm os centros já calibrados; todos foram revalidados contra o terreno e as seis sequências Nexus → inibidor → T3 → T2 → T1. Pits continuam em (438,394) e (829,863), no terreno nativo de 1254px.
- Layout compacto em telas baixas mantém as respostas visíveis sem diminuir os retratos. Mobile conserva mapa, lateral e respostas em uma sequência vertical.

## Validação focada

- `tests/jungle-regression.cjs --production`: 9.835 verificações; 52 cenários.
- `tests/browser-regression.cjs`: 210 renderizações, três tamanhos; mapa/lateral, fog, estruturas, waves e limites de tela.
- `tests/jungle-refinement.cjs`: 118 retratos decodificados, 26 verificações funcionais, nove capturas de cenário, 30 estruturas + 12 camps + cinco centros distintos de pit/rio, 16 pontos de rotação/base e dois lugares de formação. Inclui falha real de requisição de imagens, alvos inválidos e privacidade de posição.
- `tests/solo-refresh.cjs`: diário → resultado → treino, histórico diário, atalhos e quatro layouts.
- `tests/jungle-network.cjs`: três conexões reais ao Hub (uma em viewport mobile), cinco rodadas a 50s, pontuações sincronizadas e retorno ao lobby.

## Arquivos principais

`config.js`, `package.json`, `package-lock.json`, `index.html`, `jungle.html`, `css/games.css`, `css/solo.css`, `js/games/jungle-gap.js`, `js/jungle-solo.js`, `data/jungle-portraits.js`, `data/jungle-scenarios.js`, `data/lane-geometry.js`, `data/scenario-state-model.js`, `assets/champions/*.png`, `tools/build.cjs`, `tests/jungle-refinement.cjs`, `tests/jungle-network.cjs`, `THIRD-PARTY.md` e este relatório.

A geometria é calibrada sobre o mapa estilizado fornecido no projeto; não pretende reproduzir todas as colisões ou a navegação do mapa 3D do LoL. Campos estáticos não simulam respawn. Nenhuma regra dos outros seis jogos foi modificada.
