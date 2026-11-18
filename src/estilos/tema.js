// Colores, textos de ayuda y voz. Separados de las pantallas.
export const colors = {
  bg: '#F7F6F0',
  card: '#FFFFFF',
  text: '#1B1B1B',
  muted: '#6F6D66',
  line: '#E4E0D4',
  green: '#188145',
  greenInk: '#0F4D28',
  greenSoft: '#E3F6EA',
  brown: '#B15509',
  brownInk: '#8A4E08',
  amberSoft: '#FFF3D6',
  blue: '#1E4CD5',
  blueSoft: '#E7EEFF',
  purple: '#6D27DA',
  purpleSoft: '#F0E8FF',
  teal: '#00A884',
  tealSoft: '#E5F8F3',
  red: '#B41D20',
  redSoft: '#FDE8E6',
  navy: '#2C2E2D',
  warning: '#FFF4CC',
  warningInk: '#7A5A10',
  disabled: '#E4E0D6',
  disabledText: '#8E8B82',
  coin: '#E8B423',
  white: '#FFFFFF',
}

export const methods = {
  efectivo: {
    label: 'Efectivo',
    color: colors.blue,
    soft: colors.blueSoft,
    darkSoft: '#1A2744',
  },
  yape: {
    label: 'Yape',
    color: colors.purple,
    soft: colors.purpleSoft,
    darkSoft: '#2A1840',
  },
  plin: {
    label: 'Plin',
    color: colors.teal,
    soft: colors.tealSoft,
    darkSoft: '#12302C',
  },
  fiado: {
    label: 'Fiado',
    color: colors.brown,
    soft: colors.amberSoft,
    darkSoft: '#2C2418',
  },
}

export function methodSurface(method, dark) {
  if (!method) return dark ? '#1A2744' : colors.blueSoft
  return dark ? method.darkSoft : method.soft
}

export const periods = [
  { id: 'hoy', label: 'Hoy', title: 'Caja de hoy' },
  { id: 'semana', label: 'Semana', title: 'Caja de la semana' },
  { id: 'quincena', label: 'Quincena', title: 'Caja de la quincena' },
  { id: 'mes', label: 'Mes', title: 'Caja del mes' },
]

export const quickAmounts = [
  { label: 'S/1', cents: 100 },
  { label: 'S/5', cents: 500 },
  { label: 'S/10', cents: 1000 },
  { label: 'S/20', cents: 2000 },
  { label: 'S/50', cents: 5000 },
]

