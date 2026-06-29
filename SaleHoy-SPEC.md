# SaleHoy — SPEC

> **Qué es este documento.** Es la **capa 1** del método Karpathy (Spec → Verifier → Environment) aplicada a SaleHoy. Fija el *qué* y el *para qué*: la intención, los límites, qué se mide como éxito y qué reglas sostienen el trabajo. **No** es el plan técnico ni el "cómo". Manda sobre cualquier otro documento del proyecto cuando haya conflicto.
>
> Documento vivo. Versión 1.0 — 29/06/2026 — Pedro / Juan Boas.

---

## 0. Objetivo (el para-qué)

Usar SaleHoy para **aprender a construir, lanzar y hacer crecer en internet algo monetizable con IA** —shippeando un proyecto de verdad e iterando hasta que algo pegue, o hasta concluir que no va.

Cuatro precisiones que son parte del objetivo, no decoración:

1. **SaleHoy es la apuesta #1, no la meta.** El tema, los dispositivos, el formato y hasta el modelo de plata son **variables**: se sostienen mientras sirvan y se descartan sin culpa cuando no.
2. **La plata es el techo, no el piso.** Máximo upside posible, sin monto fijo, sin dependencia económica. Si en un par de años no genera, el proyecto no fracasó: la habilidad aprendida queda.
3. **El cuello de botella a resolver es la distribución y la captura de audiencia, no producir.** Producir ya sabés y te divierte; ahí no está el aprendizaje que falta.
4. **Hay una decisión de negocio abierta y consciente** (revista cultural pura vs. cebo cultural con motor de afiliados) que se resuelve **con datos** —empezando por el legal en Argentina—, no con ganas. Ver §5.

---

## 1. Lo constante y lo variable

La única cosa **constante** es el objetivo de arriba y la disciplina de las tres capas. Todo lo de contenido es **variable**.

- **Variable (cambia sin culpa si los datos lo piden):** el tema dentro y más allá del juego/azar, los cinco dispositivos de La sala, los formatos de artículo, el plantel de narradores, el modelo de monetización, y —en última instancia— el vehículo entero. SaleHoy puede morir y el objetivo seguir vivo.
- **Innegociable mientras SaleHoy exista (protege el activo, no es capricho):** la marca se escribe **SaleHoy** pegado; en el registro cultural no hay picks, soplos ni promesas de ganar; integridad de datos; credenciales nunca en el repo; rioplatense. Estas viven como reglas duras en el Environment (§4).

---

## 2. La realidad de partida (sin chamuyo)

La spec no se miente a sí misma. SaleHoy arranca en **modo difícil** para monetizar:

- Seudónimo (Juan Boas): cero red previa y cero prueba social que prestar. Techo de descubrimiento estructural.
- Tema de nicho de un nicho (el juego como cultura, en español).
- ~780 seguidores en Instagram, lista de Beehiiv chica, huella de SEO casi nula.
- Las dos vías de monetización cultural (suscripción/donación y mecenazgo) **piden audiencia primero**, y la audiencia es justo lo que falta.

Esto no invalida el objetivo: lo enfoca. La spec existe para atacar **esa** carencia, no para esquivarla construyendo cosas lindas.

---

## 3. VERIFIER — cómo sé que esto funciona

> La capa que más falta y la que más duele. Regla madre del método: **el que construye no puede ser el que verifica.** "Se ve lindo" es autoevaluación, no verificación.

### 3.1 Lo que NO verifica el objetivo (anti-señales)

Ninguna de estas, por sí sola, es progreso hacia el para-qué. Pueden sentirse como avance y no mover la aguja:

- Sumar un dispositivo a La sala o dejarla más linda.
- Publicar un artículo más, o un número más.
- Rediseñar el header, el CSS, la tipografía.
- Instalar GA4 sin tráfico (solo confirma la ausencia de audiencia).
- Generar assets de Midjourney.

Todo eso es **producción**. La producción no es el verificador.

### 3.2 Lo que SÍ verifica el objetivo (señales externas de audiencia/distribución)

En orden de aparición esperable. Son umbrales cualitativos, no KPIs inventados:

- **Mojón 0 — señal de vida.** Una persona **desconocida** (no vos, no conocidos) hace una acción de valor por voluntad propia: se suscribe a Beehiiv, o te escribe sobre una nota. La clave es *desconocida*.
- **Mojón 1 — distribución prestada.** Una pieza tuya publicada, levantada o citada por un medio o una cuenta **con audiencia propia** (Anfibia, Cenital, La Agenda, un newsletter ajeno, etc.). Es la palanca de mayor leverage identificada en el premortem.
- **Mojón 2 — motor propio.** La lista de Beehiiv crece de forma **sostenida** sin que empujes cada suscriptor a mano: gente que llega por el contenido, no por pedirle a un amigo.
- **Mojón 3 — el primer peso.** El primer ingreso real de un desconocido (donación o, si va la vía B de §5, primera comisión).

### 3.3 Cadencia y regla roja

