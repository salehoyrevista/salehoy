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
      noEsta: "Esto ya no está.", hayCielo: "Pero hay un cielo.", irCielo: "ir al cielo →",
      silencio: "{t} sin respuesta", recien: "Alguien acaba de responder.",
      momento: {"formato":"{dia} {franja}, {luna}","dias":["un domingo","un lunes","un martes","un miércoles","un jueves","un viernes","un sábado"],"franjas":["de madrugada","a la mañana","al mediodía","a la tarde","de noche"],"lunas":["con luna nueva","con luna creciente","con luna llena","con luna menguante"]},
      clicTitulo: "Regalá desde esta billetera",
      monto: "monto",
      clicBoton: "Regalar →",
      abriendo: "Abriendo tu billetera…",
      red: "Pasando a la red Base…",
      confirmar: "Confirmalo en tu billetera.",
      enviado: "Salió. Esperando que llegue al cielo…",
      ahiEsta: "Ahí está: n.º {n}.",
      verCielo: "verlo en el cielo →",
      nuevo: "Llegó un regalo nuevo: n.º {n}.",
      tarda: "Ya salió. Puede tardar unos minutos en aparecer en el cielo.",
      cancelado: "No se envió nada.",
      fallo: "No se pudo. Probá de nuevo o usá la dirección de abajo.",
      montoInvalido: "Poné un monto mayor que cero.",
      movil: "¿Desde el celular? Abrí esta página dentro de tu billetera:",
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
      noEsta: "This isn’t here anymore.", hayCielo: "But there’s a sky.", irCielo: "go to the sky →",
      silencio: "{t} without an answer", recien: "Someone just answered.",
      momento: {"formato":"{dia} {franja}, {luna}","dias":["on a Sunday","on a Monday","on a Tuesday","on a Wednesday","on a Thursday","on a Friday","on a Saturday"],"franjas":["before dawn","in the morning","at noon","in the afternoon","at night"],"lunas":["under a new moon","under a waxing moon","under a full moon","under a waning moon"]},
      clicTitulo: "Give from this wallet",
      monto: "amount",
      clicBoton: "Give →",
      abriendo: "Opening your wallet…",
      red: "Switching to the Base network…",
      confirmar: "Confirm it in your wallet.",
      enviado: "Sent. Waiting for it to reach the sky…",
      ahiEsta: "There it is: no. {n}.",
      verCielo: "see it in the sky →",
      nuevo: "A new gift arrived: no. {n}.",
      tarda: "It's on its way. It may take a few minutes to appear in the sky.",
      cancelado: "Nothing was sent.",
      fallo: "That didn't work. Try again or use the address below.",
      montoInvalido: "Enter an amount greater than zero.",
      movil: "On your phone? Open this page inside your wallet:",
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
      noEsta: "Isto já não está aqui.", hayCielo: "Mas há um céu.", irCielo: "ir para o céu →",
      silencio: "{t} sem resposta", recien: "Alguém acabou de responder.",
      momento: {"formato":"{dia} {franja}, {luna}","dias":["num domingo","numa segunda","numa terça","numa quarta","numa quinta","numa sexta","num sábado"],"franjas":["de madrugada","de manhã","ao meio-dia","à tarde","à noite"],"lunas":["com lua nova","com lua crescente","com lua cheia","com lua minguante"]},
      clicTitulo: "Presenteie desta carteira",
      monto: "valor",
      clicBoton: "Presentear →",
      abriendo: "Abrindo sua carteira…",
      red: "Mudando para a rede Base…",
      confirmar: "Confirme na sua carteira.",
      enviado: "Saiu. Esperando chegar ao céu…",
      ahiEsta: "Ali está: n.º {n}.",
      verCielo: "ver no céu →",
      nuevo: "Chegou um presente novo: n.º {n}.",
      tarda: "Já saiu. Pode levar alguns minutos para aparecer no céu.",
      cancelado: "Nada foi enviado.",
      fallo: "Não deu certo. Tente de novo ou use o endereço abaixo.",
      montoInvalido: "Coloque um valor maior que zero.",
      movil: "No celular? Abra esta página dentro da sua carteira:",
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
      noEsta: "Ceci n’est plus là.", hayCielo: "Mais il y a un ciel.", irCielo: "aller au ciel →",
      silencio: "{t} sans réponse", recien: "Quelqu’un vient de répondre.",
      momento: {"formato":"{dia} {franja}, {luna}","dias":["un dimanche","un lundi","un mardi","un mercredi","un jeudi","un vendredi","un samedi"],"franjas":["avant l’aube","le matin","à midi","l’après-midi","la nuit"],"lunas":["sous une lune nouvelle","sous une lune croissante","sous la pleine lune","sous une lune décroissante"]},
      clicTitulo: "Offrir depuis ce portefeuille",
      monto: "montant",
      clicBoton: "Offrir →",
      abriendo: "Ouverture de ton portefeuille…",
      red: "Passage au réseau Base…",
      confirmar: "Confirme dans ton portefeuille.",
      enviado: "C'est parti. En attendant qu'il arrive dans le ciel…",
      ahiEsta: "Le voilà : n° {n}.",
      verCielo: "le voir dans le ciel →",
      nuevo: "Un nouveau cadeau est arrivé : n° {n}.",
      tarda: "C'est parti. Il peut mettre quelques minutes à apparaître dans le ciel.",
      cancelado: "Rien n'a été envoyé.",
      fallo: "Ça n'a pas marché. Réessaie ou utilise l'adresse ci-dessous.",
      montoInvalido: "Indique un montant supérieur à zéro.",
      movil: "Sur ton téléphone ? Ouvre cette page dans ton portefeuille :",
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
      noEsta: "Questo non c’è più.", hayCielo: "Ma c’è un cielo.", irCielo: "vai al cielo →",
      silencio: "{t} senza risposta", recien: "Qualcuno ha appena risposto.",
      momento: {"formato":"{dia} {franja}, {luna}","dias":["di domenica","di lunedì","di martedì","di mercoledì","di giovedì","di venerdì","di sabato"],"franjas":["prima dell’alba","di mattina","a mezzogiorno","di pomeriggio","di notte"],"lunas":["con la luna nuova","con la luna crescente","con la luna piena","con la luna calante"]},
      clicTitulo: "Regala da questo wallet",
      monto: "importo",
      clicBoton: "Regala →",
      abriendo: "Apro il tuo wallet…",
      red: "Passo alla rete Base…",
      confirmar: "Confermalo nel tuo wallet.",
      enviado: "Partito. Aspettiamo che arrivi in cielo…",
      ahiEsta: "Eccolo: n. {n}.",
      verCielo: "vederlo nel cielo →",
      nuevo: "È arrivato un nuovo regalo: n. {n}.",
      tarda: "È partito. Può volerci qualche minuto prima che appaia nel cielo.",
      cancelado: "Non è stato inviato niente.",
      fallo: "Non è andata. Riprova o usa l'indirizzo qui sotto.",
      montoInvalido: "Metti un importo maggiore di zero.",
      movil: "Dal telefono? Apri questa pagina dentro il tuo wallet:",
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
      noEsta: "Das gibt es nicht mehr.", hayCielo: "Aber es gibt einen Himmel.", irCielo: "zum Himmel →",
      silencio: "{t} ohne Antwort", recien: "Gerade hat jemand geantwortet.",
      momento: {"formato":"{dia} {franja}, {luna}","dias":["an einem Sonntag","an einem Montag","an einem Dienstag","an einem Mittwoch","an einem Donnerstag","an einem Freitag","an einem Samstag"],"franjas":["vor dem Morgengrauen","am Morgen","am Mittag","am Nachmittag","in der Nacht"],"lunas":["bei Neumond","bei zunehmendem Mond","bei Vollmond","bei abnehmendem Mond"]},
      clicTitulo: "Aus dieser Wallet schenken",
      monto: "Betrag",
      clicBoton: "Schenken →",
      abriendo: "Deine Wallet wird geöffnet…",
      red: "Wechsel ins Base-Netzwerk…",
      confirmar: "Bestätige es in deiner Wallet.",
      enviado: "Unterwegs. Warten, bis es am Himmel ankommt…",
      ahiEsta: "Da ist es: Nr. {n}.",
      verCielo: "am Himmel ansehen →",
      nuevo: "Ein neues Geschenk ist angekommen: Nr. {n}.",
      tarda: "Es ist unterwegs. Es kann ein paar Minuten dauern, bis es am Himmel erscheint.",
      cancelado: "Es wurde nichts gesendet.",
      fallo: "Das hat nicht geklappt. Versuch es noch einmal oder nutze die Adresse unten.",
      montoInvalido: "Gib einen Betrag größer als null ein.",
      movil: "Am Handy? Öffne diese Seite in deiner Wallet:",
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
      noEsta: "这里已经没有了。", hayCielo: "但有一片天空。", irCielo: "去天空 →",
      silencio: "{t}没有回应", recien: "刚刚有人回应了。",
      momento: {"formato":"{dia}{franja}，{luna}","dias":["一个星期日","一个星期一","一个星期二","一个星期三","一个星期四","一个星期五","一个星期六"],"franjas":["凌晨","早上","中午","下午","夜里"],"lunas":["新月之时","月渐盈时","满月之时","月渐亏时"]},
      clicTitulo: "用这个钱包送",
      monto: "金额",
      clicBoton: "送出 →",
      abriendo: "正在打开你的钱包…",
      red: "正在切换到 Base 网络…",
      confirmar: "请在钱包中确认。",
      enviado: "已发出。等它抵达天空…",
      ahiEsta: "它在这里：第 {n} 号。",
      verCielo: "在天空中查看 →",
      nuevo: "来了一份新礼物：第 {n} 号。",
      tarda: "已经发出。可能需要几分钟才会出现在天空中。",
      cancelado: "什么也没有发送。",
      fallo: "没有成功。请再试一次，或使用下面的地址。",
      montoInvalido: "请输入大于零的金额。",
      movil: "在手机上？请在你的钱包里打开这个页面：",
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
      noEsta: "ここにはもうありません。", hayCielo: "でも、空があります。", irCielo: "空へ →",
      silencio: "{t}、応答なし", recien: "たったいま、誰かが応えました。",
      momento: {"formato":"{dia}{franja}、{luna}の下で","dias":["ある日曜日の","ある月曜日の","ある火曜日の","ある水曜日の","ある木曜日の","ある金曜日の","ある土曜日の"],"franjas":["明け方","朝","昼","午後","夜"],"lunas":["新月","満ちていく月","満月","欠けていく月"]},
      clicTitulo: "このウォレットから贈る",
      monto: "金額",
      clicBoton: "贈る →",
      abriendo: "ウォレットを開いています…",
      red: "Base ネットワークに切り替えています…",
      confirmar: "ウォレットで確認してください。",
      enviado: "送信しました。空に届くのを待っています…",
      ahiEsta: "ありました：No. {n}。",
      verCielo: "空で見る →",
      nuevo: "新しい贈り物が届きました：No. {n}。",
      tarda: "送信済みです。空に現れるまで数分かかることがあります。",
      cancelado: "何も送信されませんでした。",
      fallo: "うまくいきませんでした。もう一度試すか、下のアドレスを使ってください。",
      montoInvalido: "0 より大きい金額を入れてください。",
      movil: "スマートフォンですか？ウォレットの中でこのページを開いてください：",
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

  // Caché compartida en /api/regalos (función de Netlify, se renueva cada
  // minuto): responde rápido. Trae lo mismo que Blockscout, sin remitentes.
  function desdeCache(senal) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var reloj = setTimeout(function () { if (ctrl) ctrl.abort(); }, 2500);
    if (senal && ctrl) senal.addEventListener("abort", function () { ctrl.abort(); });
    return fetch("/api/regalos", ctrl ? { signal: ctrl.signal } : undefined).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (j) {
      clearTimeout(reloj);
      if (!j || !Array.isArray(j.transacciones) || !Array.isArray(j.transferencias)) throw new Error("formato");
      return [j.transacciones, j.transferencias];
    }, function (e) { clearTimeout(reloj); throw e; });
  }

  // Blockscout directo desde el navegador: siempre al día, pero tarda más.
  function desdeBlockscout(senal) {
    var base = "https://base.blockscout.com/api/v2/addresses/" + DIRECCION;
    return Promise.all([
      traerTodo(base + "/transactions?filter=to", senal, 20),
      traerTodo(base + "/token-transfers?type=ERC-20&filter=to&token=" + USDC_BASE, senal, 20)
    ]);
  }

  // Lista de regalos (del más viejo al más nuevo, numerados desde 1),
  // o null si no hay datos en 6 s. Primero la caché; con "denuevo" (cuando
  // alguien espera ver su regalo) primero Blockscout, que está al día.
  var pedido = null;

  function cargarRegalos(denuevo) {
    if (pedido && !denuevo) return pedido;
    var ctrl = window.AbortController ? new AbortController() : null;
    var reloj;
    var limite = new Promise(function (_, rechazar) {
      reloj = setTimeout(function () { if (ctrl) ctrl.abort(); rechazar(new Error("timeout")); }, 6000);
    });
    var senal = ctrl ? ctrl.signal : null;
    var primero = denuevo ? desdeBlockscout : desdeCache;
    var segundo = denuevo ? desdeCache : desdeBlockscout;
    pedido = Promise.race([
      primero(senal).catch(function () { return segundo(senal); }),
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

  // "N ✱ · " para el contador, con el ✱ dibujado; "— ✱ · " mientras carga o si no hay datos.
  function pintarCuenta(el, regalos) {
    el.innerHTML = (regalos ? regalos.length : "—") + " " + SVG_ASTERISCO + " · ";
  }

  // "1 día y 4 horas", en el idioma del visitante.
  function duracion(ms, lang) {
    var d = Math.floor(ms / 86400000), h = Math.floor(ms % 86400000 / 3600000), m = Math.floor(ms % 3600000 / 60000);
    var partes = d ? [[d, "day"], [h, "hour"]] : h ? [[h, "hour"], [m, "minute"]] : [[Math.max(1, m), "minute"]];
    partes = partes.filter(function (p) { return p[0] > 0; });
    try {
      var textos = partes.map(function (p) {
        return new Intl.NumberFormat(lang, { style: "unit", unit: p[1], unitDisplay: "long" }).format(p[0]);
      });
      return new Intl.ListFormat(lang, { type: "conjunction" }).format(textos);
    } catch (e) {
      return partes.map(function (p) { return p[0] + p[1].charAt(0); }).join(" ");
    }
  }

  // La línea de cada regalo: día de la semana, franja del día y fase de la
  // luna, en la hora de Argentina (UTC-3, sin horario de verano). No usa
  // montos ni direcciones: solo el momento.
  var LUNA_NUEVA = Date.UTC(2000, 0, 6, 18, 14);
  var MES_SINODICO = 29.530588853;
  function momento(ms, lang) {
    var m = T[lang].momento;
    var arg = new Date(ms - 3 * 3600000);
    var hora = arg.getUTCHours();
    var franja = hora < 6 ? 0 : hora < 12 ? 1 : hora < 14 ? 2 : hora < 20 ? 3 : 4;
    var fase = (((ms - LUNA_NUEVA) / 86400000 / MES_SINODICO) % 1 + 1) % 1;
    var luna = fase < 0.034 || fase > 0.966 ? 0 : fase < 0.466 ? 1 : fase < 0.534 ? 2 : 3;
    return m.formato.replace("{dia}", m.dias[arg.getUTCDay()]).replace("{franja}", m.franjas[franja]).replace("{luna}", m.lunas[luna]);
  }

  window.SaleHoy = {
    duracion: duracion,
    momento: momento,
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