export const helpText = {
  splash:
    'Crea tu cuenta o toca Iniciar sesión si ya la tienes.',
  register:
    'Tu nombre y tu celular sirven para reconocerte cuando vuelvas a entrar.',
  code: 'El código tiene 6 números. En esta prueba puedes usar 123456.',
  pin: 'La clave tiene 6 números. La vas a escribir cada vez que entres.',
  avatar:
    'Elige una mujer o un hombre. El que tocas se mueve. Si apagas la imagen, se muestra la inicial de tu nombre.',
  login:
    'Iniciar sesión pide tu celular y tu clave. La cuenta de demostración es Flor: 999 888 777, clave 123456.',
  home:
    'Arriba está la caja de hoy. Ver todas las ventas abre el historial. Nueva venta anota un cobro con la calculadora. Abajo, los iconos llevan a Inicio, Balance, Fiados y Cuenta.',
  sale: 'Es el paso 1. El monto está arriba. Justo debajo están S/5, S/10, S/20 y el total de la venta. Más abajo está la calculadora. Escribe el monto, usa el punto y el signo más. El igual deja el total. La flecha roja borra. Toca Hablar y di los montos: se suman. Si dices borrar o restar, se quita el último monto. Después toca Siguiente.',
  salePay:
    'Es el paso 2. Elige efectivo, Yape, Plin o fiado. Yape y Plin aparecen solo si los activaste en tu cuenta. Si es fiado, escribe el nombre o toca Decir el nombre y habla. El número de operación se escribe o se dice con Decir. Al final toca Guardar venta.',
  saleSaved:
    'La venta ya quedó guardada. Puedes tocar Nueva venta o Ir al inicio.',
  sales:
    'Aquí están todas las ventas, por fecha, de la más reciente a la más antigua. Cada fecha muestra su suma. Abajo, la caja de hoy es la misma que en Balance. Guardadas está en verde y Anuladas en rojo.',
  balance:
    'Hoy, semana, quincena y mes suman las ventas guardadas de ese periodo. Ves efectivo, Yape, Plin y fiados. El recuadro de abajo es lo que todavía te deben.',
  account:
    'Ves tu nombre y tu celular. Las tres rayas abren Ayuda y Accesibilidad. Lo que cambies ahí se ve en todos los módulos. Toca Configurar para cambiar tu icono, tu contraseña o las billeteras de Yape y de Plin. Cerrar sesión está al final.',
  settings:
    'Puedes ir a Actualizar contraseña, a Yape o a Plin. También eliges tu icono. Si apagas la imagen, se ve la inicial de tu nombre. Al final toca Guardar cambios del perfil.',
  password:
    'Escribe la contraseña actual, la nueva y repítela. Cada una tiene 6 números. Al final toca Actualizar contraseña.',
  yape:
    'Activa Yape si quieres cobrar con Yape. El celular tiene 9 números y empieza con 9. Si subes el QR, tiene que ser una foto JPG o PNG del código. Otra imagen no se guarda. Es opcional. Al final toca Guardar.',
  plin:
    'Activa Plin si quieres cobrar con Plin. El celular tiene 9 números y empieza con 9. Si subes el QR, tiene que ser una foto JPG o PNG del código. Otra imagen no se guarda. Es opcional. Al final toca Guardar.',
  fiados:
    'Anota a quién le fiaste y cuánto. En el nombre, toca Decir el nombre y habla. El nombre queda en la caja. Debajo del monto están S/5, S/10, S/20 y el total. La calculadora está más abajo. Hablar está al lado de Anotar fiado. Si dices varios montos, se suman. Si dices borrar o restar, se quita el último monto. Cuando te paguen, abre a la persona y toca Cobrar.',
  person:
    'Arriba ves cuánto te debe. Anotar fiado suma deuda. Cobrar registra el pago y entra a la caja. Debajo del monto están S/5, S/10, S/20 y el total. En el cobro, Hablar está al lado de Siguiente. Si dices varios montos, se suman. Si dices borrar o restar, se quita el último monto.',
  a11yGuide:
    'Esta pantalla explica para qué sirve la accesibilidad. No cambia tus ventas ni tus fiados. Solo cambia cómo lees, cómo escuchas y cómo tocas. Toca una tarjeta para ver el ejemplo. Si una tarjeta está abierta, Escuchar habla de esa tarjeta. Al final, Ajustar mi pantalla abre los controles.',
  a11y:
    'Arriba, el recuadro Así se ve ahora cambia al momento. Puedes poner la letra normal, grande o muy grande, subir el contraste, poner el fondo negro, separar las líneas y hacer que Escuchar hable más despacio. Contraste y fondo negro se usan de uno en uno. El mismo cambio se ve en los demás módulos.',
}

