// Sin motivo — Solzimer
// Textos en 8 idiomas, detección de idioma y lectura de regalos en Base.
// Lo usan la portada (/) y /regalo.html.
(function () {
  var DIRECCION = "0x791F5cEfb1778fFa31Af8e8A33F49cf35F41dB36";
  var USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  var AUTOR = "Solzimer";
  var CLAVE = "salehoy-idioma";

  var T = {
    es: { nombre: "Español",
      corto: "Regalame algo.", sinMotivo: "Sin motivo.",
      lema: "Cada regalo se vuelve una estrella. Para siempre.",
      regalar: "regalar →",
      esperando: "Esperando el primero.",
      enCurso: "en curso desde 29.10.2026",
      num: "n.º {n}", copiarEnlace: "copiar enlace",
      nota: "nota al pie", cerrar: "cerrar",
      notaTexto: "Sin motivo es una obra participativa de Solzimer, en curso desde el 29 de octubre de 2026. Cada regalo enviado a su dirección se convierte en un asterisco —del griego asteriskos, «estrellita»— que queda para siempre en este cielo. Su forma no la decide el autor ni el monto: la decide la transacción. Un centavo y una fortuna dibujan lo mismo. Las visitas dejan estelas que se borran. No es una donación: no financia nada ni promete nada. Es una pregunta: ¿alguien regala algo porque sí?",
      verPrologo: "ver el prólogo otra vez", registro: "registro", vacio: "Todavía vacío.", verificar: "verificar ↗",
      prologo: ["Esto es un cielo.", "Cada asterisco es un regalo que alguien hizo. Sin motivo.", "Tu paso deja una estela. Se borra.", "Un regalo, no."],
      saltear: "saltear", continuar: "continuar →",
      subtitulo: "Tu regalo se vuelve un asterisco en el cielo. Para siempre. Un centavo también cuenta.",
      soloBase: "Solo ETH o USDC en red Base. Otros tokens no se cuentan.",
      copiar: "tocá para copiar", copiado: "copiado ✓", mantener: "mantené apretado para copiar",
      billetera: "Abrir en mi billetera →", yaRegale: "Ya regalé →", buscar: "buscá tu asterisco →",
      como: "¿Cómo se regala?",
      paso1: "Abrí tu billetera (MetaMask, Coinbase Wallet u otra).",
      paso2: "Elegí la red Base y tocá Enviar.",
      paso3: "Escaneá el QR o pegá la dirección, poné el monto que quieras y confirmá.",
      maquinas: "Para máquinas", maquinaNota: "Esta página también la leen IAs y bots. Hola.",
      frases: [
        "Gracias. No hacía falta, y por eso vale.",
        "Lo que diste ya no es tuyo ni mío: es del gesto.",
        "Regalar sin motivo es la forma más rara de decir que sí.",
        "Hoy alguien recibió algo porque sí. Fuiste vos.",
        "Un regalo sin motivo no se explica. Se nota.",
        "Ahora el regalo sos vos."
      ] },
    en: { nombre: "English",
      corto: "Gift me something.", sinMotivo: "For no reason.",
      lema: "Every gift becomes a star. Forever.",
      regalar: "give →",
      esperando: "Waiting for the first one.",
      enCurso: "ongoing since 29.10.2026",
      num: "no. {n}", copiarEnlace: "copy link",
      nota: "footnote", cerrar: "close",
      notaTexto: "Sin motivo (“for no reason”) is a participatory work by Solzimer, ongoing since 29 October 2026. Every gift sent to its address becomes an asterisk —from the Greek asteriskos, “little star”— that stays in this sky forever. Its shape is decided neither by the author nor by the amount: the transaction decides it. A cent and a fortune draw the same thing. Visits leave trails that fade. It isn't a donation: it funds nothing and promises nothing. It's a question: does anyone give something just because?",
      verPrologo: "see the prologue again", registro: "record", vacio: "Still empty.", verificar: "verify ↗",
      prologo: ["This is a sky.", "Each asterisk is a gift someone gave. For no reason.", "Your passing leaves a trail. It fades.", "A gift doesn't."],
      saltear: "skip", continuar: "continue →",
      subtitulo: "Your gift becomes an asterisk in the sky. Forever. A single cent counts too.",
      soloBase: "Only ETH or USDC on Base. Other tokens don't count.",
      copiar: "tap to copy", copiado: "copied ✓", mantener: "press and hold to copy",
      billetera: "Open in my wallet →", yaRegale: "I've given →", buscar: "find your asterisk →",
      como: "How do I give?",
      paso1: "Open your wallet (MetaMask, Coinbase Wallet or another).",
      paso2: "Choose the Base network and tap Send.",
      paso3: "Scan the QR or paste the address, enter any amount and confirm.",
      maquinas: "For machines", maquinaNota: "This page is read by AIs and bots too. Hello.",
      frases: [
        "Thank you. You didn't have to, and that's why it matters.",
        "What you gave is no longer yours or mine: it belongs to the gesture.",
        "Giving for no reason is the strangest way of saying yes.",
        "Today someone got something just because. That was you.",
        "A gift for no reason isn't explained. It's felt.",
        "Now you're the gift."
      ] },
    pt: { nombre: "Português",
      corto: "Me dá um presente.", sinMotivo: "Sem motivo.",
      lema: "Cada presente vira uma estrela. Para sempre.",
      regalar: "presentear →",
      esperando: "Esperando o primeiro.",
      enCurso: "em curso desde 29.10.2026",
      num: "n.º {n}", copiarEnlace: "copiar link",
      nota: "nota de rodapé", cerrar: "fechar",
      notaTexto: "Sin motivo («sem motivo») é uma obra participativa de Solzimer, em curso desde 29 de outubro de 2026. Cada presente enviado ao seu endereço vira um asterisco —do grego asteriskos, «estrelinha»— que fica para sempre neste céu. Sua forma não é decidida pelo autor nem pelo valor: quem decide é a transação. Um centavo e uma fortuna desenham a mesma coisa. As visitas deixam rastros que se apagam. Não é uma doação: não financia nada nem promete nada. É uma pergunta: alguém dá um presente só porque sim?",
      verPrologo: "ver o prólogo de novo", registro: "registro", vacio: "Ainda vazio.", verificar: "verificar ↗",
      prologo: ["Isto é um céu.", "Cada asterisco é um presente que alguém deu. Sem motivo.", "Sua passagem deixa um rastro. Ele se apaga.", "Um presente, não."],
      saltear: "pular", continuar: "continuar →",
      subtitulo: "Seu presente vira um asterisco no céu. Para sempre. Um centavo também conta.",
      soloBase: "Só ETH ou USDC na rede Base. Outros tokens não contam.",
      copiar: "toque para copiar", copiado: "copiado ✓", mantener: "mantenha pressionado para copiar",
      billetera: "Abrir na minha carteira →", yaRegale: "Já presenteei →", buscar: "procure seu asterisco →",
      como: "Como presentear?",
      paso1: "Abra sua carteira (MetaMask, Coinbase Wallet ou outra).",
      paso2: "Escolha a rede Base e toque em Enviar.",
      paso3: "Escaneie o QR ou cole o endereço, coloque o valor que quiser e confirme.",
      maquinas: "Para máquinas", maquinaNota: "Esta página também é lida por IAs e bots. Olá.",
      frases: [
        "Obrigado. Não precisava, e por isso vale.",
        "O que você deu já não é seu nem meu: é do gesto.",
        "Presentear sem motivo é o jeito mais estranho de dizer sim.",
        "Hoje alguém recebeu algo só porque sim. Foi você.",
        "Um presente sem motivo não se explica. Se sente.",
        "Agora o presente é você."
      ] },
    fr: { nombre: "Français",
      corto: "Offre-moi quelque chose.", sinMotivo: "Sans raison.",
      lema: "Chaque cadeau devient une étoile. Pour toujours.",
      regalar: "offrir →",
      esperando: "En attendant le premier.",
      enCurso: "en cours depuis le 29.10.2026",
      num: "n° {n}", copiarEnlace: "copier le lien",
      nota: "note", cerrar: "fermer",
      notaTexto: "Sin motivo (« sans raison ») est une œuvre participative de Solzimer, en cours depuis le 29 octobre 2026. Chaque cadeau envoyé à son adresse devient un astérisque — du grec asteriskos, « petite étoile » — qui reste pour toujours dans ce ciel. Sa forme, ce n'est ni l'auteur ni le montant qui la décide : c'est la transaction. Un centime et une fortune dessinent la même chose. Les visites laissent des traînées qui s'effacent. Ce n'est pas un don : il ne finance rien et ne promet rien. C'est une question : est-ce que quelqu'un offre quelque chose, juste comme ça ?",
      verPrologo: "revoir le prologue", registro: "registre", vacio: "Encore vide.", verificar: "vérifier ↗",
      prologo: ["Ceci est un ciel.", "Chaque astérisque est un cadeau que quelqu'un a fait. Sans raison.", "Ton passage laisse une traînée. Elle s'efface.", "Un cadeau, non."],
      saltear: "passer", continuar: "continuer →",
      subtitulo: "Ton cadeau devient un astérisque dans le ciel. Pour toujours. Un centime compte aussi.",
      soloBase: "Seulement ETH ou USDC sur Base. Les autres tokens ne comptent pas.",
      copiar: "touche pour copier", copiado: "copiée ✓", mantener: "appuie longuement pour copier",
      billetera: "Ouvrir dans mon portefeuille →", yaRegale: "C'est offert →", buscar: "cherche ton astérisque →",
      como: "Comment offrir ?",
      paso1: "Ouvre ton portefeuille (MetaMask, Coinbase Wallet ou autre).",
      paso2: "Choisis le réseau Base et touche Envoyer.",
      paso3: "Scanne le QR ou colle l'adresse, mets le montant que tu veux et confirme.",
      maquinas: "Pour les machines", maquinaNota: "Cette page est aussi lue par des IA et des bots. Bonjour.",
      frases: [
        "Merci. Ce n'était pas nécessaire, et c'est pour ça que ça compte.",
        "Ce que tu as donné n'est plus à toi ni à moi : il appartient au geste.",
        "Offrir sans raison, c'est la façon la plus étrange de dire oui.",
        "Aujourd'hui, quelqu'un a reçu quelque chose, juste comme ça. C'était toi.",
        "Un cadeau sans raison ne s'explique pas. Il se sent.",
        "Maintenant, le cadeau, c'est toi."
      ] },
    it: { nombre: "Italiano",
      corto: "Regalami qualcosa.", sinMotivo: "Senza motivo.",
      lema: "Ogni regalo diventa una stella. Per sempre.",
      regalar: "regala →",
      esperando: "In attesa del primo.",
      enCurso: "in corso dal 29.10.2026",
      num: "n. {n}", copiarEnlace: "copia link",
      nota: "nota", cerrar: "chiudi",
      notaTexto: "Sin motivo («senza motivo») è un'opera partecipativa di Solzimer, in corso dal 29 ottobre 2026. Ogni regalo inviato al suo indirizzo diventa un asterisco —dal greco asteriskos, «stellina»— che resta per sempre in questo cielo. La sua forma non la decide l'autore né l'importo: la decide la transazione. Un centesimo e una fortuna disegnano la stessa cosa. Le visite lasciano scie che si cancellano. Non è una donazione: non finanzia niente e non promette niente. È una domanda: qualcuno regala qualcosa così, senza un perché?",
      verPrologo: "rivedi il prologo", registro: "registro", vacio: "Ancora vuoto.", verificar: "verifica ↗",
      prologo: ["Questo è un cielo.", "Ogni asterisco è un regalo che qualcuno ha fatto. Senza motivo.", "Il tuo passaggio lascia una scia. Si cancella.", "Un regalo, no."],
      saltear: "salta", continuar: "continua →",
      subtitulo: "Il tuo regalo diventa un asterisco nel cielo. Per sempre. Anche un centesimo conta.",
      soloBase: "Solo ETH o USDC su rete Base. Gli altri token non contano.",
      copiar: "tocca per copiare", copiado: "copiato ✓", mantener: "tieni premuto per copiare",
      billetera: "Apri nel mio wallet →", yaRegale: "Fatto, ho regalato →", buscar: "cerca il tuo asterisco →",
      como: "Come si regala?",
      paso1: "Apri il tuo wallet (MetaMask, Coinbase Wallet o un altro).",
      paso2: "Scegli la rete Base e tocca Invia.",
      paso3: "Scansiona il QR o incolla l'indirizzo, metti l'importo che vuoi e conferma.",
      maquinas: "Per le macchine", maquinaNota: "Questa pagina la leggono anche IA e bot. Ciao.",
      frases: [
        "Grazie. Non serviva, ed è per questo che vale.",
        "Quello che hai dato non è più tuo né mio: è del gesto.",
        "Regalare senza motivo è il modo più strano di dire di sì.",
        "Oggi qualcuno ha ricevuto qualcosa così, per niente. Merito tuo.",
        "Un regalo senza motivo non si spiega. Si sente.",
        "Ora il regalo sei tu."
      ] },
    de: { nombre: "Deutsch",
      corto: "Schenk mir etwas.", sinMotivo: "Ohne Grund.",
      lema: "Jedes Geschenk wird zu einem Stern. Für immer.",
      regalar: "schenken →",
      esperando: "Warten auf das erste.",
      enCurso: "fortlaufend seit 29.10.2026",
      num: "Nr. {n}", copiarEnlace: "Link kopieren",
      nota: "Fußnote", cerrar: "schließen",
      notaTexto: "Sin motivo („ohne Grund“) ist ein partizipatives Werk von Solzimer, fortlaufend seit dem 29. Oktober 2026. Jedes Geschenk an seine Adresse wird zu einem Asterisk – vom griechischen asteriskos, „Sternchen“ –, der für immer an diesem Himmel bleibt. Seine Form bestimmt weder der Autor noch der Betrag, sondern die Transaktion. Ein Cent und ein Vermögen zeichnen dasselbe. Besuche hinterlassen Spuren, die verblassen. Es ist keine Spende: Es finanziert nichts und verspricht nichts. Es ist eine Frage: Schenkt jemand etwas, einfach so?",
      verPrologo: "Prolog noch einmal ansehen", registro: "Verzeichnis", vacio: "Noch leer.", verificar: "prüfen ↗",
      prologo: ["Das ist ein Himmel.", "Jedes Sternchen ist ein Geschenk, das jemand gemacht hat. Ohne Grund.", "Dein Weg hinterlässt eine Spur. Sie verblasst.", "Ein Geschenk nicht."],
      saltear: "überspringen", continuar: "weiter →",
      subtitulo: "Dein Geschenk wird ein Sternchen am Himmel. Für immer. Auch ein Cent zählt.",
      soloBase: "Nur ETH oder USDC im Base-Netzwerk. Andere Token zählen nicht.",
      copiar: "zum Kopieren tippen", copiado: "kopiert ✓", mantener: "zum Kopieren gedrückt halten",
      billetera: "In meiner Wallet öffnen →", yaRegale: "Hab geschenkt →", buscar: "such dein Sternchen →",
      como: "Wie schenke ich?",
      paso1: "Öffne deine Wallet (MetaMask, Coinbase Wallet oder eine andere).",
      paso2: "Wähle das Netzwerk Base und tippe auf Senden.",
      paso3: "Scanne den QR-Code oder füge die Adresse ein, gib einen beliebigen Betrag ein und bestätige.",
      maquinas: "Für Maschinen", maquinaNota: "Diese Seite lesen auch KIs und Bots. Hallo.",
      frases: [
        "Danke. Es war nicht nötig, und genau deshalb zählt es.",
        "Was du gegeben hast, gehört nicht mehr dir und nicht mir, sondern der Geste.",
        "Ohne Grund zu schenken ist die seltsamste Art, Ja zu sagen.",
        "Heute hat jemand einfach so etwas bekommen. Das warst du.",
        "Ein Geschenk ohne Grund erklärt man nicht. Man spürt es.",
        "Jetzt bist du das Geschenk."
      ] },
    zh: { nombre: "中文",
      corto: "送我点什么吧。", sinMotivo: "没有理由。",
      lema: "每一份礼物都会变成一颗星。永远。",
      regalar: "去送 →",
      esperando: "等待第一颗。",
      enCurso: "始于 2026.10.29，仍在继续",
      num: "第 {n} 号", copiarEnlace: "复制链接",
      nota: "注释", cerrar: "关闭",
      notaTexto: "《Sin motivo》（“没有理由”）是 Solzimer 的一件参与式作品，自 2026 年 10 月 29 日起持续进行。每一份寄到这个地址的礼物，都会变成一个星号——源自希腊语 asteriskos，意为“小星星”——永远留在这片天空里。它的形状既不由作者决定，也不由金额决定，而是由那笔交易决定。一分钱和一笔巨款，画出的是同样的东西。来访者留下的痕迹会慢慢消失。这不是捐款：它不资助任何事，也不承诺任何事。它是一个问题：会有人无缘无故地送出礼物吗？",
      verPrologo: "再看一次序幕", registro: "记录", vacio: "还是空的。", verificar: "查看 ↗",
      prologo: ["这是一片天空。", "每一个星号，都是有人送出的一份礼物。没有理由。", "你经过会留下痕迹。它会消失。", "礼物不会。"],
      saltear: "跳过", continuar: "继续 →",
      subtitulo: "你的礼物会变成天空中的一个星号。永远。一分钱也算数。",
      soloBase: "仅限 Base 网络上的 ETH 或 USDC。其他代币不计入。",
      copiar: "点击复制", copiado: "已复制 ✓", mantener: "长按复制",
      billetera: "在我的钱包中打开 →", yaRegale: "我送了 →", buscar: "去找你的星号 →",
      como: "怎么送？",
      paso1: "打开你的钱包（MetaMask、Coinbase Wallet 或其他）。",
      paso2: "选择 Base 网络，点击发送。",
      paso3: "扫描二维码或粘贴地址，输入任意金额并确认。",
      maquinas: "给机器看的", maquinaNota: "这个页面也会被 AI 和机器人读取。你好。",
      frases: [
        "谢谢。本来不必，所以才珍贵。",
        "你给出的，已经不属于你，也不属于我：它属于这个举动。",
        "无缘无故地送礼，是说“好”最奇妙的方式。",
        "今天有人无缘无故收到了一份礼物。是你送的。",
        "没有理由的礼物不用解释，自然会被感受到。",
        "现在，你就是那份礼物。"
      ] },
    ja: { nombre: "日本語",
      corto: "何か贈ってください。", sinMotivo: "理由はありません。",
      lema: "贈り物はひとつずつ星になります。ずっと。",
      regalar: "贈る →",
      esperando: "最初のひとつを待っています。",
      enCurso: "2026.10.29 から継続中",
      num: "No. {n}", copiarEnlace: "リンクをコピー",
      nota: "注", cerrar: "閉じる",
      notaTexto: "『Sin motivo』（「理由なく」）は、Solzimer による参加型の作品で、2026年10月29日から続いています。このアドレスに贈られた贈り物は、ひとつずつアスタリスク——ギリシャ語の asteriskos、「小さな星」——になり、この空にずっと残ります。その形を決めるのは作者でも金額でもなく、取引そのものです。1セントでも大金でも、描かれるものは同じです。訪れた人の軌跡は消えていきます。これは寄付ではありません。何の資金にもならず、何も約束しません。ひとつの問いです——誰かが、理由もなく何かを贈るだろうか？",
      verPrologo: "プロローグをもう一度", registro: "記録", vacio: "まだ空っぽです。", verificar: "確認 ↗",
      prologo: ["これは空です。", "アスタリスクのひとつひとつは、誰かが贈った贈り物。理由はありません。", "あなたの通り道には軌跡が残り、やがて消えます。", "贈り物は、消えません。"],
      saltear: "スキップ", continuar: "つづける →",
      subtitulo: "あなたの贈り物は、空のアスタリスクになります。ずっと。1セントでも数えられます。",
      soloBase: "Base ネットワークの ETH または USDC のみ。ほかのトークンは数えられません。",
      copiar: "タップしてコピー", copiado: "コピーしました ✓", mantener: "長押ししてコピー",
      billetera: "ウォレットで開く →", yaRegale: "贈りました →", buscar: "あなたのアスタリスクを探す →",
      como: "贈り方",
      paso1: "ウォレット（MetaMask、Coinbase Wallet など）を開きます。",
      paso2: "Base ネットワークを選び、「送信」をタップします。",
      paso3: "QR を読み取るかアドレスを貼り付け、好きな金額を入れて確認します。",
      maquinas: "機械のために", maquinaNota: "このページは AI やボットも読んでいます。こんにちは。",
      frases: [
        "ありがとう。しなくてもよかった。だからこそ、意味があります。",
        "あなたが贈ったものは、もうあなたのものでも私のものでもない。その気持ちのものです。",
        "理由なく贈るのは、いちばん不思議な「はい」の言い方です。",
        "今日、誰かが理由もなく何かを受け取りました。贈ったのはあなたです。",
        "理由のない贈り物は、説明するものではなく、伝わるものです。",
        "今度は、あなたが贈り物です。"
      ] }
  };

  var IDIOMAS = ["es", "en", "pt", "fr", "it", "de", "zh", "ja"];

  function valido(lang) {
    lang = String(lang || "").slice(0, 2).toLowerCase();
    return T[lang] ? lang : null;
  }

  function parametro(nombre) {
    try { return new URLSearchParams(location.search).get(nombre); } catch (e) { return null; }
  }

  // ?lang= , lo elegido antes, el idioma del navegador, o "es".
  // "elegido" dice si el visitante ya fijó un idioma.
  function detectar() {
    var q = valido(parametro("lang"));
    if (q) return { lang: q, elegido: true };
    var guardado = null;
    try { guardado = valido(localStorage.getItem(CLAVE)); } catch (e) {}
    if (guardado) return { lang: guardado, elegido: true };
    var nav = navigator.languages || [navigator.language];
    for (var i = 0; i < nav.length; i++) {
      var l = valido(nav[i]);
      if (l) return { lang: l, elegido: false };
    }
    return { lang: "es", elegido: false };
  }

  function guardar(lang) {
    try { localStorage.setItem(CLAVE, lang); } catch (e) {}
  }

  // [data-t] cambia el texto; [data-t-aria] cambia el aria-label.
  function aplicarTextos(lang, raiz) {
    var t = T[lang];
    raiz = raiz || document;
    if (raiz === document) document.documentElement.lang = lang;
    var nodos = raiz.querySelectorAll("[data-t]");
    for (var i = 0; i < nodos.length; i++) {
      var k = nodos[i].getAttribute("data-t");
      if (typeof t[k] === "string") nodos[i].textContent = t[k];
    }
    var arias = raiz.querySelectorAll("[data-t-aria]");
    for (var j = 0; j < arias.length; j++) {
      var a = arias[j].getAttribute("data-t-aria");
      if (typeof t[a] === "string") arias[j].setAttribute("aria-label", t[a]);
    }
  }

  // Arma la fila de idiomas; devuelve una función para marcar el actual.
  function fila(nav, alElegir) {
    IDIOMAS.forEach(function (code) {
      var b = document.createElement("button");
      b.type = "button";
      b.dataset.lang = code;
      b.lang = code;
      b.textContent = T[code].nombre;
      b.addEventListener("click", function () { guardar(code); alElegir(code); });
      nav.appendChild(b);
    });
    return function marcar(lang) {
      var botones = nav.querySelectorAll("button");
      for (var j = 0; j < botones.length; j++) {
        botones[j].setAttribute("aria-pressed", botones[j].dataset.lang === lang ? "true" : "false");
      }
    };
  }

  function mayorQueCero(v) {
    return typeof v === "string" && /^[0-9]+$/.test(v) && /[1-9]/.test(v);
  }

  function minus(x) { return String(x || "").toLowerCase(); }

  // Filtro antispam. Cuentan solo:
  //  (a) transacciones exitosas de ETH nativo con value > 0 hacia la dirección;
  //  (b) transferencias del USDC oficial de Base con monto > 0 hacia la dirección.
  // Todo lo demás se ignora. No se guarda quién manda ni cuánto.
  function filtrarRegalos(txs, transferencias, direccion) {
    var dir = minus(direccion || DIRECCION);
    var usdc = minus(USDC_BASE);
    var regalos = [];
    (txs || []).forEach(function (tx) {
      if (tx.status !== "ok" || tx.result !== "success") return;
      if (!tx.to || minus(tx.to.hash) !== dir) return;
      if (!mayorQueCero(tx.value)) return;
      regalos.push({ hash: tx.hash, clave: tx.hash, fecha: Date.parse(tx.timestamp),
                     bloque: Number(tx.block_number) || 0, orden: Number(tx.position) || 0 });
    });
    (transferencias || []).forEach(function (tr) {
      if (!tr.token || minus(tr.token.address_hash) !== usdc) return;
      if (!tr.to || minus(tr.to.hash) !== dir) return;
      if (!tr.total || !mayorQueCero(tr.total.value)) return;
      regalos.push({ hash: tr.transaction_hash, clave: tr.transaction_hash + ":" + tr.log_index,
                     fecha: Date.parse(tr.timestamp),
                     bloque: Number(tr.block_number) || 0, orden: Number(tr.log_index) || 0 });
    });
    regalos.sort(function (a, b) { return (a.fecha - b.fecha) || (a.bloque - b.bloque) || (a.orden - b.orden); });
    regalos.forEach(function (r, i) { r.n = i + 1; });
    return regalos;
  }

  // Lee todas las páginas de un listado de Blockscout (con un tope).
  function traerTodo(url, senal, tope) {
    var items = [];
    function pagina(params, quedan) {
      var u = url;
      if (params) {
        Object.keys(params).forEach(function (k) {
          u += "&" + encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
        });
      }
      return fetch(u, senal ? { signal: senal } : undefined).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      }).then(function (j) {
        items = items.concat(j.items || []);
        if (j.next_page_params && quedan > 1) return pagina(j.next_page_params, quedan - 1);
        return items;
      });
    }
    return pagina(null, tope);
  }

  // Lista de regalos (del más viejo al más nuevo, numerados desde 1),
  // o null si la API falla o tarda más de 6 s.
  var pedido = null;

  function cargarRegalos(denuevo) {
    if (pedido && !denuevo) return pedido;
    var base = "https://base.blockscout.com/api/v2/addresses/" + DIRECCION;
    var ctrl = window.AbortController ? new AbortController() : null;
    var reloj;
    var limite = new Promise(function (_, rechazar) {
      reloj = setTimeout(function () { if (ctrl) ctrl.abort(); rechazar(new Error("timeout")); }, 6000);
    });
    var senal = ctrl ? ctrl.signal : null;
    pedido = Promise.race([
      Promise.all([
        traerTodo(base + "/transactions?filter=to", senal, 20),
        traerTodo(base + "/token-transfers?type=ERC-20&filter=to&token=" + USDC_BASE, senal, 20)
      ]),
      limite
    ]).then(function (res) {
      return filtrarRegalos(res[0], res[1]);
    }).catch(function () { return null; }).then(function (regalos) {
      clearTimeout(reloj);
      return regalos;
    });
    return pedido;
  }

  function hace(ms, lang) {
    var s = Math.min(0, (ms - Date.now()) / 1000);
    var unidades = [["year", 31536000], ["month", 2592000], ["week", 604800],
                    ["day", 86400], ["hour", 3600], ["minute", 60]];
    var rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
    for (var i = 0; i < unidades.length; i++) {
      if (Math.abs(s) >= unidades[i][1]) return rtf.format(Math.round(s / unidades[i][1]), unidades[i][0]);
    }
    return rtf.format(Math.round(s), "second");
  }

  function fecha(ms, lang) {
    try {
      return new Intl.DateTimeFormat(lang, { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));
    } catch (e) { return new Date(ms).toISOString().slice(0, 10); }
  }

  // El ✱ propio: seis trazos, igual al de og.png. Toma el color del texto.
  var SVG_ASTERISCO = '<svg class="ast" viewBox="-15 -15 30 30" aria-hidden="true" focusable="false">' +
    '<path d="M0-13V13M-11.26-6.5L11.26 6.5M-11.26 6.5L11.26-6.5" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/></svg>';

  // "N ✱ · " para el contador, con el ✱ dibujado.
  function pintarCuenta(el, regalos) {
    el.innerHTML = regalos ? regalos.length + " " + SVG_ASTERISCO + " · " : "";
  }

  window.SaleHoy = {
    SVG_ASTERISCO: SVG_ASTERISCO,
    pintarCuenta: pintarCuenta,
    DIRECCION: DIRECCION,
    USDC_BASE: USDC_BASE,
    AUTOR: AUTOR,
    T: T,
    IDIOMAS: IDIOMAS,
    parametro: parametro,
    detectar: detectar,
    guardar: guardar,
    aplicarTextos: aplicarTextos,
    fila: fila,
    filtrarRegalos: filtrarRegalos,
    cargarRegalos: cargarRegalos,
    hace: hace,
    fecha: fecha
  };
})();
