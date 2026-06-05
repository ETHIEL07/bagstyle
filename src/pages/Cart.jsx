import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Minus, Plus, Trash2, ArrowRight, ShoppingBag,
  MapPin, Truck, X, User, Mail, CheckCircle, Loader
} from 'lucide-react'
import { useCartStore, useAuthStore, selectTotal, selectCount } from '@/lib/store'
import { formatCFA } from '@/lib/mockData'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import styles from './Cart.module.css'

const WHATSAPP_NUMBER = '2250716165032'

function buildWALivraison(name, email) {
  return encodeURIComponent(
    `Bonjour BagStyle ! 👜\n\nJe viens de passer une commande sur le site.\n\n` +
    `Nom : ${name}\nEmail : ${email}\n\n` +
    `Je souhaite être livré(e). Est-ce que les articles de ma commande sont toujours disponibles ?\n\nMerci 🙏`
  )
}

function buildWARetrait(name, email) {
  return encodeURIComponent(
    `Bonjour BagStyle ! 👜\n\nJe viens de passer une commande sur le site.\n\n` +
    `Nom : ${name}\nEmail : ${email}\n\n` +
    `Je souhaite venir en boutique pour payer et récupérer mes articles. Sont-ils toujours disponibles ? Pouvez-vous m'envoyer votre localisation ? 📍\n\nMerci 🙏`
  )
}

