// Tamaño de letra, contraste y espacio.
import { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text as Ink,
  useWindowDimensions,
  View,
} from 'react-native'
import { colors, helpText, methods, periods, voiceText } from '../estilos/tema'
import { useScreenStyles } from '../estilos/pantallas'
import { Text, useLook } from './texto'
import {
  addFiado,
  addProduct,
  addSale,
  backspaceMoney,
  cartTotal,
  catalogOf,
  cobrar,
  debtors,
  formatClock,
  formatMoney,
  formatPhone,
  formatQty,
  formatWhen,
  getPerson,
  getSale,
  login,
  logout,
  periodSummary,
  pushDigit,
  register,
  removeProduct,
  salesOf,
  sessionUser,
  setSetting,
  totalDebt,
  voidSale,
  DEMO_CODE,
  DEMO_PHONE,
  DEMO_PIN,
} from '../js/logica.mjs'
import { useApp } from '../js/estado'
import { usePhone } from '../js/telefono'
import { setSpeechRate, speakAloud, stopAloud } from '../js/voz'
import {
  Avatar,
  Button,
  ErrorText,
  Field,
  Keypad,
  Logo,
  MethodOption,
  ModalCard,
  MoneyBig,
  Note,
  Otp,
  Step,
  Sub,
  Title,
  TopBar,
} from './interfaz'

import { AmountBox, DetailRow, Frame, Tab, cartItems, productText } from './marco'
function SettingRow({ title, sub, value, onPress }) {
  const styles = useScreenStyles()
  const { dark, contrast } = useLook()
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityState={{ checked: value }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.toggleCard,
        value && {
          borderColor: colors.green,
          borderWidth: 3,
          backgroundColor: dark ? '#123524' : colors.greenSoft,
        },
        pressed && { opacity: 0.86 },
      ]}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleSub}>{sub}</Text>
      </View>
      <View pointerEvents="none">
        <Switch
          value={value}
          trackColor={{ true: dark ? '#8FE3B0' : colors.green, false: dark ? '#6A6A6A' : contrast ? '#111111' : '#8A877C' }}
          thumbColor={colors.white}
        />
      </View>
    </Pressable>
  )
}

