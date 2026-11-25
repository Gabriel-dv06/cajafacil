// Cuenta: inicio de sesión, registro, perfil y ayuda.
import { useEffect, useRef, useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { prepareWalletQr } from '../js/qrWallet.mjs'
import { colors, helpText, methods, periods } from '../estilos/tema'
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
  updateAccount,
  updateWallet,
  updateWalletQr,
  totalDebt,
  voidSale,
  DEMO_CODE,
  DEMO_PHONE,
  DEMO_PIN,
} from '../js/logica.mjs'
import { useApp } from '../js/estado'
import { usePhone } from '../js/telefono'
import {
  Avatar,
  Button,
  ErrorText,
  Field,
  Logo,
  MethodOption,
  AvatarPicker,
  ModalCard,
  MoneyBig,
  Note,
  PlinMark,
  YapeMark,
  Otp,
  Step,
  Sub,
  Title,
  TopBar,
} from './interfaz'

import { AmountBox, DetailRow, Frame, Tab, cartItems, productText } from './marco'
export function Splash() {
  const styles = useScreenStyles()
  const { push } = useApp()
  return (
    <Frame
      mode="splash"
      helpTopic="splash"
      footer={
        <View style={{ gap: 10 }}>
          <Button label="Crear mi cuenta" onPress={() => push('register')} />
          <Button label="Iniciar sesión" variant="outline" onPress={() => push('login')} />
        </View>
      }
    >
      <View style={styles.hero}>
        <Logo size={96} />
        <Text style={styles.heroName}>CajaFácil</Text>
        <Text style={styles.heroText}>Anota las ventas de tu bodega.</Text>
      </View>
    </Frame>
  )
}

export function Register() {
  const { draft, setDraft, pop, push } = useApp()
  const [error, setError] = useState('')
  const phone = draft.phone.replace(/\D/g, '')
  const ready = draft.name.trim().length >= 2 && phone.length === 9 && phone.startsWith('9')

  function next() {
    if (!ready) {
      setError('Escribe tu nombre y un celular de 9 dígitos que empiece con 9.')
      return
    }
    setError('')
    push('code')
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Frame
        onBack={() => pop()}
        helpTopic="register"
        footer={<Button label="Continuar" disabled={!ready} onPress={next} />}
      >
        <Step>Paso 1 de 4</Step>
        <Title>Cuéntanos de ti</Title>
        <Sub>Con estos datos te reconocemos cuando vuelvas a entrar.</Sub>
        <ErrorText>{error}</ErrorText>
        <Field
          label="Tu nombre"
          value={draft.name}
          placeholder="Flor Quispe"
          autoCapitalize="words"
          onChangeText={(name) => setDraft((current) => ({ ...current, name }))}
        />
        <Field
          label="Teléfono"
          value={formatPhone(draft.phone)}
          placeholder="999 888 777"
          keyboardType="number-pad"
          onChangeText={(value) => {
            const digits = value.replace(/\D/g, '').slice(0, 9)
            if (digits && !digits.startsWith('9')) return
            setDraft((current) => ({ ...current, phone: digits }))
          }}
        />
      </Frame>
    </KeyboardAvoidingView>
  )
}

export function Code() {
  const { draft, setDraft, pop, push } = useApp()

  return (
    <Frame
      onBack={() => pop()}
      helpTopic="code"
      dismissKeyboardOnTouch
      footer={<Button label="Confirmar" disabled={draft.code.length < 6} onPress={() => push('pin')} />}
    >
      <View>
        <Step>Paso 2 de 4</Step>
        <Title>Escribe tu código</Title>
        <Sub>Te enviamos un código de 6 dígitos a tu celular.</Sub>
        <Otp
          value={draft.code}
          onChangeText={(code) => setDraft((current) => ({ ...current, code }))}
        />
        <Note>Si no te llega el mensaje, usa el código de demostración {DEMO_CODE}.</Note>
        <Button
          label="Usar código de demostración"
          variant="outline"
          disabled={draft.code.length >= 6}
          onPress={() => {
            setDraft((current) => ({ ...current, code: DEMO_CODE }))
            Keyboard.dismiss()
          }}
        />
      </View>
    </Frame>
  )
}

