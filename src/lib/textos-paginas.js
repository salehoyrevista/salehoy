// Textos de "regalar una estrella" y "frases" en francés, italiano, alemán,
// chino y japonés. Español, inglés y portugués tienen archivo propio en
// src/pages/. Los marcadores {cielo}, {regalo}, {frases}, {sobre} y
// {estrella} se reemplazan por las direcciones del idioma (RUTAS).
// El HTML de estos textos es propio (nunca viene de visitantes).

export const ESTRELLA = {
  fr: {
    titulo: "Offrir une étoile : ce qu’on peut vraiment offrir",
    descripcion: "Peut-on offrir une étoile avec un nom ? Pas officiellement. Ce que vendent les registres d’étoiles, et une autre manière : une étoile permanente dans une œuvre d’art, avec ta dédicace.",
    h1: "Offrir une étoile",
    entrada: "C’est possible. Mais mieux vaut savoir ce qu’on offre.",
    secciones: [
      ["Peut-on vraiment donner un nom à une étoile ?", [
        "Pas officiellement. L’<strong>Union astronomique internationale</strong> est le seul organisme qui nomme les objets du ciel, et elle ne vend pas de noms ni ne reconnaît ceux qui sont vendus. La plupart des étoiles n’ont même pas de nom : elles ont un numéro de catalogue.",
        "Les sites qui proposent de « donner ton nom à une étoile » envoient un certificat et des coordonnées. C’est un geste symbolique, et ça peut être un beau cadeau. Mais le nom n’existe que dans la base de données de cette entreprise : aucun astronome ne l’utilisera, et une autre entreprise peut vendre la même étoile à quelqu’un d’autre."
      ]],
      ["Alors, qu’est-ce qu’on offre ?", [
        "Un geste. Ce qui compte dans une étoile offerte, ce n’est pas l’astronomie : c’est dire à quelqu’un qu’on a pensé à quelque chose qui dure. La question est de savoir si le cadeau dit la vérité sur ce qu’il est."
      ]]
    ],
    otraManera: "Une autre manière : une étoile dans une œuvre d’art",
    intro: "<a href=\"{cielo}\"><em>Sin motivo</em></a> (« sans raison ») est une œuvre de Solzimer : un ciel où chaque cadeau devient un astérisque — du grec <em>asteriskos</em>, « petite étoile » — qui reste pour toujours. Elle ne promet pas une place dans le firmament. Elle promet ce qu’elle peut tenir :",
    lista: [
      "<strong>Elle est permanente.</strong> Chaque étoile est une transaction sur une blockchain publique. Personne ne peut l’effacer, pas même l’auteur.",
      "<strong>Elle porte ta dédicace.</strong> Jusqu’à 80 caractères écrits dans la transaction elle-même : <em>« Pour Ana. Sans raison. »</em>",
      "<strong>Elle a son lien.</strong> Tu l’envoies à qui tu veux. À l’ouverture, l’astérisque naît trait par trait, avec son numéro et le moment où tu l’as offert : <em>« un dimanche avant l’aube, sous une lune croissante »</em>.",
      "<strong>Elle est unique.</strong> La forme de chaque astérisque vient de la transaction. L’auteur ne la choisit pas et le montant ne la décide pas.",
      "<strong>Elle n’a pas de prix.</strong> Tu offres ce que tu veux. Le montant n’est jamais affiché : un centime et une fortune dessinent la même chose."
    ],
    noEs: "Ce qu’elle n’est pas : un registre astronomique, un certificat ou un investissement. C’est une œuvre d’art en cours depuis le 29 octobre 2026. Le nombre d’étoiles qu’elle compte aujourd’hui se voit dans <a href=\"{cielo}\">le ciel</a>.",
    como: "Comment l’offrir",
    pasos: [
      "Ouvre <a href=\"{regalo}\">offrir</a> avec un portefeuille qui contient de l’ETH sur le réseau Base.",
      "Écris la dédicace, choisis n’importe quel montant et confirme.",
      "Quand l’astérisque apparaît, copie son lien et envoie-le à cette personne."
    ],
    accion: "offrir une étoile →",
    preguntas: "Questions",
    faq: [
      ["Peut-on officiellement donner un nom à une étoile ?", "Non. L’Union astronomique internationale est le seul organisme qui nomme les objets célestes, et elle ne vend pas de noms. Les sites qui proposent de « nommer une étoile » remettent un certificat symbolique : le nom ne figure dans aucun catalogue astronomique."],
      ["Combien coûte une étoile dans Sin motivo ?", "Ce que tu veux. Il n’y a pas de prix. Le montant n’est jamais affiché et ne change rien : un centime et une fortune dessinent le même astérisque."],
      ["Que reçoit la personne à qui je l’offre ?", "Un lien. À l’ouverture, l’astérisque naît trait par trait dans le ciel, avec son numéro, le moment où tu l’as offert et ta dédicace."],
      ["Faut-il des cryptomonnaies ?", "Oui. Le cadeau se fait en ETH ou en USDC sur le réseau Base. La dédicace ne voyage qu’avec l’ETH, parce qu’elle est écrite dans la transaction elle-même."],
      ["Peut-on l’effacer ou la modifier ensuite ?", "Non. La transaction et sa dédicace restent sur une blockchain publique. C’est pour ça que l’étoile est permanente, et qu’il vaut mieux réfléchir à ce qu’on écrit."],
      ["Est-ce un certificat ou un registre astronomique ?", "Non. C’est une œuvre d’art : Sin motivo, de Solzimer. L’étoile est un astérisque dessiné dans un ciel qui existe sur ce site et sur la blockchain, pas dans le firmament."]
    ],
    cierre: "Tu cherches quoi écrire ? Voici des <a href=\"{frases}\">phrases pour un cadeau sans raison</a>. Pour comprendre l’œuvre, <a href=\"{sobre}\">lis sa présentation</a>."
  },

  it: {
    titulo: "Regalare una stella: cosa si può davvero regalare",
    descripcion: "Si può regalare una stella con un nome? Ufficialmente no. Cosa vendono i registri di stelle, e un altro modo: una stella permanente in un’opera d’arte, con la tua dedica.",
    h1: "Regalare una stella",
    entrada: "Si può. Ma conviene sapere cosa si sta regalando.",
    secciones: [
      ["Si può davvero dare un nome a una stella?", [
        "Non ufficialmente. L’<strong>Unione Astronomica Internazionale</strong> è l’unico organismo che dà nomi agli oggetti del cielo, e non vende nomi né riconosce quelli venduti. Quasi nessuna stella ha un nome: ha un numero di catalogo.",
        "I siti che offrono di «dare il tuo nome a una stella» mandano un certificato e delle coordinate. È un gesto simbolico, e può essere un bel regalo. Ma il nome esiste solo nel database di quell’azienda: nessun astronomo lo userà, e un’altra azienda può vendere la stessa stella a qualcun altro."
      ]],
      ["Allora, cosa si regala?", [
        "Un gesto. Quello che conta in una stella regalata non è l’astronomia: è dire a qualcuno che hai pensato a qualcosa che dura. La domanda è se il regalo dice la verità su quello che è."
      ]]
    ],
    otraManera: "Un altro modo: una stella in un’opera d’arte",
    intro: "<a href=\"{cielo}\"><em>Sin motivo</em></a> («senza motivo») è un’opera di Solzimer: un cielo dove ogni regalo diventa un asterisco — dal greco <em>asteriskos</em>, «stellina» — che resta per sempre. Non promette un posto nel firmamento. Promette quello che può mantenere:",
    lista: [
      "<strong>È permanente.</strong> Ogni stella è una transazione su una blockchain pubblica. Nessuno può cancellarla, nemmeno l’autore.",
      "<strong>Porta la tua dedica.</strong> Fino a 80 caratteri scritti dentro la transazione stessa: <em>«Per Ana. Senza motivo.»</em>",
      "<strong>Ha il suo link.</strong> Lo mandi a chi vuoi. Aprendolo, l’asterisco nasce tratto per tratto, con il suo numero e il momento in cui l’hai regalato: <em>«di domenica prima dell’alba, con la luna crescente»</em>.",
      "<strong>È unica.</strong> La forma di ogni asterisco viene dalla transazione. L’autore non la sceglie e l’importo non la decide.",
      "<strong>Non ha prezzo.</strong> Regali quanto vuoi. L’importo non si mostra mai: un centesimo e una fortuna disegnano la stessa cosa."
    ],
    noEs: "Cosa non è: un registro astronomico, un certificato o un investimento. È un’opera d’arte in corso dal 29 ottobre 2026. Quante stelle ha oggi si vede nel <a href=\"{cielo}\">cielo</a>.",
    como: "Come regalarla",
    pasos: [
      "Apri <a href=\"{regalo}\">regala</a> con un wallet che abbia ETH sulla rete Base.",
      "Scrivi la dedica, scegli qualsiasi importo e conferma.",
      "Quando appare l’asterisco, copia il suo link e mandalo a quella persona."
    ],
    accion: "regala una stella →",
    preguntas: "Domande",
    faq: [
      ["Si può dare ufficialmente un nome a una stella?", "No. L’Unione Astronomica Internazionale è l’unico organismo che dà nomi agli oggetti celesti, e non vende nomi. I siti che offrono di «battezzare una stella» consegnano un certificato simbolico: il nome non compare in nessun catalogo astronomico."],
      ["Quanto costa regalare una stella in Sin motivo?", "Quanto vuoi. Non c’è un prezzo. L’importo non si mostra mai e non cambia niente: un centesimo e una fortuna disegnano lo stesso asterisco."],
      ["Cosa riceve la persona a cui la regalo?", "Un link. Aprendolo, l’asterisco nasce tratto per tratto nel cielo, con il suo numero, il momento in cui l’hai regalato e la tua dedica."],
      ["Servono criptovalute?", "Sì. Il regalo si fa in ETH o USDC sulla rete Base. La dedica viaggia solo con ETH, perché resta scritta dentro la transazione stessa."],
      ["Si può cancellare o cambiare dopo?", "No. La transazione e la sua dedica restano su una blockchain pubblica. Per questo la stella è permanente, e per questo conviene pensare a cosa si scrive."],
      ["È un certificato o un registro astronomico?", "No. È un’opera d’arte: Sin motivo, di Solzimer. La stella è un asterisco disegnato in un cielo che esiste su questo sito e sulla blockchain, non nel firmamento."]
    ],
    cierre: "Cerchi cosa scrivere? Ecco delle <a href=\"{frases}\">frasi per un regalo senza motivo</a>. Per capire l’opera, <a href=\"{sobre}\">leggi la presentazione</a>."
  },

  de: {
    titulo: "Einen Stern schenken oder taufen: was wirklich geht",
    descripcion: "Kann man einen Stern mit Namen verschenken? Offiziell nicht. Was Sternregister verkaufen – und ein anderer Weg: ein bleibender Stern in einem Kunstwerk, mit deiner Widmung.",
    h1: "Einen Stern schenken",
    entrada: "Das geht. Aber es hilft zu wissen, was man da verschenkt.",
    secciones: [
      ["Kann man einem echten Stern einen Namen geben?", [
        "Nicht offiziell. Die <strong>Internationale Astronomische Union</strong> ist die einzige Stelle, die Himmelsobjekte benennt, und sie verkauft keine Namen und erkennt verkaufte nicht an. Die meisten Sterne haben nicht einmal einen Namen, sondern eine Katalognummer.",
        "Seiten, die anbieten, „einen Stern nach jemandem zu taufen“, schicken eine Urkunde und Koordinaten. Das ist eine symbolische Geste und kann ein schönes Geschenk sein. Aber der Name existiert nur in der Datenbank dieser Firma: Kein Astronom wird ihn verwenden, und eine andere Firma kann denselben Stern an jemand anderen verkaufen."
      ]],
      ["Was verschenkt man dann?", [
        "Eine Geste. Bei einem geschenkten Stern geht es nicht um Astronomie, sondern darum, jemandem zu sagen, dass man an etwas gedacht hat, das bleibt. Die Frage ist, ob das Geschenk ehrlich sagt, was es ist."
      ]]
    ],
    otraManera: "Ein anderer Weg: ein Stern in einem Kunstwerk",
    intro: "<a href=\"{cielo}\"><em>Sin motivo</em></a> („ohne Grund“) ist ein Werk von Solzimer: ein Himmel, in dem jedes Geschenk zu einem Sternchen wird – vom griechischen <em>asteriskos</em>, „kleiner Stern“ –, das für immer bleibt. Es verspricht keinen Platz am Firmament. Es verspricht, was es halten kann:",
    lista: [
      "<strong>Er bleibt.</strong> Jeder Stern ist eine Transaktion auf einer öffentlichen Blockchain. Niemand kann ihn löschen, nicht einmal der Autor.",
      "<strong>Er trägt deine Widmung.</strong> Bis zu 80 Zeichen, geschrieben in die Transaktion selbst: <em>„Für Ana. Ohne Grund.“</em>",
      "<strong>Er hat einen eigenen Link.</strong> Du schickst ihn, wem du willst. Beim Öffnen entsteht das Sternchen Strich für Strich, mit seiner Nummer und dem Moment, in dem du es geschenkt hast: <em>„an einem Sonntag vor dem Morgengrauen, bei zunehmendem Mond“</em>.",
      "<strong>Er ist einzigartig.</strong> Die Form jedes Sternchens ergibt sich aus der Transaktion. Der Autor wählt sie nicht, und der Betrag entscheidet nichts.",
      "<strong>Er hat keinen Preis.</strong> Du schenkst, so viel du willst. Der Betrag wird nie gezeigt: Ein Cent und ein Vermögen zeichnen dasselbe."
    ],
    noEs: "Was er nicht ist: ein astronomisches Register, eine Urkunde oder eine Geldanlage. Es ist ein Kunstwerk, fortlaufend seit dem 29. Oktober 2026. Wie viele Sterne es heute hat, siehst du am <a href=\"{cielo}\">Himmel</a>.",
    como: "So verschenkst du einen",
    pasos: [
      "Öffne <a href=\"{regalo}\">schenken</a> mit einer Wallet, die ETH im Base-Netzwerk hat.",
      "Schreib die Widmung, wähle einen beliebigen Betrag und bestätige.",
      "Wenn das Sternchen erscheint, kopiere seinen Link und schick ihn dieser Person."
    ],
    accion: "einen Stern schenken →",
    preguntas: "Fragen",
    faq: [
      ["Kann man einen Stern offiziell benennen?", "Nein. Die Internationale Astronomische Union ist die einzige Stelle, die Himmelsobjekte benennt, und sie verkauft keine Namen. Anbieter von Sterntaufen und Sternpatenschaften liefern eine symbolische Urkunde: Der Name steht in keinem astronomischen Katalog."],
      ["Was kostet ein Stern in Sin motivo?", "So viel du willst. Es gibt keinen Preis. Der Betrag wird nie gezeigt und ändert nichts: Ein Cent und ein Vermögen zeichnen dasselbe Sternchen."],
      ["Was bekommt die beschenkte Person?", "Einen Link. Beim Öffnen entsteht das Sternchen Strich für Strich am Himmel, mit seiner Nummer, dem Moment des Schenkens und deiner Widmung."],
      ["Brauche ich Kryptowährung?", "Ja. Geschenkt wird mit ETH oder USDC im Base-Netzwerk. Die Widmung geht nur mit ETH, weil sie in der Transaktion selbst steht."],
      ["Kann man ihn später löschen oder ändern?", "Nein. Die Transaktion und ihre Widmung bleiben auf einer öffentlichen Blockchain. Darum bleibt der Stern, und darum lohnt es sich, gut zu überlegen, was man schreibt."],
      ["Ist das eine Urkunde oder ein Sternregister?", "Nein. Es ist ein Kunstwerk: Sin motivo von Solzimer. Der Stern ist ein Sternchen in einem Himmel, der auf dieser Website und in der Blockchain existiert, nicht am Firmament."]
    ],
    cierre: "Suchst du Worte dafür? Hier sind <a href=\"{frases}\">Sprüche für ein Geschenk ohne Grund</a>. Mehr über das Werk <a href=\"{sobre}\">liest du hier</a>."
  },

  zh: {
    titulo: "送一颗星星：哪些能送，哪些不能",
    descripcion: "能把一颗有名字的星星送人吗？官方意义上不能。星星命名网站到底卖的是什么，以及另一种方式：一件艺术作品里的永久星星，带着你的题词。",
    h1: "送一颗星星",
    entrada: "可以。但最好先知道自己送的是什么。",
    secciones: [
      ["真的能给一颗星星命名吗？", [
        "官方意义上不能。<strong>国际天文学联合会</strong>是唯一为天体命名的机构，它不出售名字，也不承认被出售的名字。大多数星星甚至没有名字，只有一个星表编号。",
        "那些提供“用你的名字命名一颗星”的网站，寄给你的是一张证书和一组坐标。这是一种象征性的心意，也可以是一份很美的礼物。但这个名字只存在于那家公司的数据库里：没有天文学家会使用它，另一家公司也可以把同一颗星卖给别人。"
      ]],
      ["那么，送的到底是什么？", [
        "是一份心意。送星星重要的不是天文学，而是告诉一个人：你想到了某种会一直留下的东西。问题在于，这份礼物是否诚实地说明了它是什么。"
      ]]
    ],
    otraManera: "另一种方式：艺术作品里的一颗星",
    intro: "<a href=\"{cielo}\">《Sin motivo》</a>（“没有理由”）是 Solzimer 的一件作品：一片天空，每一份礼物都会变成一个星号——源自希腊语 <em>asteriskos</em>，意为“小星星”——永远留在那里。它不承诺你在苍穹中的位置，只承诺它能做到的：",
    lista: [
      "<strong>它是永久的。</strong>每一颗星都是公开区块链上的一笔交易。没有人能删除它，作者也不能。",
      "<strong>它带着你的题词。</strong>最多 80 个字符，写在交易本身里：<em>“给安娜。没有理由。”</em>",
      "<strong>它有自己的链接。</strong>你可以发给任何人。打开链接时，星号会一笔一笔地诞生，带着它的编号和你送出的时刻：<em>“一个星期日凌晨，月渐盈时”</em>。",
      "<strong>它独一无二。</strong>每个星号的形状来自那笔交易。作者不能选择，金额也不能决定。",
      "<strong>它没有价格。</strong>送多少都可以。金额从不显示：一分钱和一大笔钱画出的是同样的东西。"
    ],
    noEs: "它不是：天文登记、证书或投资。它是一件自 2026 年 10 月 29 日起持续进行的艺术作品。现在有多少颗星，可以在<a href=\"{cielo}\">天空</a>里看到。",
    como: "怎么送",
    pasos: [
      "用一个在 Base 网络上有 ETH 的钱包打开<a href=\"{regalo}\">送礼页面</a>。",
      "写下题词，选择任意金额并确认。",
      "星号出现后，复制它的链接，发给那个人。"
    ],
    accion: "送一颗星星 →",
    preguntas: "常见问题",
    faq: [
      ["能正式给一颗星星命名吗？", "不能。国际天文学联合会是唯一为天体命名的机构，它不出售名字。那些提供“星星命名”的网站给的是一张象征性的证书：这个名字不会出现在任何天文星表中。"],
      ["在 Sin motivo 送一颗星星要多少钱？", "随你。没有价格。金额从不显示，也不改变任何东西：一分钱和一大笔钱画出的是同一个星号。"],
      ["收到的人会得到什么？", "一个链接。打开后，星号会在天空中一笔一笔地诞生，带着它的编号、你送出的时刻和你的题词。"],
      ["需要加密货币吗？", "需要。礼物用 Base 网络上的 ETH 或 USDC 送出。题词只能随 ETH 一起发送，因为它写在交易本身里。"],
      ["之后能删除或修改吗？", "不能。交易和题词都留在公开的区块链上。所以这颗星是永久的，也所以写之前值得想一想。"],
      ["这是证书或天文登记吗？", "不是。这是一件艺术作品：Solzimer 的《Sin motivo》。这颗星是一个画在天空里的星号，这片天空存在于这个网站和区块链上，而不在真正的苍穹中。"]
    ],
    cierre: "不知道写什么？这里有<a href=\"{frases}\">无缘无故送礼时可以写的话</a>。想了解这件作品，<a href=\"{sobre}\">请看介绍</a>。"
  },

  ja: {
    titulo: "星を贈る：本当に贈れるもの、贈れないもの",
    descripcion: "名前のついた星をプレゼントできる？公式にはできません。星の命名サービスが実際に売っているもの、そしてもうひとつの方法：あなたの献辞が入った、アート作品の中の永遠の星。",
    h1: "星を贈る",
    entrada: "贈れます。ただ、何を贈るのかは知っておいたほうがいい。",
    secciones: [
      ["本物の星に名前をつけられる？", [
        "公式にはできません。天体に名前をつけるのは<strong>国際天文学連合</strong>だけで、名前を売ることも、売られた名前を認めることもありません。ほとんどの星には名前すらなく、カタログ番号があるだけです。",
        "「星にあなたの名前をつける」サービスが送ってくるのは、証明書と座標です。象徴的な気持ちの表し方で、すてきな贈り物にもなります。ただ、その名前はその会社のデータベースの中にしかありません。天文学者が使うことはなく、別の会社が同じ星を別の人に売ることもできます。"
      ]],
      ["では、何を贈るのか", [
        "気持ちです。星を贈るときに大切なのは天文学ではなく、ずっと残るものを思い浮かべたと誰かに伝えること。問題は、その贈り物が自分が何であるかを正直に語っているかどうかです。"
      ]]
    ],
    otraManera: "もうひとつの方法：アート作品の中の星",
    intro: "<a href=\"{cielo}\">『Sin motivo』</a>（「理由なく」）は Solzimer の作品です。贈り物がひとつずつアスタリスク——ギリシャ語の <em>asteriskos</em>、「小さな星」——になって、ずっと残る空。天空の中の場所は約束しません。約束するのは、守れることだけです。",
    lista: [
      "<strong>永遠に残ります。</strong>星のひとつひとつは、公開されたブロックチェーン上の取引です。誰にも消せません。作者にも。",
      "<strong>あなたの献辞が入ります。</strong>取引そのものに書き込まれる、80 文字までの言葉：<em>「アナへ。理由はありません。」</em>",
      "<strong>専用のリンクがあります。</strong>好きな人に送れます。開くと、アスタリスクが一画ずつ生まれます。番号と、あなたが贈った瞬間とともに：<em>「ある日曜日の明け方、満ちていく月の下で」</em>。",
      "<strong>ひとつしかありません。</strong>アスタリスクの形は取引から決まります。作者が選ぶのでも、金額が決めるのでもありません。",
      "<strong>値段はありません。</strong>好きな額を贈れます。金額は決して表示されません。1 セントでも大金でも、描かれるものは同じです。"
    ],
    noEs: "これは、天文登録でも、証明書でも、投資でもありません。2026 年 10 月 29 日から続いているアート作品です。いま星がいくつあるかは<a href=\"{cielo}\">空</a>で見られます。",
    como: "贈り方",
    pasos: [
      "Base ネットワークの ETH が入ったウォレットで<a href=\"{regalo}\">贈るページ</a>を開きます。",
      "献辞を書き、好きな金額を選んで確認します。",
      "アスタリスクが現れたら、リンクをコピーしてその人に送ります。"
    ],
    accion: "星を贈る →",
    preguntas: "よくある質問",
    faq: [
      ["星に正式に名前をつけられますか？", "いいえ。天体に名前をつけるのは国際天文学連合だけで、名前は売っていません。「星の命名」サービスが渡すのは象徴的な証明書で、その名前はどの天文カタログにも載りません。"],
      ["Sin motivo で星を贈るといくらかかりますか？", "好きな額です。値段はありません。金額は表示されず、何も変わりません。1 セントでも大金でも、同じアスタリスクが描かれます。"],
      ["贈られた人は何を受け取りますか？", "リンクです。開くと、アスタリスクが空に一画ずつ生まれます。番号と、贈った瞬間と、あなたの献辞とともに。"],
      ["暗号資産が必要ですか？", "はい。贈り物は Base ネットワークの ETH または USDC で行います。献辞は取引そのものに書き込まれるため、ETH のときだけ送れます。"],
      ["あとから消したり変えたりできますか？", "できません。取引と献辞は公開されたブロックチェーンに残ります。だから星は永遠で、だから書く言葉はよく考えたほうがいいのです。"],
      ["証明書や天文登録ですか？", "いいえ。アート作品です。Solzimer の『Sin motivo』。星は、このサイトとブロックチェーンの中にある空に描かれたアスタリスクで、本物の天空の星ではありません。"]
    ],
    cierre: "何を書けばいいか迷ったら、<a href=\"{frases}\">理由のない贈り物に添える言葉</a>をどうぞ。作品について知りたいときは、<a href=\"{sobre}\">紹介ページ</a>へ。"
  }
};

