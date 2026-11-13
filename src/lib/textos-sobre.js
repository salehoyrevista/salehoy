// "Sobre la obra" en portugués, francés, italiano, alemán, chino y japonés.
// Español e inglés tienen archivo propio (src/pages/sobre.astro y
// src/pages/en/about.astro). {cielo} y {estrella} se reemplazan por las
// direcciones del idioma; {red} por la red y su cadena. HTML propio.

export const SOBRE = {
  pt: {
    titulo: "Sobre a obra",
    descripcion: "O que é Sin motivo, a obra de net art de Solzimer: um céu onde cada presente em blockchain vira um asterisco permanente. Como funciona, o que conta e o que não é.",
    h1: "Sobre <em>Sin motivo</em>",
    entrada: "<em>Sin motivo</em> («sem motivo») é uma obra de net art de Solzimer, em curso desde 29 de outubro de 2026. É um céu. Cada presente que alguém envia vira um asterisco que fica para sempre.",
    pregunta: "A obra faz uma única pergunta: <strong>alguém dá um presente só porque sim?</strong> Não é uma doação: não financia nada nem promete nada. Também não é uma venda: ninguém recebe algo em troca. O que fica é apenas a marca de que alguém respondeu.",
    comoTitulo: "Como funciona",
    como: [
      "<strong>Um presente, um asterisco.</strong> Cada presente recebido na blockchain aparece no <a href=\"{cielo}\">céu</a> como um asterisco, do grego <em>asteriskos</em>, «estrelinha».",
      "<strong>A forma é decidida pela transação.</strong> Pontas, traço, giro, tamanho e lugar saem do seu identificador. Nem o autor nem o valor interferem.",
      "<strong>Todos valem o mesmo.</strong> O valor nunca é mostrado. Um centavo e uma fortuna desenham a mesma coisa.",
      "<strong>Os presentes ficam; as visitas, não.</strong> Quem passa pelo céu deixa um rastro que se apaga em dois segundos.",
      "<strong>O céu gira.</strong> Dá uma volta por dia sideral, como o céu de verdade. Os presentes do mesmo dia formam constelações.",
      "<strong>O silêncio também é contado.</strong> A obra mostra há quanto tempo ninguém responde.",
      "<strong>Cada presente pode levar uma dedicatória</strong> de até 80 caracteres, escrita na própria transação. É assim que se pode <a href=\"{estrella}\">presentear alguém com uma estrela</a>."
    ],
    fichaTitulo: "Ficha",
    ficha: { titulo: "título", autor: "autor", tipo: "tipo", inicio: "início", soporte: "suporte", direccion: "endereço da obra", cuentan: "contam", idiomas: "idiomas", verificar: "verificação pública" },
    valores: { tipo: "net art, obra participativa em curso", inicio: "29 de outubro de 2026", soporte: "site e blockchain ({red})", cuentan: "ETH nativo e USDC oficial na Base", idiomas: "espanhol, inglês, português, francês, italiano, alemão, chinês, japonês" },
    preguntas: "Perguntas",
    faq: [
      ["O que é Sin motivo?", "Uma obra de net art de Solzimer, em curso desde 29 de outubro de 2026. É um céu: cada presente enviado em blockchain para o endereço da obra vira um asterisco que fica para sempre. As visitas deixam rastros que se apagam."],
      ["É uma doação?", "Não. Não financia nada nem promete nada em troca. É um presente, e a obra consiste em perguntar se alguém dá algo só porque sim."],
      ["Para onde vai o dinheiro?", "Para o autor. Não há causa, projeto nem contrapartida. Dizer isso faz parte da obra."],
      ["Por que um asterisco?", "Asterisco vem do grego asteriskos, «estrelinha». Também é a marca da nota de rodapé: o que se acrescenta à margem, sem que ninguém peça."],
      ["Quem decide a forma de cada asterisco?", "A transação. As pontas, o traço, o giro, o tamanho e o lugar saem do seu identificador (hash). O autor não escolhe e o valor não influi."],
      ["Mostra quanto cada um deu?", "Nunca. Nem quem deu. Todos os presentes valem o mesmo: um centavo e uma fortuna desenham a mesma coisa."],
      ["O que é a dedicatória?", "Um texto de até 80 caracteres que quem presenteia pode escrever dentro da própria transação (só com ETH). Fica na blockchain, pública e para sempre. O site não a guarda: só a lê."],
      ["Quais presentes contam?", "Só os da rede Base: ETH nativo e USDC oficial. Qualquer outro token é ignorado, para que o céu não se encha de lixo."],
      ["Quem é Solzimer?", "É o pseudônimo do autor da obra."],
      ["O site me rastreia?", "Usa o Google Analytics, que coloca cookies, para contar visitas e saber de onde chegam, em números agregados. O site não pede nem guarda nomes, e-mails ou endereços de carteira. Os rastros que você deixa no céu não ficam guardados em lugar nenhum."]
    ],
    verCielo: "ver o céu →", regalar: "presentear →",
    cita: "Para citar a obra: Solzimer, <em>Sin motivo</em>, 2026–em curso, net art, salehoy.com.ar. Versão para máquinas: <a href=\"/llms.txt\">llms.txt</a>, <a href=\"/obra.json\">obra.json</a>, <a href=\"/agentes/\">para agentes de IA</a>."
  },

  fr: {
    titulo: "À propos de l’œuvre",
    descripcion: "Ce qu’est Sin motivo, l’œuvre de net art de Solzimer : un ciel où chaque cadeau sur la blockchain devient un astérisque permanent. Comment ça marche, ce qui compte, et ce que ce n’est pas.",
    h1: "À propos de <em>Sin motivo</em>",
    entrada: "<em>Sin motivo</em> (« sans raison ») est une œuvre de net art de Solzimer, en cours depuis le 29 octobre 2026. C’est un ciel. Chaque cadeau envoyé devient un astérisque qui reste pour toujours.",
    pregunta: "L’œuvre pose une seule question : <strong>est-ce que quelqu’un offre quelque chose, juste comme ça ?</strong> Ce n’est pas un don : elle ne finance rien et ne promet rien. Ce n’est pas non plus une vente : personne ne reçoit rien en échange. Il ne reste que la trace que quelqu’un a répondu.",
    comoTitulo: "Comment ça marche",
    como: [
      "<strong>Un cadeau, un astérisque.</strong> Chaque cadeau reçu sur la blockchain apparaît dans <a href=\"{cielo}\">le ciel</a> comme un astérisque, du grec <em>asteriskos</em>, « petite étoile ».",
      "<strong>La transaction décide de la forme.</strong> Branches, trait, rotation, taille et place viennent de son identifiant. Ni l’auteur ni le montant n’interviennent.",
      "<strong>Tous valent la même chose.</strong> Le montant n’est jamais affiché. Un centime et une fortune dessinent la même chose.",
      "<strong>Les cadeaux restent ; les visites, non.</strong> Qui passe par le ciel laisse une traînée qui s’efface en deux secondes.",
      "<strong>Le ciel tourne.</strong> Un tour par jour sidéral, comme le vrai ciel. Les cadeaux d’un même jour forment des constellations.",
      "<strong>Le silence aussi se compte.</strong> L’œuvre montre depuis combien de temps personne ne répond.",
      "<strong>Chaque cadeau peut porter une dédicace</strong> de 80 caractères maximum, écrite dans la transaction elle-même. C’est ainsi qu’on peut <a href=\"{estrella}\">offrir une étoile à quelqu’un</a>."
    ],
    fichaTitulo: "Fiche",
    ficha: { titulo: "titre", autor: "auteur", tipo: "type", inicio: "début", soporte: "support", direccion: "adresse de l’œuvre", cuentan: "comptent", idiomas: "langues", verificar: "vérification publique" },
    valores: { tipo: "net art, œuvre participative en cours", inicio: "29 octobre 2026", soporte: "site web et blockchain ({red})", cuentan: "ETH natif et USDC officiel sur Base", idiomas: "espagnol, anglais, portugais, français, italien, allemand, chinois, japonais" },
    preguntas: "Questions",
    faq: [
      ["Qu’est-ce que Sin motivo ?", "Une œuvre de net art de Solzimer, en cours depuis le 29 octobre 2026. C’est un ciel : chaque cadeau envoyé sur la blockchain à l’adresse de l’œuvre devient un astérisque qui reste pour toujours. Les visites laissent des traînées qui s’effacent."],
      ["Est-ce un don ?", "Non. Elle ne finance rien et ne promet rien en échange. C’est un cadeau, et l’œuvre consiste à demander si quelqu’un offre quelque chose juste comme ça."],
      ["Où va l’argent ?", "À l’auteur. Il n’y a ni cause, ni projet, ni contrepartie. Le dire fait partie de l’œuvre."],
      ["Pourquoi un astérisque ?", "Astérisque vient du grec asteriskos, « petite étoile ». C’est aussi la marque de la note de bas de page : ce qu’on ajoute en marge, sans que personne ne le demande."],
      ["Qui décide de la forme de chaque astérisque ?", "La transaction. Les branches, le trait, la rotation, la taille et la place viennent de son identifiant (hash). L’auteur ne les choisit pas et le montant n’y est pour rien."],
      ["Le montant de chaque cadeau est-il affiché ?", "Jamais. Ni qui l’a offert. Tous les cadeaux valent la même chose : un centime et une fortune dessinent la même chose."],
      ["Qu’est-ce que la dédicace ?", "Un texte de 80 caractères maximum que la personne qui offre peut écrire dans la transaction elle-même (seulement en ETH). Il reste sur la blockchain, public et pour toujours. Le site ne le garde pas : il le lit."],
      ["Quels cadeaux comptent ?", "Seulement ceux du réseau Base : ETH natif et USDC officiel. Tout autre token est ignoré, pour que le ciel ne se remplisse pas de déchets."],
      ["Qui est Solzimer ?", "C’est le pseudonyme de l’auteur de l’œuvre."],
      ["Le site me suit-il ?", "Il utilise Google Analytics, qui dépose des cookies, pour compter les visites et savoir d’où elles viennent, en chiffres agrégés. Le site ne demande ni ne garde de noms, d’e-mails ou d’adresses de portefeuille. Les traînées que tu laisses dans le ciel ne sont gardées nulle part."]
    ],
    verCielo: "voir le ciel →", regalar: "offrir →",
    cita: "Pour citer l’œuvre : Solzimer, <em>Sin motivo</em>, 2026–en cours, net art, salehoy.com.ar. Version pour les machines : <a href=\"/llms.txt\">llms.txt</a>, <a href=\"/obra.json\">obra.json</a>, <a href=\"/agentes/\">pour les agents IA</a>."
  },

  it: {
    titulo: "Sull’opera",
    descripcion: "Cos’è Sin motivo, l’opera di net art di Solzimer: un cielo in cui ogni regalo su blockchain diventa un asterisco permanente. Come funziona, cosa conta e cosa non è.",
    h1: "Su <em>Sin motivo</em>",
    entrada: "<em>Sin motivo</em> («senza motivo») è un’opera di net art di Solzimer, in corso dal 29 ottobre 2026. È un cielo. Ogni regalo che qualcuno invia diventa un asterisco che resta per sempre.",
    pregunta: "L’opera fa una sola domanda: <strong>qualcuno regala qualcosa così, senza un perché?</strong> Non è una donazione: non finanzia niente e non promette niente. Non è nemmeno una vendita: nessuno riceve qualcosa in cambio. Resta solo il segno che qualcuno ha risposto.",
    comoTitulo: "Come funziona",
    como: [
      "<strong>Un regalo, un asterisco.</strong> Ogni regalo ricevuto sulla blockchain appare nel <a href=\"{cielo}\">cielo</a> come un asterisco, dal greco <em>asteriskos</em>, «stellina».",
      "<strong>La forma la decide la transazione.</strong> Punte, tratto, rotazione, dimensione e posizione vengono dal suo identificativo. Né l’autore né l’importo intervengono.",
      "<strong>Valgono tutti uguale.</strong> L’importo non si mostra mai. Un centesimo e una fortuna disegnano la stessa cosa.",
      "<strong>I regali restano; le visite no.</strong> Chi passa per il cielo lascia una scia che si cancella in due secondi.",
      "<strong>Il cielo gira.</strong> Fa un giro per giorno siderale, come il cielo vero. I regali dello stesso giorno formano costellazioni.",
      "<strong>Anche il silenzio si conta.</strong> L’opera mostra da quanto tempo nessuno risponde.",
      "<strong>Ogni regalo può portare una dedica</strong> fino a 80 caratteri, scritta nella transazione stessa. Così si può <a href=\"{estrella}\">regalare una stella a qualcuno</a>."
    ],
    fichaTitulo: "Scheda",
    ficha: { titulo: "titolo", autor: "autore", tipo: "tipo", inicio: "inizio", soporte: "supporto", direccion: "indirizzo dell’opera", cuentan: "contano", idiomas: "lingue", verificar: "verifica pubblica" },
    valores: { tipo: "net art, opera partecipativa in corso", inicio: "29 ottobre 2026", soporte: "sito web e blockchain ({red})", cuentan: "ETH nativo e USDC ufficiale su Base", idiomas: "spagnolo, inglese, portoghese, francese, italiano, tedesco, cinese, giapponese" },
    preguntas: "Domande",
    faq: [
      ["Cos’è Sin motivo?", "Un’opera di net art di Solzimer, in corso dal 29 ottobre 2026. È un cielo: ogni regalo inviato su blockchain all’indirizzo dell’opera diventa un asterisco che resta per sempre. Le visite lasciano scie che si cancellano."],
      ["È una donazione?", "No. Non finanzia niente e non promette niente in cambio. È un regalo, e l’opera consiste nel chiedere se qualcuno regala qualcosa così, senza un perché."],
      ["Dove vanno i soldi?", "All’autore. Non c’è una causa, un progetto né una contropartita. Dirlo fa parte dell’opera."],
      ["Perché un asterisco?", "Asterisco viene dal greco asteriskos, «stellina». È anche il segno della nota a piè di pagina: quello che si aggiunge a margine, senza che nessuno lo chieda."],
      ["Chi decide la forma di ogni asterisco?", "La transazione. Le punte, il tratto, la rotazione, la dimensione e la posizione vengono dal suo identificativo (hash). L’autore non le sceglie e l’importo non conta."],
      ["Si vede quanto ha regalato ciascuno?", "Mai. E nemmeno chi. Tutti i regali valgono uguale: un centesimo e una fortuna disegnano la stessa cosa."],
      ["Cos’è la dedica?", "Un testo fino a 80 caratteri che chi regala può scrivere dentro la transazione stessa (solo con ETH). Resta sulla blockchain, pubblico e per sempre. Il sito non lo conserva: lo legge."],
      ["Quali regali contano?", "Solo quelli sulla rete Base: ETH nativo e USDC ufficiale. Qualsiasi altro token viene ignorato, perché il cielo non si riempia di spazzatura."],
      ["Chi è Solzimer?", "È lo pseudonimo dell’autore dell’opera."],
      ["Il sito mi traccia?", "Usa Google Analytics, che imposta dei cookie, per contare le visite e sapere da dove arrivano, in numeri aggregati. Il sito non chiede né conserva nomi, e-mail o indirizzi di portafoglio. Le scie che lasci nel cielo non vengono salvate da nessuna parte."]
    ],
    verCielo: "vedi il cielo →", regalar: "regala →",
    cita: "Per citare l’opera: Solzimer, <em>Sin motivo</em>, 2026–in corso, net art, salehoy.com.ar. Versione per le macchine: <a href=\"/llms.txt\">llms.txt</a>, <a href=\"/obra.json\">obra.json</a>, <a href=\"/agentes/\">per agenti IA</a>."
  },

  de: {
    titulo: "Über das Werk",
    descripcion: "Was Sin motivo ist, das Net-Art-Werk von Solzimer: ein Himmel, in dem jedes Blockchain-Geschenk zu einem bleibenden Sternchen wird. Wie es funktioniert, was zählt und was es nicht ist.",
    h1: "Über <em>Sin motivo</em>",
    entrada: "<em>Sin motivo</em> („ohne Grund“) ist ein Net-Art-Werk von Solzimer, fortlaufend seit dem 29. Oktober 2026. Es ist ein Himmel. Jedes Geschenk, das jemand schickt, wird zu einem Sternchen, das für immer bleibt.",
    pregunta: "Das Werk stellt eine einzige Frage: <strong>Schenkt jemand etwas, einfach so?</strong> Es ist keine Spende: Es finanziert nichts und verspricht nichts. Es ist auch kein Verkauf: Niemand bekommt etwas dafür. Es bleibt nur das Zeichen, dass jemand geantwortet hat.",
    comoTitulo: "So funktioniert es",
    como: [
      "<strong>Ein Geschenk, ein Sternchen.</strong> Jedes Geschenk, das in der Blockchain ankommt, erscheint am <a href=\"{cielo}\">Himmel</a> als Sternchen, vom griechischen <em>asteriskos</em>, „kleiner Stern“.",
      "<strong>Die Transaktion bestimmt die Form.</strong> Zacken, Strich, Drehung, Größe und Ort ergeben sich aus ihrer Kennung. Weder der Autor noch der Betrag spielen eine Rolle.",
      "<strong>Alle sind gleich viel wert.</strong> Der Betrag wird nie gezeigt. Ein Cent und ein Vermögen zeichnen dasselbe.",
      "<strong>Geschenke bleiben, Besuche nicht.</strong> Wer durch den Himmel geht, hinterlässt eine Spur, die in zwei Sekunden verblasst.",
      "<strong>Der Himmel dreht sich.</strong> Eine Umdrehung pro Sterntag, wie der echte Himmel. Geschenke desselben Tages bilden Sternbilder.",
      "<strong>Auch die Stille wird gezählt.</strong> Das Werk zeigt, wie lange schon niemand geantwortet hat.",
      "<strong>Jedes Geschenk kann eine Widmung tragen</strong>, bis zu 80 Zeichen, geschrieben in die Transaktion selbst. So kann man <a href=\"{estrella}\">jemandem einen Stern schenken</a>."
    ],
    fichaTitulo: "Steckbrief",
    ficha: { titulo: "Titel", autor: "Autor", tipo: "Art", inicio: "Beginn", soporte: "Medium", direccion: "Adresse des Werks", cuentan: "es zählen", idiomas: "Sprachen", verificar: "öffentliche Prüfung" },
    valores: { tipo: "Net Art, fortlaufendes partizipatives Werk", inicio: "29. Oktober 2026", soporte: "Website und Blockchain ({red})", cuentan: "natives ETH und offizielles USDC auf Base", idiomas: "Spanisch, Englisch, Portugiesisch, Französisch, Italienisch, Deutsch, Chinesisch, Japanisch" },
    preguntas: "Fragen",
    faq: [
      ["Was ist Sin motivo?", "Ein Net-Art-Werk von Solzimer, fortlaufend seit dem 29. Oktober 2026. Es ist ein Himmel: Jedes Geschenk, das über die Blockchain an die Adresse des Werks geht, wird zu einem Sternchen, das für immer bleibt. Besuche hinterlassen Spuren, die verblassen."],
      ["Ist das eine Spende?", "Nein. Es finanziert nichts und verspricht nichts. Es ist ein Geschenk, und das Werk besteht darin zu fragen, ob jemand etwas einfach so schenkt."],
      ["Wohin geht das Geld?", "An den Autor. Es gibt keinen guten Zweck, kein Projekt und keine Gegenleistung. Das offen zu sagen, gehört zum Werk."],
      ["Warum ein Sternchen?", "Asterisk kommt vom griechischen asteriskos, „kleiner Stern“. Es ist auch das Zeichen der Fußnote: das, was am Rand hinzugefügt wird, ohne dass jemand danach fragt."],
      ["Wer bestimmt die Form jedes Sternchens?", "Die Transaktion. Zacken, Strich, Drehung, Größe und Ort ergeben sich aus ihrer Kennung (Hash). Der Autor wählt sie nicht, und der Betrag hat keinen Einfluss."],
      ["Wird angezeigt, wie viel jemand geschenkt hat?", "Nie. Auch nicht, wer. Alle Geschenke sind gleich viel wert: Ein Cent und ein Vermögen zeichnen dasselbe."],
      ["Was ist die Widmung?", "Ein Text mit bis zu 80 Zeichen, den die schenkende Person in die Transaktion selbst schreiben kann (nur mit ETH). Er bleibt in der Blockchain, öffentlich und für immer. Die Website speichert ihn nicht, sie liest ihn nur."],
      ["Welche Geschenke zählen?", "Nur die im Base-Netzwerk: natives ETH und offizielles USDC. Jeder andere Token wird ignoriert, damit sich der Himmel nicht mit Müll füllt."],
      ["Wer ist Solzimer?", "Das ist das Pseudonym des Autors."],
      ["Verfolgt mich die Website?", "Sie nutzt Google Analytics, das Cookies setzt, um Besuche zu zählen und zu sehen, woher sie kommen, in zusammengefassten Zahlen. Die Website fragt weder nach Namen, E-Mail-Adressen oder Wallet-Adressen, noch speichert sie sie. Die Spuren, die du am Himmel hinterlässt, werden nirgends gespeichert."]
    ],
    verCielo: "zum Himmel →", regalar: "schenken →",
    cita: "Zitiervorschlag: Solzimer, <em>Sin motivo</em>, 2026–fortlaufend, Net Art, salehoy.com.ar. Für Maschinen: <a href=\"/llms.txt\">llms.txt</a>, <a href=\"/obra.json\">obra.json</a>, <a href=\"/agentes/\">für KI-Agenten</a>."
  },

  zh: {
    titulo: "关于作品",
    descripcion: "《Sin motivo》是什么：Solzimer 的网络艺术作品，一片天空，每一份区块链上的礼物都会变成一个永久的星号。它如何运作、什么算数，以及它不是什么。",
    h1: "关于<em>《Sin motivo》</em>",
    entrada: "《Sin motivo》（“没有理由”）是 Solzimer 的一件网络艺术作品，自 2026 年 10 月 29 日起持续进行。它是一片天空。每一份有人送出的礼物，都会变成一个永远留下的星号。",
    pregunta: "这件作品只问一个问题：<strong>会有人无缘无故地送出礼物吗？</strong>它不是捐款：不资助任何事，也不承诺任何事。它也不是买卖：没有人会得到回报。留下的，只是有人回应过的痕迹。",
    comoTitulo: "它如何运作",
    como: [
      "<strong>一份礼物，一个星号。</strong>区块链上收到的每一份礼物，都会以星号的形式出现在<a href=\"{cielo}\">天空</a>中。星号源自希腊语 <em>asteriskos</em>，意为“小星星”。",
      "<strong>形状由交易决定。</strong>星芒、笔画、角度、大小和位置都来自交易的标识符。作者和金额都不参与。",
      "<strong>每一份都一样珍贵。</strong>金额从不显示。一分钱和一大笔钱画出的是同样的东西。",
      "<strong>礼物会留下，来访不会。</strong>经过这片天空的人会留下痕迹，两秒后消失。",
      "<strong>天空在转动。</strong>每个恒星日转一圈，就像真实的天空。同一天的礼物会连成星座。",
      "<strong>沉默也会被计数。</strong>作品会显示已经多久没有人回应。",
      "<strong>每一份礼物都可以带上题词</strong>，最多 80 个字符，写在交易本身里。这样就能<a href=\"{estrella}\">送给某人一颗星星</a>。"
    ],
    fichaTitulo: "作品信息",
    ficha: { titulo: "标题", autor: "作者", tipo: "类型", inicio: "开始", soporte: "媒介", direccion: "作品地址", cuentan: "计入", idiomas: "语言", verificar: "公开验证" },
    valores: { tipo: "网络艺术，持续进行的参与式作品", inicio: "2026 年 10 月 29 日", soporte: "网站与区块链（{red}）", cuentan: "Base 上的原生 ETH 和官方 USDC", idiomas: "西班牙语、英语、葡萄牙语、法语、意大利语、德语、中文、日语" },
    preguntas: "常见问题",
    faq: [
      ["《Sin motivo》是什么？", "Solzimer 的一件网络艺术作品，自 2026 年 10 月 29 日起持续进行。它是一片天空：每一份通过区块链送到作品地址的礼物，都会变成一个永远留下的星号。来访者留下的痕迹会消失。"],
      ["这是捐款吗？", "不是。它不资助任何事，也不承诺任何回报。它是一份礼物，而作品本身就是在问：会有人无缘无故地送出礼物吗？"],
      ["钱去了哪里？", "给作者。没有公益目的，没有项目，也没有回报。把这一点说清楚，也是作品的一部分。"],
      ["为什么是星号？", "星号（asterisk）源自希腊语 asteriskos，意为“小星星”。它也是脚注的标记：在页边补上的东西，没有人要求。"],
      ["谁决定每个星号的形状？", "交易。星芒、笔画、角度、大小和位置都来自交易的标识符（哈希）。作者不能选择，金额也没有影响。"],
      ["会显示每个人送了多少吗？", "从不显示，也不显示是谁送的。每一份礼物都一样：一分钱和一大笔钱画出的是同样的东西。"],
      ["题词是什么？", "送礼的人可以在交易本身里写下的一段文字，最多 80 个字符（仅限 ETH）。它会留在区块链上，公开且永久。网站不保存它，只是读取它。"],
      ["哪些礼物计入？", "只有 Base 网络上的礼物：原生 ETH 和官方 USDC。其他代币一律忽略，以免天空被垃圾填满。"],
      ["Solzimer 是谁？", "是这件作品作者的笔名。"],
      ["网站会追踪我吗？", "本站使用 Google Analytics（会设置 Cookie）来统计来访数量和来源，只看汇总数字。网站不索取也不保存姓名、邮箱或钱包地址。你在天空中留下的痕迹不会被保存在任何地方。"]
    ],
    verCielo: "去看天空 →", regalar: "送礼 →",
    cita: "引用方式：Solzimer，《Sin motivo》，2026 年至今，网络艺术，salehoy.com.ar。给机器读的版本：<a href=\"/llms.txt\">llms.txt</a>、<a href=\"/obra.json\">obra.json</a>、<a href=\"/agentes/\">给 AI 智能体</a>。"
  },

  ja: {
    titulo: "作品について",
    descripcion: "『Sin motivo』とは：Solzimer のネットアート作品。ブロックチェーン上の贈り物がひとつずつ、永遠のアスタリスクになる空。しくみ、数えられるもの、そうでないもの。",
    h1: "<em>『Sin motivo』</em>について",
    entrada: "『Sin motivo』（「理由なく」）は、Solzimer によるネットアート作品で、2026 年 10 月 29 日から続いています。それは空です。誰かが贈った贈り物は、ひとつずつ、ずっと残るアスタリスクになります。",
    pregunta: "この作品が問うのは、ひとつだけ。<strong>誰かが、理由もなく何かを贈るだろうか？</strong>これは寄付ではありません。何の資金にもならず、何も約束しません。売買でもありません。誰も見返りを受け取りません。残るのは、誰かが応えたという印だけです。",
    comoTitulo: "しくみ",
    como: [
      "<strong>贈り物ひとつに、アスタリスクひとつ。</strong>ブロックチェーンで受け取った贈り物は、<a href=\"{cielo}\">空</a>にアスタリスクとして現れます。ギリシャ語の <em>asteriskos</em>、「小さな星」から。",
      "<strong>形は取引が決めます。</strong>角の数、線、向き、大きさ、位置は、取引の識別子から決まります。作者も金額も関わりません。",
      "<strong>どれも同じ価値です。</strong>金額は表示されません。1 セントでも大金でも、描かれるものは同じです。",
      "<strong>贈り物は残り、訪問は残りません。</strong>空を通った人は軌跡を残しますが、2 秒で消えます。",
      "<strong>空は回ります。</strong>本物の空と同じく、恒星日ごとに一周します。同じ日の贈り物は星座になります。",
      "<strong>沈黙も数えられます。</strong>作品は、誰も応えていない時間を表示します。",
      "<strong>贈り物には献辞を添えられます。</strong>80 文字まで、取引そのものに書き込まれます。こうして<a href=\"{estrella}\">誰かに星を贈る</a>ことができます。"
    ],
    fichaTitulo: "作品データ",
    ficha: { titulo: "題名", autor: "作者", tipo: "形式", inicio: "開始", soporte: "媒体", direccion: "作品のアドレス", cuentan: "数えられるもの", idiomas: "言語", verificar: "公開検証" },
    valores: { tipo: "ネットアート、継続中の参加型作品", inicio: "2026 年 10 月 29 日", soporte: "ウェブサイトとブロックチェーン（{red}）", cuentan: "Base 上のネイティブ ETH と公式 USDC", idiomas: "スペイン語、英語、ポルトガル語、フランス語、イタリア語、ドイツ語、中国語、日本語" },
    preguntas: "よくある質問",
    faq: [
      ["『Sin motivo』とは？", "Solzimer によるネットアート作品で、2026 年 10 月 29 日から続いています。それは空です。作品のアドレスにブロックチェーンで贈られた贈り物は、ずっと残るアスタリスクになります。訪問者の軌跡は消えていきます。"],
      ["寄付ですか？", "いいえ。何の資金にもならず、見返りも約束しません。これは贈り物で、作品は、誰かが理由もなく何かを贈るかどうかを問うことそのものです。"],
      ["お金はどこへ行きますか？", "作者へ。目的も、プロジェクトも、見返りもありません。それをはっきり言うことも作品の一部です。"],
      ["なぜアスタリスクなのですか？", "アスタリスクはギリシャ語の asteriskos、「小さな星」から来ています。脚注の印でもあります。誰にも頼まれずに、余白に書き添えるもの。"],
      ["アスタリスクの形は誰が決めるのですか？", "取引です。角の数、線、向き、大きさ、位置は、取引の識別子（ハッシュ）から決まります。作者が選ぶことはなく、金額も影響しません。"],
      ["誰がいくら贈ったか表示されますか？", "決して表示されません。誰が贈ったかも。どの贈り物も同じ価値です。1 セントでも大金でも、描かれるものは同じです。"],
      ["献辞とは何ですか？", "贈る人が取引そのものに書き込める、80 文字までの言葉です（ETH のみ）。ブロックチェーンに公開されたまま永久に残ります。サイトは保存せず、読むだけです。"],
      ["どの贈り物が数えられますか？", "Base ネットワークのものだけです。ネイティブ ETH と公式 USDC。ほかのトークンは無視されます。空がごみで埋まらないように。"],
      ["Solzimer とは誰ですか？", "作品の作者のペンネームです。"],
      ["サイトは私を追跡しますか？", "訪問数とその流入元を集計した数字で把握するために、Cookie を設定する Google Analytics を使っています。サイトが名前、メールアドレス、ウォレットアドレスを尋ねたり保存したりすることはありません。あなたが空に残す軌跡は、どこにも保存されません。"]
    ],
    verCielo: "空を見る →", regalar: "贈る →",
    cita: "引用するとき：Solzimer『Sin motivo』2026 年–継続中、ネットアート、salehoy.com.ar。機械向け：<a href=\"/llms.txt\">llms.txt</a>、<a href=\"/obra.json\">obra.json</a>、<a href=\"/agentes/\">AI エージェント向け</a>。"
  }
};
