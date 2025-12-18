interface VideoData {
  id: string;
  product_name?: string;
  title?: string;
  category?: string;
  total_sales?: number;
  sales_yesterday?: number;
  country_origin?: string;
}

interface SalesAngle {
  title: string;
  description: string;
}

// Simple hash function to generate a consistent seed from string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

function formatNumber(num?: number): string {
  if (!num) return '10,000+';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// EXCLUSIVIDAD/ESCASEZ VARIATIONS (15)
const exclusivityVariations = [
  (productName: string, totalSales: string, salesYesterday: string | number) => `🚨 ALERTA DE INVENTARIO CRÍTICO 🚨

${productName} se está agotando más rápido de lo esperado. Solo ayer vendimos ${salesYesterday} unidades.

⚡ SITUACIÓN ACTUAL:
• Stock limitado disponible
• Demanda viral en redes sociales
• ${totalSales} unidades ya vendidas
• Próximo reabastecimiento: 4-6 semanas

Esta no es una táctica de marketing, la demanda es completamente real y el inventario está al límite.

⏰ VENTANA DE OPORTUNIDAD:
Si estás leyendo esto ahora, aún quedan unidades... pero no por mucho tiempo.

No seas de los que después se arrepienten. Actúa AHORA antes del agotamiento total. 🔥`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `⚠️ ÚLTIMA OPORTUNIDAD ⚠️

${productName} está en su nivel más bajo de inventario del año.

📊 DATOS EN TIEMPO REAL:
• ${totalSales} unidades vendidas hasta ahora
• ${salesYesterday} ventas solo en las últimas 24 horas
• Tendencia EXPLOSIVA en TikTok y Instagram
• Producción limitada este trimestre

🎯 POR QUÉ DEBES ACTUAR YA:
Miles de personas están viendo esto al mismo tiempo que tú. Cada minuto que pasas pensando, alguien más está comprando.

El precio de dudar es perder tu oportunidad. Simple y directo. ⚡`,

  (productName: string, totalSales: string) => `🔥 EDICIÓN LIMITADA - STOCK AGOTÁNDOSE 🔥

${productName} NO es un producto de producción masiva. Es una edición especial con cantidades limitadas.

💎 POR QUÉ ES TAN EXCLUSIVO:
• Producción limitada por temporada
• Materiales premium de disponibilidad restringida
• ${totalSales} unidades vendidas en tiempo récord
• No habrá reposición hasta nueva temporada

🚀 FENÓMENO VIRAL:
Este producto se volvió viral y la demanda superó todas las proyecciones. Los que actuaron rápido ya tienen el suyo.

⏳ NO ESPERES MÁS:
Cuando se agote, tendrás que esperar meses para la próxima producción. ¿Vale la pena arriesgarse? 💪`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `⚡ ADVERTENCIA: STOCK CRÍTICO ⚡

El inventario de ${productName} está en CÓDIGO ROJO.

📈 NÚMEROS QUE NO MIENTEN:
• ${salesYesterday} ventas ayer
• ${totalSales} unidades totales vendidas
• Velocidad de venta: 1 unidad cada 3 minutos
• Stock restante: MUY LIMITADO

🎪 EFECTO VIRAL:
Influencers y creadores de contenido están comprando al mayoreo. Los clientes están ordenando múltiples unidades.

🚨 TU DECISIÓN:
Comprar ahora o arrepentirte después. No hay término medio cuando el producto se agota. 🔥`,

  (productName: string, totalSales: string) => `🎯 OPORTUNIDAD ÚNICA - ACCESO LIMITADO 🎯

${productName} se ha convertido en el producto más buscado del momento.

⭐ LA REALIDAD:
• Solo disponible mientras dure el stock actual
• ${totalSales} clientes satisfechos no pueden estar equivocados
• Reposición incierta por alta demanda
• Precio especial solo para stock actual

💡 DATO IMPORTANTE:
El 73% de las personas que esperan "para pensarlo mejor" nunca logran comprarlo porque se agota.

¿Serás parte del 27% que actúa a tiempo? La elección es tuya. ⚡`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `🔔 ALERTA DE DISPONIBILIDAD 🔔

${productName} está volando de los estantes. Stock descendiendo rápidamente.

📊 SITUACIÓN ACTUAL:
• ${salesYesterday} unidades vendidas solo ayer
• ${totalSales} clientes ya lo tienen
• Tendencia #1 en redes sociales
• Reposición programada: SIN CONFIRMAR

⚠️ MOMENTO DECISIVO:
Este mensaje es tu recordatorio de que las oportunidades tienen fecha de vencimiento.

Los que dudan pierden, los que actúan ganan. Así de simple. 🎯`,

  (productName: string, totalSales: string) => `🚀 FENÓMENO VIRAL - STOCK LIMITADÍSIMO 🚀

${productName} explotó en popularidad y el inventario no puede seguir el ritmo.

🔥 SITUACIÓN CRÍTICA:
• ${totalSales} unidades vendidas en tiempo récord
• Demanda 300% por encima de lo proyectado
• Producción al máximo, aún no es suficiente
• Stock actual: ÚLTIMAS UNIDADES

💎 EXCLUSIVIDAD REAL:
No es marketing, es matemática simple: stock limitado + demanda masiva = agotamiento inminente.

Toma tu decisión antes de que otros lo hagan por ti. ⏰`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `⚠️ INVENTARIO EN NIVEL MÍNIMO ⚠️

${productName} alcanzó niveles críticos de stock.

📉 NÚMEROS REALES:
• ${salesYesterday} ventas en las últimas 24h
• ${totalSales} unidades totales despachadas
• Velocidad de agotamiento: ACELERADA
• Tiempo estimado hasta agotamiento: HORAS

🎯 NO ES COINCIDENCIA:
Cuando un producto es realmente bueno, se vende. Simple. Este producto es BUENO.

⏳ ÚLTIMA LLAMADA:
La próxima vez que revises, puede que ya no haya stock. Actúa YA. 🔥`,

  (productName: string, totalSales: string) => `🎪 EDICIÓN ESPECIAL - CANTIDADES LIMITADAS 🎪

${productName} es una producción limitada, no un producto regular de catálogo.

⚡ POR QUÉ LA URGENCIA:
• Lote de producción único y limitado
• ${totalSales} unidades ya en manos de clientes
• Sin planes confirmados de nueva producción
• Demanda superando toda expectativa

💎 VALOR EXCLUSIVO:
Los productos limitados no solo resuelven tu necesidad, se convierten en artículos codiciados que otros buscarán después.

No seas el que se quedó afuera. Asegura el tuyo AHORA. 🚀`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `🔴 CÓDIGO ROJO: STOCK AGOTÁNDOSE 🔴

${productName} en nivel crítico de disponibilidad.

⚡ SITUACIÓN EN TIEMPO REAL:
• ${salesYesterday} unidades vendidas ayer
• ${totalSales} clientes totales
• Tendencia viral en múltiples plataformas
• Stock restante: CONTADO

🚨 VENTANA CERRÁNDOSE:
Cada segundo que pasa, alguien está completando su compra. La pregunta no es "si" se agotará, sino "cuándo".

¿Estarás del lado de los que actuaron o de los que se quedaron pensando? ⏰`,

  (productName: string, totalSales: string) => `⚡ ÚLTIMA OPORTUNIDAD DEL AÑO ⚡

${productName} llegó a su límite de stock para esta temporada.

📊 LA REALIDAD:
• ${totalSales} unidades vendidas este año
• Stock actual: ÚLTIMAS UNIDADES
• Próxima producción: AÚN POR CONFIRMAR
• Demanda: DESBORDADA

🎯 MOMENTO DE LA VERDAD:
Puedes ser de los afortunados que lo consiguen o de los que tendrán que esperar meses (o más) para la próxima oportunidad.

Tu elección define tu resultado. ¿Qué decides? 🔥`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `🚨 ALERTA MÁXIMA - AGOTAMIENTO INMINENTE 🚨

${productName} está en sus últimas unidades disponibles.

⚡ DATOS ACTUALIZADOS:
• ${salesYesterday} ventas en las últimas 24 horas
• ${totalSales} unidades totales vendidas
• Ritmo de venta: ACELERADO
• Stock disponible: CRÍTICO

💡 REALIDAD CRUDA:
Este producto se vende con o sin ti. La única diferencia es si tú estarás entre los que lo tienen o entre los que se arrepienten.

No dejes pasar esta oportunidad. Puede ser la última. 🎯`,

  (productName: string, totalSales: string) => `🔥 STOCK EN MÍNIMOS HISTÓRICOS 🔥

${productName} alcanzó el nivel más bajo de inventario desde su lanzamiento.

📈 POR QUÉ SE AGOTA:
• ${totalSales} clientes satisfechos y contando
• Viralidad en redes sociales sin precedentes
• Calidad que supera expectativas
• Precio que no se repetirá

⚠️ ÚLTIMA VENTANA:
Cuando este stock se agote, no sabemos cuándo volverá. La producción limitada significa oportunidades limitadas.

Actúa ahora o acepta las consecuencias. Simple. ⚡`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `⏰ CUENTA REGRESIVA FINAL ⏰

${productName} está en sus últimas horas de disponibilidad.

🎯 SITUACIÓN CRÍTICA:
• ${salesYesterday} ventas solo ayer
• ${totalSales} unidades despachadas
• Stock actual: AGOTÁNDOSE POR MINUTO
• Reposición: INCIERTA

🚀 NO HAY MARCHA ATRÁS:
Una vez que el stock llega a cero, se acabó. No hay excepciones, no hay lista de espera mágica.

Es tu momento de decidir: ¿dentro o fuera? La ventana se cierra YA. 🔥`,

  (productName: string, totalSales: string) => `🎯 ÚLTIMAS UNIDADES - ACCIÓN INMEDIATA REQUERIDA 🎯

${productName} está literalmente volando de los estantes.

💎 LOS NÚMEROS HABLAN:
• ${totalSales} clientes ya lo disfrutan
• Stock descendiendo cada minuto
• Demanda viral sin control
• Disponibilidad: MÍNIMA

⚡ TU ELECCIÓN AHORA:
Ser parte del grupo exclusivo que lo consiguió a tiempo, o ser parte del grupo que llegó tarde.

La diferencia entre los dos grupos es una sola acción. ¿Qué eliges? 🚀`
];

// PROBLEMA-SOLUCIÓN VARIATIONS (15)
const problemSolutionVariations = [
  (productName: string, totalSales: string) => `¿Cansado de que ese problema arruine tu día a día? 😤

${productName} fue creado específicamente para eliminar este problema de raíz, no solo taparlo temporalmente.

✅ SOLUCIÓN COMPLETA:
• Ataca el problema desde su origen
• Sin complicaciones ni curva de aprendizaje
• Resultados visibles desde el primer uso
• ${totalSales} clientes que ya superaron el problema

💪 LA DIFERENCIA:
Otros productos solo disfrazan el problema. Este lo ELIMINA.

No permitas que un problema resoluble controle tu vida un día más. 🎯`,

  (productName: string, totalSales: string) => `Ese problema que enfrentas todos los días tiene solución. 🔧

${productName} no es solo otro producto más, es LA respuesta definitiva que has estado buscando.

🎯 CÓMO TE AYUDA:
• Identifica y elimina la raíz del problema
• Funciona de manera automática y eficiente
• Sin efectos secundarios ni complicaciones
• Comprobado por ${totalSales} usuarios

✨ RESULTADOS REALES:
El 94% de nuestros clientes reportan que su problema desapareció en la primera semana.

Deja de sufrir innecesariamente. La solución está aquí. 💎`,

  (productName: string, totalSales: string) => `¿Cuánto tiempo más vas a tolerar ese problema? 😩

${productName} es la herramienta que transforma tu problema en historia del pasado.

⚡ POR QUÉ FUNCIONA:
• Diseño específico para este problema exacto
• Tecnología probada y refinada
• Implementación simple y rápida
• ${totalSales} casos de éxito documentados

🚀 DE PROBLEMA A SOLUCIÓN:
En menos de lo que imaginas, estarás preguntándote por qué no lo hiciste antes.

Tu problema tiene solución. ¿Vas a tomarla? 🔥`,

  (productName: string, totalSales: string) => `¿Frustrado con soluciones que no funcionan? 😤

${productName} rompe con todo lo anterior y realmente resuelve tu problema.

💡 LA DIFERENCIA:
• No es un parche temporal, es solución permanente
• Basado en resultados reales, no promesas vacías
• Fácil de implementar, imposible de ignorar sus resultados
• ${totalSales} personas ya viven sin ese problema

✅ GARANTÍA REAL:
Si no resuelve tu problema, no tiene sentido. Por eso funciona tan bien.

Deja de buscar. Ya encontraste la respuesta. 🎯`,

  (productName: string, totalSales: string) => `El problema que te aqueja tiene nombre y apellido... ¡y solución! 🔑

${productName} fue desarrollado pensando exactamente en personas como tú.

🎯 ENFOQUE PRECISO:
• Ataca los 3 puntos críticos del problema
• Previene que el problema regrese
• Resultados medibles y comprobables
• ${totalSales} testimonios reales de éxito

💪 SIN COMPLICACIONES:
Olvídate de procesos complejos. Esto funciona y punto.

Tu vida sin este problema está a un clic de distancia. ⚡`,

  (productName: string, totalSales: string) => `¿Y si te dijera que ese problema puede desaparecer hoy? 🌟

${productName} convierte lo imposible en realidad cotidiana.

✨ CÓMO CAMBIA TODO:
• Elimina el problema desde su causa raíz
• Sin necesidad de cambios drásticos en tu rutina
• Funciona mientras tú vives tu vida
• ${totalSales} clientes lo confirman diariamente

🚀 TRANSICIÓN NATURAL:
De vivir con el problema a olvidar que alguna vez lo tuviste.

La solución existe. Solo falta que la tomes. 🔥`,

  (productName: string, totalSales: string) => `Ese problema diario que te frustra tiene fecha de vencimiento. 📅

${productName} es el punto final que necesitas ponerle.

⚡ SOLUCIÓN INTEGRAL:
• Aborda todas las dimensiones del problema
• Sin efectos secundarios indeseados
• Resultados sostenibles en el tiempo
• Validado por ${totalSales} usuarios

💎 MÁS QUE UN PRODUCTO:
Es tu boleto de salida del problema que te ha limitado.

¿Listo para cerrar este capítulo? La solución te espera. 🎯`,

  (productName: string, totalSales: string) => `¿Cuánto vale tu paz mental? 🧘

${productName} elimina ese problema que te roba tranquilidad cada día.

🎯 BENEFICIOS DIRECTOS:
• Problema resuelto de forma permanente
• Sin complicaciones adicionales
• Resultados desde la primera aplicación
• ${totalSales} casos de éxito comprobados

✅ SIMPLE Y EFECTIVO:
No necesitas ser experto, solo necesitas usarlo.

Tu problema tiene solución. Tómala ahora. 💪`,

  (productName: string, totalSales: string) => `¿Cansado de "soluciones" que no solucionan nada? 😤

${productName} es diferente porque realmente FUNCIONA.

🔥 POR QUÉ ES DIFERENTE:
• Diseñado por expertos en el problema específico
• Probado en condiciones reales
• Sin trucos ni letra pequeña
• ${totalSales} personas lo avalan

🚀 RESULTADOS TANGIBLES:
Notarás la diferencia desde el primer día.

Deja de gastar en promesas. Invierte en resultados. 🎯`,

  (productName: string, totalSales: string) => `Tu problema no es único, pero sí merece una solución única. ⭐

${productName} entiende tu situación y actúa en consecuencia.

💡 SOLUCIÓN PERSONALIZADA:
• Se adapta a tu situación específica
• Funciona sin importar cuánto tiempo llevas con el problema
• Resultados verificables y medibles
• ${totalSales} historias de éxito reales

✨ DE PROBLEMA A RECUERDO:
En semanas, tu problema será solo una anécdota del pasado.

La solución está aquí. ¿La tomas o la dejas pasar? 🔥`,

  (productName: string, totalSales: string) => `¿Por qué seguir sufriendo cuando hay solución? 🤔

${productName} es la respuesta que has estado buscando sin saberlo.

⚡ IMPACTO INMEDIATO:
• Ataca el problema desde el primer momento
• Sin necesidad de cambios radicales
• Funciona mientras tú sigues con tu vida
• ${totalSales} personas ya no tienen ese problema

🎯 DECISIÓN SIMPLE:
Seguir con el problema o eliminarlo hoy. Tú eliges.

La solución está disponible. ¿Vas por ella? 💪`,

  (productName: string, totalSales: string) => `Ese problema diario ya no tiene por qué serlo. 🌅

${productName} transforma tu frustración en satisfacción.

✅ SOLUCIÓN COMPROBADA:
• Elimina el problema en su totalidad
• Previene que vuelva a aparecer
• Fácil de usar, imposible de fallar
• ${totalSales} clientes libres del problema

🚀 TU NUEVA REALIDAD:
Despierta sin ese peso que llevas arrastrando.

La solución existe y funciona. Solo falta tu decisión. 🔥`,

  (productName: string, totalSales: string) => `¿Sabes cuál es el costo real de no resolver tu problema? 💸

${productName} no solo resuelve el problema, te ahorra todo lo que pierdes diariamente.

🎯 VALOR COMPLETO:
• Elimina el problema principal
• Evita problemas secundarios derivados
• Ahorra tiempo, dinero y energía
• ${totalSales} usuarios recuperaron su tranquilidad

💎 INVERSIÓN INTELIGENTE:
No es un gasto, es la mejor inversión en ti mismo.

Tu problema tiene solución rentable. Tómala. ⚡`,

  (productName: string, totalSales: string) => `La vida es demasiado corta para vivir con problemas resolubles. ⏰

${productName} es tu atajo hacia una vida sin ese problema.

🔥 CAMBIO REAL:
• Solución permanente, no temporal
• Sin complicaciones en el proceso
• Resultados que hablan por sí solos
• ${totalSales} vidas transformadas

✨ TU MOMENTO:
De convivir con el problema a olvidar que existió.

La solución está lista. ¿Tú también? 🚀`,

  (productName: string, totalSales: string) => `Imagina tu vida sin ese problema que te limita. 🌟

${productName} convierte esa imaginación en tu nueva realidad.

⚡ TRANSFORMACIÓN TOTAL:
• Problema eliminado definitivamente
• Mejora cascada en otras áreas
• Proceso simple y directo
• ${totalSales} testimonios reales de cambio

💪 DECISIÓN LIBERADORA:
Hoy puede ser el día que todo cambie.

Tu solución está aquí. Solo falta que la actives. 🎯`
];

// BENEFICIO EMOCIONAL VARIATIONS (15)
const emotionalBenefitVariations = [
  (productName: string, totalSales: string) => `Imagina despertar sintiéndote confiado, seguro y en control. 🌟

${productName} no es solo un producto, es tu camino hacia la vida que mereces.

💎 TRANSFORMACIÓN EMOCIONAL:
• Siente la tranquilidad de tener todo bajo control
• Disfruta la confianza que siempre quisiste
• Experimenta la libertad de vivir sin preocupaciones
• Conquista ese sentimiento de logro personal

✨ IMPACTO REAL:
${totalSales} personas ya están viviendo esta transformación emocional.

Tu bienestar no tiene precio. Invierte en ti hoy. ❤️`,

  (productName: string, totalSales: string) => `¿Cuándo fue la última vez que te sentiste verdaderamente feliz? 😊

${productName} te devuelve esa sensación y la hace permanente.

🌈 TU NUEVA REALIDAD:
• Despierta con energía y entusiasmo
• Enfrenta el día con actitud positiva
• Duerme tranquilo sabiendo que todo está bien
• Vive sin ese peso que te agobiaba

💫 NO ESTÁS SOLO:
${totalSales} personas recuperaron su felicidad con esto.

Tu sonrisa genuina está a un paso. Tómalo. 🎯`,

  (productName: string, totalSales: string) => `El estrés, la ansiedad, la frustración... ¿hasta cuándo? 😤

${productName} es tu boleto hacia la paz mental que necesitas.

🧘 BIENESTAR REAL:
• Siente cómo se libera la tensión
• Experimenta calma genuina
• Recupera tu equilibrio emocional
• Vuelve a ser tú mismo, pero mejor

✨ TESTIMONIOS REALES:
${totalSales} personas transformaron su estado emocional.

Tu paz mental te está esperando. Ve por ella. 💎`,

  (productName: string, totalSales: string) => `¿Recuerdas cómo se siente estar orgulloso de ti mismo? 🏆

${productName} te da esa sensación de logro que tanto extrañas.

⭐ IMPACTO PROFUNDO:
• Recupera tu autoestima
• Siente la satisfacción del progreso
• Experimenta orgullo genuino
• Inspira a otros con tu cambio

🚀 EFECTO COMPROBADO:
${totalSales} personas redescubrieron su mejor versión.

Tu mejor yo te está esperando. Da el paso. 🔥`,

  (productName: string, totalSales: string) => `La vida es corta para vivirla preocupado o inseguro. 🌅

${productName} te libera de esas cadenas emocionales.

💫 LIBERTAD EMOCIONAL:
• Vive sin miedo al qué dirán
• Actúa con confianza absoluta
• Disfruta cada momento plenamente
• Siente que todo es posible

✨ TRANSFORMACIÓN VIRAL:
${totalSales} personas ya viven esta libertad.

Tu liberación emocional empieza hoy. ⚡`,

  (productName: string, totalSales: string) => `¿Qué precio tiene despertar feliz cada día? 😊

${productName} te demuestra que la felicidad sostenible es posible.

🌟 FELICIDAD DIARIA:
• Mañanas llenas de energía positiva
• Días productivos y satisfactorios
• Noches tranquilas y reparadoras
• Vida plena y significativa

💎 VALIDACIÓN REAL:
${totalSales} personas viven esta realidad.

Tu felicidad cotidiana te espera. Tómala. 🎯`,

  (productName: string, totalSales: string) => `El bienestar emocional no es lujo, es necesidad. 🧠

${productName} es tu inversión en salud mental y emocional.

💚 BENEFICIOS PROFUNDOS:
• Reduce el estrés significativamente
• Aumenta tu resiliencia emocional
• Mejora tus relaciones personales
• Potencia tu calidad de vida

✨ RESULTADOS MEDIBLES:
${totalSales} vidas emocionalmente transformadas.

Tu bienestar emocional vale la inversión. 💪`,

  (productName: string, totalSales: string) => `¿Te imaginas vivir sin esa carga emocional? 🎈

${productName} hace real lo que parece imposible.

🌈 LIBERACIÓN TOTAL:
• Suelta el peso que te agobia
• Siente ligereza en tu día a día
• Experimenta alegría genuina
• Vive el presente sin cargas del pasado

🚀 CAMBIO COMPROBADO:
${totalSales} personas se liberaron emocionalmente.

Tu liberación está disponible. Solo tómala. 🔥`,

  (productName: string, totalSales: string) => `La confianza en ti mismo cambia todo. 💪

${productName} es el catalizador de esa transformación.

⭐ CONFIANZA RENOVADA:
• Enfrentas desafíos sin miedo
• Tomas decisiones con seguridad
• Te expresas con autenticidad
• Alcanzas metas que parecían lejanas

✨ IMPACTO REAL:
${totalSales} personas recuperaron su confianza.

Tu versión más segura te espera. Da el paso. 🎯`,

  (productName: string, totalSales: string) => `¿Cuánto vale sentirte bien contigo mismo? 💎

${productName} te devuelve esa sensación invaluable.

🌟 AUTOESTIMA RENOVADA:
• Te miras al espejo con orgullo
• Actúas desde el amor propio
• Estableces límites sanos
• Vives desde tu autenticidad

💫 TRANSFORMACIÓN INTERIOR:
${totalSales} personas reencontraron su valía.

Tu autoestima merece este impulso. Tómalo. ⚡`,

  (productName: string, totalSales: string) => `La tranquilidad mental no tiene precio. 🧘

${productName} te la ofrece en bandeja de plata.

💚 PAZ INTERIOR:
• Mente clara y enfocada
• Emociones equilibradas
• Respuestas conscientes, no reactivas
• Serenidad ante los desafíos

✨ EFECTO DOCUMENTADO:
${totalSales} mentes en paz lo confirman.

Tu tranquilidad mental te espera. Acéptala. 🌅`,

  (productName: string, totalSales: string) => `Sentirte pleno es tu derecho, no un privilegio. 🌟

${productName} hace que lo vivas día a día.

💫 PLENITUD REAL:
• Satisfacción con tu progreso
• Alegría en las pequeñas cosas
• Gratitud genuina y constante
• Vida con propósito y sentido

🚀 RESULTADOS EMOCIONALES:
${totalSales} personas viven plenamente ahora.

Tu plenitud está al alcance. Tómala. 💎`,

  (productName: string, totalSales: string) => `¿Recuerdas cuando eras más optimista? ��

${productName} te reconecta con esa versión tuya.

✨ OPTIMISMO RENOVADO:
• Ves oportunidades donde antes veías problemas
• Confías en que las cosas saldrán bien
• Mantienes actitud positiva naturalmente
• Inspiras a otros con tu energía

💪 CAMBIO VISIBLE:
${totalSales} personas recuperaron su optimismo.

Tu yo optimista te extraña. Reencuéntrense. 🎯`,

  (productName: string, totalSales: string) => `La alegría de vivir sin angustias es indescriptible. 😊

${productName} te regala esa experiencia diariamente.

🌟 VIDA SIN ANGUSTIAS:
• Duermes profundo y descansas bien
• Vives el presente sin preocupaciones excesivas
• Disfrutas cada momento conscientemente
• Sientes que la vida fluye naturalmente

💫 TESTIMONIOS GENUINOS:
${totalSales} vidas sin angustias innecesarias.

Tu vida tranquila te espera. Empiézala hoy. 🔥`,

  (productName: string, totalSales: string) => `Sentirte empoderado cambia tu mundo entero. ⚡

${productName} es tu herramienta de empoderamiento personal.

💪 PODER PERSONAL:
• Tomas el control de tu vida
• Decides desde tu fuerza interior
• Actúas con determinación
• Consigues lo que te propones

🚀 IMPACTO TRANSFORMADOR:
${totalSales} personas se empoderaron con esto.

Tu empoderamiento personal empieza aquí. 🎯`
];

// COMPARACIÓN VARIATIONS (15)
const comparisonVariations = [
  (productName: string, totalSales: string, salesYesterday: string | number) => `🤔 ¿Seguir igual o transformar tu situación con ${productName}?

📊 COMPARACIÓN DIRECTA:

SIN ${productName}:
❌ Sigues con las mismas frustraciones diarias
❌ Pierdes tiempo y recursos constantemente
❌ Te frustras al intentar resolver el problema
❌ Envidias a quienes ya tienen la solución

CON ${productName}:
✅ Resultados automáticos y consistentes
✅ Ahorro real de tiempo y dinero
✅ Satisfacción y tranquilidad diarias
✅ Eres parte de los ${totalSales} usuarios satisfechos

💰 INVERSIÓN vs GASTO:
La competencia cobra más por menos. ${productName} ofrece calidad premium a precio justo.

¿Vas a seguir gastando en soluciones mediocres? ${salesYesterday} personas ayer eligieron correctamente. 🎯`,

  (productName: string, totalSales: string) => `Tu situación AHORA vs tu situación CON ${productName}: 🔄

⬅️ TU REALIDAD ACTUAL:
❌ El problema persiste día tras día
❌ Soluciones parciales que no resuelven nada
❌ Frustración acumulada
❌ Dinero gastado sin resultados

➡️ TU REALIDAD CON ${productName}:
✅ Problema resuelto definitivamente
✅ Solución completa y efectiva
✅ Satisfacción y tranquilidad
✅ Inversión que da resultados

💡 LOS NÚMEROS HABLAN:
${totalSales} personas ya hicieron el cambio. ¿Vas a quedarte atrás?

La diferencia está en tus manos. 🚀`,

  (productName: string, totalSales: string) => `ANTES vs DESPUÉS de ${productName}: 📈

🔴 ANTES:
• Problema constante y recurrente
• Intentos fallidos de solución
• Tiempo y dinero desperdiciados
• Resignación y frustración

🟢 DESPUÉS:
• Problema eliminado completamente
• Solución efectiva implementada
• Recursos optimizados
• Satisfacción y logro personal

📊 DATO CLAVE:
El 96% de nuestros ${totalSales} clientes dicen que hubieran querido conocerlo antes.

¿Vas a esperar o vas a actuar? ⚡`,

  (productName: string, totalSales: string) => `¿Qué diferencia hace ${productName}? TODO. 💎

SIN ESTO:
❌ Días complicados y estresantes
❌ Resultados mediocres o nulos
❌ Seguir probando cosas sin éxito
❌ Sensación de estar estancado

CON ESTO:
✅ Días fluidos y productivos
✅ Resultados sobresalientes
✅ Solución definitiva encontrada
✅ Progreso constante y visible

🎯 LA ELECCIÓN:
${totalSales} personas ya eligieron el cambio. ¿Tú seguirás igual?

La diferencia entre ambos escenarios es una decisión. 🔥`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `Elección simple: Continuar o Transformar 🔄

OPCIÓN A - CONTINUAR SIN ${productName}:
❌ Mismo problema, mismo resultado
❌ Frustración creciente
❌ Tiempo y dinero perdidos
❌ Oportunidades desperdiciadas

OPCIÓN B - TRANSFORMAR CON ${productName}:
✅ Problema resuelto, resultado nuevo
✅ Satisfacción constante
✅ Inversión inteligente
✅ Oportunidades aprovechadas

💡 MATEMÁTICA SIMPLE:
${salesYesterday} personas ayer eligieron la opción B. ${totalSales} en total ya viven la diferencia.

¿Qué opción elegirás tú? 🎯`,

  (productName: string, totalSales: string) => `La vida CON ${productName} vs la vida SIN él: 🌟

❌ SIN ÉL:
• Luchas diarias con el mismo problema
• Soluciones temporales que fallan
• Dinero en productos que no sirven
• Cada día es igual al anterior

✅ CON ÉL:
• Problema eliminado permanentemente
• Solución definitiva que funciona
• Inversión única con resultados duraderos
• Cada día mejor que el anterior

📊 EVIDENCIA:
${totalSales} clientes confirman la diferencia.

¿De qué lado quieres estar? 🚀`,

  (productName: string, totalSales: string) => `Tu mundo ANTES y DESPUÉS de ${productName}: 🔄

🔴 ANTES:
Frustración | Problema constante | Soluciones fallidas | Desesperanza

🟢 DESPUÉS:
Satisfacción | Problema eliminado | Solución efectiva | Confianza renovada

💎 INVERSIÓN vs RESULTADO:
Pequeña inversión → Gran transformación

✨ VALIDADO POR:
${totalSales} historias de transformación real.

Tu "después" te espera. ¿Lo tomas? ⚡`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `Hoy decides: ¿Mismo camino o nuevo rumbo? 🛤️

MISMO CAMINO (sin ${productName}):
❌ Resultados conocidos (ninguno)
❌ Frustración predecible
❌ Tiempo perdido en soluciones falsas
❌ Seguir buscando sin encontrar

NUEVO RUMBO (con ${productName}):
✅ Resultados comprobados
✅ Satisfacción garantizada
✅ Solución definitiva encontrada
✅ Fin de la búsqueda

🎯 DECISIÓN DIARIA:
${salesYesterday} personas ayer tomaron el nuevo rumbo. ${totalSales} en total ya no vuelven atrás.

¿Qué camino eliges? 🔥`,

  (productName: string, totalSales: string) => `El contraste es obvio: CON o SIN ${productName} 📊

SIN ESTO EN TU VIDA:
❌ El problema sigue ahí, siempre
❌ Intentos que no llevan a nada
❌ Gasto continuo sin solución
❌ Resignación progresiva

CON ESTO EN TU VIDA:
✅ Problema resuelto de una vez
✅ Solución que realmente funciona
✅ Inversión única, beneficio continuo
✅ Tranquilidad permanente

💡 REALIDAD COMPROBADA:
${totalSales} vidas transformadas lo confirman.

¿Cuál será tu realidad? Tú decides. 🎯`,

  (productName: string, totalSales: string) => `Dos realidades, una elección: ${productName} 🔄

REALIDAD 1 - Sin cambio:
❌ Problema persistente
❌ Frustración acumulada
❌ Recursos desperdiciados
❌ Estancamiento total

REALIDAD 2 - Con cambio:
✅ Problema eliminado
✅ Satisfacción alcanzada
✅ Recursos optimizados
✅ Progreso constante

🚀 YA ELIGIERON EL CAMBIO:
${totalSales} personas viven la realidad 2.

¿En qué realidad quieres vivir? ⚡`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `Tu vida HOY vs tu vida MAÑANA con ${productName}: 📅

🔴 HOY (sin esto):
• Sigues lidiando con el mismo problema
• Pérdida constante de tiempo y recursos
• Nivel de frustración en aumento
• Sin solución real a la vista

🟢 MAÑANA (con esto):
• Problema en vías de desaparición
• Optimización de tiempo y recursos
• Nivel de satisfacción en aumento
• Solución implementada y funcionando

💪 EL CAMBIO ES HOY:
${salesYesterday} personas ayer empezaron su "mañana". ${totalSales} en total ya viven diferente.

¿Empiezas tu cambio hoy? 🎯`,

  (productName: string, totalSales: string) => `VIEJO MÉTODO vs ${productName}: No hay comparación 🆚

❌ VIEJO MÉTODO:
• Complicado y confuso
• Resultados inconsistentes
• Requiere mucho tiempo y esfuerzo
• Tasa de éxito: baja

✅ ${productName.toUpperCase()}:
• Simple y directo
• Resultados consistentes
• Mínimo tiempo y esfuerzo
• Tasa de éxito: ${totalSales} casos comprobados

🎯 LA DIFERENCIA:
Uno te hace perder el tiempo, el otro te da resultados.

¿Con cuál te quedas? 🚀`,

  (productName: string, totalSales: string) => `La pregunta no es SI cambiar, es CUÁNDO: ${productName} ⏰

❌ SEGUIR SIN CAMBIO:
• Más de lo mismo
• Problema permanente
• Frustración crónica
• Oportunidad perdida

✅ CAMBIAR AHORA:
• Inicio de algo nuevo
• Problema en resolución
• Esperanza renovada
• Oportunidad aprovechada

💎 DECISIÓN INTELIGENTE:
${totalSales} personas ya no postergan su cambio.

¿Seguirás esperando o actuarás? 🔥`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `TÚ sin ${productName} vs TÚ con ${productName}: 🪞

👤 TÚ SIN ESTO:
Lidiando con el problema | Buscando soluciones | Gastando en cosas que no sirven | Frustrado y cansado

👤 TÚ CON ESTO:
Problema resuelto | Solución encontrada | Inversión inteligente | Satisfecho y tranquilo

🎯 TRANSFORMACIÓN:
De un estado a otro hay solo una decisión.

✨ COMPROBADO:
${salesYesterday} personas ayer se transformaron. ${totalSales} ya viven la diferencia.

¿Qué versión de ti quieres ser? ⚡`,

  (productName: string, totalSales: string) => `Análisis simple: CON y SIN ${productName} 📋

📉 SITUACIÓN SIN ESTO:
❌ Problema activo y molesto
❌ Intentos fallidos repetidos
❌ Dinero gastado sin retorno
❌ Frustración como constante

📈 SITUACIÓN CON ESTO:
✅ Problema inactivo y resuelto
✅ Solución exitosa implementada
✅ Inversión con retorno claro
✅ Satisfacción como nueva norma

💡 EVIDENCIA NUMÉRICA:
${totalSales} casos de éxito documentados.

¿Quieres seguir en la situación SIN o pasar a la situación CON? 🎯`
];

// TRANSFORMACIÓN VARIATIONS (15)
const transformationVariations = [
  (productName: string, totalSales: string) => `🔴 ANTES de ${productName}:
"Cada día es una batalla. He intentado todo y nada funciona realmente. Me siento atrapado sin salida..." 😞

🟢 DESPUÉS de ${productName}:
"¡Increíble! Mi vida cambió por completo. ¿Cómo no descubrí esto antes? Es exactamente lo que necesitaba." 🤩

📈 LÍNEA DE TRANSFORMACIÓN:

✨ Primera Semana:
• Mejora notable en tu situación
• El problema disminuye significativamente
• Primeros resultados visibles

🚀 Primer Mes:
• Resultados completamente establecidos
• Transformación total de tu rutina
• Las personas notan el cambio

💎 REALIDAD COMPROBADA:
${totalSales} transformaciones documentadas y verificables.

Tu transformación comienza con una decisión. ¿La tomas? 🔥`,

  (productName: string, totalSales: string) => `DE ESTO ➡️ A ESTO con ${productName}: 📊

😓 PUNTO DE PARTIDA:
• Problema dominando tu vida
• Frustración constante
• Intentos sin éxito
• Resignación creciente

😊 PUNTO DE LLEGADA:
• Vida sin ese problema
• Satisfacción diaria
• Solución efectiva funcionando
• Confianza renovada

⏱️ TIEMPO DE TRANSFORMACIÓN:
Semanas, no años. Resultados visibles desde el inicio.

✨ TRANSFORMADOS:
${totalSales} personas ya completaron el viaje.

Tu viaje de transformación te espera. 🚀`,

  (productName: string, totalSales: string) => `La metamorfosis que causa ${productName}: 🦋

🐛 ESTADO INICIAL:
Luchando | Frustrado | Estancado | Sin solución

🦋 ESTADO FINAL:
Superando | Satisfecho | Progresando | Con solución

🎯 PROCESO DE CAMBIO:
• Días 1-7: Primeros cambios notables
• Días 8-21: Transformación acelerándose
• Días 22-30: Nueva realidad establecida
• Día 31+: Viviendo la transformación

💫 METAMORFOSIS REALES:
${totalSales} casos de cambio radical.

Tu metamorfosis está lista para comenzar. ⚡`,

  (productName: string, totalSales: string) => `Historia de transformación tipo con ${productName}: 📖

CAPÍTULO 1 - El Problema:
"Vivía con este problema todos los días. Afectaba mi calidad de vida. Probé varias cosas sin éxito."

CAPÍTULO 2 - El Cambio:
"Decidí probar ${productName}. Los primeros resultados me sorprendieron. Empecé a ver cambios reales."

CAPÍTULO 3 - La Transformación:
"Hoy mi vida es completamente diferente. El problema desapareció. Ojalá lo hubiera hecho antes."

📚 HISTORIAS SIMILARES:
${totalSales} personas tienen esta misma historia de éxito.

¿Cuándo empiezas a escribir la tuya? 🎯`,

  (productName: string, totalSales: string) => `El viaje de transformación con ${productName}: 🛤️

🚩 INICIO:
Problema presente | Frustración alta | Sin solución | Desesperanza

⚡ DURANTE:
Cambios iniciales | Esperanza renovada | Solución trabajando | Optimismo

🏆 LLEGADA:
Problema ausente | Satisfacción alta | Con solución | Confianza plena

💪 DURACIÓN DEL VIAJE:
Más corto de lo que imaginas, más impactante de lo que esperas.

✨ VIAJEROS EXITOSOS:
${totalSales} personas completaron el viaje.

Tu viaje puede empezar hoy. 🚀`,

  (productName: string, totalSales: string) => `Antes y Después REAL con ${productName}: 📸

❌ FOTOGRAFÍA "ANTES":
• Problema visible en tu vida
• Frustración marcada en tu día a día
• Soluciones temporales que fallan
• Sensación de no avanzar

✅ FOTOGRAFÍA "DESPUÉS":
• Problema eliminado de tu vida
• Tranquilidad presente en tu rutina
• Solución permanente funcionando
• Sensación de progreso constante

🎯 TIEMPO ENTRE FOTOS:
Menos de lo que crees, más efectivo de lo que imaginas.

💎 GALERÍA:
${totalSales} transformaciones antes/después documentadas.

¿Cuándo tomamos tu foto "después"? ⚡`,

  (productName: string, totalSales: string) => `La evolución que provoca ${productName}: 🧬

FASE 1 - Pre-solución:
Problema activo | Búsqueda constante | Frustración | Sin resultados

FASE 2 - Implementación:
Solución aplicada | Cambios iniciando | Esperanza | Primeros resultados

FASE 3 - Post-transformación:
Problema resuelto | Búsqueda terminada | Satisfacción | Resultados sostenidos

🚀 VELOCIDAD DE EVOLUCIÓN:
Rápida, efectiva y permanente.

✨ SERES EVOLUCIONADOS:
${totalSales} personas ya completaron su evolución.

Tu evolución está disponible. Iníciala. 🔥`,

  (productName: string, totalSales: string) => `Tu vida AHORA → Tu vida CON ${productName}: 🔄

📍 TU UBICACIÓN ACTUAL:
• Conviviendo con el problema
• Buscando soluciones sin éxito
• Gastando tiempo y dinero
• Sintiendo frustración creciente

📍 TU DESTINO POTENCIAL:
• Viviendo sin el problema
• Solución encontrada y funcionando
• Tiempo y dinero optimizados
• Sintiendo satisfacción constante

🗺️ RUTA DE CAMBIO:
Clara, directa y comprobadamente efectiva.

✅ YA LLEGARON:
${totalSales} personas están viviendo en el destino.

¿Empiezas el viaje hoy? 🎯`,

  (productName: string, totalSales: string) => `Transformación paso a paso con ${productName}: 👣

PASO 1 - Reconocimiento:
"Tengo este problema y necesito solucionarlo"

PASO 2 - Acción:
"Voy a probar ${productName}"

PASO 3 - Experimentación:
"Estoy viendo cambios reales"

PASO 4 - Confirmación:
"Funciona, el problema se está resolviendo"

PASO 5 - Consolidación:
"Mi vida es diferente, esto realmente funciona"

📊 TASA DE COMPLETITUD:
${totalSales} personas completaron los 5 pasos.

¿En qué paso estás tú? Da el siguiente. 🚀`,

  (productName: string, totalSales: string) => `El cambio que genera ${productName}: 🌊

🌑 SITUACIÓN INICIAL:
Oscuridad | Problema dominante | Sin claridad | Estancamiento

🌓 TRANSICIÓN:
Luz apareciendo | Cambios iniciando | Claridad emergiendo | Movimiento

🌕 SITUACIÓN FINAL:
Luz completa | Problema eliminado | Total claridad | Progreso constante

⚡ VELOCIDAD DEL CAMBIO:
Natural, progresiva y definitiva.

💫 EN LA LUZ COMPLETA:
${totalSales} personas ya viven iluminadas.

Tu cambio de fase está disponible. ⚡`,

  (productName: string, totalSales: string) => `Tu upgrade personal: ${productName} 💻

VERSIÓN ACTUAL (sin esto):
❌ Bug: Problema recurrente
❌ Error: Soluciones que no funcionan
❌ Crash: Frustración frecuente
❌ Vulnerable: Sin protección efectiva

VERSIÓN MEJORADA (con esto):
✅ Bug: Eliminado
✅ Error: Corregido
✅ Crash: Estabilizado
✅ Protegido: Solución implementada

🔄 PROCESO DE UPGRADE:
Simple, rápido y sin complicaciones.

💎 USUARIOS ACTUALIZADOS:
${totalSales} ya operan en la versión mejorada.

¿Instalas el upgrade? 🚀`,

  (productName: string, totalSales: string) => `De punto A a punto B con ${productName}: 🎯

📍 PUNTO A (tu presente):
Problema definido | Situación incómoda | Búsqueda activa | Resultados ausentes

➡️ TRAYECTORIA:
Decisión → Acción → Implementación → Resultados

📍 PUNTO B (tu futuro):
Solución implementada | Situación cómoda | Búsqueda terminada | Resultados presentes

🚀 DISTANCIA A-B:
Más corta de lo que parece, más alcanzable de lo que crees.

✨ EN PUNTO B:
${totalSales} personas ya llegaron y se quedaron.

¿Inicias el recorrido? ⚡`,

  (productName: string, totalSales: string) => `La revolución personal de ${productName}: ⚡

🔴 ANTIGUO RÉGIMEN:
• Problema en control
• Tú adaptándote al problema
• Frustración como norma
• Sin salida visible

🟢 NUEVO ORDEN:
• Tú en control
• Problema eliminado
• Satisfacción como norma
• Libertad alcanzada

🎆 REVOLUCIÓN:
Rápida, efectiva y permanente.

💪 REVOLUCIONARIOS:
${totalSales} personas ya liberaron su vida.

¿Te unes a la revolución? 🔥`,

  (productName: string, totalSales: string) => `Tu timeline transformado: ${productName} 📅

PASADO (antes de esto):
❌ Viviendo con el problema
❌ Intentos fallidos múltiples
❌ Tiempo perdido buscando
❌ Dinero gastado sin retorno

PRESENTE (decidiendo):
🤔 Conociendo la solución
🤔 Evaluando la oportunidad
🤔 En el punto de inflexión
🤔 A un paso del cambio

FUTURO (con esto):
✅ Viviendo sin el problema
✅ Solución exitosa implementada
✅ Tiempo recuperado
✅ Inversión con resultados

⏰ MOMENTO CLAVE:
El presente determina tu futuro.

🚀 FUTUROS EXITOSOS:
${totalSales} personas ya viven ese futuro.

¿Qué timeline eliges? 🎯`,

  (productName: string, totalSales: string) => `Transformación 360° con ${productName}: 🔄

❌ REALIDAD 1 (sin transformar):
Problema → Frustración → Búsqueda → Fracaso → Repetir ciclo

✅ REALIDAD 2 (transformada):
Solución → Satisfacción → Resultados → Éxito → Vivir plenamente

🎯 CAMBIO DE REALIDAD:
Un paso pequeño, un impacto gigante.

💫 EN REALIDAD 2:
${totalSales} personas rompieron el ciclo.

¿Rompes tu ciclo hoy? ⚡`
];

// FACEBOOK AD COPIES - PAIN POINT VARIATIONS (10)
const painPointVariations = [
  (productName: string, totalSales: string) => `¿Frustrado porque ese problema sigue afectando tu día a día? 😔

Sabemos exactamente lo que estás pasando. Miles han enfrentado este mismo problema, probando soluciones que simplemente NO funcionan.

Pero aquí está la buena noticia... 🎯

${productName} fue diseñado para resolver este problema de raíz. No es otra solución temporal, es LA solución definitiva.

✅ Resuelve el problema permanentemente
✅ Fácil de usar, sin complicaciones
✅ Resultados visibles desde el primer uso
✅ Garantía de satisfacción 100%

Ya son ${totalSales} clientes que superaron este mismo problema.

👉 Haz clic en "Comprar Ahora" y transforma tu vida hoy. ¡No dejes que este problema te detenga más!`,

  (productName: string, totalSales: string) => `¿Cuánto tiempo más vas a tolerar ese problema constante? 😤

Cada día que pasa es otro día perdido. Otro día frustrado. Otro día deseando que las cosas fueran diferentes.

${productName} es la respuesta que has estado buscando.

💡 POR QUÉ ES DIFERENTE:
• Ataca el problema desde su origen
• No más parches temporales
• Resultados duraderos garantizados
• ${totalSales} personas ya lo confirman

⏰ TU MOMENTO ES AHORA:
No dejes pasar otro día con este problema. La solución está frente a ti.

👉 Clic aquí para ordenar y empezar tu transformación hoy mismo.`,

  (productName: string, totalSales: string) => `¿Cansado de intentar cosas que NO funcionan? 😩

Has probado todo. Has gastado dinero. Has invertido tiempo. Y sigues con el mismo problema.

Es hora de probar algo que REALMENTE funciona: ${productName}

🎯 LA DIFERENCIA:
• Solución completa, no parcial
• Diseño específico para tu problema
• Funciona desde el primer uso
• ${totalSales} casos de éxito comprobados

💪 NO MÁS FRUSTRACIONES:
Esta es la última solución que necesitas probar.

👉 Ordena ahora y dile adiós a ese problema de una vez por todas.`,

  (productName: string, totalSales: string) => `Ese problema que enfrentas NO se va a resolver solo... 🔍

Lo sabemos. Lo has intentado. Pero sin la herramienta correcta, el problema persiste.

${productName} es esa herramienta correcta.

✨ SOLUCIÓN REAL:
• Elimina el problema desde la raíz
• Sin complicaciones innecesarias
• Resultados medibles y visibles
• Respaldado por ${totalSales} clientes satisfechos

🚀 EL CAMBIO EMPIEZA HOY:
No esperes a que el problema empeore.

👉 Haz clic ahora y obtén la solución definitiva que necesitas.`,

  (productName: string, totalSales: string) => `¿Estás dejando que un problema resoluble arruine tu día a día? 😔

La mayoría de personas aceptan vivir con sus problemas. Pero tú no tienes que hacerlo.

${productName} existe para liberarte de ese problema.

💎 LO QUE OBTIENES:
• Solución efectiva y permanente
• Implementación simple y rápida
• Sin riesgos ni complicaciones
• Unirte a ${totalSales} usuarios felices

⚡ TU DECISIÓN:
Seguir con el problema o eliminarlo hoy.

👉 Toma control ahora. Haz clic para ordenar tu solución.`,

  (productName: string, totalSales: string) => `¿Por qué seguir luchando cuando existe una solución? 🤔

${productName} no es solo otro producto. Es la respuesta al problema que te ha limitado.

🎯 SOLUCIÓN COMPROBADA:
• Diseño específico para tu problema
• Resultados desde el primer día
• Sin curva de aprendizaje complicada
• ${totalSales} transformaciones exitosas

✅ GARANTÍA REAL:
Si no resuelve tu problema, te devolvemos tu dinero. Así de seguros estamos.

👉 Ordena ahora y experimenta el cambio que has estado esperando.`,

  (productName: string, totalSales: string) => `¿Frustrado de vivir con ese problema constante? 😤

No estás solo. Miles enfrentaban lo mismo hasta que descubrieron ${productName}.

💡 LA SOLUCIÓN QUE FUNCIONA:
• Elimina el problema definitivamente
• Sin soluciones temporales inútiles
• Fácil de usar y efectivo
• ${totalSales} historias de éxito

🔥 NO ESPERES MÁS:
Cada día con el problema es un día perdido.

👉 Clic aquí para ordenar y empezar a vivir sin ese problema.`,

  (productName: string, totalSales: string) => `Ese problema diario que te frustra tiene solución. 🔧

${productName} fue creado específicamente para eliminarlo de tu vida.

⚡ POR QUÉ FUNCIONA:
• Aborda la causa, no solo el síntoma
• Resultados sostenibles a largo plazo
• Sin complicaciones adicionales
• Validado por ${totalSales} usuarios

💪 TU LIBERACIÓN:
No tienes que vivir con este problema un día más.

👉 Ordena ahora y recupera tu tranquilidad hoy mismo.`,

  (productName: string, totalSales: string) => `¿Cuántos intentos fallidos más antes de probar algo que funciona? 🎯

${productName} es diferente. Es la solución que has estado buscando.

✨ DIFERENCIADORES CLAVE:
• Efectividad probada
• Resultados rápidos y duraderos
• Sin efectos secundarios
• ${totalSales} clientes lo respaldan

🚀 MOMENTO DE ACTUAR:
Deja de gastar en cosas que no sirven.

👉 Invierte en ${productName} y resuelve tu problema de una vez.`,

  (productName: string, totalSales: string) => `¿Listo para decirle adiós a ese problema para siempre? 👋

${productName} hace posible lo que otros productos prometen pero no cumplen.

🎯 SOLUCIÓN DEFINITIVA:
• Problema eliminado permanentemente
• Sin necesidad de intentos múltiples
• Funciona desde el inicio
• ${totalSales} éxitos documentados

✅ SIN RIESGOS:
Garantía total o devolución completa.

👉 Haz clic ahora y libérate de ese problema hoy mismo.`
];

// FACEBOOK AD COPIES - TRANSFORMATION VARIATIONS (10)
const transformationCopyVariations = [
  (productName: string, totalSales: string, salesYesterday: string | number) => `🔴 ANTES: "Estoy harto... He probado todo y nada funciona. Me siento frustrado..."

¿Te suena familiar? Así se sentían miles antes de descubrir ${productName}.

🟢 DESPUÉS: "¡No puedo creer la diferencia! ${productName} cambió mi vida. Ojalá lo hubiera descubierto antes."

Esta es la transformación REAL que viven ${totalSales} personas. No es magia, es una solución que REALMENTE funciona.

📈 RESULTADOS COMPROBADOS:
• Mejora notable en tiempo récord
• Resultados duraderos garantizados
• Cambios desde el primer día
• Satisfacción del 98%

La pregunta no es SI funciona... es: ¿Cuándo empiezas TÚ?

💥 Únete a ${salesYesterday} personas que ayer empezaron su transformación. Haz clic ahora.`,

  (productName: string, totalSales: string) => `DE ESTO ➡️ A ESTO en semanas, no años.

ANTES de ${productName}:
❌ Problema constante y frustrante
❌ Intentos fallidos repetidos
❌ Resignación creciente

DESPUÉS de ${productName}:
✅ Problema completamente resuelto
✅ Solución efectiva implementada
✅ Tranquilidad recuperada

💎 ${totalSales} TRANSFORMACIONES REALES:
Cada una comenzó con una simple decisión: probar ${productName}.

🎯 TU TRANSFORMACIÓN ESPERA:
El único paso que separa tu ANTES de tu DESPUÉS es hacer clic ahora.

👉 Ordena hoy y empieza tu increíble transformación.`,

  (productName: string, totalSales: string) => `"Antes vs Después de ${productName}" - Historia Real:

📉 MI VIDA ANTES:
Luchando con el problema diariamente, frustrado sin solución real, gastando en cosas que no servían.

📈 MI VIDA DESPUÉS:
Problema resuelto, tranquilidad recuperada, inversión que valió cada centavo.

⚡ EL CAMBIO:
${productName} fue el catalizador que lo hizo posible.

💫 NO SOLO YO:
${totalSales} personas tienen historias similares de transformación.

🚀 TU HISTORIA EMPIEZA HOY:
Haz clic ahora y escribe tu propio "antes y después".

👉 Ordena ${productName} y transforma tu realidad.`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `La transformación que ${productName} genera es REAL.

🔴 PUNTO DE PARTIDA:
Problema activo | Frustración constante | Sin solución efectiva

🟢 PUNTO DE LLEGADA:
Problema resuelto | Satisfacción diaria | Solución funcionando

⏱️ TIEMPO DE TRANSFORMACIÓN:
Más rápido de lo que imaginas, más efectivo de lo que esperas.

✨ ${salesYesterday} TRANSFORMACIONES AYER:
Cada una comenzó con la decisión de intentarlo.

💪 TU TURNO:
No observes desde afuera. Sé parte del cambio.

👉 Clic aquí para iniciar tu transformación ahora.`,

  (productName: string, totalSales: string) => `¿Recuerdas cómo era tu vida antes de este problema?

${productName} te devuelve a ese estado... pero MEJOR.

✨ EL VIAJE:
ANTES → DURANTE → DESPUÉS

🎯 ANTES:
Viviendo limitado por el problema

💡 DURANTE:
Implementando ${productName}, viendo cambios

🏆 DESPUÉS:
Viviendo libre del problema

🚀 VELOCIDAD:
Más rápido de lo que crees.

💎 COMPROBACIÓN:
${totalSales} viajes completados exitosamente.

👉 Empieza tu viaje hoy. Ordena ahora.`,

  (productName: string, totalSales: string) => `Transformación documentada con ${productName}:

DÍA 1: Decides probar ${productName}
DÍA 7: Notas los primeros cambios significativos
DÍA 21: La transformación es evidente
DÍA 30: Tu vida es completamente diferente

📊 ESTADÍSTICA REAL:
${totalSales} personas completaron esta transformación.

⚡ LA PREGUNTA:
¿Empiezas tu Día 1 hoy o sigues postergando?

🎯 TU DECISIÓN DEFINE TU RESULTADO:
Actuar = Transformarte
Esperar = Quedarte igual

👉 Elige transformarte. Haz clic para ordenar ahora.`,

  (productName: string, totalSales: string) => `De vivir con el problema a olvidar que existió.

${productName} no solo resuelve, TRANSFORMA.

🔴 ESTADO INICIAL:
Problema dominante | Frustración creciente | Sin esperanza real

🟢 ESTADO FINAL:
Problema ausente | Satisfacción presente | Esperanza realizada

💫 TRAYECTORIA:
Clara, efectiva y comprobada por ${totalSales} personas.

🚀 TU OPORTUNIDAD:
Dejar de vivir en el estado inicial y pasar al estado final.

👉 El cambio empieza con un clic. Ordena ${productName} ahora.`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `¿Cómo cambia tu vida ${productName}? Totalmente.

CAMBIO 1: El problema desaparece
CAMBIO 2: Tu rutina mejora
CAMBIO 3: Tu bienestar aumenta
CAMBIO 4: Tu confianza crece

💎 NO ES TEORÍA:
${salesYesterday} personas ayer experimentaron estos cambios.
${totalSales} en total ya viven transformados.

⚡ TU TURNO DE CAMBIAR:
Cada transformación exitosa comenzó con decidirse a probar.

👉 Decídete hoy. Ordena y experimenta tu propia transformación.`,

  (productName: string, totalSales: string) => `Testimonio Real: "Mi vida ANTES y DESPUÉS de ${productName}"

ANTES: Problema constante, frustraciones diarias, sin solución efectiva, gastando en cosas inútiles.

DESPUÉS: Problema eliminado, días tranquilos, solución implementada, mejor inversión que hice.

💡 EL CAMBIO: ${productName}

✨ NO ES ÚNICO:
${totalSales} testimonios similares confirman la transformación.

🎯 TU TESTIMONIO:
Dentro de semanas podrías estar escribiendo tu propia historia de éxito.

👉 Empieza tu historia. Ordena ${productName} hoy.`,

  (productName: string, totalSales: string) => `Tu "Antes" vs tu "Después": Una decisión de distancia.

❌ ANTES (sin ${productName}):
Problema presente | Búsqueda constante | Frustración | Sin resultados

✅ DESPUÉS (con ${productName}):
Problema ausente | Búsqueda terminada | Satisfacción | Resultados logrados

🔄 TRANSICIÓN:
Más simple de lo que crees, más impactante de lo que imaginas.

💫 YA TRANSITARON:
${totalSales} personas hicieron este viaje exitosamente.

👉 Inicia tu transición ahora. Clic para ordenar.`
];

// FACEBOOK AD COPIES - SCARCITY/URGENCY VARIATIONS (10)
const scarcityUrgencyVariations = [
  (productName: string, totalSales: string, salesYesterday: string | number) => `⚠️ ALERTA DE INVENTARIO CRÍTICO ⚠️

Pocas unidades de ${productName} disponibles con descuento especial.

📊 DATOS EN TIEMPO REAL:
• ${salesYesterday} unidades vendidas SOLO AYER
• Stock actual: LIMITADO
• Demanda: ALTÍSIMA
• Tiempo restante: POCAS HORAS

🔥 ¿Por qué tanta demanda?
${totalSales} clientes descubrieron que es LA solución definitiva.

⏰ LA REALIDAD:
Si lees esto AHORA, aún quedan unidades. Pero en horas puede agotarse COMPLETAMENTE.

Esperar significa pagar más después... o peor, quedarte sin él.

❌ No seas de los que dicen "debí comprarlo cuando pude"
✅ Actúa AHORA mientras hay disponibilidad

👉 Clic en "Comprar Ahora" antes de que sea tarde. ¡No te quedes afuera!`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `🚨 STOCK AGOTÁNDOSE RÁPIDAMENTE 🚨

${productName} está volando de los estantes.

⚡ SITUACIÓN ACTUAL:
• ${salesYesterday} ventas en 24 horas
• ${totalSales} unidades totales vendidas
• Velocidad: 1 unidad cada minutos
• Disponibilidad: CRÍTICA

🔥 ALERTA VIRAL:
Este producto explotó en redes sociales y la demanda superó todas las proyecciones.

⏳ TU VENTANA:
Abierta AHORA. Cerrada PRONTO.

💡 DECISIÓN INTELIGENTE:
Asegurar tu unidad ahora, no arrepentirte después.

👉 Haz clic YA y ordena antes del agotamiento total.`,

  (productName: string, totalSales: string) => `⏰ ÚLTIMA OPORTUNIDAD: STOCK MÍNIMO ⏰

${productName} en nivel crítico de disponibilidad.

🎯 LA REALIDAD:
• Edición limitada por temporada
• ${totalSales} unidades ya despachadas
• Reposición: SEMANAS o MESES
• Tu ventana: CERRÁNDOSE

🚀 FENÓMENO COMPROBADO:
Cuando un producto es bueno, se agota. Este producto es EXCELENTE.

💎 NO POSTERGUES:
Las oportunidades tienen fecha de vencimiento.

👉 Ordena ahora mientras aún hay stock. Clic aquí.`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `🔔 ALERTA: INVENTARIO DESCENDIENDO 🔔

${productName} llegando a niveles mínimos históricos.

📉 NÚMEROS REALES:
• ${salesYesterday} unidades ayer
• ${totalSales} totales vendidas
• Stock actual: ÚLTIMAS UNIDADES
• Próxima producción: INCIERTA

⚠️ MOMENTO DECISIVO:
Cada minuto que dudas, alguien más está comprando.

🔥 LA MATEMÁTICA ES SIMPLE:
Stock limitado + Demanda alta = Agotamiento inminente

👉 No esperes más. Asegura el tuyo AHORA.`,

  (productName: string, totalSales: string) => `🚨 CÓDIGO ROJO: DISPONIBILIDAD CRÍTICA 🚨

${productName} está a punto de agotarse.

⚡ STATUS ACTUAL:
• Stock: ÚLTIMAS UNIDADES
• Demanda: DESBORDADA
• ${totalSales} ya lo tienen
• Tiempo restante: CONTADO

💡 REALIDAD CRUDA:
Este producto se vende con o sin ti. La diferencia es si TÚ lo tendrás o te arrepentirás.

⏰ NO HAY MARCHA ATRÁS:
Una vez agotado, tendrás que esperar... si es que vuelve.

👉 Actúa ahora. Haz clic y asegura tu unidad.`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `⚠️ ADVERTENCIA FINAL: AGOTAMIENTO INMINENTE ⚠️

${productName} en sus últimas horas de disponibilidad.

🔥 SITUACIÓN LÍMITE:
• ${salesYesterday} ventas solo ayer
• ${totalSales} clientes ya lo disfrutan
• Stock: AGOTÁNDOSE POR MINUTO
• Tu oportunidad: AHORA O NUNCA

🎯 DECISIÓN CRÍTICA:
Ser parte de los que actuaron o parte de los que se quedaron viendo.

💎 SIN SEGUNDAS OPORTUNIDADES:
Cuando llegue a cero, se acabó. Sin excepciones.

👉 Clic ahora para ordenar antes del agotamiento total.`,

  (productName: string, totalSales: string) => `🔴 ÚLTIMA LLAMADA: STOCK CRÍTICO 🔴

${productName} alcanzó nivel mínimo de inventario.

⚡ DATOS FINALES:
• Disponibilidad: CRÍTICA
• ${totalSales} ya vendidas
• Reposición: SIN CONFIRMAR
• Tu ventana: CERRÁNDOSE

🚀 LA REALIDAD:
Los que actúan rápido obtienen lo que quieren. Los que dudan, se quedan afuera.

⏰ MOMENTO FINAL:
Este mensaje puede ser tu última oportunidad.

👉 No te quedes afuera. Ordena AHORA.`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `🚨 ALERTA MÁXIMA: ÚLTIMAS UNIDADES 🚨

${productName} a punto de agotamiento total.

📊 SITUACIÓN FINAL:
• ${salesYesterday} unidades vendidas ayer
• ${totalSales} totales despachadas
• Stock restante: CONTADO
• Tiempo: SE ACABA

🔥 TU ELECCIÓN:
Actuar ahora y tenerlo, o dudar y arrepentirte.

💡 NO HAY TÉRMINO MEDIO:
O lo ordenas ahora o pierdes la oportunidad.

👉 Haz clic YA y asegura tu unidad antes del fin del stock.`,

  (productName: string, totalSales: string) => `⏰ CUENTA REGRESIVA FINAL ⏰

${productName} en sus últimas unidades disponibles.

🎯 STATUS CRÍTICO:
• Inventario: MÍNIMO HISTÓRICO
• ${totalSales} ya se fueron
• Demanda: MÁXIMA
• Disponibilidad: EFÍMERA

⚠️ ÚLTIMA VENTANA:
Esta puede ser literalmente tu última oportunidad de conseguirlo.

🚀 ACTÚA O ACEPTA LAS CONSECUENCIAS:
Simple y directo.

👉 Ordena ahora mientras todavía es posible. Clic aquí.`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `🔔 ALERTA FINAL: AGOTAMIENTO TOTAL INMINENTE 🔔

${productName} llegando a CERO unidades disponibles.

⚡ ÚLTIMOS NÚMEROS:
• ${salesYesterday} ventas en 24h
• ${totalSales} unidades totales
• Stock actual: ÚLTIMAS PIEZAS
• Tu oportunidad: EXPIRANDO

🔥 DECISIÓN FINAL:
Dentro o fuera. No hay grises.

💎 LOS QUE DUDARON PERDIERON:
No seas uno de ellos.

👉 Última oportunidad. Clic para ordenar AHORA.`
];

// FACEBOOK AD COPIES - UNIQUE VALUE PROPOSITION VARIATIONS (10)
const uniqueValueVariations = [
  (productName: string, totalSales: string) => `¿Qué hace a ${productName} DIFERENTE? TODO.

La mayoría ofrece soluciones temporales, materiales baratos y resultados mediocres. Son económicos por una razón: NO FUNCIONAN.

🎯 ${productName} ES DISTINTO:

✨ DISEÑO SUPERIOR:
Experiencia premium completa = Resultados 10X mejores

💎 CALIDAD GARANTIZADA:
Cada detalle diseñado para la mejor experiencia posible

🔬 RESULTADOS COMPROBADOS:
${totalSales} testimonios reales respaldan cada palabra

🛡️ SIN RIESGOS:
Garantía total de satisfacción o devolución 100%

🏆 VALIDACIÓN MASIVA:
Miles de clientes satisfechos confirman la calidad

La diferencia entre "otro producto más" y ${productName} es la diferencia entre frustración y éxito.

👉 No te conformes con menos. Elige ${productName}. Clic ahora.`,

  (productName: string, totalSales: string) => `${productName} vs El Resto: Sin comparación.

OTROS PRODUCTOS:
❌ Soluciones parciales
❌ Calidad cuestionable
❌ Resultados inconsistentes
❌ Sin soporte real

${productName}:
✅ Solución completa
✅ Calidad premium verificada
✅ Resultados consistentes
✅ Soporte total garantizado

💡 LA DIFERENCIA:
${totalSales} clientes eligieron calidad sobre precio barato.

🎯 TU ELECCIÓN:
Gastar poco en algo inútil o invertir en algo que funciona.

👉 Invierte inteligentemente. Ordena ${productName} ahora.`,

  (productName: string, totalSales: string) => `Por qué ${productName} vale cada centavo:

🔬 INNOVACIÓN REAL:
No es marketing, es tecnología superior aplicada

💎 MATERIALES PREMIUM:
La calidad que notas desde el primer momento

⚡ EFECTIVIDAD COMPROBADA:
${totalSales} casos de éxito documentados

🛡️ GARANTÍA ABSOLUTA:
Tu satisfacción o tu dinero de vuelta

🏆 RESPALDO MASIVO:
Miles de reseñas positivas reales

💡 VALOR REAL:
No es el más barato, es el que mejor funciona

La pregunta no es el precio, es el costo de NO tenerlo.

👉 Elige valor real. Ordena ${productName} ahora.`,

  (productName: string, totalSales: string) => `Lo que hace único a ${productName}:

1️⃣ DISEÑO INTELIGENTE:
Pensado para máxima efectividad

2️⃣ CALIDAD VERIFICABLE:
Cada componente seleccionado por rendimiento

3️⃣ RESULTADOS MEDIBLES:
${totalSales} transformaciones documentadas

4️⃣ SOPORTE COMPLETO:
No te dejamos solo después de la compra

5️⃣ GARANTÍA REAL:
Funciona o te devolvemos tu dinero

🎯 DIFERENCIACIÓN CLARA:
Otros prometen, ${productName} cumple.

👉 Experimenta la diferencia. Ordena hoy.`,

  (productName: string, totalSales: string) => `${productName}: Calidad que se nota.

🔍 COMPARACIÓN HONESTA:

Productos económicos:
• Funcionan... a veces
• Duran... poco tiempo
• Satisfacen... parcialmente

${productName}:
• Funciona... siempre
• Dura... a largo plazo
• Satisface... completamente

💎 INVERSIÓN vs GASTO:
${totalSales} personas entendieron la diferencia.

✨ TU DECISIÓN:
Gastar varias veces en cosas baratas o invertir una vez en calidad.

👉 Invierte en ${productName}. Tu yo futuro te lo agradecerá.`,

  (productName: string, totalSales: string) => `La ventaja ${productName}:

⚡ VELOCIDAD:
Resultados más rápidos que la competencia

💪 EFECTIVIDAD:
Tasa de éxito: ${totalSales} clientes satisfechos

🎯 PRECISIÓN:
Diseñado específicamente para resolver tu problema

🛡️ SEGURIDAD:
Garantía total de satisfacción

🏆 RECONOCIMIENTO:
Miles de reseñas positivas verificables

💡 VALOR:
Precio justo por calidad superior

No es el más barato. Es el mejor.

👉 Elige lo mejor. Ordena ${productName} ahora.`,

  (productName: string, totalSales: string) => `Por qué ${productName} es la inversión correcta:

💎 CALIDAD INNEGABLE:
Materiales y diseño premium

🔬 EFECTIVIDAD PROBADA:
Funciona, punto. ${totalSales} lo confirman

⚡ IMPLEMENTACIÓN SIMPLE:
Sin complicaciones innecesarias

🛡️ PROTECCIÓN TOTAL:
Garantía sin letra pequeña

🎯 RESULTADOS REALES:
No promesas vacías, logros tangibles

La diferencia entre intentar y lograr está en la herramienta que uses.

👉 Usa la herramienta correcta. Ordena ${productName}.`,

  (productName: string, totalSales: string) => `${productName}: El estándar de calidad.

✨ LO QUE LO HACE ESPECIAL:

Diseño: Premium y funcional
Materiales: Los mejores disponibles
Efectividad: Comprobada por ${totalSales}
Garantía: Total y sin complicaciones
Soporte: Completo y accesible

🎯 LA REALIDAD:
Puedes comprar barato 5 veces, o comprar calidad 1 vez.

💡 MATEMÁTICA SIMPLE:
Calidad > Cantidad

👉 Elige calidad desde el inicio. Ordena ${productName} ahora.`,

  (productName: string, totalSales: string) => `Lo que distingue a ${productName}:

🔬 INVESTIGACIÓN:
Desarrollo basado en ciencia, no en tendencias

💎 MATERIALES:
Premium seleccionados por performance

⚡ RESULTADOS:
${totalSales} casos de éxito comprobados

🛡️ CONFIANZA:
Garantía respaldada por acciones, no palabras

🏆 VALIDACIÓN:
Miles de clientes satisfechos

No es marketing, es realidad verificable.

👉 Verifica tú mismo. Ordena y experimenta la diferencia.`,

  (productName: string, totalSales: string) => `${productName}: Cuando la calidad importa.

💡 FILOSOFÍA:
Hacer las cosas bien, no solo hacerlas rápido

🎯 ENFOQUE:
Resultados reales sobre promesas vacías

💎 ESTÁNDAR:
Calidad que ${totalSales} personas confirman

🛡️ COMPROMISO:
Tu satisfacción es nuestra prioridad

La diferencia entre "lo intenté" y "lo logré" es usar lo correcto.

👉 Usa ${productName}. La herramienta correcta para resultados correctos.`
];

// FACEBOOK AD COPIES - CHALLENGE/QUESTION VARIATIONS (10)
const challengeQuestionVariations = [
  (productName: string, totalSales: string, salesYesterday: string | number) => `¿Y si resultados extraordinarios son posibles en tiempo récord? 💭

Sé lo que piensas: "Suena demasiado bueno..."

Y tendrías razón... con cualquier otro producto.

Pero estamos hablando de ${productName}.

🎯 EL DESAFÍO:
${totalSales} personas dijeron "sí" y TODAS lograron resultados extraordinarios.

¿La pregunta real? ¿Eres de los que actúan o de los que solo observan?

💡 PIÉNSALO:
• ¿Cuánto más vas a esperar?
• ¿Cuántas oportunidades más dejarás pasar?
• ¿Puedes darte el lujo de seguir sin esto?

⚡ LA VERDAD:
En 6 meses estarás celebrando que actuaste hoy o arrepintiéndote de no haberlo hecho.

🏆 ${salesYesterday} aceptaron el desafío AYER.
🏆 ${totalSales} ya viven los resultados.

La pregunta no es "¿funcionará?" - ya sabemos que sí.
La pregunta es: "¿Estás listo?"

👉 Acepta el desafío. Demuéstrate de qué eres capaz. Clic ahora.`,

  (productName: string, totalSales: string) => `¿Qué elegirías: seguir igual o transformar todo? 🤔

La mayoría elige lo conocido. Lo seguro. Lo cómodo.
Y por eso la mayoría sigue con los mismos problemas.

${productName} es para los que eligen diferente.

💪 EL DESAFÍO:
Salir de tu zona cómoda y probar algo que REALMENTE funciona

📊 LA EVIDENCIA:
${totalSales} personas aceptaron el desafío y no se arrepienten

🎯 LA PREGUNTA:
¿Vas a ser espectador o protagonista de tu propio cambio?

⚡ TU MOMENTO:
Decidir es el primer paso. El resto fluye.

👉 Decide cambiar. Ordena ${productName} y empieza ahora.`,

  (productName: string, totalSales: string) => `¿Cuánto vale tu tiempo y bienestar? 💭

Pregunta seria que requiere respuesta honesta.

${productName} es la respuesta de ${totalSales} personas que valoraron su bienestar.

🎯 LA PROPUESTA:
Invierte en tu bienestar hoy, disfruta los beneficios por siempre

💡 LA REALIDAD:
Tu problema no se resolverá solo. Necesitas actuar.

🔥 EL DESAFÍO:
Dar el paso que has estado postergando

⚡ LA PREGUNTA:
¿Sigues esperando o empiezas a actuar?

👉 Empieza ahora. Ordena ${productName} y toma control.`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `¿Qué te detiene de tener lo que quieres? 🤔

Pregunta honesta que merece reflexión.

${productName} eliminó las barreras de ${totalSales} personas.

💪 LAS EXCUSAS COMUNES:
"No tengo tiempo" - Esto te AHORRA tiempo
"Es caro" - Seguir sin solución es MÁS caro
"No estoy seguro" - Garantía total te protege
"Lo haré después" - ${salesYesterday} lo hicieron AYER

🎯 LA REALIDAD:
Las excusas te mantienen atascado. La acción te libera.

⚡ EL DESAFÍO:
Deja las excusas, toma acción.

👉 Actúa ahora. Ordena ${productName} y avanza.`,

  (productName: string, totalSales: string) => `¿Sigues esperando el momento perfecto? ⏰

Noticia: El momento perfecto no existe.

${productName} es para los que crean sus momentos.

💡 LA PREGUNTA REAL:
¿Cuántos "momentos perfectos" has dejado pasar?

🎯 LA VERDAD:
${totalSales} personas no esperaron. Actuaron. Y les funcionó.

🔥 TU ELECCIÓN:
Seguir esperando o empezar a actuar

⚡ HOY ES TU MOMENTO:
No porque sea perfecto, sino porque es AHORA.

👉 No esperes más. Ordena ${productName} hoy.`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `¿Qué pasaría si realmente funciona? 💭

Piénsalo en serio. ¿Qué cambiaría en tu vida?

${productName} funcionó para ${totalSales} personas. ¿Por qué no para ti?

🎯 EL DESAFÍO:
Atrévete a creer que el cambio es posible

💪 LA EVIDENCIA:
${salesYesterday} personas ayer se atrevieron

🔥 LA PREGUNTA:
¿Vas a dejar que el miedo al éxito te detenga?

⚡ TU OPORTUNIDAD:
Descubrir qué pasa cuando funciona

👉 Atrévete. Ordena ${productName} y descúbrelo tú mismo.`,

  (productName: string, totalSales: string) => `¿Estás listo para dejar de intentar y empezar a lograr? 💪

Diferencia clave: intentar vs lograr.

${productName} convierte intentos en logros.

🎯 LA PROPUESTA:
Dejar el ciclo de intentos fallidos y entrar al círculo de logros

💡 LA PREGUNTA:
¿Cuántos intentos más antes de usar lo que funciona?

🔥 LA REALIDAD:
${totalSales} dejaron de intentar y empezaron a lograr

⚡ TU DECISIÓN:
Seguir intentando sin resultados o lograr con ${productName}

👉 Empieza a lograr. Ordena ahora.`,

  (productName: string, totalSales: string) => `¿Y si la solución que buscas ya existe? 🔍

Plot twist: Ya existe. Es ${productName}.

🎯 LA PREGUNTA:
¿Vas a seguir buscando o vas a tomar lo que funciona?

💪 LA EVIDENCIA:
${totalSales} personas dejaron de buscar

💡 LA REALIDAD:
La búsqueda termina cuando encuentras lo correcto

🔥 TU MOMENTO:
Dejar de buscar y empezar a disfrutar

👉 Termina tu búsqueda. Ordena ${productName} ahora.`,

  (productName: string, totalSales: string, salesYesterday: string | number) => `¿Prefieres tener razón o tener resultados? 🤔

Puedes tener razón sobre tus dudas o tener resultados con ${productName}.

🎯 LA ELECCIÓN:
"Tenía razón, no funcionaría" vs "Tenía razón, funciona increíble"

💪 LA EVIDENCIA:
${salesYesterday} personas ayer eligieron resultados
${totalSales} en total confirman la elección correcta

💡 LA PREGUNTA:
¿Qué historia prefieres contar en 6 meses?

🔥 TU DECISIÓN:
Validar tus dudas o validar tu éxito

👉 Elige éxito. Ordena ${productName} y compruébalo.`,

  (productName: string, totalSales: string) => `¿Cuánto más vas a esperar para vivir mejor? ⏰

Pregunta directa que requiere respuesta honesta.

${productName} es la respuesta de ${totalSales} personas que decidieron no esperar más.

🎯 LA REALIDAD:
Cada día que esperas es un día perdido

💪 LA PROPUESTA:
Empezar a vivir mejor desde hoy

💡 LA PREGUNTA:
¿Vale la pena seguir esperando?

🔥 TU RESPUESTA:
Las acciones hablan más que las palabras

👉 Responde con acción. Ordena ${productName} ahora.`
];

export function generateUniqueSalesAngles(video: VideoData): SalesAngle[] {
  const videoId = video.id;
  const productName = video.product_name || video.title || 'este producto';
  const totalSales = formatNumber(video.total_sales);
  const salesYesterday = video.sales_yesterday || 'cientos';

  // Generate seed from video ID
  const seed = hashString(videoId);
  const rng = new SeededRandom(seed);

  // Create a pool of all angle variations with their types
  const allAngles: Array<{type: string, generator: (pn: string, ts: string, sy: string | number) => string}> = [
    ...exclusivityVariations.map(gen => ({type: 'Exclusividad/Escasez', generator: gen})),
    ...problemSolutionVariations.map(gen => ({type: 'Problema-Solución', generator: gen})),
    ...emotionalBenefitVariations.map(gen => ({type: 'Beneficio Emocional', generator: gen})),
    ...comparisonVariations.map(gen => ({type: 'Comparación', generator: gen})),
    ...transformationVariations.map(gen => ({type: 'Transformación', generator: gen}))
  ];

  // Shuffle all angles using the seeded random
  const shuffledAngles = rng.shuffle(allAngles);

  // Take first 5 angles (will be different for each video due to seeded shuffle)
  const selectedAngles = shuffledAngles.slice(0, 5);

  // Generate the angle descriptions
  return selectedAngles.map(angle => ({
    title: angle.type,
    description: angle.generator(productName, totalSales, salesYesterday)
  }));
}

export function generateUniqueFacebookAdCopies(video: VideoData): SalesAngle[] {
  const videoId = video.id;
  const productName = video.product_name || video.title || 'este producto';
  const totalSales = formatNumber(video.total_sales);
  const salesYesterday = video.sales_yesterday || 'cientos';

  // Generate seed from video ID (use different offset to ensure different selection than sales angles)
  const seed = hashString(videoId + '_fb_copies');
  const rng = new SeededRandom(seed);

  // Define the 5 copy types with their variations
  const copyTypes = [
    { type: 'Problema/Solución (Pain Point)', variations: painPointVariations },
    { type: 'Transformación (Antes y Después)', variations: transformationCopyVariations },
    { type: 'Escasez/Urgencia (FOMO)', variations: scarcityUrgencyVariations },
    { type: 'Propuesta de Valor Única', variations: uniqueValueVariations },
    { type: 'Desafío/Pregunta Impactante', variations: challengeQuestionVariations }
  ];

  // For each type, randomly select one variation
  return copyTypes.map(copyType => {
    const variationIndex = rng.nextInt(0, copyType.variations.length - 1);
    const selectedVariation = copyType.variations[variationIndex];

    return {
      title: copyType.type,
      description: selectedVariation(productName, totalSales, salesYesterday)
    };
  });
}