export const FRASES = {
  fr: {
    titulo: "Phrases pour un cadeau sans raison",
    descripcion: "18 phrases courtes pour accompagner un cadeau juste comme ça : sans anniversaire, sans occasion, sans excuse. Originales et libres d’usage, pour une carte ou un message.",
    h1: "Phrases pour un cadeau <em>sans raison</em>",
    entrada: "Pour quand il n’y a ni anniversaire, ni fête, ni excuse. Juste l’envie.",
    intro: "Un cadeau sans raison met un peu mal à l’aise : la personne qui le reçoit cherche le pourquoi. La phrase qui l’accompagne n’a pas à l’expliquer. Elle doit faire comprendre qu’il n’y a rien à expliquer.",
    frases: [
      "Juste comme ça. C’est la meilleure raison.",
      "Ce n’est pas ton anniversaire. Justement.",
      "J’ai vu ça et j’ai pensé à toi. Fin de l’explication.",
      "Pas besoin de date pour penser à quelqu’un.",
      "Sans raison, c’est comme ça qu’on aime vraiment.",
      "Je ne fête rien. Je te fête toi.",
      "Un mardi ordinaire mérite aussi un cadeau.",
      "Tu ne me dois rien. Même pas un merci.",
      "Ce n’est pas pour quelque chose. C’est pour quelqu’un.",
      "J’en avais envie. Ça ne se discute pas.",
      "Pour qu’aujourd’hui ait quelque chose de différent.",
      "Ne l’ouvre pas en cherchant le pourquoi. Il n’y en a pas.",
      "Certains cadeaux préviennent. Pas celui-ci.",
      "Parce que le calendrier ne décide pas quand je pense à toi.",
      "Un petit rien pour un jour normal.",
      "Je l’ai vu, c’était toi, je l’ai pris.",
      "Ce n’est ni une excuse ni une fête. C’est un cadeau.",
      "Offrir sans raison, c’est la façon la plus étrange de dire oui."
    ],
    copiar: "copier", copiado: "copiée ✓",
    nota: "Ces phrases ont été écrites pour cette page. Elles sont libres d’usage : copie-les, change-les, signe-les de ton nom.",
    usoTitulo: "Comment les utiliser",
    usos: [
      "<strong>Sur une carte.</strong> Une seule ligne, à la main. Moins elle explique, mieux c’est.",
      "<strong>Dans un message.</strong> Envoie-la avant le cadeau, sans autre contexte. Le mystère en fait partie.",
      "<strong>Pour toujours.</strong> Dans <a href=\"{cielo}\"><em>Sin motivo</em></a>, une œuvre d’art, tu peux <a href=\"{estrella}\">offrir une étoile</a> et laisser la phrase écrite comme dédicace, de façon permanente."
    ],
    porTitulo: "Pourquoi offrir sans raison",
    por: [
      "Un cadeau d’anniversaire répond à une date. Un cadeau sans raison ne répond à rien, et c’est pour ça qu’il dit plus : que quelqu’un a pensé à toi un jour où ce n’était pas nécessaire.",
      "C’est de cette idée qu’est née <a href=\"{sobre}\"><em>Sin motivo</em></a>, une œuvre qui ne pose qu’une question : est-ce que quelqu’un offre quelque chose, juste comme ça ?"
    ],
    accion: "voir le ciel →"
  },

  it: {
    titulo: "Frasi per un regalo senza motivo",
    descripcion: "18 frasi brevi per accompagnare un regalo fatto così: senza compleanno, senza ricorrenza, senza scuse. Originali e libere da usare, per un biglietto o un messaggio.",
    h1: "Frasi per un regalo <em>senza motivo</em>",
    entrada: "Per quando non c’è un compleanno, né un anniversario, né una scusa. Solo la voglia.",
    intro: "Un regalo senza motivo mette un po’ in imbarazzo: chi lo riceve cerca il perché. La frase che lo accompagna non deve spiegarlo. Deve far capire che non c’è niente da spiegare.",
    frases: [
      "Così. Che è il motivo migliore.",
      "Non è il tuo compleanno. Appunto.",
      "L’ho visto e ho pensato a te. Fine della spiegazione.",
      "Non serve una data per ricordarsi di qualcuno.",
      "Senza motivo, che è come si vuole bene davvero.",
      "Non festeggio niente. Festeggio te.",
      "Anche un martedì qualunque merita un regalo.",
      "Non mi devi niente. Nemmeno un grazie.",
      "Non è per qualcosa. È per qualcuno.",
      "Mi andava. E sulla voglia non si discute.",
      "Perché oggi abbia qualcosa di diverso.",
      "Non aprirlo cercando il perché. Non c’è.",
      "Certi regali avvisano. Questo no.",
      "Perché non è il calendario a decidere quando ti penso.",
      "Un pensiero piccolo per un giorno normale.",
      "L’ho visto, eri tu, l’ho preso.",
      "Non è una scusa né una festa. È un regalo.",
      "Regalare senza motivo è il modo più strano di dire di sì."
    ],
    copiar: "copia", copiado: "copiata ✓",
    nota: "Queste frasi sono state scritte per questa pagina. Sono libere da usare: copiale, cambiale, firmale con il tuo nome.",
    usoTitulo: "Come usarle",
    usos: [
      "<strong>Su un biglietto.</strong> Una riga sola, a mano. Meno spiega, meglio è.",
      "<strong>In un messaggio.</strong> Mandala prima del regalo, senza altro contesto. Il mistero fa parte del gioco.",
      "<strong>Per sempre.</strong> In <a href=\"{cielo}\"><em>Sin motivo</em></a>, un’opera d’arte, puoi <a href=\"{estrella}\">regalare una stella</a> e lasciare la frase scritta come dedica, per sempre."
    ],
    porTitulo: "Perché regalare senza motivo",
    por: [
      "Un regalo di compleanno risponde a una data. Un regalo senza motivo non risponde a niente, ed è per questo che dice di più: che qualcuno ha pensato a te in un giorno in cui non serviva.",
      "Da questa idea nasce <a href=\"{sobre}\"><em>Sin motivo</em></a>, un’opera che fa una sola domanda: qualcuno regala qualcosa così, senza un perché?"
    ],
    accion: "vedi il cielo →"
  },

  de: {
    titulo: "Sprüche für ein Geschenk ohne Grund",
    descripcion: "18 kurze Sprüche für ein Geschenk einfach so: ohne Geburtstag, ohne Anlass, ohne Ausrede. Originell und frei verwendbar, für eine Karte oder eine Nachricht.",
    h1: "Sprüche für ein Geschenk <em>ohne Grund</em>",
    entrada: "Für die Tage ohne Geburtstag, ohne Jahrestag, ohne Ausrede. Einfach weil.",
    intro: "Ein Geschenk ohne Anlass ist ein bisschen irritierend: Wer es bekommt, sucht nach dem Warum. Der Spruch dazu muss nichts erklären. Er muss zeigen, dass es nichts zu erklären gibt.",
    frases: [
      "Einfach so. Das ist der beste Grund.",
      "Es ist nicht dein Geburtstag. Eben drum.",
      "Ich hab das gesehen und an dich gedacht. Ende der Erklärung.",
      "Man braucht kein Datum, um an jemanden zu denken.",
      "Ohne Grund – so mag man jemanden wirklich.",
      "Ich feiere nichts. Ich feiere dich.",
      "Auch ein ganz normaler Dienstag verdient ein Geschenk.",
      "Du schuldest mir nichts. Nicht mal ein Danke.",
      "Das ist nicht für etwas. Das ist für jemanden.",
      "Ich hatte Lust dazu. Darüber lässt sich nicht streiten.",
      "Damit heute etwas anders ist.",
      "Mach es nicht auf, um das Warum zu finden. Es gibt keins.",
      "Manche Geschenke kündigen sich an. Dieses nicht.",
      "Weil nicht der Kalender entscheidet, wann ich an dich denke.",
      "Eine Kleinigkeit für einen ganz normalen Tag.",
      "Ich hab’s gesehen, es warst du, ich hab’s mitgenommen.",
      "Keine Entschuldigung, kein Fest. Ein Geschenk.",
      "Ohne Grund zu schenken ist die seltsamste Art, Ja zu sagen."
    ],
    copiar: "kopieren", copiado: "kopiert ✓",
    nota: "Diese Sprüche wurden für diese Seite geschrieben. Du darfst sie frei verwenden: kopieren, ändern, mit deinem Namen unterschreiben.",
    usoTitulo: "So verwendest du sie",
    usos: [
      "<strong>Auf einer Karte.</strong> Eine Zeile, von Hand. Je weniger sie erklärt, desto besser.",
      "<strong>In einer Nachricht.</strong> Schick sie vor dem Geschenk, ohne weiteren Kontext. Das Rätsel gehört dazu.",
      "<strong>Für immer.</strong> In <a href=\"{cielo}\"><em>Sin motivo</em></a>, einem Kunstwerk, kannst du <a href=\"{estrella}\">einen Stern schenken</a> und den Spruch als Widmung hinterlassen, dauerhaft."
    ],
    porTitulo: "Warum ohne Grund schenken",
    por: [
      "Ein Geburtstagsgeschenk folgt einem Datum. Ein Geschenk ohne Grund folgt nichts, und gerade deshalb sagt es mehr: dass jemand an dich gedacht hat, an einem Tag, an dem es nicht nötig war.",
      "Aus diesem Gedanken entstand <a href=\"{sobre}\"><em>Sin motivo</em></a>, ein Werk, das nur eine Frage stellt: Schenkt jemand etwas, einfach so?"
    ],
    accion: "zum Himmel →"
  },

  zh: {
    titulo: "无缘无故送礼时，可以写的话",
    descripcion: "18 句简短的话，配一份没有理由的礼物：不是生日，不是纪念日，也不需要借口。原创，可自由使用，写在卡片上或发在消息里。",
    h1: "<em>没有理由</em>的礼物，可以写的话",
    entrada: "给那些不是生日、不是纪念日、也没有借口的日子。只是想送。",
    intro: "没有理由的礼物会让人有点不知所措：收到的人会去找原因。附上的那句话不需要解释，它要让人明白：根本没什么需要解释的。",
    frases: [
      "就是想送。这是最好的理由。",
      "今天不是你的生日。正因为如此。",
      "看到这个就想到了你。解释完毕。",
      "想起一个人，不需要日子。",
      "没有理由，才是真心。",
      "我不是在庆祝什么。我在庆祝你。",
      "一个普通的星期二，也值得一份礼物。",
      "你什么都不欠我。连谢谢都不用。",
      "这不是为了什么。是为了某个人。",
      "就是想。想，没什么好讨论的。",
      "让今天有一点不一样。",
      "别带着“为什么”去拆它。没有为什么。",
      "有些礼物会提前打招呼。这份不会。",
      "因为什么时候想你，不是日历说了算。",
      "一件小东西，给一个普通的日子。",
      "看到了，是你，就带来了。",
      "不是道歉，也不是庆祝。只是一份礼物。",
      "无缘无故地送礼，是说“好”最奇妙的方式。"
    ],
    copiar: "复制", copiado: "已复制 ✓",
    nota: "这些话是为这个页面写的，可以自由使用：复制、修改、署上你的名字都可以。",
    usoTitulo: "怎么用",
    usos: [
      "<strong>写在卡片上。</strong>只写一句，手写。解释得越少越好。",
      "<strong>发在消息里。</strong>在礼物之前发，不加任何说明。悬念也是礼物的一部分。",
      "<strong>永远留下。</strong>在艺术作品<a href=\"{cielo}\">《Sin motivo》</a>里，你可以<a href=\"{estrella}\">送一颗星星</a>，把这句话作为题词永久写下。"
    ],
    porTitulo: "为什么无缘无故地送礼",
    por: [
      "生日礼物回应的是一个日期。没有理由的礼物不回应任何东西，所以它说得更多：有人在一个不必想起你的日子里想起了你。",
      "<a href=\"{sobre}\">《Sin motivo》</a>就来自这个想法。这件作品只问一个问题：会有人无缘无故地送出礼物吗？"
    ],
    accion: "去看天空 →"
  },

  ja: {
    titulo: "理由のない贈り物に添える言葉",
    descripcion: "誕生日でも記念日でもなく、ただ贈りたいときに添える短い言葉を 18 個。オリジナルで自由に使えます。カードにも、メッセージにも。",
    h1: "<em>理由のない</em>贈り物に添える言葉",
    entrada: "誕生日でも、記念日でも、口実があるわけでもない日に。ただ、贈りたくて。",
    intro: "理由のない贈り物は、少し戸惑わせます。受け取った人は理由を探すから。添える言葉は、説明しなくていい。説明することは何もないと伝われば、それでいいのです。",
    frases: [
      "なんとなく。それがいちばんの理由。",
      "誕生日じゃないよ。だからこそ。",
      "これを見て、あなたを思い出した。説明はそれだけ。",
      "誰かを思い出すのに、日付はいらない。",
      "理由がないのが、本当の気持ち。",
      "何かを祝っているわけじゃない。あなたを祝っている。",
      "なんでもない火曜日にも、贈り物があっていい。",
      "お返しはいらない。お礼の言葉も。",
      "何かのためじゃない。誰かのため。",
      "贈りたかった。それ以上の理由はない。",
      "今日が少しだけ、いつもと違う日になるように。",
      "理由を探しながら開けないで。理由はないから。",
      "予告してくる贈り物もある。これは違う。",
      "あなたを思う日は、カレンダーが決めるわけじゃない。",
      "ふつうの日に、小さなものをひとつ。",
      "見つけた。あなただと思った。持ってきた。",
      "おわびでも、お祝いでもない。ただの贈り物。",
      "理由なく贈るのは、いちばん不思議な「はい」の言い方。"
    ],
    copiar: "コピー", copiado: "コピーしました ✓",
    nota: "ここにある言葉は、このページのために書いたものです。自由に使ってください。コピーしても、書き換えても、あなたの名前で贈っても構いません。",
    usoTitulo: "使い方",
    usos: [
      "<strong>カードに。</strong>一行だけ、手書きで。説明が少ないほどいい。",
      "<strong>メッセージで。</strong>贈り物より先に、何も添えずに送る。謎も贈り物のうち。",
      "<strong>ずっと残す。</strong>アート作品<a href=\"{cielo}\">『Sin motivo』</a>では、<a href=\"{estrella}\">星を贈って</a>、この言葉を献辞として永遠に残せます。"
    ],
    porTitulo: "なぜ理由なく贈るのか",
    por: [
      "誕生日の贈り物は日付に応えるもの。理由のない贈り物は何にも応えない。だからこそ、より多くを語ります。そうしなくてもいい日に、誰かがあなたのことを思った、と。",
      "その考えから生まれたのが<a href=\"{sobre}\">『Sin motivo』</a>。問いはひとつだけです。誰かが、理由もなく何かを贈るだろうか？"
    ],
    accion: "空を見る →"
  }
};