export function Pin() {
  const { draft, setDraft, pop, push } = useApp()

  return (
    <Frame
      onBack={() => pop()}
      helpTopic="pin"
      dismissKeyboardOnTouch
      footer={<Button label="Confirmar" disabled={draft.pin.length < 6} onPress={() => push('avatar')} />}
    >
      <View>
        <Step>Paso 3 de 4</Step>
        <Title>Crea tu clave</Title>
        <Sub>Crea tu contraseña de 6 dígitos.</Sub>
        <Otp
          value={draft.pin}
          secret
          onChangeText={(pin) => setDraft((current) => ({ ...current, pin }))}
        />
      </View>
    </Frame>
  )
}

export function AvatarPick() {
  const styles = useScreenStyles()
  const { state, draft, setDraft, pop, patch, go } = useApp()
  const [error, setError] = useState('')

  function start() {
    const result = register(state, {
      name: draft.name,
      phone: draft.phone,
      pin: draft.pin,
      avatar: draft.avatar,
      usePhoto: draft.usePhoto,
    })
    if (!result.ok) {
      setError(result.error)
      return
    }
    patch(() => result.state)
    setDraft((current) => ({
      ...current,
      name: '',
      phone: '',
      code: '',
      pin: '',
      avatar: 'woman',
      usePhoto: true,
    }))
    go([{ name: 'home' }])
  }

  return (
    <Frame
      onBack={() => pop()}
      helpTopic="avatar"
      footer={<Button label="Empezar" onPress={start} />}
    >
      <Step>Paso 4 de 4</Step>
      <Title>Elige tu imagen</Title>
      <ErrorText>{error}</ErrorText>
      <AvatarPicker
        value={draft.avatar}
        onChange={(avatar) => setDraft((current) => ({ ...current, avatar }))}
      />
      <View style={styles.toggleCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.toggleTitle}>Usar esta imagen</Text>
          <Text style={styles.toggleSub}>Se verá junto a tu saludo.</Text>
        </View>
        <Switch
          value={draft.usePhoto}
          onValueChange={(usePhoto) => setDraft((current) => ({ ...current, usePhoto }))}
          trackColor={{ true: colors.green, false: colors.line }}
          thumbColor={colors.white}
        />
      </View>
    </Frame>
  )
}

export function Login() {
  const styles = useScreenStyles()
  const { state, draft, setDraft, pop, patch, go } = useApp()
  const [error, setError] = useState('')

  function enter(phone, pin) {
    const result = login(state, { phone, pin })
    if (!result.ok) {
      setError(result.error)
      return
    }
    patch(() => result.state)
    setDraft((current) => ({ ...current, phone: '', pin: '' }))
    go([{ name: 'home' }])
  }

  const phone = draft.phone.replace(/\D/g, '')
  const ready = phone.length === 9 && draft.pin.length === 6

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Frame
        onBack={() => pop()}
        helpTopic="login"
        footer={
          <View style={{ gap: 10 }}>
            <Button label="Iniciar sesión" disabled={!ready} onPress={() => enter(draft.phone, draft.pin)} />
            <Button
              label="Usar cuenta de demostración"
              variant="outline"
              onPress={() => enter(DEMO_PHONE, DEMO_PIN)}
            />
          </View>
        }
      >
        <View style={styles.loginBrand}>
          <Logo size={42} />
          <Text style={styles.heroName}>CajaFácil</Text>
        </View>
        <Title>Iniciar sesión</Title>
        <Sub>Usa el celular y la clave de 6 números.</Sub>
        <ErrorText>{error}</ErrorText>
        <Field
          label="Celular"
          value={formatPhone(draft.phone)}
          placeholder="999 888 777"
          keyboardType="number-pad"
          onChangeText={(value) =>
            setDraft((current) => ({ ...current, phone: value.replace(/\D/g, '').slice(0, 9) }))
          }
        />
        <Field
          label="Clave"
          value={draft.pin}
          placeholder="123456"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          onChangeText={(value) =>
            setDraft((current) => ({ ...current, pin: value.replace(/\D/g, '').slice(0, 6) }))
          }
          hint="Cuenta de demostración: 999 888 777 · clave 123456"
        />
      </Frame>
    </KeyboardAvoidingView>
  )
}

