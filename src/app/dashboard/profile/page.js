'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const S = {
  title: { fontSize: 'clamp(20px,3vw,28px)', fontWeight: 400, marginBottom: 6 },
  sub: { fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 28 },
  tabs: { display: 'flex', gap: 2, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)' },
  tab: (a) => ({ padding: '10px 18px', background: 'none', border: 'none', borderBottom: a ? '1px solid #C0C0C0' : '1px solid transparent', color: a ? '#C0C0C0' : 'rgba(255,255,255,0.3)', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer' }),
  section: { marginBottom: 28 },
  sHead: { fontSize: 7, letterSpacing: '0.42em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  rowLabel: { fontSize: 9, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)' },
  rowVal: { fontSize: 12, letterSpacing: '0.06em' },
  badge: (c) => ({ fontSize: 8, letterSpacing: '0.25em', padding: '4px 12px', textTransform: 'uppercase', background: `${c}12`, color: c, border: `1px solid ${c}33` }),
  btnDanger: { background: 'transparent', color: 'rgba(255,80,80,0.5)', border: '1px solid rgba(255,80,80,0.15)', padding: '10px 22px', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.28em', cursor: 'pointer', textTransform: 'uppercase', marginTop: 8 },
  err: { background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.2)', padding: '10px 14px', fontSize: 9, color: 'rgba(255,80,80,0.7)', marginBottom: 16 },
  success: { background: 'rgba(192,192,192,0.06)', border: '1px solid rgba(192,192,192,0.2)', padding: '10px 14px', fontSize: 9, color: '#C0C0C0', marginBottom: 16 },
  upload: { width: '100%', border: '1px dashed rgba(192,192,192,0.2)', padding: 28, textAlign: 'center', cursor: 'pointer', position: 'relative', background: 'rgba(255,255,255,0.02)' },
  uploadInput: { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' },
}

const kycStatusColor = { unverified: 'rgba(255,255,255,0.3)', pending: 'rgba(255,200,0,0.7)', verified: '#C0C0C0', rejected: 'rgba(255,80,80,0.7)' }

function authHeaders() {
  const token = localStorage.getItem('sx_token')
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
  })
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('profile')
  const [kycData, setKycData] = useState(null)
  const [kycFiles, setKycFiles] = useState({ id_image: null, selfie: null, receipt: null })
  const [uploadingKyc, setUploadingKyc] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    fetch('/api/auth', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.error) router.push('/login'); else setUser(d) })
    fetchKYC()
  }, [])

  async function fetchKYC() {
    try {
      const res = await fetch('/api/kyc', { headers: authHeaders() })
      if (res.ok) setKycData(await res.json())
    } catch {}
  }

  async function handleKYCSubmit() {
    setError(''); setSuccess('')
    if (!kycFiles.id_image || !kycFiles.selfie) return setError('Please upload both ID and selfie')
    const charge = kycData?.kyc_charge || 0
    if (charge > 0 && !kycFiles.receipt) return setError('Please upload payment receipt')
    setUploadingKyc(true)
    try {
      const id_image_url = await fileToBase64(kycFiles.id_image)
      const selfie_url = await fileToBase64(kycFiles.selfie)
      const charge_receipt_url = kycFiles.receipt ? await fileToBase64(kycFiles.receipt) : null
      const res = await fetch('/api/kyc', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ id_image_url, selfie_url, charge_receipt_url }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setUploadingKyc(false); return }
      setSuccess('KYC submitted successfully. Under review.')
      setUser(u => ({ ...u, kyc_status: 'pending' }))
      fetchKYC()
    } catch { setError('Something went wrong. Please try again.') }
    setUploadingKyc(false)
  }

  const signOut = () => { localStorage.removeItem('sx_token'); router.push('/login') }

  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.2)' }}>LOADING...</div>
    </div>
  )

  const withdrawalBalance = Number(user?.withdrawal_balance || 0)
  const kycRequired = withdrawalBalance >= 5000
  const kycStatus = kycData?.kyc_status || user.kyc_status || 'unverified'
  const kycCharge = kycData?.kyc_charge || 0

  return (
    <div>
      <div style={S.title}>My Profile</div>
      <div style={S.sub}>Account · Membership · Settings</div>

      <div style={S.tabs}>
        <button style={S.tab(tab === 'profile')} onClick={() => setTab('profile')}>Profile</button>
        {kycRequired && <button style={S.tab(tab === 'kyc')} onClick={() => setTab('kyc')}>KYC Verification</button>}
      </div>

      {tab === 'profile' && (
        <>
          <div style={S.section}>
            <div style={S.sHead}>Account Details</div>
            <div style={S.row}><div style={S.rowLabel}>Full Name</div><div style={S.rowVal}>{user.full_name}</div></div>
            <div style={S.row}><div style={S.rowLabel}>Email</div><div style={S.rowVal}>{user.email}</div></div>
            <div style={S.row}><div style={S.rowLabel}>Member Since</div><div style={S.rowVal}>{new Date(user.created_at || user.member_since || Date.now()).toLocaleDateString()}</div></div>
            <div style={S.row}><div style={S.rowLabel}>Member Number</div><div style={S.rowVal}>#{user.member_number || '000001'}</div></div>
            <div style={S.row}>
              <div style={S.rowLabel}>KYC Status</div>
              <div><span style={S.badge(kycStatusColor[kycStatus])}>{kycStatus}</span></div>
            </div>
          </div>

          <div style={S.section}>
            <div style={S.sHead}>Balances</div>
            <div style={S.row}><div style={S.rowLabel}>Available Balance</div><div style={S.rowVal}>${(user.balance || 0).toLocaleString()}</div></div>
            <div style={S.row}><div style={S.rowLabel}>Withdrawal Balance</div><div style={S.rowVal}>${(user.withdrawal_balance || 0).toLocaleString()}</div></div>
            <div style={S.row}><div style={S.rowLabel}>Total Deposited</div><div style={S.rowVal}>${(user.total_deposited || 0).toLocaleString()}</div></div>
            <div style={S.row}><div style={S.rowLabel}>Total Profit Earned</div><div style={S.rowVal}>${(user.total_profit || 0).toLocaleString()}</div></div>
          </div>

          <div style={S.section}>
            <div style={S.sHead}>Support</div>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', lineHeight: 2 }}>
              For any questions, account issues, or perk activation, contact us at:<br />
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>invest@spacestocks.finance</span>
            </div>
          </div>

          <button style={S.btnDanger} onClick={signOut}>Sign Out</button>
        </>
      )}

      {tab === 'kyc' && kycRequired && (
        <div>
          {error && <div style={S.err}>{error}</div>}
          {success && <div style={S.success}>{success}</div>}

          {kycStatus === 'verified' ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 40, color: '#C0C0C0', marginBottom: 16 }}>✓</div>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 16, color: '#fff', marginBottom: 8 }}>Identity Verified</div>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>You can now make withdrawals above $5,000.</div>
            </div>
          ) : kycStatus === 'pending' ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 40, color: 'rgba(255,200,0,0.7)', marginBottom: 16 }}>⏳</div>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 16, color: '#fff', marginBottom: 8 }}>Under Review</div>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>Your documents are being reviewed. This usually takes 24–48 hours.</div>
            </div>
          ) : (
            <>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)', lineHeight: 2, letterSpacing: '0.04em', marginBottom: 24 }}>
                To withdraw funds over $5,000, you must verify your identity. Please upload a valid government-issued ID and a selfie holding the same ID.
              </div>

              {kycCharge > 0 && (
                <div style={{ background: 'rgba(255,80,80,0.04)', border: '1px solid rgba(255,80,80,0.15)', padding: 16, marginBottom: 20 }}>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, color: 'rgba(255,80,80,0.7)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>⚠ Verification Fee Required</div>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)', lineHeight: 1.8, marginBottom: 8 }}>{kycData?.kyc_charge_reason}</div>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 12, color: 'rgba(255,80,80,0.8)', marginBottom: 8 }}>Fee: ${kycCharge}</div>
                  {kycData?.kyc_charge_address && (
                    <div style={{ background: '#000', border: '1px solid rgba(255,80,80,0.1)', padding: 10, fontFamily: "'Courier New',monospace", fontSize: 9, color: 'rgba(255,80,80,0.6)', wordBreak: 'break-all' }}>
                      {kycData.kyc_charge_address}
                    </div>
                  )}
                </div>
              )}

              {[
                { key: 'id_image', label: 'Valid ID Card *', icon: '📄', hint: 'Click to upload ID card · PNG, JPG up to 10MB' },
                { key: 'selfie', label: 'Selfie Holding ID *', icon: '🤳', hint: 'Must clearly show your face and ID' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 8 }}>{f.label}</div>
                  <div style={S.upload}>
                    <input type="file" accept="image/*" style={S.uploadInput} onChange={e => setKycFiles(p => ({ ...p, [f.key]: e.target.files[0] }))} />
                    {kycFiles[f.key] ? (
                      <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: '#C0C0C0' }}>✓ {kycFiles[f.key].name}</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 22, marginBottom: 8, opacity: 0.3 }}>{f.icon}</div>
                        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{f.hint}</div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {kycCharge > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 8 }}>Payment Receipt *</div>
                  <div style={S.upload}>
                    <input type="file" accept="image/*" style={S.uploadInput} onChange={e => setKycFiles(p => ({ ...p, receipt: e.target.files[0] }))} />
                    {kycFiles.receipt ? (
                      <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: '#C0C0C0' }}>✓ {kycFiles.receipt.name}</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 22, marginBottom: 8, opacity: 0.3 }}>🧾</div>
                        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Upload payment receipt</div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={handleKYCSubmit}
                disabled={uploadingKyc || (kycCharge > 0 && !kycFiles.receipt)}
                style={{
                  width: '100%', marginTop: 8, padding: 13,
                  background: '#fff', color: '#000', border: 'none',
                  fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.35em',
                  textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700,
                  opacity: uploadingKyc || (kycCharge > 0 && !kycFiles.receipt) ? 0.5 : 1,
                }}
              >
                {uploadingKyc ? 'Submitting...' : 'Submit for Verification →'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}