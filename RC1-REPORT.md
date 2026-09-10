# Party Games Hub · relatório RC1

Versão: **1.0.0-rc.1**. Status: **PARTY_GAMES_HUB_RC1: DEPLOYED_FOR_PRIVATE_BETA**.

## Propriedade e publicação

- GitHub: `thisisjorge`, e-mail principal verificado `ejorgeotavares@gmail.com`.
- Autoria Git: `Jorge Tavares <ejorgeotavares@gmail.com>`.
- Cloudflare: `Ejorgeotavares@gmail.com's Account`, ID `614183ed5a4431a0d8710bcc06f9254f`.
- Projetos Pages: `party-games-hub-jorge` e `jungle-gap-jorge`, ambos nessa conta.
- Repositório: `https://github.com/thisisjorge/party-games-hub` (privado).
- Endereços dos projetos: `https://party-games-hub-jorge.pages.dev` e `https://jungle-gap-jorge.pages.dev`.
- Ponto de segurança: `19ffeaf`, tag `pre-rc1-final-pass`. Tag final: `rc1-private-beta`.

## Mapa

Os 30 anchors foram recalibrados sobre o terreno atual de 1254 × 1254. As seis rotas passam pela ordem base → inibidor → T3 → T2 → T1; os centros foram verificados também contra os pixels do terreno para rejeitar paredes escuras. Mapa, waves e cards usam a mesma projeção de `scenario.state`. Não existem torres incorporadas ao terreno de produção.

| Tipo | Tamanho anterior | Final, em viewBox 1000 | Alteração |
| --- | ---: | ---: | ---: |
| T1 | 57,34 | 73,40 | +28% |
| T2 / T3 | 54,05 | 67,56 | +25% |
| Inibidor | 47,58 | 63,28 | +33% |
| Torre do Nexus | 47,00 | 56,40 | +20% |
| Nexus | 54,05 | 67,56 | +25% |

Foram comparadas quatro opções: anterior, faixa inferior, faixa superior e final por tipo. Blue/red compartilham geometria, escala, traço e tratamento; apenas cores diferem. Os seis pares SVG passaram na comparação geométrica. Nas bases, os anchors foram espaçados para acomodar a escala maior.

Arauto/Baron/Grubs: centro `(438,394)`; Drag: `(829,863)`; aronguejos: `(332,452)` e `(917,944)`, em pixels do terreno. Anchors dedicados substituem posições genéricas de rio. Os textos visíveis usam ARAUTO, ARONGUEJO e JG INIMIGO; gírias usuais de LoL foram preservadas.

Estruturas destruídas desaparecem sem substituição de tipo. T1/T2/T3 vivas limitam o avanço da wave a partir do mesmo atlas e estado. Apenas T1 pode ter plates, e cenários de 14 minutos em diante não as mantêm. Papéis seguem 1 TOP, 2 JG, 3 MID, 4 ADC, 5 SUP; fog não vaza posição real. Os 52 mapas foram capturados e revisados, além de all-alive, T1 destruída, T1+T2 destruídas, inibidor exposto, outer towers e late game.

## Catálogo e avaliação editorial

As avaliações de diversão são hipóteses para validar com os amigos, não resultados de pesquisa com jogadores. Todos os sete jogos ficam disponíveis nesta RC1.

| Jogo | Decisão RC1 | Diversão / repetição / social | Espera e risco residual |
| --- | --- | --- | --- |
| WordBomb | KEEP | Pressão de turno; 310.710 palavras; eliminação compartilhada | Espera entre turnos; dicionário pode conter vocabulário incomum |
| Termo Battle | KEEP | Dedução simultânea; 231 segredos; disputa de tentativas | Jogador que resolve espera; banco finito |
| Riftle | KEEP | Dedução com atributos; 151 campeões; comparação de palpites | Dataset estático, não cobre necessariamente lançamentos recentes |
| Jungle Gap | POLISH concluído | 52 decisões; explicações; voto simultâneo | Avaliação editorial de macro, sem simulação de partida real |
| STOP! | REWORK concluído | Categorias, duplicatas e contestação entre 2–8 jogadores | Revisão pode alongar a rodada; validade semântica é votada pela sala |
| Fake Answer | REWORK concluído | Blefes anônimos, enganos e revelação; 3–12 jogadores | Banco de 12 fatos favorece repetição após algumas sessões |
| Reflex Rush | REWORK concluído | Quatro variantes; rodadas rápidas; 2–12 jogadores | Precisão afetada por dispositivo, FPS e rede; sem ranking competitivo |