export const voiceText = {
  splash:
    'Esta es la bienvenida de CajaFácil. Puedes crear tu cuenta, o tocar Iniciar sesión si ya tienes una.',
  register:
    'Este módulo crea tu cuenta. Escribe tu nombre y tu celular para que la app te reconozca cuando vuelvas.',
  code:
    'Esta pantalla pide un código de seis números. En esta prueba puedes usar uno, dos, tres, cuatro, cinco, seis.',
  pin:
    'Aquí eliges tu clave de seis números. Esa clave la escribes cada vez que entras a tu caja.',
  avatar:
    'Aquí eliges cómo quieres verte. Hay mujeres y hombres distintos. El que tocas se mueve. Si apagas la foto, se muestra la primera letra de tu nombre.',
  login:
    'Este módulo es Iniciar sesión. Escribe tu celular y tu clave. La cuenta de prueba es Flor. Su celular es nueve, nueve, nueve, ocho, ocho, ocho, siete, siete, siete. Su clave es uno, dos, tres, cuatro, cinco, seis.',
  home:
    'Este es el inicio de tu bodega. Arriba ves la caja de hoy. Ver todas las ventas abre el historial. Nueva venta anota un cobro con la calculadora. Abajo hay iconos: Inicio, Balance, Fiados y Cuenta.',
  sale:
    'Este módulo anota una venta. Es el paso uno. El monto está arriba. Justo debajo están cinco, diez y veinte soles, y el total de la venta. Más abajo está la calculadora. Escribes el monto, el punto si hay centavos, y tocas el signo más para sumar otro. El botón igual deja el total. La flecha roja borra el último número o el último monto sumado. Si tocas Hablar y dices varios montos, se suman. Por ejemplo, cinco soles más diez soles. Si dices borrar o restar, se quita el último monto. Después toca Siguiente.',
  salePay:
    'Este es el paso dos de la venta. El total está arriba. Elige si pagaron en efectivo, con Yape, con Plin o se lo llevaron fiado. Yape y Plin aparecen solo si los activaste en tu cuenta. Si es fiado, escribe el nombre o toca Decir el nombre y habla. El nombre queda en la caja. El número de operación se escribe o se dice con el botón Decir. Al final toca Guardar venta.',
  saleSaved:
    'La venta ya quedó guardada. Puedes tocar Nueva venta para anotar otra, o Ir al inicio.',
  sales:
    'Este módulo muestra todas las ventas, de la más reciente a la más antigua, agrupadas por fecha. Cada fecha muestra cuánto se vendió ese día. Abajo, la caja de hoy es el mismo monto que ves en Balance. Guardadas está en verde y Anuladas en rojo. Abre una venta para ver el detalle. Si te equivocaste, puedes anularla.',
  balance:
    'Este módulo junta el dinero de las ventas guardadas. Hoy es solo el día de hoy. Semana empieza el lunes. Quincena es del 1 al 15 o del 16 al fin de mes. Mes es el mes completo. Separa efectivo, Yape, Plin y fiados. El recuadro de abajo es lo que todavía te deben.',
  account:
    'Este módulo es tu perfil. Ves tu nombre y tu celular. Las tres rayas, al lado de Escuchar, abren Ayuda y Accesibilidad. Si cambias la letra, el fondo o la voz, el cambio queda en Inicio, Venta, Balance, Fiados y en las demás pantallas. Toca Configurar para cambiar tu icono, tu contraseña o las billeteras de Yape y de Plin. Cerrar sesión está al final y te saca de la caja. Las ventas se quedan en este celular.',
  settings:
    'Esta pantalla es Configurar. Puedes ir a Actualizar contraseña, a Yape o a Plin. También eliges tu icono. Si apagas la imagen, se muestra la inicial de tu nombre. Al final toca Guardar cambios del perfil.',
  password:
    'Esta pantalla cambia tu contraseña. Escribe la contraseña actual, la nueva y repítela. Cada una tiene seis números. Al final toca Actualizar contraseña.',
  yape:
    'Esta pantalla es Yape. Actívalo si quieres cobrar con Yape. Escribe el celular de nueve números, que empieza con nueve. Si subes el QR, solo se acepta una foto JPG o PNG que sea el código. Una foto cualquiera u otro archivo no se guarda. Es opcional. Al final toca Guardar. La app te pide confirmar antes de registrarlo.',
  plin:
    'Esta pantalla es Plin. Actívalo si quieres cobrar con Plin. Escribe el celular de nueve números, que empieza con nueve. Si subes el QR, solo se acepta una foto JPG o PNG que sea el código. Una foto cualquiera u otro archivo no se guarda. Es opcional. Al final toca Guardar. La app te pide confirmar antes de registrarlo.',
  fiados:
    'Este módulo es de fiados. Anota a quién le fiaste. En el nombre, toca Decir el nombre y habla. El nombre queda escrito en la caja. Debajo del monto están cinco, diez y veinte soles, y el total. Más abajo está la calculadora, igual que en la venta. Hablar está al lado de Anotar fiado. Si dices el monto, por ejemplo cinco soles, se anota. Si dices otro monto, se suma. Si dices borrar o restar, se quita el último monto. Cuando te paguen, abre a la persona y toca Cobrar.',
  person:
    'Esta pantalla es de una persona. Arriba ves cuánto te debe. Anotar fiado suma deuda. Cobrar registra el pago y el dinero entra a la caja. Debajo del monto están cinco, diez y veinte soles, y el total. En el cobro, Hablar está al lado de Siguiente. Si tocas Hablar y dices varios montos, se suman. Si dices borrar o restar, se quita el último monto.',
  a11yGuide:
    'Esta pantalla te explica la accesibilidad de CajaFácil. Sirve para que leas, escuches y toques con calma. No cambia tus ventas ni tus fiados. Toca una tarjeta y verás un ejemplo. Letras más grandes, contraste, fondo negro, más espacio y una voz más lenta. El botón verde Escuchar está en cada pantalla. Ayuda y Accesibilidad están en las tres rayas de tu perfil. Lo que ajustes aquí se ve en todos los módulos. Si sales de una venta con montos, la app te pregunta antes. Al final, Ajustar mi pantalla abre los controles.',
  a11y:
    'Este módulo ajusta la pantalla para leer con más calma. El recuadro Así se ve ahora cambia en el momento. Puedes poner la letra normal, grande o muy grande, subir el contraste, cambiar el fondo de blanco a negro y separar las líneas. Contraste y fondo negro se usan de uno en uno. También puedes hacer que Escuchar hable más despacio. El mismo ajuste se ve en los demás módulos.',
}
