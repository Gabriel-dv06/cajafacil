// Venta: calculadora del monto, pago y ventas del día.
import { useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native'
import { colors, helpText, methodSurface, methods, periods, quickAmounts, voiceText } from '../estilos/tema'
import { useScreenStyles } from '../estilos/pantallas'
import { Text, toneColor, useLook } from './texto'
import {
  addFiado,
  addProduct,
  addSale,
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
  payPhone,
  periodSummary,
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
import { canListen, startListening } from '../js/escucha'
import { appendDigit, appendDot, calcTotal, commitTyped, createSpeechLedger, sumCents, typedCents } from '../js/montos.mjs'
import { usePhone } from '../js/telefono'
import { speakAloud, stopAloud } from '../js/voz'
import {
  Avatar,
  Button,
  ErrorText,
  Field,
  NameField,
  Logo,
  MethodOption,
  Keypad,
  MicMark,
  ModalCard,
  MoneyBig,
  Note,
  PlinMark,
  YapeMark,
  YapePanel,
  Otp,
  Step,
  Sub,
  Title,
  TopBar,
  SALE_LEAVE_BODY,
  SALE_LEAVE_TITLE,
} from './interfaz'

import { DetailRow, Frame, Tab, cartItems, productText } from './marco'
export function SaleAmount() {
  const styles = useScreenStyles()
  const { dark, spacing } = useLook()
  const { draft, setDraft, pop, push, clearSale, goHome } = useApp()
  const { pad, short, narrow } = usePhone()
  const [ask, setAsk] = useState(null)
  const [typed, setTyped] = useState('')
  const [hearing, setHearing] = useState(false)
  const [said, setSaid] = useState('')
  const [hearNote, setHearNote] = useState('')
  const entry = typedCents(typed)
  const lines = draft.sale.lines || []
  const stopHear = useRef(null)
  const linesRef = useRef(lines)
  const typedRef = useRef('')
  const clearedAt = useRef(0)
  const saidRef = useRef('')
  const heardBase = useRef([])
  const ledger = useRef(null)
  const [speechView, setSpeechView] = useState(null)
  const hearingRef = useRef(false)
  linesRef.current = lines

  useEffect(() => {
    return () => {
      if (stopHear.current) stopHear.current()
      stopAloud()
    }
  }, [])

  function remember(nextLines) {
    const cents = sumCents(nextLines)
    linesRef.current = nextLines
    setDraft((current) => ({
      ...current,
      sale: { ...current.sale, lines: nextLines, cents, products: [] },
    }))
    return cents
  }

  function addAmounts(extra) {
    if (!extra.length) return sumCents(linesRef.current)
    return remember([...linesRef.current, ...extra])
  }

  function addTypedAmount() {
    const saved = commitTyped(linesRef.current, typedRef.current)
    if (!saved.added) return
    clearedAt.current = Date.now()
    typedRef.current = ''
    setTyped('')
    remember(saved.lines)
    setDraft((current) => ({
      ...current,
      sale: { ...current.sale, pendingCents: 0 },
    }))
  }

  function writeAmount(next) {
    typedRef.current = next
    setTyped(next)
    setDraft((current) => ({
      ...current,
      sale: { ...current.sale, pendingCents: typedCents(next) },
    }))
  }

  function typeDigit(digit) {
    if (hearingRef.current) finishHear()
    writeAmount(appendDigit(typedRef.current, digit))
  }

  function typeDot() {
    if (hearingRef.current) finishHear()
    writeAmount(appendDot(typedRef.current))
  }

  function typeBackspace() {
    if (hearingRef.current) finishHear()
    if (typedRef.current) {
      writeAmount(typedRef.current.slice(0, -1))
      return
    }
    if (linesRef.current.length) remember(linesRef.current.slice(0, -1))
  }

  function centsToTyped(cents) {
    const whole = Math.floor(cents / 100)
    const frac = cents % 100
    if (!frac) return String(whole)
    if (frac % 10 === 0) return `${whole}.${frac / 10}`
    return `${whole}.${String(frac).padStart(2, '0')}`
  }

  function finishHear() {
    if (!hearingRef.current) return
    hearingRef.current = false
    const stop = stopHear.current
    stopHear.current = null
    if (stop) stop()
    setHearing(false)
    const view = ledger.current ? ledger.current.view() : { base: heardBase.current, amounts: [] }
    saidRef.current = ''
    setSaid('')
    setSpeechView(null)
    typedRef.current = ''
    setTyped('')
    const nextLines = [...view.base, ...view.amounts]
    const sameBase = nextLines.length === heardBase.current.length
      && nextLines.every((cents, index) => cents === heardBase.current[index])
    if (!view.amounts.length && sameBase) {
      setDraft((current) => ({
        ...current,
        sale: { ...current.sale, pendingCents: 0 },
      }))
      return
    }
    linesRef.current = nextLines
    setDraft((current) => ({
      ...current,
      sale: { ...current.sale, lines: nextLines, cents: sumCents(nextLines), products: [], pendingCents: 0 },
    }))
  }

  function leave(where) {
    finishHear()
    if (sumCents(linesRef.current) > 0 || entry > 0 || Number(draft.sale.pendingCents) > 0) {
      setAsk(where)
      return
    }
    clearSale()
    if (where === 'home') goHome()
    else pop()
  }

  function goPay() {
    const wasHearing = hearingRef.current
    finishHear()
    if (!wasHearing) {
      const saved = commitTyped(linesRef.current, typedRef.current)
      if (saved.added) {
        typedRef.current = ''
        setTyped('')
        remember(saved.lines)
      }
    }
    const cents = sumCents(linesRef.current)
    writeAmount('')
    if (cents <= 0) return
    push('salePay')
  }

  function toggleHear() {
    if (hearingRef.current) {
      finishHear()
      return
    }
    if (!canListen()) {
      const message = 'Aquí no puedo escuchar. Usa la calculadora para escribir el monto.'
      setHearNote(message)
      speakAloud(message)
      return
    }
    if (typedCents(typedRef.current) > 0) addTypedAmount()
    heardBase.current = linesRef.current.slice()
    ledger.current = createSpeechLedger(heardBase.current)
    setSpeechView(ledger.current.view())
    saidRef.current = ''
    setSaid('')
    setHearNote('')
    hearingRef.current = true
    setHearing(true)
    stopAloud()
    stopHear.current = startListening({
      onLive: (text, generation) => {
        if (!hearingRef.current || !ledger.current) return
        saidRef.current = text
        setSaid(text)
        const step = ledger.current.push(text, generation)
        const view = ledger.current.view()
        setSpeechView(view)
        const next = view.amounts.length ? centsToTyped(view.amounts[view.amounts.length - 1]) : ''
        typedRef.current = next
        setTyped(next)
        if (step.restart) {
          setHearNote('Quité el último monto.')
          if (stopHear.current) stopHear.current.restart()
        }
      },
      onBreak: () => {
        if (!hearingRef.current || !ledger.current) return
        setSpeechView(ledger.current.breakSession())
      },
      onPhrase: () => {},
      onError: (code) => {
        finishHear()
        const message = code === 'not-allowed'
          ? 'Permite el micrófono para anotar con la voz.'
          : 'No pude escuchar. Toca Hablar otra vez.'
        setHearNote(message)
        speakAloud(message)
      },
      onEnd: () => finishHear(),
    })
  }

  const spokenNow = hearing && speechView ? speechView.amounts : []
  const total = hearing && speechView
    ? calcTotal(speechView.base, '') + sumCents(spokenNow)
    : sumCents(lines)
  const shown = hearing && speechView ? total : typed ? entry : 0
  const parts = hearing && speechView
    ? [...speechView.base, ...spokenNow]
    : [...lines, ...(entry > 0 ? [entry] : [])]

  return (
    <View style={styles.screen}>
      <TopBar onBack={() => leave('back')} onHome={() => leave('home')} helpTopic="sale" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: short ? 'flex-start' : 'center',
          paddingHorizontal: pad,
          paddingTop: spacing > 1 ? 14 : 4,
          paddingBottom: spacing > 1 ? 28 : 16,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Step>Paso 1 de 2</Step>
        <View style={[styles.cajaCard, { marginTop: 4, marginBottom: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Text style={[styles.cajaLabel, { marginBottom: 0 }]}>Total de la venta</Text>
            <Text style={[styles.cajaMoney, { textAlign: 'right' }]}>{formatMoney(total)}</Text>
          </View>
        </View>
        <Title>Haz Cuenta y Suma</Title>
        <View
          accessibilityLabel="Monto de la venta en soles"
          style={[styles.amountBox, { marginBottom: 12, minHeight: short ? 72 : 84, justifyContent: 'center', borderColor: hearing ? colors.red : colors.blue }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingHorizontal: 12 }}>
            <Text style={{ color: colors.text, fontSize: narrow ? 22 : 26, fontWeight: '800', marginRight: 8 }}>S/</Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
              style={{
                color: shown ? colors.text : colors.muted,
                fontSize: short ? 34 : narrow ? 36 : 44,
                fontWeight: '800',
                flexShrink: 1,
              }}
            >
              {formatMoney(shown).replace('S/', '')}
            </Text>
          </View>
        </View>
        <View style={[styles.chips, { marginTop: 0 }]}>
          {quickAmounts.filter((amount) => [500, 1000, 2000].includes(amount.cents)).map((amount) => (
            <Pressable
              key={amount.cents}
              accessibilityRole="button"
              accessibilityLabel={`Sumar ${amount.label}`}
              onPress={() => {
                if (hearingRef.current) finishHear()
                addAmounts([amount.cents])
              }}
              style={[styles.chip, { flexGrow: 1, flexBasis: 0, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }]}
            >
              <Text style={[styles.chipText, { color: '#000000', fontSize: narrow ? 16 : 18 }]}>{amount.label}</Text>
            </Pressable>
          ))}
        </View>
        {parts.length ? (
          <View style={{ marginTop: 2, marginBottom: 8, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Tu registro:</Text>
            {parts.map((cents, index) => {
              const pending = !hearing && entry > 0 && index === parts.length - 1
              return (
                <View key={`${cents}-${index}`} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {index > 0 ? <Text style={{ color: colors.green, fontWeight: '800' }}> + </Text> : null}
                  {pending ? (
                    <Text style={{ color: colors.green, fontWeight: '800', fontSize: 16 }}>{formatMoney(cents)}</Text>
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Quitar ${formatMoney(cents)}`}
                      onPress={() => {
                        if (hearing) return
                        remember(lines.filter((_, item) => item !== index))
                      }}
                    >
                      <Text style={{ color: colors.blue, fontWeight: '700', fontSize: 16 }}>{formatMoney(cents)}</Text>
                    </Pressable>
                  )}
                </View>
              )
            })}
          </View>
        ) : null}
        <View style={{ marginBottom: 10 }}>
          <Keypad
            onAdd={() => { if (hearingRef.current) finishHear(); else addTypedAmount() }}
            onEquals={() => { if (hearingRef.current) finishHear(); else if (typedCents(typedRef.current) > 0) addTypedAmount() }}
            addEnabled={entry > 0 || (hearing && spokenNow.length > 0)}
            onDigit={typeDigit}
            onDot={typeDot}
            onDelete={typeBackspace}
          />
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: pad, paddingTop: 6, paddingBottom: short ? 8 : 14, gap: 8 }}>
        {hearNote && !hearing ? <Text style={styles.hearNote}>{hearNote}</Text> : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hearing ? 'Dejar de escuchar' : 'Hablar el monto de la venta'}
            onPress={toggleHear}
            style={({ pressed }) => [
              styles.hearBtn,
              {
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: toneColor(hearing ? colors.red : colors.green, dark),
                marginBottom: 0,
                width: 112,
                minHeight: 58,
                paddingHorizontal: 8,
                gap: 4,
              },
              pressed && { opacity: 0.86 },
            ]}
          >
            <MicMark size={18} color={toneColor(hearing ? colors.red : colors.green, dark)} />
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={[styles.hearText, { color: toneColor(hearing ? colors.red : colors.green, dark), fontSize: 14 }]}>
              {hearing ? 'Alto' : 'Hablar'}
            </Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Button label="Siguiente" disabled={total <= 0} onPress={goPay} />
          </View>
        </View>
      </View>
      {ask ? (
        <ModalCard title={SALE_LEAVE_TITLE} body={SALE_LEAVE_BODY}>
          <Button label="Seguir en la venta" onPress={() => setAsk(null)} />
          <Button
            label={ask === 'home' ? 'Salir al inicio' : 'Salir de la venta'}
            variant="red"
            onPress={() => {
              clearSale()
              if (ask === 'home') goHome()
              else pop()
            }}
          />
        </ModalCard>
      ) : null}
    </View>
  )
}

export function SalePay() {
  const styles = useScreenStyles()
  const { dark } = useLook()
  const { state, draft, setDraft, pop, push, patch, clearSale } = useApp()
  const sale = draft.sale
  const method = sale.method ? methods[sale.method] : null
  const user = sessionUser(state)
  const people = state.sessionUserId ? debtors(state) : []
  const canSave = sale.cents > 0 && sale.method && (sale.method !== 'fiado' || sale.clientName.trim())

  function save() {
    const result = addSale(state, { ...sale, products: [] })
    if (!result.ok) return
    patch(() => result.state)
    clearSale()
    push('saleSaved', { saleId: result.saleId })
  }

  const variantByMethod = { efectivo: 'blue', yape: 'purple', plin: 'teal', fiado: 'brown' }
  const marks = { yape: <YapeMark size={28} />, plin: <PlinMark size={28} /> }
  const buttonVariant = variantByMethod[sale.method] || 'green'
  const buttonLabel = sale.method === 'fiado' ? 'Guardar como fiado' : 'Guardar venta'

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Frame
        onBack={() => pop()}
        dirty={sale.cents > 0}
        helpTopic="salePay"
        footer={<Button label={buttonLabel} variant={buttonVariant} disabled={!canSave} onPress={save} />}
      >
        <Step>Paso 2 de 2</Step>
        <View style={[styles.totalCard, styles.totalCompact, { backgroundColor: methodSurface(method, dark) }]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={[styles.totalMoney, { color: method ? method.color : colors.blue }]}>{formatMoney(sale.cents)}</Text>
        </View>
        <Text style={styles.label}>¿Cómo paga?</Text>
        <View style={{ gap: 10 }}>
          {Object.entries(methods)
            .filter(([id]) => (id !== 'yape' && id !== 'plin') || user?.[`${id}Enabled`])
            .map(([id, item]) => (
            <MethodOption
              key={id}
              method={item}
              selected={sale.method === id}
              leading={marks[id] || null}
              onPress={() => setDraft((current) => ({ ...current, sale: { ...current.sale, method: id } }))}
            />
          ))}
        </View>
        {sale.method === 'yape' || sale.method === 'plin' ? (
          <YapePanel
            brand={sale.method}
            cents={sale.cents}
            phone={payPhone(user, sale.method)}
            qr={user?.[`${sale.method}Qr`]}
            note={sale.note}
            onNote={(note) => setDraft((current) => ({ ...current, sale: { ...current.sale, note } }))}
          />
          
        ) : null}
        {sale.method === 'fiado' ? (
          <View style={{ marginTop: 14 }}>
            <NameField
              label="¿A quién se lo fías?"
              value={sale.clientName}
              placeholder="Luis"
              onChangeText={(clientName) =>
                setDraft((current) => ({ ...current, sale: { ...current.sale, clientName } }))
              }
            />
            {people.length ? (
              <View style={{ gap: 8 }}>
                {people.map((person) => {
                  const selected = sale.clientName.trim().toLowerCase() === person.name.toLowerCase()
                  return (
                    <Pressable
                      key={person.id}
                      onPress={() =>
                        setDraft((current) => ({
                          ...current,
                          sale: { ...current.sale, clientName: person.name },
                        }))
                      }
                      style={[styles.personRow, selected && { borderColor: colors.brown }]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.personName}>{person.name}</Text>
                        <Text style={styles.personMeta}>Te debe {formatMoney(person.debt)}</Text>
                      </View>
                      <Text style={[styles.personMoney, { color: colors.brown }]}>{formatMoney(person.debt)}</Text>
                    </Pressable>
                  )
                })}
              </View>
            ) : null}
          </View>
        ) : null}
      </Frame>
    </KeyboardAvoidingView>
  )
}

export function SaleSaved() {
  const styles = useScreenStyles()
  const { state, route, go, clearSale } = useApp()
  const sale = getSale(state, route.params?.saleId)
  return (
    <Frame
      onBack={() => go([{ name: 'home' }])}
      helpTopic="saleSaved"
      footer={
        <View style={{ gap: 10 }}>
          <Button
            label="Nueva venta"
            onPress={() => {
              clearSale()
              go([{ name: 'home' }, { name: 'saleAmount' }])
            }}
          />
          <Button label="Ir al inicio" variant="outline" onPress={() => go([{ name: 'home' }])} />
        </View>
      }
    >
      <View style={styles.saved}>
        <View style={styles.savedIcon}>
          <Text style={{ color: colors.green, fontSize: 28, fontWeight: '800' }}>✓</Text>
        </View>
        <Text style={styles.savedTitle}>Venta guardada</Text>
        <View style={styles.savedCard}>
          <MoneyBig cents={sale?.cents || 0} />
          <Text style={styles.savedMethod}>{sale ? methods[sale.method].label : ''}</Text>
        </View>
        <Text style={styles.savedSub}>Puedes seguir vendiendo o volver al inicio.</Text>
      </View>
    </Frame>
  )
}

export function Sales() {
  const styles = useScreenStyles()
  const { dark } = useLook()
  const { state, push, pop } = useApp()
  const [tab, setTab] = useState('guardadas')
  const rows = salesOf(state, { voided: tab === 'anuladas', all: true })
  const summary = periodSummary(state, 'hoy')
  const days = []
  for (const sale of rows) {
    const date = new Date(sale.at)
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    let day = days[days.length - 1]
    if (!day || day.key !== key) {
      day = {
        key,
        label: date.toLocaleDateString('es-PE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        sales: [],
      }
      days.push(day)
    }
    day.sales.push(sale)
  }
  return (
    <Frame onBack={() => pop()} helpTopic="sales">
      <Title>Todas las ventas</Title>
      <View style={styles.tabs}>
        <Tab label="Guardadas" active={tab === 'guardadas'} onPress={() => setTab('guardadas')} />
        <Tab label="Anuladas" tone="red" active={tab === 'anuladas'} onPress={() => setTab('anuladas')} />
      </View>
      {rows.length === 0 ? (
        <Text style={[styles.empty, tab === 'anuladas' && styles.voidEmpty]}>
          {tab === 'anuladas'
            ? 'No hay ventas anuladas. Cuando anulas una, aparece aquí y sale de la caja.'
            : 'Todavía no anotas ventas.'}
        </Text>
      ) : (
        <View>
          {days.map((day) => (
            <View key={day.key}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 14, marginBottom: 8 }}>
                <Text style={[styles.personName, { flex: 1 }]}>{day.label}</Text>
                <Text style={[styles.personMoney, { fontSize: 15, flexShrink: 0 }]}>
                  {formatMoney(day.sales.reduce((sum, sale) => sum + sale.cents, 0))}
                </Text>
              </View>
              <View style={{ gap: 10 }}>
                {day.sales.map((sale) => (
                  <Pressable
                    key={sale.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Venta de ${formatMoney(sale.cents)}`}
                    onPress={() => push('saleDetail', { saleId: sale.id })}
                    style={({ pressed }) => [styles.personRow, tab === 'anuladas' && styles.voidRow, pressed && { opacity: 0.8 }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.personMeta}>{formatClock(sale.at)}</Text>
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, alignItems: 'center' }}>
                        <View style={[styles.mini, { backgroundColor: methodSurface(methods[sale.method], dark) }]}>
                          <Text style={[styles.miniText, { color: methods[sale.method].color }]}>
                            {methods[sale.method].label}
                          </Text>
                        </View>
                        <Text style={styles.personMeta} numberOfLines={1}>
                          {sale.kind === 'cobro'
                            ? `Cobro de ${sale.clientName}`
                            : productText(sale.products) || sale.clientName}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.personMoney, tab === 'anuladas' && styles.voidMoney]}>{formatMoney(sale.cents)} ›</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
      {tab === 'guardadas' ? (
        <View style={styles.cajaCard}>
          <Text style={styles.cajaLabel}>Caja de hoy</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={styles.cajaMoney}>{formatMoney(summary.total)}</Text>
          <Text style={styles.cajaSub}>Solo las ventas guardadas de hoy. Es el mismo monto de Balance.</Text>
        </View>
      ) : null}
    </Frame>
  )
}

export function SaleDetail() {
  const styles = useScreenStyles()
  const { state, route, pop, patch } = useApp()
  const [ask, setAsk] = useState(false)
  const sale = getSale(state, route.params?.saleId)
  if (!sale) {
    return (
      <Frame onBack={() => pop()} helpTopic="sales">
        <Title>Detalle de la venta</Title>
        <Text style={styles.empty}>No encontramos esta venta.</Text>
      </Frame>
    )
  }
  return (
    <View style={{ flex: 1 }}>
      <Frame
        onBack={() => pop()}
        helpTopic="sales"
        footer={
          sale.voided ? null : (
            <Button label="Anular venta" variant="red" onPress={() => setAsk(true)} />
          )
        }
      >
        <Title>Detalle de la venta</Title>
        {sale.voided ? (
          <View style={styles.voidBanner}>
            <Text style={styles.voidText}>Esta venta está anulada</Text>
          </View>
        ) : null}
        <View style={[styles.detailCard, sale.voided && styles.voidRow]}>
          <MoneyBig cents={sale.cents} color={sale.voided ? StyleSheet.flatten(styles.voidMoney).color : colors.text} />
          <DetailRow label="Hora de la venta" value={formatWhen(sale.at)} />
          {sale.voided ? (
            <DetailRow
              label="Hora de la anulación"
              value={sale.voidAt != null ? formatWhen(sale.voidAt) : 'No disponible'}
            />
          ) : null}
          <DetailRow label="Cómo pagó" value={methods[sale.method].label} />
          {sale.kind === 'cobro' ? <DetailRow label="Tipo" value={`Cobro de ${sale.clientName}`} /> : null}
          {sale.clientName && sale.kind !== 'cobro' ? <DetailRow label="Fiado a" value={sale.clientName} /> : null}
          {cartItems(sale.products).length ? <DetailRow label="Carrito" value={productText(sale.products)} /> : null}
          {sale.note ? <DetailRow label="Operación" value={sale.note} /> : null}
        </View>
      </Frame>
      {ask ? (
        <ModalCard
          title="¿Anular esta venta?"
          body="Se quita de la caja de hoy. No se puede deshacer."
        >
          <Button label="No anular" onPress={() => setAsk(false)} />
          <Button
            label="Sí, anular"
            variant="red"
            onPress={() => {
              patch((current) => voidSale(current, sale.id))
              pop()
            }}
          />
        </ModalCard>
      ) : null}
    </View>
  )
}