export function Accessibility() {
  const styles = useScreenStyles()
  const { state, pop, patch } = useApp()
  const { textSize, spacing: lineSpace } = useLook()
  const gap = lineSpace > 1 ? 16 : 10
  const [askReset, setAskReset] = useState(false)
  const sizes = [
    { id: 'normal', label: 'Letra normal' },
    { id: 'grande', label: 'Letra grande' },
    { id: 'muy', label: 'Letra muy grande' },
  ]

  function choose(key, value) {
    patch((current) => setSetting(current, key, value))
  }

  function reset() {
    patch((current) => {
      let next = setSetting(current, 'textSize', 'normal')
      next = setSetting(next, 'contrast', false)
      next = setSetting(next, 'dark', false)
      next = setSetting(next, 'spacing', false)
      next = setSetting(next, 'slowVoice', false)
      return next
    })
    setAskReset(false)
  }

  return (
    <View style={{ flex: 1 }}>
      <Frame onBack={() => pop()} helpTopic="a11y">
        <Title>Accesibilidad</Title>
        <Sub>Ajusta la letra, el contraste y el fondo. El cambio se ve al momento. Escuchar explica cada pantalla.</Sub>
        <View style={[styles.readyBanner, { marginBottom: gap + 6 }]}>
          <Text style={styles.readyText}>Así se ve ahora</Text>
          <Text style={[styles.helpBody, { marginTop: 6 }]}>
            La letra, el espacio y el fondo cambian en esta pantalla y en los demás módulos.
          </Text>
        </View>
        <Text style={styles.label}>Tamaño de texto</Text>
        <View style={{ gap, marginBottom: 16 }}>
          {sizes.map((item) => {
            const selected = textSize === item.id
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => choose('textSize', item.id)}
                style={({ pressed }) => [
                  styles.choice,
                  selected && styles.choiceOn,
                  selected && { borderWidth: 3 },
                  pressed && { opacity: 0.86 },
                ]}
              >
                <Text style={styles.choiceText}>{selected ? '✓  ' : ''}{item.label}</Text>
              </Pressable>
            )
          })}
        </View>
        <SettingRow
          title="Contraste alto"
          sub="Fondo blanco, letras negras y bordes marcados."
          value={Boolean(state.settings.contrast)}
          onPress={() =>
            patch((current) => {
              const value = !current.settings.contrast
              let next = setSetting(current, 'contrast', value)
              if (value) next = setSetting(next, 'dark', false)
              return next
            })
          }
        />
        <SettingRow
          title="Fondo negro"
          sub="Cambia el fondo de blanco a negro."
          value={Boolean(state.settings.dark)}
          onPress={() =>
            patch((current) => {
              const value = !current.settings.dark
              let next = setSetting(current, 'dark', value)
              if (value) next = setSetting(next, 'contrast', false)
              return next
            })
          }
        />
        <Text style={[styles.empty, { marginTop: 8, marginBottom: 4 }]}>
          Puedes usar uno. Si activas el otro, el primero se apaga.
        </Text>
        <SettingRow
          title="Más espacio"
          sub="Separa las líneas para leer sin apuro."
          value={Boolean(state.settings.spacing)}
          onPress={() => choose('spacing', !state.settings.spacing)}
        />
        <SettingRow
          title="Hablar más despacio"
          sub="Escuchar lee más despacio en todas las pantallas."
          value={Boolean(state.settings.slowVoice)}
          onPress={() => choose('slowVoice', !state.settings.slowVoice)}
        />
        <View style={{ marginTop: 16 }}>
          <Button label="Restablecer" variant="outline" onPress={() => setAskReset(true)} />
        </View>
        <Text style={[styles.empty, { marginTop: 16 }]}>
          Las ventas, los fiados y estos ajustes se guardan en este celular. No se envían a internet.
        </Text>
        <View style={{ height: 36 }} />
      </Frame>
      {askReset ? (
        <ModalCard
          title="¿Volver a la letra normal?"
          body="Vuelve la letra normal y se apagan el contraste, el fondo negro, el espacio extra y la voz lenta."
        >
          <Button label="No" onPress={() => setAskReset(false)} />
          <Button label="Sí, restablecer" variant="outline" onPress={reset} />
        </ModalCard>
      ) : null}
    </View>
  )
}

const guideVoices = {
  letra: 'Letras más grandes. Hay tres tamaños: normal, grande y muy grande. Si pruebas uno, cambia en todas las pantallas.',
  claro: 'Ver con más claridad. El contraste pone letras negras y bordes marcados sobre fondo blanco. El fondo negro pone letras blancas. Se usa uno a la vez.',
  espacio: 'Más espacio para leer. Separa las líneas para que no se vean amontonadas.',
  voz: 'Una voz más lenta. Escuchar puede hablar más despacio para que entiendas con calma.',
  ayuda: 'Ayuda en tu perfil. El botón verde Escuchar está en cada pantalla y te explica qué hacer. Las tres rayas solo están en tu perfil: ahí abres Ayuda y Accesibilidad. Lo que cambies se ve en todos los módulos. Si sales de una venta con montos, te preguntamos antes para que no se pierda.',
}

function DemoBox({ children, background, border, color }) {
  return (
    <View
      style={{
        backgroundColor: background,
        borderColor: border,
        borderWidth: 3,
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
      }}
    >
      {typeof children === 'string' ? (
        <Ink style={{ color, fontSize: 22, fontWeight: '800', lineHeight: 30 }}>{children}</Ink>
      ) : children}
    </View>
  )
}

