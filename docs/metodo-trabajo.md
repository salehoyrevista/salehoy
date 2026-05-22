---
title: "Método de trabajo de SaleHoy"
description: "Notas sobre cómo trabaja Juan Boas (editor) con asistencia de IA en el proyecto SaleHoy. Reglas internas para que el método se sostenga sin agotar al editor ni perder calidad."
version: 1.0
fecha: 2026-05-22
editor: Juan Boas
uso: Referencia interna. Consultar cuando una sesión se está poniendo larga, cuando aparecen muchas ideas a la vez, o cuando se quiere repensar el flujo de trabajo.
---

# Método de trabajo de SaleHoy

SaleHoy es un proyecto editorial sostenido por Juan Boas con asistencia de IA. Esa combinación tiene reglas propias para funcionar bien en el tiempo. Este documento las nombra.

---

## Sobre las sesiones de trabajo

**1. Sesiones cortas y enfocadas.**
Las sesiones de 40 a 60 minutos con un foco claro funcionan mejor que las sesiones largas de varias horas que mezclan muchas cosas. Las decisiones editoriales mejoran cuando se toman descansadas.

**2. Un foco por sesión.**
Idealmente cada sesión tiene un objetivo claro: "cerrar tal personaje", "diseñar tal sección", "revisar tal artículo". Si aparecen otras ideas, anotarlas en `docs/ideas/ideas-en-pausa.md` o `docs/ideas/articulos-futuros.md` y volver al foco.

**3. Descansar entre etapas grandes.**
Después de cerrar una etapa importante (por ejemplo, los cinco narradores, el manifiesto, una edición publicada), tomar unos días antes de meterse en la siguiente. Las decisiones se asientan mejor con tiempo.

**4. Juan corta cuando algo no es esencial.**
Cuando la IA tira demasiada información o se desvía hacia detalles que no aportan al objetivo, el editor frena. "Eso no me interesa", "salteá esa parte", "vamos al punto" son intervenciones válidas y bienvenidas.

**5. La IA debe ofrecer cortes también.**
Cuando una conversación se está extendiendo y conviene parar, la IA puede proponerlo. "Esto es mucho para una sola sesión, ¿paramos acá?" es una intervención válida.

---

## Sobre la relación editor / IA

**6. El editor decide. La IA estructura y propone.**
Las decisiones editoriales son de Juan Boas. La IA puede tirar opciones, estructurar contenidos, completar huecos, pero no decide. Cuando aparezca una decisión grande, la IA pregunta antes de avanzar.

**7. La IA no infla detalles que no aporten.**
Lo que no sirve para la voz del personaje o la pieza editorial, no se inventa. Los CVs detallados, las bibliografías falsas con títulos y años, los detalles biográficos vacíos: descarte por principio.

**8. La IA debe respetar las máximas editoriales.**
Antes de escribir cualquier contenido editorial (artículo, presentación de sección, texto público), consultar `docs/manifiesto-editorial.md`. Especialmente las máximas sobre el juego (1-4), sobre la escritura (5-8), y sobre la ética (21-23).

**9. La IA debe respetar las voces de los narradores.**
Antes de escribir contenido firmado por un narrador, consultar el dossier correspondiente en `docs/personajes/`. Cada narrador tiene voz propia, repertorio propio, estilo propio. No mezclar.

---

## Sobre la memoria del proyecto

**10. Mantener la memoria actualizada.**
Cada decisión grande conviene registrarla en la memoria del proyecto de Claude Code. Esa memoria es lo que permite que al volver a abrir el proyecto, no haya que explicar todo de nuevo.

**11. Guardar ideas en pausa, no descartarlas.**
Cuando en una conversación aparece una idea valiosa pero no urgente, registrarla en `docs/ideas/ideas-en-pausa.md` (para proyectos, dispositivos, decisiones grandes) o en `docs/ideas/articulos-futuros.md` (para temas de artículos). No perder ideas.