function OrderModal({ onClose, items, total }) {
  const { user } = useAuthStore()
  const { clearCart } = useCartStore()

  const [step, setStep]       = useState('form')
  const [mode, setMode]       = useState('')
  const [loading, setLoading] = useState(false)
 const [form, setForm] = useState({
  name: user?.user_metadata?.full_name || '',
  email: user?.email || '',
  address: '',
  phone: user?.user_metadata?.whatsapp || '',
})

  const setField = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))
  useEffect(() => {
  const savedLoc = sessionStorage.getItem('bagstyle_loc')

  if (savedLoc) {
    const { lat, lng } = JSON.parse(savedLoc)

    setForm(prev => ({
      ...prev,
      address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    }))
  }
}, [])

  const handleCommander = async (e) => {
    e.preventDefault()
    if (!mode) { toast.error('Choisissez un mode de réception'); return }
    if (mode === 'livraison' && !form.address.trim()) {
      toast.error('Entrez votre adresse de livraison'); return
    }

    setLoading(true)
    try {
      const { error: orderErr } = await supabase
        .from('orders')
        .insert({
          customer_name:    form.name.trim(),
          customer_email:   form.email.trim(),
          customer_phone:   form.phone.trim() || null,
          delivery_mode:    mode,
          delivery_address: mode === 'livraison' ? form.address.trim() : null,
          total_amount:     total,
          status:           'pending',
          user_id:          user?.id || null,
          items_snapshot:   items.map(i => ({
            id:        i.id,
            name:      i.name,
            price:     i.price,
            quantity:  i.quantity,
            shop:      i.shop?.name || '',
            image_url: i.image_url || null,
          })),
        })

      if (orderErr) throw orderErr

      clearCart()

      const waUrl = mode === 'livraison'
        ? `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWALivraison(form.name, form.email)}`
        : `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWARetrait(form.name, form.email)}`

      window.open(waUrl, '_blank', 'noopener,noreferrer')
      setStep('success')
      toast.success('Commande enregistrée ! 🎉')
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Erreur lors de la commande')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.modalClose} onClick={onClose}><X size={20} /></button>

        {step === 'success' ? (
          <div className={styles.successBox}>
            <CheckCircle size={56} color="#22c55e" />
            <h2>Commande enregistrée !</h2>
            <p>
              WhatsApp s'est ouvert pour contacter BagStyle.<br />
              Vous recevrez une confirmation rapidement.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onClose}>
              Fermer
            </button>
          </div>
        ) : (
          <>
            <h2 className={styles.modalTitle}>Finaliser la commande</h2>
            <p className={styles.modalSub}>
              Remplissez vos informations — la commande sera enregistrée puis vous serez redirigé vers WhatsApp.
            </p>

            <div className={styles.miniRecap}>
              {items.map(i => (
                <div key={i.id} className={styles.miniItem}>
                  <span>{i.name} × {i.quantity}</span>
                  <span>{formatCFA((i.price || 0) * i.quantity)}</span>
                </div>
              ))}
              <div className={styles.miniTotal}>
                <strong>Total</strong>
                <strong>{formatCFA(total)}</strong>
              </div>
            </div>

            <form onSubmit={handleCommander} className={styles.orderForm}>

              <div className={styles.field}>
                <label><User size={13} /> Prénom & Nom *</label>
                <input
                  type="text"
                  placeholder="Marie Kouassi"
                  value={form.name}
                  onChange={setField('name')}
                  required
                />
              </div>

              <div className={styles.field}>
                <label><Mail size={13} /> Email *</label>
                <input
                  type="email"
                  placeholder="vous@exemple.com"
                  value={form.email}
                  onChange={setField('email')}
                  required
                />
              </div>

              <div className={styles.field}>
                <label>📱 Téléphone / WhatsApp <span className={styles.opt}>(facultatif)</span></label>
                <input
                  type="tel"
                  placeholder="+225 07 XX XX XX XX"
                  value={form.phone}
                  onChange={setField('phone')}
                />
              </div>

              <div className={styles.field}>
                <label>Mode de réception *</label>
                <div className={styles.modeRow}>
                  <button
                    type="button"
                    className={`${styles.modeBtn} ${mode === 'livraison' ? styles.modeActive : ''}`}
                    onClick={() => setMode('livraison')}
                  >
                    <Truck size={18} /> Livraison
                  </button>
                  <button
                    type="button"
                    className={`${styles.modeBtn} ${mode === 'retrait' ? styles.modeActive : ''}`}
                    onClick={() => setMode('retrait')}
                  >
                    <MapPin size={18} /> Venir en boutique
                  </button>
                </div>
              </div>

              {mode === 'livraison' && (
  <div className={styles.field}>
    <label>
      <MapPin size={13} />
      Adresse de livraison *
    </label>

    <button
      type="button"
      className={styles.locationBtn}
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords

            sessionStorage.setItem(
              'bagstyle_loc',
              JSON.stringify({
                lat: latitude,
                lng: longitude
              })
            )

            setForm(prev => ({
              ...prev,
              address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
            }))

            toast.success('Position récupérée ✅')
          },
          () => {
            toast.error('Impossible de récupérer votre position')
          }
        )
      }}
    >
      📍 Utiliser ma position actuelle
    </button>

    <input
      type="text"
      placeholder="Ou saisissez votre adresse (Cocody, Riviera 3, rue...)"
      value={form.address}
      onChange={setField('address')}
      required
    />

    <small className={styles.locationHint}>
      Vous pouvez utiliser votre position actuelle ou saisir une adresse manuellement.
    </small>
  </div>
)}

              {mode === 'retrait' && (
                <p className={styles.retraitNote}>
                  📍 Après confirmation, BagStyle vous enverra l'adresse de la boutique sur WhatsApp.
                </p>
              )}

              <button
                type="submit"
                className={`btn btn-primary ${styles.submitBtn}`}
                disabled={loading || !mode}
              >
                {loading
                  ? <><Loader size={16} className={styles.spin} /> Enregistrement...</>
                  : '✅ Commander & Contacter BagStyle'
                }
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function Cart() {
  const { items, removeItem, updateQuantity } = useCartStore()
  const total = useCartStore(selectTotal)
  const count = useCartStore(selectCount)
  const [showModal, setShowModal] = useState(false)

  if (items.length === 0) {
    return (
      <main className="page-layout">
        <div className={styles.empty}>
          <ShoppingBag size={60} color="#e8c0d0" />
          <h2>Votre panier est vide</h2>
          <p>Explorez nos sacs et trouvez votre coup de cœur !</p>
          <Link to="/search" className="btn btn-primary">
            Découvrir la boutique <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="page-layout">
      <div className="container" style={{ padding: '24px 20px' }}>
        <h1 className={styles.title}>
          Mon panier ({count} article{count > 1 ? 's' : ''})
        </h1>

        <div className={styles.layout}>
          <div className={styles.items}>
            {items.map(item => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImg} style={{ background: item.color || '#fbeaf0' }}>
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} />
                    : <span>{item.emoji || '👜'}</span>
                  }
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemShop}>{item.shop?.name}</div>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemPrice}>
                    <span className="price">{formatCFA((item.price || 0) * item.quantity)}</span>
                    {item.quantity > 1 && (
                      <span style={{ fontSize: 12, color: '#aaa' }}>
                        ({formatCFA(item.price || 0)} × {item.quantity})
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.itemActions}>
                  <div className={styles.qty}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeItem(item.id)} aria-label="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>Récapitulatif</h3>
            <div className={styles.summaryRow}>
              <span>{count} article{count > 1 ? 's' : ''}</span>
              <span>{formatCFA(total)}</span>
            </div>
            <div className={styles.divider} />
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Total</span>
              <span>{formatCFA(total)}</span>
            </div>
            <button
              className={`btn btn-primary ${styles.checkoutBtn}`}
              onClick={() => setShowModal(true)}
            >
              Commander
            </button>
            <Link to="/search" className={`btn ${styles.continueBtn}`}>
              Continuer les achats
            </Link>
          </div>
        </div>
      </div>

      {showModal && (
        <OrderModal
          onClose={() => setShowModal(false)}
          items={items}
          total={total}
        />
      )}
    </main>
  )
}