export function Settings() {
  const styles = useScreenStyles()
  const { state, draft, setDraft, pop, patch, push, go, goHome, registerNavigationGuard } = useApp()
  const user = sessionUser(state)
  const [avatar, setAvatar] = useState(draft.settingsAppearance?.avatar || user?.avatar || 'woman')
  const [usePhoto, setUsePhoto] = useState(
    draft.settingsAppearance ? draft.settingsAppearance.usePhoto : user?.usePhoto !== false,
  )
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [leaveTo, setLeaveTo] = useState(null)
  const hasUnsavedChanges = avatar !== (user?.avatar || 'woman') || usePhoto !== (user?.usePhoto !== false)

  function navigateAway(destination) {
    setLeaveTo(null)
    if (!['yapeSettings', 'plinSettings'].includes(destination)) {
      setDraft((current) => ({ ...current, settingsAppearance: null }))
    }
    if (destination.startsWith('tab:')) {
      const tab = destination.slice(4)
      if (tab === 'home') {
        goHome()
        return
      }
      go([{ name: 'home' }, { name: tab }])
      return
    }
    if (destination === 'back') {
      pop()
      return
    }
    if (destination === 'home') {
      goHome()
      return
    }
    push(destination)
  }

  function requestLeave(destination) {
    if (hasUnsavedChanges) {
      setLeaveTo(destination)
      return
    }
    navigateAway(destination)
  }

  const tabLeaveRef = useRef(null)
  tabLeaveRef.current = (tab) => requestLeave(`tab:${tab}`)
  useEffect(() => {
    registerNavigationGuard((tab) => tabLeaveRef.current(tab))
    return () => registerNavigationGuard(null)
  }, [registerNavigationGuard])

  function saveAppearance() {
    const result = updateAccount(state, {
      avatar,
      usePhoto,
      yapePhone: user?.yapePhone || user?.phone || '',
      plinPhone: user?.plinPhone || user?.phone || '',
    })
    if (!result.ok) {
      setSaved(false)
      setError(result.error)
      return false
    }
    patch(() => result.state)
    setDraft((current) => ({ ...current, settingsAppearance: null }))
    setError('')
    setSaved(true)
    return true
  }

  function discardAndLeave() {
    const destination = leaveTo
    setAvatar(user?.avatar || 'woman')
    setUsePhoto(user?.usePhoto !== false)
    setDraft((current) => ({ ...current, settingsAppearance: null }))
    setError('')
    setSaved(false)
    navigateAway(destination)
  }

  function saveAndLeave() {
    if (saveAppearance()) navigateAway(leaveTo)
  }

  function changeAppearance(nextAvatar, nextUsePhoto) {
    setAvatar(nextAvatar)
    setUsePhoto(nextUsePhoto)
    setDraft((current) => ({
      ...current,
      settingsAppearance: { avatar: nextAvatar, usePhoto: nextUsePhoto },
    }))
    setSaved(false)
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Frame
        onBack={() => requestLeave('back')}
        onHome={() => requestLeave('home')}
        helpTopic="settings"
        footer={<Button label="Guardar cambios del perfil" onPress={saveAppearance} />}
      >
        <Title>Configurar</Title>
        <Sub>Administra tu contraseña y tus billeteras digitales.</Sub>
        <View style={{ gap: 10, marginBottom: 20 }}>
          <Button label="Actualizar contraseña" variant="outline" onPress={() => requestLeave('passwordSettings')} />
          <Button label="Yape" variant="outline" onPress={() => push('yapeSettings')} />
          <Button label="Plin" variant="outline" onPress={() => push('plinSettings')} />
        </View>
        <Text style={styles.toggleTitle}>Perfil</Text>
        <Sub>Personaliza el icono que aparece junto a tu saludo.</Sub>
        <ErrorText>{error}</ErrorText>
        {saved ? (
          <View style={styles.readyBanner}>
            <Text style={styles.readyText}>✓  Los cambios quedaron guardados.</Text>
          </View>
        ) : null}
        <Text style={styles.toggleTitle}></Text>
        <AvatarPicker
          value={avatar}
          limitToCurrentGroup
          onChange={(next) => changeAppearance(next, usePhoto)}
        />
        <View style={styles.toggleCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Usar esta imagen</Text>
            <Text style={styles.toggleSub}>Si la apagas, se ve la inicial de tu nombre.</Text>
          </View>
          <Switch
            value={usePhoto}
            onValueChange={(value) => changeAppearance(avatar, value)}
            trackColor={{ true: colors.green, false: colors.line }}
            thumbColor={colors.white}
          />
        </View>
        {leaveTo ? (
          <ModalCard
            title="Tienes cambios sin guardar"
            body="Si sales de Configurar, perderás los cambios que aún no guardaste. ¿Qué quieres hacer?"
          >
            <Button label="Seguir configurando" variant="outline" onPress={() => setLeaveTo(null)} />
            <Button label="Salir sin guardar" variant="red" onPress={discardAndLeave} />
            <Button label="Guardar y salir" onPress={saveAndLeave} />
          </ModalCard>
        ) : null}
      </Frame>
    </KeyboardAvoidingView>
  )
}

export function PasswordSettings() {
  const styles = useScreenStyles()
  const { state, pop, patch } = useApp()
  const user = sessionUser(state)
  const [currentPin, setCurrentPin] = useState('')
  const [nextPin, setNextPin] = useState('')
  const [repeatPin, setRepeatPin] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function pinDigits(value) {
    return value.replace(/\D/g, '').slice(0, 6)
  }

  function save() {
    if (!currentPin || !nextPin || !repeatPin) {
      setSaved(false)
      setError('Completa los tres campos para actualizar la contraseña.')
      return
    }
    const result = updateAccount(state, {
      avatar: user?.avatar,
      usePhoto: user?.usePhoto,
      yapePhone: user?.yapePhone || user?.phone || '',
      plinPhone: user?.plinPhone || user?.phone || '',
      currentPin,
      nextPin,
      repeatPin,
    })
    if (!result.ok) {
      setSaved(false)
      setError(result.error)
      return
    }
    patch(() => result.state)
    setCurrentPin('')
    setNextPin('')
    setRepeatPin('')
    setError('')
    setSaved(true)
  }

  return (
    <Frame
      onBack={() => pop()}
        helpTopic="password"
        footer={<Button label="Actualizar contraseña" onPress={save} />}
    >
      <Title>Actualizar contraseña</Title>
      <Sub>La contraseña debe tener 6 dígitos.</Sub>
      <ErrorText>{error}</ErrorText>
      {saved ? (
        <View style={styles.readyBanner}>
          <Text style={styles.readyText}>✓  La contraseña se actualizó.</Text>
        </View>
      ) : null}
      <Field
        label="Contraseña actual"
        value={currentPin}
        placeholder="6 dígitos"
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        onChangeText={(value) => { setCurrentPin(pinDigits(value)); setSaved(false) }}
      />
      <Field
        label="Contraseña nueva"
        value={nextPin}
        placeholder="6 dígitos"
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        onChangeText={(value) => { setNextPin(pinDigits(value)); setSaved(false) }}
      />
      <Field
        label="Repite la contraseña nueva"
        value={repeatPin}
        placeholder="6 dígitos"
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        onChangeText={(value) => { setRepeatPin(pinDigits(value)); setSaved(false) }}
      />
    </Frame>
  )
}

export function WalletSettings({ brand }) {
  const styles = useScreenStyles()
  const { state, pop, patch } = useApp()
  const user = sessionUser(state)
  const name = brand === 'plin' ? 'Plin' : 'Yape'
  const phoneKey = `${brand}Phone`
  const enabledKey = `${brand}Enabled`
  const qrKey = `${brand}Qr`
  const [enabled, setEnabled] = useState(user?.[enabledKey] === true)
  const [phone, setPhone] = useState(user?.[phoneKey] || '')
  const [qr, setQr] = useState(user?.[qrKey] || '')
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState('')
  const [checking, setChecking] = useState(false)

  async function pickQr() {
    setError('')
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) {
        setError('Permite el acceso a tus fotos para seleccionar el QR.')
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        base64: true,
        quality: 0.85,
      })
      if (result.canceled) return
      const asset = result.assets[0]
      if (!asset.base64) {
        setError('No se pudo leer el archivo. Elige una foto JPG o PNG del QR.')
        return
      }
      setChecking(true)
      const check = await prepareWalletQr({ asset, brand })
      if (!check.ok) {
        setError(check.error)
        return
      }
      const saved = updateWalletQr(state, brand, check.qr)
      if (!saved.ok) {
        setError(saved.error)
        return
      }
      patch(() => saved.state)
      setQr(check.qr)
      setDialog('qr-success')
    } catch (pickerError) {
      setError(pickerError instanceof Error
        ? pickerError.message
        : 'No se pudo revisar la imagen. Intenta otra vez.')
    } finally {
      setChecking(false)
    }
  }

  function save() {
    if (enabled) {
      const digits = phone.replace(/\D/g, '')
      if (digits.length !== 9 || !digits.startsWith('9')) {
        setError(`El celular de ${name} debe tener 9 dígitos y empezar con 9.`)
        return
      }
      setDialog('confirm')
      return
    }
    commit()
  }

  function commit() {
    const result = updateWallet(state, brand, { enabled, phone, qr })
    if (!result.ok) {
      setDialog('')
      setError(result.error)
      return
    }
    patch(() => result.state)
    setError('')
    setDialog('success')
  }

  return (
    <Frame
      onBack={() => pop()}
      helpTopic={brand === 'plin' ? 'plin' : 'yape'}
      footer={<Button label="Guardar" onPress={save} />}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        {brand === 'plin' ? <PlinMark size={34} /> : <YapeMark size={34} />}
        <Title>{name}</Title>
      </View>
      <Sub>Activa {name} para ofrecer esta opción al registrar pagos.</Sub>
      <View style={styles.toggleCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.toggleTitle}>Activar {name}</Text>
          <Text style={styles.toggleSub}>{enabled ? 'Billetera activada' : 'Desactivada'}</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={(value) => { setEnabled(value); setError('') }}
          trackColor={{ true: colors.green, false: colors.line }}
          thumbColor={colors.white}
        />
      </View>
      {enabled ? (
        <>
          <Field
            label={`Celular de ${name}`}
            value={formatPhone(phone)}
            placeholder="999 888 777"
            keyboardType="number-pad"
            onChangeText={(value) => { setPhone(value.replace(/\D/g, '').slice(0, 9)); setError('') }}
          />
          <Text style={styles.toggleTitle}>Sube tu QR</Text>
          <Sub>La foto debe mostrar el QR y la palabra {name}. Se guardará automáticamente solo el recorte del QR.</Sub>
          <Button label={checking ? 'Revisando el QR...' : qr ? 'Cambiar QR' : 'Subir QR'} variant="outline" disabled={checking} onPress={pickQr} />
          {qr ? (
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <Image
                source={{ uri: qr }}
                resizeMode="contain"
                style={{ width: '100%', maxWidth: 220, aspectRatio: 1, backgroundColor: colors.white }}
                accessibilityLabel={`QR de ${name}`}
              />
              <Button label="Quitar QR" variant="outline" onPress={() => setQr('')} />
            </View>
          ) : null}
        </>
      ) : null}
      <ErrorText>{error}</ErrorText>
      {dialog === 'confirm' ? (
        <ModalCard
          title={`¿Estás seguro de registrar ${formatPhone(phone)} en ${name}?`}
          body={qr ? `También se registrará el QR de ${name}.` : `El número se registrará sin un QR de ${name}.`}
        >
          <Button label="Cancelar" variant="outline" onPress={() => setDialog('')} />
          <Button label="Sí, registrar" onPress={commit} />
        </ModalCard>
      ) : null}
      {dialog === 'qr-success' ? (
        <ModalCard title="QR actualizado" body={`Se actualizó exitosamente el QR de ${name}.`}>
          <Button label="Entendido" onPress={() => setDialog('')} />
        </ModalCard>
      ) : null}
      {dialog === 'success' ? (
        <ModalCard
          title="Registro exitoso"
          body={enabled
            ? `Se registró el número ${formatPhone(phone)}${qr ? ` y el QR de ${name}.` : '.'}`
            : `${name} quedó desactivado.`}
        >
          <Button label="Entendido" onPress={() => { setDialog(''); pop() }} />
        </ModalCard>
      ) : null}
    </Frame>
  )
}

