# Jungle Gap · 1.0.0-rc.1.1

Correção posterior ao beta RC1, a partir do feedback visual do usuário.

- Curva da top lane redesenhada sobre o terreno atual: centro em `(225,205)` no mapa 1254×1254. Campeões e minions usam a mesma curva. Os 414 centros de top laners/minions dos 52 cenários passam na verificação de pixels transitáveis; esta verificação foi adicionada porque os testes anteriores de estado e contagem não detectavam esse defeito visual.
- Nexus azul e suas duas torres alinhados por rotação de 180° com a disposição vermelha. Nexus azul agora em `(154,1088)`. Removida a inclinação decorativa da prévia. Estes anchors substituem os valores do relatório RC1 inicial.
- Favicon e emblema usam o Smite. Entrada substituída por menu de jogo com mapa, desafio diário, cinco etapas e recorde do dia. Sem apresentação comercial ou menção a cadastro.
- Treino livre sempre acessível pelo menu e pelo cabeçalho. Depois do diário, o botão principal leva ao treino. Cada treino contém cinco situações e oferece outra série ao terminar; não há contador de rodadas infinitas acumulado.
- Quem concluiu o diário vê o melhor resultado salvo neste navegador e o botão de rejogar. Links de desafio continuam determinísticos.

Validação: regressão Jungle com 9.835 verificações, 210 casos de interface, 414 verificações de terreno e fluxo diário → resultado → treino, persistência do recorde e atalho de treino. Layouts de entrada conferidos em 1366, 1280, 390 e 360 pixels. Nenhuma regra dos outros jogos foi alterada.

Sites mantidos: https://jungle-gap-jorge.pages.dev e https://party-games-hub-jorge.pages.dev . Repositório e deploys permanecem nas contas do usuário.