- Revisión de estas señales **una vez por mes**.
- **Regla roja:** si en el período el trabajo fue todo producción y **ninguna señal externa se movió**, la spec lo marca en rojo —*no* como progreso. Dos períodos rojos seguidos obligan a cambiar de táctica (de superficie de distribución, de pieza, o de vehículo), no a producir más.

---

## 4. ENVIRONMENT — el mundo en disco

> No es configuración: es el modelo del mundo que la IA no puede hacerse crecer sola. Cada sesión despierta con amnesia; esto se lo devuelve.

### 4.1 El corpus (ya existe, ordenarlo como tal)

Estos documentos **son** el Environment de SaleHoy y deben vivir versionados:
`Instrucciones del proyecto` · `Línea editorial` · `Estado del sitio (técnico)` · `Briefing de diseño` · bibliotecas de los cinco narradores · `el-trio-sistema-de-referencia` · **esta SPEC**.

**Pendiente de capa 3:** un `CLAUDE.md` en la raíz del repo que inyecte en cada sesión de Claude Code la arquitectura, las convenciones y las barreras de abajo.

### 4.2 Zonas (Always Do / Ask First / Never Do)

Una regla en prosa es una *sugerencia* que la IA viola apenas aparece una excusa. Donde se pueda, la barrera se aplica afuera del razonamiento del modelo (hooks, env vars, validación). Por ahora, declaradas:

**NEVER DO (barreras duras)**
- Editar `datos.json` a mano. Sobrescribir `textos.json` con el script.
- Commitear claves o API keys al repo (solo variables de entorno de Netlify).
- Escribir "Sale Hoy" separado en texto, o meter "argentino" en el tagline de header/footer/meta.
- Dar picks, soplos o promesas de ganar en el registro cultural.
- Usar logos AI con texto roto.
- En Claude Code: simplificar o reconstruir un export de Design. Transcribir 1:1.
- Enlazar artículos entre sí con dependencias: cada nota se sostiene sola.
- Inventar citas, autores o datos.

**ASK FIRST (checkpoint humano obligatorio)**
- Aceptar plata de operadores de juego o activar cualquier CTA de afiliados → bloqueado hasta resolver §5 (legal + modelo).
- Cambios de hosting o infra que gasten plata.
- Publicar o pitchear con nombre real en vez del seudónimo (decisión de marca).

**ALWAYS DO (piloto automático)**
- Rioplatense por defecto.
- Placeholder-first en visuales.
- Recomendaciones rankeadas (mejor a peor).
- Preservar la voz de Pedro en su prosa: ediciones quirúrgicas, nunca reescribir sin pedido.
- Escribir prosa contra datos reales, nunca de prototipo.

---

## 5. Decisión abierta: el modelo de negocio

Dos arquitecturas, conscientes y excluyentes en su forma pura:

- **A — Marca cultural primero.** Monetización suave (suscripción/donación/pauta claramente marcada). El juego se analiza, no se promociona. Protege el activo de confianza; techo de plata bajo y lento.
- **B — Cebo cultural + motor de afiliados/comparador.** El contenido cultural genera confianza y tráfico; abajo, un comparador de casinos con links rastreados (CPA / revenue share). Plata mucho mayor y más rápida; **taxa la confianza** y mete dos audiencias distintas en el mismo sitio (riesgo de no servir bien a ninguna). No es "pongo un banner": es ser el lugar donde la gente decide, o sea SEO durísimo contra competidores que viven de eso.

**Cómo se resuelve (no con ganas):**
1. **Dato P0 — legal.** Qué se puede y qué no en publicidad y afiliados de juego online en Argentina (regulación nacional + provincial; Pedro está en Córdoba). Puede cerrar la vía B antes de empezar. **A investigar con fuente, no de memoria.**
2. **Dato — audiencia.** Sin Mojón 1/2 del Verifier, ningún modelo monetiza. La decisión real recién aprieta cuando hay a quién monetizar.

Hasta entonces: **A por defecto** (no cierra puertas), vía B en estado *ASK FIRST* bloqueado.

---

## 6. Cola de sub-specs (compartimentadas)

El método sesga hacia specs **chicas, una por capacidad**, no un mamotreto. Esta SPEC es el marco; debajo se escriben de a una, cuando toque:

- [ ] **Distribución / primer pitch** — una pieza altamente compartible + un medio objetivo. (Máxima prioridad: ataca el Verifier directo.)
- [ ] **Beehiiv growth** — mecánica concreta de captura, sin fragmentar la lista.
- [ ] **Legal afiliados AR** — investigación P0 que destraba §5.
- [ ] **La sala v2** — qué queda (Vichy, La Data), qué se va, qué entra (jueguitos tipo NYT, en modo prueba).
- [ ] **La Data mensual** — workflow ya operativo; documentar como spec estable.
- [ ] **CLAUDE.md** — materializar el Environment (§4) en la raíz del repo.

> Regla: no se abre una sub-spec nueva sin cerrar la anterior. Una por chat.

---

*Fin de la SPEC v1.0. Se revisa cuando un dato real la contradiga —no antes, no por las dudas.*