export function AccessibilityGuide() {
  const styles = useScreenStyles()
  const { state, pop, push, patch } = useApp()
  const { textSize, contrast, dark } = useLook()
  const roomy = Boolean(state.settings?.spacing)
  const slow = Boolean(state.settings?.slowVoice)
  const [openId, setOpenId] = useState(null)
  const [note, setNote] = useState('')
  const user = sessionUser(state)
  const first = (user?.name || '').trim().split(/\s+/)[0]
  const using = [
    textSize === 'muy' ? 'letra muy grande' : textSize === 'grande' ? 'letra grande' : 'letra normal',
    contrast ? 'contraste alto' : '',
    dark ? 'fondo negro' : '',
    roomy ? 'más espacio' : '',
    slow ? 'voz lenta' : '',
  ].filter(Boolean)

  useEffect(() => () => stopAloud(), [])

  function apply(key, value) {
    patch((current) => {
      let next = setSetting(current, key, value)
      if (key === 'contrast' && value) next = setSetting(next, 'dark', false)
      if (key === 'dark' && value) next = setSetting(next, 'contrast', false)
      return next
    })
    setNote('Listo. Ya cambió en esta pantalla y en las demás.')
  }

  function cycleSize() {
    const order = ['normal', 'grande', 'muy']
    const next = order[(order.indexOf(textSize) + 1) % order.length]
    apply('textSize', next)
  }

  function tryVoice(slow) {
    apply('slowVoice', slow)
    setSpeechRate(slow)
    stopAloud()
    speakAloud(
      slow
        ? 'Hola. Así hablo más despacio, para que me entiendas con calma.'
        : 'Hola. Así hablo a la velocidad de siempre.',
      { rate: slow ? 0.75 : 0.9 },
    )
  }

  const sizeLabel = textSize === 'grande'
    ? 'Probar letra muy grande'
    : textSize === 'muy'
      ? 'Volver a letra normal'
      : 'Probar letra grande'
  const spoken = openId
    ? `${guideVoices[openId]} Si quieres dejarlo así, toca Ajustar mi pantalla.`
    : voiceText.a11yGuide

  return (
    <View style={{ flex: 1 }}>
      <Frame onBack={() => pop()} helpTopic="a11yGuide" voice={spoken}>
        <Title>{first ? `Hola, ${first}` : 'Hola'}</Title>
        <Sub>La accesibilidad acomoda CajaFácil a ti. No cambia tus ventas ni tus fiados. Solo cambia cómo lees, cómo escuchas y cómo tocas.</Sub>
        <View style={[styles.readyBanner, { marginBottom: 16 }]}>
          <Text style={styles.readyText}>Ahora mismo</Text>
          <Text style={[styles.helpBody, { marginTop: 6 }]}>{using.join(', ')}.</Text>
          {note ? <Text style={[styles.helpBody, { marginTop: 8 }]}>{note}</Text> : null}
        </View>
        <Text style={styles.label}>Toca una tarjeta</Text>

        <GuideCard
          title="Letras más grandes"
          lead="Si se ven chicas, las agrandamos."
          open={openId === 'letra'}
          onPress={() => setOpenId(openId === 'letra' ? null : 'letra')}
        >
          <DemoBox background="#FFFFFF" border="#111111">
            <Ink style={{ color: '#111111', fontSize: 16, fontWeight: '800' }}>Normal. Buenos días.</Ink>
            <Ink style={{ color: '#111111', fontSize: 22, fontWeight: '800', marginTop: 8 }}>Grande. Buenos días.</Ink>
            <Ink style={{ color: '#111111', fontSize: 30, fontWeight: '800', marginTop: 8 }}>Muy grande. Buenos días.</Ink>
          </DemoBox>
          <Text style={styles.helpBody}>Hay tres tamaños. El que eliges se ve en Inicio, Venta, Balance, Fiados y Cuenta.</Text>
          <View style={{ marginTop: 12 }}>
            <Button label={sizeLabel} onPress={cycleSize} />
          </View>
        </GuideCard>

        <GuideCard
          title="Ver con más claridad"
          lead="Letras negras o fondo negro. Uno a la vez."
          open={openId === 'claro'}
          onPress={() => setOpenId(openId === 'claro' ? null : 'claro')}
        >
          <DemoBox background="#FFFFFF" border="#111111" color="#111111">Contraste: letras negras.</DemoBox>
          <DemoBox background="#000000" border="#FFFFFF" color="#FFFFFF">Fondo negro: letras blancas.</DemoBox>
          <Text style={styles.helpBody}>Si enciendes uno, el otro se apaga. Así no se mezclan.</Text>
          <View style={{ marginTop: 12, gap: 10 }}>
            <Button
              label={contrast ? 'Quitar contraste' : 'Probar contraste'}
              onPress={() => apply('contrast', !contrast)}
            />
            <Button
              label={dark ? 'Quitar fondo negro' : 'Probar fondo negro'}
              variant="outline"
              onPress={() => apply('dark', !dark)}
            />
          </View>
        </GuideCard>

        <GuideCard
          title="Más espacio para leer"
          lead="Las líneas no quedan pegadas."
          open={openId === 'espacio'}
          onPress={() => setOpenId(openId === 'espacio' ? null : 'espacio')}
        >
          <DemoBox background="#FFFFFF" border="#188145">
            <Ink style={{ color: '#111111', fontSize: 18, fontWeight: '800', lineHeight: 22 }}>Junto. La venta de hoy ya está en la caja.</Ink>
            <Ink style={{ color: '#111111', fontSize: 18, fontWeight: '800', lineHeight: 34, marginTop: 10 }}>Con espacio. La venta de hoy ya está en la caja.</Ink>
          </DemoBox>
          <Text style={styles.helpBody}>Sirve para leer sin apuro. El texto sigue diciendo lo mismo.</Text>
          <View style={{ marginTop: 12 }}>
            <Button
              label={roomy ? 'Juntar las líneas' : 'Separar las líneas'}
              onPress={() => apply('spacing', !roomy)}
            />
          </View>
        </GuideCard>

        <GuideCard
          title="Una voz más lenta"
          lead="Escuchar puede hablar con más calma."
          open={openId === 'voz'}
          onPress={() => setOpenId(openId === 'voz' ? null : 'voz')}
        >
          <Text style={styles.helpBody}>Toca el botón y escucha. La voz lenta se queda en todas las pantallas hasta que la quites.</Text>
          <View style={{ marginTop: 12 }}>
            <Button
              label={slow ? 'Volver a la voz de siempre' : 'Probar voz lenta'}
              onPress={() => tryVoice(!slow)}
            />
          </View>
        </GuideCard>

        <GuideCard
          title="Ayuda en cada pantalla"
          lead="Te explicamos antes de que te pierdas."
          open={openId === 'ayuda'}
          onPress={() => setOpenId(openId === 'ayuda' ? null : 'ayuda')}
        >
          <DemoBox background="#188145" border="#0F4D28" color="#FFFFFF">Escuchar, el botón verde.</DemoBox>
          <DemoBox background="#FFE7A3" border="#C6A04A" color="#4A3208">Ayuda, en las tres rayas de tu perfil.</DemoBox>
          <Text style={styles.helpBody}>Escuchar está en cada pantalla y dice para qué sirve. Ayuda y Accesibilidad están en las tres rayas de tu perfil. Lo que cambies ahí se ve en todos los módulos. Si sales de una venta que ya tiene montos, te preguntamos antes.</Text>
          <View style={{ marginTop: 12 }}>
            <Button
              label="Escuchar un ejemplo"
              variant="outline"
              onPress={() => {
                stopAloud()
                speakAloud(guideVoices.ayuda, { rate: slow ? 0.75 : 0.9 })
              }}
            />
          </View>
        </GuideCard>

        <View style={{ marginTop: 8 }}>
          <Button label="Ajustar mi pantalla" onPress={() => push('a11y')} />
        </View>
        <Text style={[styles.empty, { marginTop: 16 }]}>
          Elige solo lo que te ayude. Puedes volver a la normalidad cuando quieras.
        </Text>
        <View style={{ height: 36 }} />
      </Frame>
    </View>
  )
}

function GuideCard({ title, lead, open, onPress, children }) {
  const styles = useScreenStyles()
  return (
    <View style={{ marginBottom: 12 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={title}
        onPress={onPress}
        style={({ pressed }) => [
          styles.choice,
          open && styles.choiceOn,
          open && { borderWidth: 3 },
          { minHeight: 72, paddingVertical: 12 },
          pressed && { opacity: 0.86 },
        ]}
      >
        <Text style={styles.choiceText}>{open ? '✓  ' : ''}{title}</Text>
        <Text style={[styles.toggleSub, { marginTop: 4 }]}>{lead}</Text>
      </Pressable>
      {open ? <View style={{ marginTop: 10 }}>{children}</View> : null}
    </View>
  )
}
