'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function authHeaders() {
  const token = localStorage.getItem('sx_token')
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
}

const S = {
  wrap: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  logo: { fontSize: 10, letterSpacing: '0.4em', color: '#fff', textTransform: 'uppercase' },
  back: { fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' },
  main: { maxWidth: 1100, margin: '0 auto', padding: '28px 16px' },
  title: { fontSize: 20, fontWeight: 400, marginBottom: 4, color: '#C0C0C0' },
  sub: { fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 24 },
  filterBtn: (a) => ({ background: a ? 'rgba(192,192,192,0.08)' : 'transparent', border: `1px solid ${a ? 'rgba(192,192,192,0.3)' : 'rgba(255,255,255,0.1)'}`, color: a ? '#C0C0C0' : 'rgba(255,255,255,0.35)', padding: '7px 16px', fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }),
  row: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  detail: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderTop: '2px solid #C0C0C0', position: 'relative' },
  label: { fontSize: 7, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 8 },
  input: { width: '100%', background: '#000', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', fontFamily: "'Courier New',monospace", fontSize: 11, color: '#fff', outline: 'none', boxSizing: 'border-box' },
  err: { background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.2)', padding: '10px 14px', fontSize: 9, color: 'rgba(255,80,80,0.7)', marginBottom: 16 },
  success: { background: 'rgba(192,192,192,0.06)', border: '1px solid rgba(192,192,192,0.2)', padding: '10px 14px', fontSize: 9, color: '#C0C0C0', marginBottom: 16 },
}

const statusColor = { pending: 'rgba(255,200,0,0.7)', verified: '#C0C0C0', rejected: 'rgba(255,80,80,0.7)' }

export default function AdminKYCPage() {
  const router = useRouter()
  const [kycs, setKycs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [note, setNote] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [feeForm, setFeeForm] = useState({ amount: '', address: '', reason: '' })

  useEffect(() => { fetchKYCs() }, [])

  useEffect(() => {
    if (selected) {
      setFeeForm({
        amount: selected.users?.kyc_charge || '',
        address: selected.users?.kyc_charge_address || '',
        reason: selected.users?.kyc_charge_reason || '',
      })
    }
  }, [selected])

  async function fetchKYCs() {
    try {
      const res = await fetch('/api/admin/kyc', { headers: authHeaders() })
      if (res.ok) { const data = await res.json(); setKycs(data.kycs || []) }
    } catch {}
    setLoading(false)
  }

  async function handleAction(action) {
    setProcessing(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/admin/kyc', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ id: selected.id, action, admin_note: note }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setProcessing(false); return }
      setSuccess(`KYC ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
      setSelected(null); setNote(''); fetchKYCs()
    } catch { setError('Something went wrong') }
    setProcessing(false)
  }

  async function handleSetFee() {
    if (!selected) return
    setError(''); setSuccess('')
    try {
      const res = await fetch('/api/admin/kyc/fee', {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({
          user_id: selected.user_id,
          kyc_charge: Number(feeForm.amount) || 0,
          kyc_charge_address: feeForm.address || null,
          kyc_charge_reason: feeForm.reason || null,
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess('Verification fee updated')
      fetchKYCs()
    } catch { setError('Something went wrong') }
  }

  const filtered = kycs.filter(k => filter === 'all' ? true : k.status === filter)

  return (
    <div style={S.wrap}>
      <nav style={S.nav}>
        <div style={S.logo}>SpaceX Stocks · Admin</div>
        <button style={S.back} onClick={() => router.push('/admin')}>← Dashboard</button>
      </nav>

      <main style={S.main}>
        <div style={S.title}>KYC Verification</div>
        <div style={S.sub}>Identity verification review</div>

        {error && <div style={S.err}>{error}</div>}
        {success && <div style={S.success}>{success}</div>}

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {['all', 'pending', 'verified', 'rejected'].map(f => (
            <button key={f} style={S.filterBtn(filter === f)} onClick={() => setFilter(f)}>
              {f} {f === 'pending' && kycs.filter(k => k.status === 'pending').length > 0 && `(${kycs.filter(k => k.status === 'pending').length})`}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.5fr' : '1fr', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>No KYC submissions found</div>
            ) : filtered.map(kyc => (
              <div key={kyc.id} style={{ ...S.row, background: selected?.id === kyc.id ? 'rgba(192,192,192,0.06)' : 'transparent' }}
                onClick={() => { setSelected(kyc); setNote(''); setError(''); setSuccess('') }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(192,192,192,0.08)', border: '1px solid rgba(192,192,192,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#C0C0C0', flexShrink: 0 }}>
                  {kyc.users?.full_name?.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kyc.users?.full_name}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>{kyc.users?.email}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 7, letterSpacing: '0.2em', textTransform: 'uppercase', color: statusColor[kyc.status], border: `1px solid ${statusColor[kyc.status]}33`, padding: '2px 8px', marginBottom: 4 }}>{kyc.status}</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>{new Date(kyc.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div style={S.detail}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#fff' }}>{selected.users?.full_name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{selected.users?.email}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>

              {/* Verification fee control */}
              <div style={{ marginBottom: 18, padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={S.label}>Verification Fee (optional)</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="number"
                    placeholder="Amount ($)"
                    value={feeForm.amount}
                    style={{ ...S.input, width: 120 }}
                    onChange={e => setFeeForm(f => ({ ...f, amount: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Wallet address"
                    value={feeForm.address}
                    style={{ ...S.input, flex: 1 }}
                    onChange={e => setFeeForm(f => ({ ...f, address: e.target.value }))}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Reason (shown to user)"
                  value={feeForm.reason}
                  style={{ ...S.input, marginBottom: 8 }}
                  onChange={e => setFeeForm(f => ({ ...f, reason: e.target.value }))}
                />
                <button onClick={handleSetFee} style={{ padding: '8px 16px', background: 'rgba(192,192,192,0.08)', border: '1px solid rgba(192,192,192,0.25)', color: '#C0C0C0', fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Set Fee
                </button>
              </div>

              {selected.id_image_url && (
                <div style={{ marginBottom: 16 }}>
                  <div style={S.label}>ID Document</div>
                  <img src={selected.id_image_url} alt="ID" style={{ width: '100%', border: '1px solid rgba(192,192,192,0.15)', cursor: 'pointer' }} onClick={() => window.open(selected.id_image_url, '_blank')} />
                </div>
              )}
              {selected.selfie_url && (
                <div style={{ marginBottom: 16 }}>
                  <div style={S.label}>Selfie with ID</div>
                  <img src={selected.selfie_url} alt="Selfie" style={{ width: '100%', border: '1px solid rgba(192,192,192,0.15)', cursor: 'pointer' }} onClick={() => window.open(selected.selfie_url, '_blank')} />
                </div>
              )}
              {selected.charge_receipt_url && (
                <div style={{ marginBottom: 16 }}>
                  <div style={S.label}>Payment Receipt</div>
                  <img src={selected.charge_receipt_url} alt="Receipt" style={{ width: '100%', border: '1px solid rgba(192,192,192,0.15)', cursor: 'pointer' }} onClick={() => window.open(selected.charge_receipt_url, '_blank')} />
                </div>
              )}

              {selected.status === 'pending' && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={S.label}>Admin Note (optional)</div>
                    <input style={S.input} placeholder="Rejection reason..." value={note} onChange={e => setNote(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => handleAction('approve')} disabled={processing} style={{ flex: 1, background: 'rgba(192,192,192,0.08)', border: '1px solid rgba(192,192,192,0.25)', color: '#C0C0C0', padding: 13, fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {processing ? '...' : '✓ Approve'}
                    </button>
                    <button onClick={() => handleAction('reject')} disabled={processing} style={{ flex: 1, background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.2)', color: 'rgba(255,80,80,0.7)', padding: 13, fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {processing ? '...' : '✕ Reject'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}