export function Account() {
  const styles = useScreenStyles()
  const { state, pop, push, patch, go, setDraft } = useApp()
  const [askOut, setAskOut] = useState(false)
  const user = sessionUser(state)

  function signOut() {
    patch((current) => logout(current))
    setDraft((current) => ({
      ...current,
      phone: '',
      pin: '',
      code: '',
      settingsAppearance: null,
      sale: { cents: 0, method: null, products: [], lines: [], note: '', clientName: '' },
    }))
    go([{ name: 'splash' }])
  }

  return (
    <Frame
      onBack={() => pop()}
      helpTopic="account"
      footer={<Button label="Cerrar sesión" variant="red" onPress={() => setAskOut(true)} />}
    >
      <Title>Mi cuenta</Title>
      <View style={styles.personRow}>
        <Avatar kind={user?.avatar} name={user?.name} usePhoto={user?.usePhoto} size={52} />
        <View>
          <Text style={styles.personName}>{user?.name}</Text>
          <Text style={styles.personMeta}>{formatPhone(user?.phone)}</Text>
        </View>
      </View>
      <View style={styles.readyBanner}>
        <Text style={styles.readyText}>✓  Tu cuenta está activa.</Text>
      </View>
      <Button label="Configurar" onPress={() => push('settings')} />
      <View style={{ height: 14 }} />
      {askOut ? (
        <ModalCard
          title="¿Cerrar sesión?"
          body="Vas a salir de tu caja. Las ventas se quedan guardadas en este celular."
        >
          <Button label="Seguir aquí" onPress={() => setAskOut(false)} />
          <Button label="Sí, cerrar sesión" variant="red" onPress={signOut} />
        </ModalCard>
      ) : null}
    </Frame>
  )
}

export function Help() {
  const styles = useScreenStyles()
  const { route, pop } = useApp()
  const topic = route.params?.topic || 'home'
  const body = helpText[topic] || helpText.home
  return (
    <Frame
      onBack={() => pop()}
      voice={`Cómo te ayudo. ${body} Cuando termines de leer, toca Entendido para volver a la pantalla.`}
      footer={<Button label="Entendido" variant="navy" onPress={() => pop()} />}
    >
      <Title>¿Cómo te ayudo?</Title>
      <View style={styles.helpCard}>
        <Text style={styles.helpLabel}>Ayuda</Text>
        <Text style={styles.helpBody}>{body}</Text>
      </View>
      <Text style={styles.empty}>Cuando termines de leer, toca Entendido para volver a la pantalla.</Text>
    </Frame>
  )
}
