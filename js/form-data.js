// Every word on the page lives here; js/form.js only renders it.
// Question types: choice (one answer), multi (several, optional max), text, long, words (three short fields),
// sites (link + what you like, repeatable), rating (one row per idea: interest level).

window.FORM = {
  meta: {
    title: "IDAMHO: nuevo sitio web e imagen",
    by: "Andrés Alegría · Graphics in Science",
  },

  intro: {
    heading: "Un nuevo sitio web y una imagen renovada para IDAMHO",
    paragraphs: [
      "Muchas gracias por su interés en renovar el sitio web y la imagen de IDAMHO.",
      "Estas preguntas me ayudan a entender qué espera usted, para preparar un primer prototipo que podamos revisar juntos. Toman unos 10 minutos. Sus respuestas se guardan en este navegador mientras completa el formulario, así que puede cerrarlo y continuar después.",
    ],
  },

  sections: [
    {
      title: "IDAMHO y su público",
      questions: [
        {
          id: "publico",
          type: "multi",
          max: 3,
          label: "¿Para quién es, ante todo, el sitio web?",
          help: "Elija hasta tres.",
          options: [
            "Comunidades y organizaciones locales",
            "Abogadas, abogados y operadores de justicia",
            "Periodistas",
            "Estudiantes e investigadores",
            "Cooperación internacional y donantes",
            "Autoridades y tomadores de decisión",
          ],
          other: "Otro público",
        },
        {
          id: "primer_minuto",
          type: "long",
          label: "Cuando alguien visita el sitio por primera vez, ¿qué debería entender o poder hacer en el primer minuto?",
          placeholder: "Por ejemplo: saber qué hace IDAMHO y cómo pedir apoyo.",
        },
        {
          id: "objetivos",
          type: "multi",
          max: 3,
          label: "¿Qué debería lograr el nuevo sitio en los próximos dos años?",
          help: "Elija hasta tres.",
          options: [
            "Dar a conocer el trabajo y los logros de IDAMHO",
            "Difundir La Gaceta Verde",
            "Ofrecer guías y materiales útiles",
            "Atraer apoyo y financiamiento",
            "Invitar a participar (actividades, denuncias, voluntariado)",
            "Publicar pronunciamientos y noticias",
          ],
          other: "Otro objetivo",
        },
      ],
    },

    {
      title: "Imagen y marca",
      questions: [
        {
          id: "logo",
          type: "choice",
          label: "¿Qué le gustaría hacer con el logo actual?",
          options: [
            "Mantenerlo como está",
            "Mantener la idea, pero modernizar el dibujo",
            "Estoy abierta a un logo nuevo",
          ],
        },
        {
          id: "palabras",
          type: "words",
          label: "¿Con qué tres palabras le gustaría que la gente describa a IDAMHO?",
          placeholders: ["cercana", "rigurosa", "valiente"],
        },
        {
          id: "color",
          type: "choice",
          label: "¿El verde actual es parte de la identidad de IDAMHO?",
          options: [
            "Sí, quiero mantener el verde",
            "El verde, pero con otros tonos que lo acompañen",
            "Estoy abierta a otros colores",
            "No tengo preferencia",
          ],
        },
        {
          id: "no_parecer",
          type: "text",
          label: "¿A qué no debería parecerse el nuevo sitio?",
          placeholder: "Por ejemplo: a un sitio de gobierno, o a una ONG cualquiera.",
        },
      ],
    },

    {
      title: "Sitios que le gustan",
      intro: "Puede ser cualquier sitio: de otra organización, de un medio o de una empresa. Lo que más me ayuda es saber qué le gusta de cada uno.",
      questions: [
        {
          id: "referencias",
          type: "sites",
          max: 4,
          label: "Comparta hasta cuatro sitios y cuénteme qué le gusta de ellos.",
          urlLabel: "Enlace",
          urlPlaceholder: "https://…",
          likeLabel: "¿Qué le gusta de este sitio?",
          likePlaceholder: "Los colores, cómo cuenta historias, lo fácil que es encontrar las cosas…",
          addLabel: "Agregar otro sitio",
          removeLabel: "Quitar este sitio",
        },
      ],
    },

    {
      title: "Contenido e ideas",
      questions: [
        {
          id: "secciones",
          type: "multi",
          label: "Del sitio actual, ¿qué secciones quiere conservar?",
          options: [
            "Sobre nosotros y antecedentes",
            "Alianzas",
            "Equipo de trabajo",
            "Logros",
            "Metas y objetivos",
            "La Gaceta Verde",
            "Materiales",
            "Pronunciamientos",
            "Noticias",
          ],
          other: "¿Falta alguna sección?",
        },
        {
          id: "ideas",
          type: "rating",
          label: "Algunas ideas que podríamos explorar. ¿Cuánto le interesan?",
          scale: ["Me interesa", "Tal vez", "No por ahora"],
          items: [
            { id: "gaceta", text: "Una biblioteca interactiva de La Gaceta Verde: buscar normas por tema, año y lugar, con una línea de tiempo y un mapa." },
            { id: "casos", text: "Un mapa de los casos y conflictos ambientales que IDAMHO acompaña." },
            { id: "historia", text: "Una línea de tiempo con la historia y los logros de IDAMHO." },
            { id: "boletin", text: "La Gaceta Verde por correo electrónico, con un diseño renovado." },
            { id: "materiales", text: "Una biblioteca de guías, trifolios y radiodramas, fácil de buscar y descargar." },
            { id: "ingles", text: "Una versión en inglés para aliados y cooperantes." },
            { id: "redes", text: "Plantillas para redes sociales con la nueva imagen." },
          ],
          other: "¿Tiene otra idea?",
        },
      ],
    },

    {
      title: "Cómo trabajaríamos",
      questions: [
        {
          id: "actualiza",
          type: "choice",
          label: "Una vez listo el sitio, ¿quién publicaría las novedades, como cada nueva Gaceta Verde?",
          options: [
            "Alguien del equipo de IDAMHO",
            "Preferimos que Andrés se encargue",
            "Aún no lo sabemos",
          ],
        },
        {
          id: "fecha",
          type: "text",
          label: "¿Hay una fecha o un evento para el que le gustaría tener el sitio listo?",
          placeholder: "Por ejemplo: un aniversario o el lanzamiento de una campaña.",
        },
        {
          id: "comentarios",
          type: "long",
          label: "¿Algo más que quiera contarme? ¿Hay otras personas del equipo que deberían opinar?",
        },
      ],
    },
  ],

  contact: {
    title: "Sus datos",
    nameLabel: "Nombre",
    emailLabel: "Correo electrónico",
    emailHelp: "Para enviarle el prototipo.",
  },

  // Answers are emailed through Web3Forms, the same service as the contact form on graphicsinscience.com.
  // The access key is public by design.
  send: {
    endpoint: "https://api.web3forms.com/submit",
    accessKey: "00aaceb8-6230-4448-8030-af61e3e7e9cb",
    subject: "IDAMHO: respuestas sobre el nuevo sitio web e imagen",
    fromName: "Cuestionario IDAMHO",
    button: "Enviar respuestas",
    sending: "Enviando…",
    needName: "Por favor, escriba su nombre para poder enviar.",
    privacy: "Al enviar, sus respuestas llegan por correo electrónico a Andrés Alegría. No se publican ni se usan para nada más.",
    successTitle: "¡Muchas gracias!",
    successText: "Sus respuestas llegaron bien. Con ellas prepararé un primer prototipo y le escribiré para revisarlo juntos.",
    errorText: "No se pudieron enviar las respuestas. Revise su conexión e inténtelo de nuevo, o descargue una copia y envíela por correo.",
    download: "Descargar una copia de sus respuestas",
    fileName: "IDAMHO-respuestas.txt",
  },

  progress: (done, total) => `${done} de ${total} preguntas respondidas`,
  otherPlaceholder: "Escriba aquí",
  maxReached: (n) => `Puede elegir hasta ${n}.`,
};
