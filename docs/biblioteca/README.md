# Biblioteca de narradores

Esta carpeta contiene textos curados que se cargan al contexto cuando se genera contenido firmado por cada narrador. Sirve para dar precisión teórica, citas verificables, referencias culturales y densidad de voz a cada narrador.

## Criterio

No cargar obras completas (los autores tienen miles de páginas, eso satura el contexto). Cargar:
- Glosarios de conceptos clave por narrador (100-200 palabras por concepto).
- Fragmentos breves citables.
- Síntesis de tradiciones teóricas (800-1500 palabras).
- Cronologías verificadas.
- Lista comentada de autores que el narrador maneja.

Crecimiento orgánico: cuando un artículo necesita un texto que no está cargado, se suma ese día. No pretender tener todo desde el día uno.

## Formato

Archivos Markdown (.md) con encabezado YAML que indique narrador, tema, fuente. Ejemplo:

```
---
narrador: maria-lange
tema: pulsión de muerte
fuente: Bleichmar, Silvia. "El desmantelamiento de la subjetividad" (2005)
extracto: páginas 47-52
---
```

## Uso

Antes de generar contenido firmado por un narrador, cargar los textos relevantes de su carpeta al contexto. Eso se puede hacer manualmente (Juan indica qué cargar) o automáticamente en sesiones de Claude Code dedicadas.