## Evidência de testes

- Jungle: **9.835 verificações**, 10 golden fixtures, 45 combinações wave/ausência, 21 estados especiais, 8 fixtures de estruturas e 52 cenários reais.
- Seis outros jogos: **192 verificações**; 68 palavras comuns, acentos/cedilha, letras repetidas, palavras inválidas, pontuação, limites, payloads privados e revelações.
- Interface Jungle: **210/210 casos** em 1366×768, 1280×720 e 390×844, sem erros de JS ou overflow horizontal.
- Responsividade: **49 layouts** (7 jogos × 7 telas), mais **7 sequências solo completas**. Telas: 1920×1080, 1536×864, 1366×768, 1280×720, 430×932, 390×844 e 360×800, sem zoom-out.
- Multiplayer local com internet: **3 participantes WebRTC reais**, todos os sete jogos até resultado/lobby, placares sincronizados, revanche, Party Mix de 5 jogos, recompensa diária idempotente, saída e reconexão. Nenhum erro de JavaScript capturado.
- Standalone: 5 decisões, vereditos, resultado e compartilhamento determinístico. Os cinco arquivos centrais são comparados byte a byte no build do Hub e do Solo.
- **Produção: PASS.** As duas URLs reais passaram. Hub: sete jogos com três participantes, ação principal, resultado, placares, revanche, Party Mix, reconexão e saídas. Solo: sete fluxos de cinco decisões com compartilhamento determinístico. Responsividade: 49 layouts públicos. Personagens, READY, chat e reações também passaram.
- **Integridade pública: 131 arquivos** comparados ao manifesto SHA-256; seis aberturas desktop/mobile, zero arquivos necessários ausentes, zero chamadas localhost e zero erros de JS.
- Deploy Hub: `e8425a24` · https://e8425a24.party-games-hub-jorge.pages.dev . Deploy Jungle: `467add5f` · https://467add5f.jungle-gap-jorge.pages.dev . Ambos usam a aplicação do commit `77076ea`; o commit final da tag acrescenta relatórios e suítes de verificação pública, sem alterar a aplicação publicada.

As suítes avançam relógios pelo hook local de QA para validar as transições sem esperar a duração inteira. Teste de payload privado significa ausência de resposta antecipada nas mensagens públicas, não proteção contra inspeção do código/host.

## Reconexão e limites conhecidos

Cliente que perde a conexão e retorna provoca cancelamento seguro da rodada atual e retorno ao lobby; a sala e os pontos concluídos permanecem. Saída definitiva do host fecha a sala e retorna os clientes ao início. Não existe migração de host durante a partida.

PeerJS Cloud permanece como sinalizador. Não há TURN privado nem garantia para NAT/VPN restritivos; os contextos testados compartilham a mesma máquina/rede. O beta com amigos em redes diferentes é a próxima validação real. Perfis e progresso são locais ao navegador. O host e o código distribuído são inspecionáveis. Não há autenticação central, ranking competitivo ou garantia antitrapaça. Consulte `DEPLOY.md` para infraestrutura opcional e rollback.

Sem bloqueador P0/P1 conhecido nos testes locais e públicos executados. Build congelada para beta privado. Os dois deploys pertencem à conta Cloudflare do usuário; o repositório privado pertence a `thisisjorge`. Não foi criado recurso na conta da pessoa dona do notebook.
