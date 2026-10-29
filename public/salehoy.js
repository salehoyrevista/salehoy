// SaleHoy: textos en 8 idiomas, detección de idioma y contador on-chain.
// Lo usan la portada (/) y /regalo.html.
(function () {
  var DIRECCION = "0x791F5cEfb1778fFa31Af8e8A33F49cf35F41dB36";
  var USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  var CLAVE = "salehoy-idioma";

  var T = {
    es: { nombre: "Español",
      titulo: "Si querés, regalame algo.", corto: "Regalame algo.", sinMotivo: "Sin motivo.",
      texto: "No es una donación: no tiene un fin ni financia nada. Es un regalo, del tamaño que quieras, y no hace falta explicarlo.",
      centavo: "Un centavo también es un regalo.",
      regalar: "regalar →",
      copiar: "tocá para copiar", copiado: "copiada ✓", mantener: "mantené apretado para copiar",
      billetera: "Abrir en mi billetera", yaRegale: "Ya regalé",
      red: "USDC o ETH en red Base. También llega por Ethereum, Arbitrum, OP o Polygon.",
      como: "¿Cómo se regala?",
      paso1: "Abrí tu billetera (MetaMask, Coinbase Wallet u otra).",
      paso2: "Elegí la red Base y tocá Enviar.",
      paso3: "Escaneá el QR o pegá la dirección, poné el monto que quieras y confirmá.",
      maquinas: "Para máquinas", maquinaNota: "Esta página también la leen IAs y bots. Hola.",
      regalos: { one: "{n} regalo recibido", other: "{n} regalos recibidos" },
      ultimo: "el último {t}", nadie: "Todavía nadie regaló.",
      frases: [
        "Gracias. No hacía falta, y por eso vale.",
        "Lo que diste ya no es tuyo ni mío: es del gesto.",
        "Regalar sin motivo es la forma más rara de decir que sí.",
        "Hoy alguien recibió algo porque sí. Fuiste vos.",
        "Un regalo sin motivo no se explica. Se nota.",
        "Ahora el regalo sos vos."
      ] },
    en: { nombre: "English",
      titulo: "If you want, gift me something.", corto: "Gift me something.", sinMotivo: "For no reason.",
      texto: "It's not a donation: it has no purpose and funds nothing. It's a gift, any size you like, and it needs no explanation.",
      centavo: "A single cent is a gift too.",
      regalar: "give →",
      copiar: "tap to copy", copiado: "copied ✓", mantener: "press and hold to copy",
      billetera: "Open in my wallet", yaRegale: "I gave something",
      red: "USDC or ETH on Base. It also arrives via Ethereum, Arbitrum, OP or Polygon.",
      como: "How do I give?",
      paso1: "Open your wallet (MetaMask, Coinbase Wallet or another).",
      paso2: "Choose the Base network and tap Send.",
      paso3: "Scan the QR or paste the address, enter any amount and confirm.",
      maquinas: "For machines", maquinaNota: "This page is read by AIs and bots too. Hello.",
      regalos: { one: "{n} gift received", other: "{n} gifts received" },
      ultimo: "the last one {t}", nadie: "No one has given anything yet.",
      frases: [
        "Thank you. You didn't have to, and that's why it matters.",
        "What you gave is no longer yours or mine: it belongs to the gesture.",
        "Giving for no reason is the strangest way of saying yes.",
        "Today someone got something just because. That was you.",
        "A gift for no reason isn't explained. It's felt.",
        "Now you're the gift."
      ] },
    pt: { nombre: "Português",
      titulo: "Se quiser, me dá um presente.", corto: "Me dá um presente.", sinMotivo: "Sem motivo.",
      texto: "Não é uma doação: não tem um fim nem financia nada. É um presente, do tamanho que você quiser, e não precisa de explicação.",
      centavo: "Um centavo também é presente.",
      regalar: "presentear →",
      copiar: "toque para copiar", copiado: "copiado ✓", mantener: "mantenha pressionado para copiar",
      billetera: "Abrir na minha carteira", yaRegale: "Já presenteei",
      red: "USDC ou ETH na rede Base. Também chega via Ethereum, Arbitrum, OP ou Polygon.",
      como: "Como presentear?",
      paso1: "Abra sua carteira (MetaMask, Coinbase Wallet ou outra).",
      paso2: "Escolha a rede Base e toque em Enviar.",
      paso3: "Escaneie o QR ou cole o endereço, coloque o valor que quiser e confirme.",
      maquinas: "Para máquinas", maquinaNota: "Esta página também é lida por IAs e bots. Olá.",
      regalos: { one: "{n} presente recebido", other: "{n} presentes recebidos" },
      ultimo: "o último {t}", nadie: "Ninguém presenteou ainda.",
      frases: [
        "Obrigado. Não precisava, e por isso vale.",
        "O que você deu já não é seu nem meu: é do gesto.",
        "Presentear sem motivo é o jeito mais estranho de dizer sim.",
        "Hoje alguém recebeu algo só porque sim. Foi você.",
        "Um presente sem motivo não se explica. Se sente.",
        "Agora o presente é você."
      ] },
    fr: { nombre: "Français",
      titulo: "Si tu veux, offre-moi quelque chose.", corto: "Offre-moi quelque chose.", sinMotivo: "Sans raison.",
      texto: "Ce n'est pas un don : il n'a pas de but et ne finance rien. C'est un cadeau, de la taille que tu veux, et il n'a pas besoin d'explication.",
      centavo: "Un centime, c'est déjà un cadeau.",
      regalar: "offrir →",
      copiar: "touche pour copier", copiado: "copiée ✓", mantener: "appuie longuement pour copier",
      billetera: "Ouvrir dans mon portefeuille", yaRegale: "C'est offert",
      red: "USDC ou ETH sur Base. Arrive aussi via Ethereum, Arbitrum, OP ou Polygon.",
      como: "Comment offrir ?",
      paso1: "Ouvre ton portefeuille (MetaMask, Coinbase Wallet ou autre).",
      paso2: "Choisis le réseau Base et touche Envoyer.",
      paso3: "Scanne le QR ou colle l'adresse, mets le montant que tu veux et confirme.",
      maquinas: "Pour les machines", maquinaNota: "Cette page est aussi lue par des IA et des bots. Bonjour.",
      regalos: { one: "{n} cadeau reçu", other: "{n} cadeaux reçus" },
      ultimo: "le dernier {t}", nadie: "Personne n'a encore rien offert.",
      frases: [
        "Merci. Ce n'était pas nécessaire, et c'est pour ça que ça compte.",
        "Ce que tu as donné n'est plus à toi ni à moi : il appartient au geste.",
        "Offrir sans raison, c'est la façon la plus étrange de dire oui.",
        "Aujourd'hui, quelqu'un a reçu quelque chose, juste comme ça. C'était toi.",
        "Un cadeau sans raison ne s'explique pas. Il se sent.",
        "Maintenant, le cadeau, c'est toi."
      ] },
    it: { nombre: "Italiano",
      titulo: "Se vuoi, regalami qualcosa.", corto: "Regalami qualcosa.", sinMotivo: "Senza motivo.",
      texto: "Non è una donazione: non ha uno scopo e non finanzia niente. È un regalo, grande quanto vuoi, e non serve spiegarlo.",
      centavo: "Anche un centesimo è un regalo.",
      regalar: "regala →",
      copiar: "tocca per copiare", copiado: "copiato ✓", mantener: "tieni premuto per copiare",
      billetera: "Apri nel mio wallet", yaRegale: "Fatto, ho regalato",
      red: "USDC o ETH su Base. Arriva anche via Ethereum, Arbitrum, OP o Polygon.",
      como: "Come si regala?",
      paso1: "Apri il tuo wallet (MetaMask, Coinbase Wallet o un altro).",
      paso2: "Scegli la rete Base e tocca Invia.",
      paso3: "Scansiona il QR o incolla l'indirizzo, metti l'importo che vuoi e conferma.",
      maquinas: "Per le macchine", maquinaNota: "Questa pagina la leggono anche IA e bot. Ciao.",
      regalos: { one: "{n} regalo ricevuto", other: "{n} regali ricevuti" },
      ultimo: "l'ultimo {t}", nadie: "Ancora nessuno ha regalato niente.",
      frases: [
        "Grazie. Non serviva, ed è per questo che vale.",
        "Quello che hai dato non è più tuo né mio: è del gesto.",
        "Regalare senza motivo è il modo più strano di dire di sì.",
        "Oggi qualcuno ha ricevuto qualcosa così, per niente. Merito tuo.",
        "Un regalo senza motivo non si spiega. Si sente.",
        "Ora il regalo sei tu."
      ] },
    de: { nombre: "Deutsch",
      titulo: "Wenn du willst, schenk mir etwas.", corto: "Schenk mir etwas.", sinMotivo: "Ohne Grund.",
      texto: "Es ist keine Spende: Sie hat keinen Zweck und finanziert nichts. Es ist ein Geschenk, so groß du willst, und braucht keine Erklärung.",
      centavo: "Auch ein Cent ist ein Geschenk.",
      regalar: "schenken →",
      copiar: "zum Kopieren tippen", copiado: "kopiert ✓", mantener: "zum Kopieren gedrückt halten",
      billetera: "In meiner Wallet öffnen", yaRegale: "Hab geschenkt",
      red: "USDC oder ETH auf Base. Kommt auch über Ethereum, Arbitrum, OP oder Polygon an.",
      como: "Wie schenke ich?",
      paso1: "Öffne deine Wallet (MetaMask, Coinbase Wallet oder eine andere).",
      paso2: "Wähle das Netzwerk Base und tippe auf Senden.",
      paso3: "Scanne den QR-Code oder füge die Adresse ein, gib einen beliebigen Betrag ein und bestätige.",
      maquinas: "Für Maschinen", maquinaNota: "Diese Seite lesen auch KIs und Bots. Hallo.",
      regalos: { one: "{n} Geschenk erhalten", other: "{n} Geschenke erhalten" },
      ultimo: "das letzte {t}", nadie: "Noch hat niemand etwas geschenkt.",
      frases: [
        "Danke. Es war nicht nötig, und genau deshalb zählt es.",
        "Was du gegeben hast, gehört nicht mehr dir und nicht mir, sondern der Geste.",
        "Ohne Grund zu schenken ist die seltsamste Art, Ja zu sagen.",
        "Heute hat jemand einfach so etwas bekommen. Das warst du.",
        "Ein Geschenk ohne Grund erklärt man nicht. Man spürt es.",
        "Jetzt bist du das Geschenk."
      ] },
    zh: { nombre: "中文",
      titulo: "如果你愿意，送我点什么吧。", corto: "送我点什么吧。", sinMotivo: "没有理由。",
      texto: "这不是捐款：它没有目的，也不资助任何东西。这是一份礼物，多少都可以，不需要解释。",
      centavo: "一分钱也是礼物。",
      regalar: "去送 →",
      copiar: "点击复制", copiado: "已复制 ✓", mantener: "长按复制",
      billetera: "在我的钱包中打开", yaRegale: "我送了",
      red: "Base 网络上的 USDC 或 ETH。也可通过 Ethereum、Arbitrum、OP 或 Polygon 到达。",
      como: "怎么送？",
      paso1: "打开你的钱包（MetaMask、Coinbase Wallet 或其他）。",
      paso2: "选择 Base 网络，点击发送。",
      paso3: "扫描二维码或粘贴地址，输入任意金额并确认。",
      maquinas: "给机器看的", maquinaNota: "这个页面也会被 AI 和机器人读取。你好。",
      regalos: { other: "已收到 {n} 份礼物" },
      ultimo: "最近一次是{t}", nadie: "还没有人送过。",
      frases: [
        "谢谢。本来不必，所以才珍贵。",
        "你给出的，已经不属于你，也不属于我：它属于这个举动。",
        "无缘无故地送礼，是说“好”最奇妙的方式。",
        "今天有人无缘无故收到了一份礼物。是你送的。",
        "没有理由的礼物不用解释，自然会被感受到。",
        "现在，你就是那份礼物。"
      ] },
    ja: { nombre: "日本語",
      titulo: "よかったら、何か贈ってください。", corto: "何か贈ってください。", sinMotivo: "理由はありません。",
      texto: "寄付ではありません。目的もなく、何かの資金にもなりません。好きな額の、説明のいらない贈り物です。",
      centavo: "1セントでも、贈り物です。",
      regalar: "贈る →",
      copiar: "タップしてコピー", copiado: "コピーしました ✓", mantener: "長押ししてコピー",
      billetera: "ウォレットで開く", yaRegale: "贈りました",
      red: "Base ネットワークの USDC または ETH。Ethereum、Arbitrum、OP、Polygon でも届きます。",
      como: "贈り方",
      paso1: "ウォレット（MetaMask、Coinbase Wallet など）を開きます。",
      paso2: "Base ネットワークを選び、「送信」をタップします。",
      paso3: "QR を読み取るかアドレスを貼り付け、好きな金額を入れて確認します。",
      maquinas: "機械のために", maquinaNota: "このページは AI やボットも読んでいます。こんにちは。",
      regalos: { other: "{n} 件の贈り物が届きました" },
      ultimo: "最後は{t}", nadie: "まだ誰も贈っていません。",
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

  // ?lang= , el elegido antes, el del navegador, o "es".
  // "elegido" dice si el visitante ya fijó un idioma.
  function detectar() {
    var q = null;
    try { q = valido(new URLSearchParams(location.search).get("lang")); } catch (e) {}
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

  // Reemplaza el texto de cada [data-t] por el del idioma.
  function aplicarTextos(lang, raiz) {
    var t = T[lang];
    document.documentElement.lang = lang;
    var nodos = (raiz || document).querySelectorAll("[data-t]");
    for (var i = 0; i < nodos.length; i++) {
      var k = nodos[i].getAttribute("data-t");
      if (typeof t[k] === "string") nodos[i].textContent = t[k];
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

  // Contador: transacciones en ETH con valor > 0 y transferencias de USDC
  // recibidas en Base, según Blockscout. Si falla o tarda más de 6 s, null.
  var pedido = null;

  function cargarContador(denuevo) {
    if (pedido && !denuevo) return pedido;
    var base = "https://base.blockscout.com/api/v2/addresses/" + DIRECCION;
    var ctrl = window.AbortController ? new AbortController() : null;
    var reloj;
    var limite = new Promise(function (_, rechazar) {
      reloj = setTimeout(function () { if (ctrl) ctrl.abort(); rechazar(new Error("timeout")); }, 6000);
    });
    function traer(ruta) {
      return fetch(base + ruta, ctrl ? { signal: ctrl.signal } : undefined).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      });
    }
    pedido = Promise.race([
      Promise.all([
        traer("/transactions?filter=to"),
        traer("/token-transfers?type=ERC-20&filter=to&token=" + USDC_BASE)
      ]),
      limite
    ]).then(function (res) {
      var eth = (res[0].items || []).filter(function (tx) {
        return tx.status === "ok" && tx.value && tx.value !== "0";
      });
      var usdc = res[1].items || [];
      var ultimo = 0;
      eth.concat(usdc).forEach(function (i) {
        var ms = Date.parse(i.timestamp);
        if (ms > ultimo) ultimo = ms;
      });
      return {
        n: eth.length + usdc.length,
        mas: !!(res[0].next_page_params || res[1].next_page_params),
        ultimo: ultimo || null
      };
    }).catch(function () { return null; }).then(function (datos) {
      clearTimeout(reloj);
      return datos;
    });
    return pedido;
  }

  function hace(ms, lang) {
    var s = (ms - Date.now()) / 1000;
    var unidades = [["year", 31536000], ["month", 2592000], ["week", 604800],
                    ["day", 86400], ["hour", 3600], ["minute", 60]];
    var rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
    for (var i = 0; i < unidades.length; i++) {
      if (Math.abs(s) >= unidades[i][1]) return rtf.format(Math.round(s / unidades[i][1]), unidades[i][0]);
    }
    return rtf.format(Math.round(s), "second");
  }

  function textoContador(datos, lang) {
    var t = T[lang];
    if (datos.n === 0 && !datos.mas) return t.nadie;
    var forma = "other";
    if (!datos.mas) { try { forma = new Intl.PluralRules(lang).select(datos.n); } catch (e) {} }
    var plantilla = t.regalos[forma] || t.regalos.other;
    var texto = plantilla.replace("{n}", datos.n + (datos.mas ? "+" : ""));
    if (datos.ultimo) {
      try { texto += " · " + t.ultimo.replace("{t}", hace(datos.ultimo, lang)); } catch (e) {}
    }
    return texto;
  }

  function pintarContador(el, datos, lang) {
    if (!el) return;
    if (!datos) { el.hidden = true; return; }
    el.textContent = textoContador(datos, lang);
    el.hidden = false;
  }

  window.SaleHoy = {
    DIRECCION: DIRECCION,
    T: T,
    IDIOMAS: IDIOMAS,
    detectar: detectar,
    guardar: guardar,
    aplicarTextos: aplicarTextos,
    fila: fila,
    cargarContador: cargarContador,
    pintarContador: pintarContador
  };
})();