**12. La IA puede sugerir cuándo registrar una idea.**
Si en una charla aparece una idea que vale la pena no perder, la IA propone registrarla. "Esto vale la pena guardarlo en ideas-en-pausa, ¿lo agrego?".

---

## Sobre el cuidado del editor

**13. Juan Boas es persona, no máquina de producción.**
El proyecto debe ser sostenible en términos humanos. Si una semana Juan está cansado y no puede publicar, no pasa nada. La constancia se mide en meses, no en días.

**14. Juan Boas es psicoanalista.**
Esa formación atraviesa criterios editoriales del proyecto. En temas sensibles (compulsión, ludopatía, vulnerabilidad emocional), el criterio clínico de Juan vale más que el razonamiento técnico general. La IA debe deferir a él en esos casos.

**15. El editor no escribe todo.**
Su rol es editor, no autor único. Los narradores generan contenido con asistencia de IA, Juan corrige, edita, decide. Esa distinción entre editor y autor es lo que vuelve sostenible al proyecto.

---

## Sobre el ritmo del proyecto

**16. Ediciones quincenales como meta, no como obligación.**
Si una edición se atrasa una semana, no es problema. Mejor un número bueno tarde que uno apurado a tiempo.

**17. Cada edición tiene foco editorial.**
Aunque los artículos sean diversos, conviene que cada número tenga un eje temático. La edición #01 fue "La quiniela al diván". La #02 puede ser otra cosa concreta. Esa decisión es del editor.

**18. La carta del editor abre cada edición.**
Una carta corta (500-800 palabras) firmada por Juan Boas que conecte los artículos del número, marque preocupaciones, anticipe lo que viene. Es la voz humana del proyecto y lo que lo distingue de un agregador automático.

---

## Sobre la revisión periódica

**19. Revisar el manifiesto cada seis meses.**
No es texto eterno. Probablemente cada doce ediciones convenga relectura. Lo que dejó de ser cierto, se ajusta.

**20. Revisar los dossiers de personajes con el uso.**
A medida que los narradores escriban artículos reales, su voz se va a refinar. Cuando aparezcan ajustes naturales (un tic que no estaba previsto, una estructura nueva que funciona, una posición que se afina), actualizar el dossier correspondiente.

**21. Revisar este documento de método cuando haga falta.**
Si un método deja de funcionar, se cambia. Este archivo también es vivo.

---

## Reglas adicionales sobre la biblioteca y la generación de contenido

**22. Consultar la biblioteca antes de generar contenido firmado por un narrador.**
Cuando se va a generar contenido firmado por un narrador, cargar al contexto los textos relevantes de su biblioteca (docs/biblioteca/[narrador]/). Esto da precisión teórica y referencias verificables a la prosa generada.

**23. La biblioteca crece orgánicamente.**
No pretender tenerla completa desde el día uno. Cuando un artículo necesita un texto que falta, se suma ese día. Cada vez que aparece un nuevo concepto, autor o cita importante en una sesión, evaluar si vale la pena registrarlo en la biblioteca del narrador correspondiente.

## Decisiones sobre la web y la interacción con lectores

**24. SaleHoy es lectura libre.**
Sin login obligatorio para entrar al sitio. Los puntos de contacto con la comunidad (newsletter, anecdotario, eventualmente Vichy y La Data) son opcionales y los activa el lector cuando quiere.

**25. Botones de compartir en cada artículo.**
WhatsApp, X, Facebook, Telegram, Mail, Copiar link. Estética sobria, al pie de cada artículo. Implementar cuando se haga la sesión técnica correspondiente.

**26. Contacto único al editor.**
Un solo mail editorial: juan@salehoy.com.ar cuando se tenga el dominio. Mientras tanto, gmail temporal. Mails individuales por narrador descartados por ahora (riesgo de prometer respuestas personalizadas no sostenibles).

**27. Comentarios al pie, en pausa.**
No activar hasta tener tráfico real (estimado 6 meses). Cuando se active, evaluar Disqus o sistema propio con moderación previa obligatoria.

---

*Documento vivo. Se actualiza cuando el método se afine con la práctica.*
