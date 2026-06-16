# La máquina que mata leyendas

### Construí un verdugo estadístico para destruir mis propias ideas. Lo primero que mató fue la Tormenta de Santa Rosa. Lo que no pudo matar es más raro todavía.

Todos los argentinos conocemos el libreto. Llega fin de agosto, el cielo se pone pesado, y alguien —una abuela, un colectivero, el pronosticador del noticiero— anuncia con autoridad de oráculo: "Viene la Santa Rosa". La tormenta que llega, puntual, alrededor del 30 de agosto. Hace siglos que llega. Todos la vimos llegar.

El problema es que los datos dicen otra cosa.

Tomé 86 años de precipitación diaria sobre Buenos Aires —de 1940 a 2025, la serie completa del reanálisis meteorológico ERA5, sin un solo día faltante— y le hice a la leyenda la pregunta que nadie le hace: ¿la ventana alrededor del 30 de agosto es más tormentosa que las ventanas vecinas de fin de invierno? No comparada con julio o con enero: comparada con sus vecinas inmediatas, las otras semanas de la misma época del año.

Respuesta: no. La ventana de Santa Rosa quedó en el puesto 14 de 52 ventanas posibles. Trece semanas vecinas, sin santa ni leyenda, le ganan. La diferencia entre lo observado y lo esperado por puro azar estacional no alcanza ningún umbral estadístico razonable. Y no es que el test sea ciego: con 86 años de datos, si la Santa Rosa fuera apenas un 50% más tormentosa que sus vecinas, el método la detectaría el 99% de las veces.

¿Entonces por qué la "vemos" llegar todos los años? Porque fin de agosto en Buenos Aires *es* una época tormentosa en general, y porque la memoria humana es una máquina de confirmar. Los años en que la tormenta llega, la leyenda se anota el poroto. Los años en que no llega, nadie hace una nota titulada "Santa Rosa faltó otra vez". La leyenda es estacionalidad genuina más sesgo de confirmación. Nada más.

## Un laboratorio para funerales

Esa autopsia no fue un capricho. Es el producto de un proyecto casero con una premisa incómoda: la mayoría de los patrones que creemos ver en el mundo son ruido, y la única forma honesta de averiguar cuáles no lo son es intentar matarlos a todos.

El método tiene reglas estrictas. Toda hipótesis se registra por escrito *antes* de mirar los datos, con la dirección del efecto declarada de antemano —para que no se pueda mover el arco después de patear—. Los datos que sirvieron para encontrar un patrón quedan "quemados": no pueden usarse para confirmarlo, hace falta una segunda fuente independiente. Y cada resultado positivo pasa por una batería de intentos de asesinato: cambiar el método de cálculo, buscar el mismo efecto donde no debería existir, partir la muestra por épocas, eliminar los casos extremos. Solo sobrevive lo que aguanta todo eso *dos veces*, en dos conjuntos de datos distintos.

Con esa vara, casi todo muere. Murió Santa Rosa. Murió la sospecha de que la quiniela nocturna tuviera algún sesgo (226 sorteos: azar puro, como debía ser). Murieron hipótesis propias que yo mismo había declarado prometedoras.

Pero algunas cosas no murieron. Y eso es lo interesante.

## El imán de los números redondos

Tomá los tiempos de llegada de 1,7 millones de corredores de maratón —Berlín, Chicago, Nueva York, Londres, Boston— y graficá cuánta gente termina en cada segundo de la carrera. La curva debería ser suave. No lo es: justo antes de cada hora redonda hay una montaña de gente, y justo después, un valle. Antes de las 4 horas en punto terminan un 40% más de corredores de lo esperable; después, un déficit. El salto ocurre en el segundo exacto del umbral. En tiempos no redondos —3:17, 4:43— la curva es perfectamente plana.

¿Qué significa? Que miles de personas agotadas, en el kilómetro 41, encuentran una reserva de esfuerzo que no sabían que tenían, solo para que el reloj diga "3:59" y no "4:01". El número redondo no existe en sus piernas: existe en su cabeza. Y mueve cuerpos. El patrón se replicó, idéntico, en 93.000 corredores del maratón de Praga que el análisis original nunca había tocado.

## Cantar último en Eurovision

Otro sobreviviente. Entre 1956 y 2012, el orden de actuación en la final de Eurovision se sorteaba al azar. Eso convierte al festival en un experimento natural: si el orden es una lotería, cualquier relación entre orden y puntaje es causal. Y la relación existe: actuar más tarde produce sistemáticamente más puntos, con un gradiente perfectamente escalonado del primer al último quintil. No es que los favoritos cierren el show —el sorteo lo impide—: es que los jueces y el público recuerdan mejor lo último que vieron. El mismo sesgo apareció, con la misma forma, en el patinaje artístico internacional, donde el orden dentro de cada grupo también se sortea. Dos competencias, dos sistemas de puntaje, dos poblaciones de jueces: el mismo defecto humano.

## La moraleja incómoda

El hallazgo del proyecto no es ninguno de estos patrones. Es la asimetría: las creencias que más queremos —la tormenta puntual, el número que "está caliente", la corazonada— suelen ser las que mueren primero cuando se las somete a un test honesto. Y los sesgos reales, los que sobreviven a todos los intentos de asesinato, son aburridos y humillantes: no gobiernan el clima ni la suerte, nos gobiernan a nosotros. El corredor que se mata por el 3:59. El jurado que premia al que cantó último sin saberlo.

La estadística no sirve para predecir el futuro. Sirve para algo más modesto y más raro: para saber cuáles de nuestras certezas merecen un funeral. La Santa Rosa ya tuvo el suyo. Llueve igual, claro. Pero ahora sabemos que la santa no tiene nada que ver.

---

*Nota metodológica: todos los resultados citados fueron pre-registrados antes del contacto con los datos y replicados en una segunda fuente independiente. Los datos son públicos: reanálisis ERA5 (Open-Meteo), resultados oficiales de maratones, dataset académico Mirovision (ISMIR 2023) y puntajes ISU compilados por BuzzFeed News.*
