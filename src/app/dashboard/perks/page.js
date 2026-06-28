'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const PLAN_PERKS = {
  Bronze: [], Starter: [],
  Growth: ['2 years X Premium free', '2 years Grok AI free', 'Private members group access', 'SpaceX merch shipped to you'],
  Premium: ['Everything in Growth', '2 years Starlink internet free', '2 years Tesla self-driving software free', 'We get your X account verified', 'Free Tesla charging for a full year', '1 invite to an exclusive Elon Musk event'],
  Elite: ['Everything in Premium', 'Starlink & Tesla FSD extended to 3 years', 'New Tesla & SpaceX products before public release', 'Invite to watch a real SpaceX rocket launch', 'Dedicated account manager', '2 Elon event invites during your plan'],
  Platinum: ['Everything in Elite', 'A discount on buying a Tesla car', '3 Elon event invites', 'Your own private contact for updates anytime', 'VIP spot at SpaceX launches — best viewing area', 'Lifetime access to our private members community'],
}

function getPerkIcon(perk) {
  const p = perk.toLowerCase()
  if (p.includes('tesla') && p.includes('car') || p.includes('discount')) return '🚗'
  if (p.includes('starlink')) return '🛰️'
  if (p.includes('x premium') || p.includes('grok') || p.includes('verified') || p.includes('blue tick') || p.includes('x account')) return '𝕏'
  if (p.includes('elon') || p.includes('event') || p.includes('invite')) return '🎟️'
  if (p.includes('launch') || p.includes('rocket')) return '🚀'
  if (p.includes('merch')) return '📦'
  if (p.includes('community')) return '👥'
  if (p.includes('contact') || p.includes('manager')) return '📞'
  if (p.includes('tesla') && p.includes('charging')) return '⚡'
  if (p.includes('tesla') && p.includes('software') || p.includes('fsd')) return '🤖'
  return '✦'
}

export default function PerksPage() {
  const router = useRouter()
  const [investments, setInvestments] = useState([])
  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    fetch('/api/plans', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setInvestments(d.investments?.filter(i => i.status === 'active') || []))
  }, [])

  const ORDER = ['Bronze','Starter','Growth','Premium','Elite','Platinum']
  const highestPlan = investments.length > 0
    ? investments.reduce((best, i) => {
        const curr = ORDER.indexOf(i.investment_plans?.name)
        const b = ORDER.indexOf(best?.investment_plans?.name)
        return curr > b ? i : best
      }, investments[0])
    : null
  const currentPlanName = highestPlan?.investment_plans?.name
  const currentPlanIndex = currentPlanName ? ORDER.indexOf(currentPlanName) : -1
  const userPerks = currentPlanName ? PLAN_PERKS[currentPlanName] || [] : []

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 400, marginBottom: 4 }}>My Perks</div>
        <div style={{ fontSize: 8, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>
          {currentPlanName ? `${currentPlanName} Member · ${userPerks.length} perks unlocked` : 'No active plan · Invest to unlock perks'}
        </div>
      </div>

      {/* No plan */}
      {!highestPlan && (
        <div style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '40px 20px', textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', lineHeight: 2.2, marginBottom: 20 }}>
            Perks unlock from the Growth plan ($5,000) upward.<br />The higher your plan, the more exclusive your benefits.
          </div>
          <button onClick={() => router.push('/dashboard/invest')} style={{ background: '#fff', color: '#000', border: 'none', padding: '11px 28px', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.3em', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}>View Plans →</button>
        </div>
      )}

      {/* Unlocked perks */}
      {userPerks.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 8, letterSpacing: '0.4em', color: 'rgba(0,212,255,0.6)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-block', width: 16, height: 1, background: 'rgba(0,212,255,0.4)' }}></span>
            Unlocked Perks
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
            {userPerks.map((perk, i) => (
              <div key={i} style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)', padding: '18px 16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.5),transparent)' }} />
                <div style={{ fontSize: 20, marginBottom: 10 }}>{getPerkIcon(perk)}</div>
                <div style={{ fontSize: 10, letterSpacing: '0.04em', color: '#fff', lineHeight: 1.7, marginBottom: 8 }}>{perk}</div>
                <div style={{ fontSize: 7, letterSpacing: '0.28em', color: 'rgba(0,212,255,0.5)', textTransform: 'uppercase' }}>✓ Unlocked</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, border: '1px solid rgba(255,255,255,0.05)', padding: '14px 18px', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ fontSize: 8, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 6 }}>Activate Your Perks</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', lineHeight: 2 }}>
              Email us with your account details to activate: <span style={{ color: 'rgba(0,212,255,0.6)' }}>invest@spacestocks.finance</span>
            </div>
          </div>
        </div>
      )}

      {/* All tiers overview */}
      <div>
        <div style={{ fontSize: 8, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-block', width: 16, height: 1, background: 'rgba(255,255,255,0.15)' }}></span>
          All Tiers
        </div>
        {ORDER.filter(plan => PLAN_PERKS[plan].length > 0).map(plan => {
          const planIndex = ORDER.indexOf(plan)
          const isUnlocked = planIndex <= currentPlanIndex
          const isCurrent = plan === currentPlanName
          return (
            <div key={plan} style={{ border: `1px solid ${isCurrent ? 'rgba(0,212,255,0.2)' : isUnlocked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`, padding: '16px 18px', marginBottom: 8, opacity: isUnlocked ? 1 : 0.45, background: isCurrent ? 'rgba(0,212,255,0.02)' : 'transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 9, letterSpacing: '0.38em', color: isCurrent ? 'rgba(0,212,255,0.7)' : isUnlocked ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
                  {!isUnlocked && '🔒 '}{plan}
                </div>
                {isCurrent && <div style={{ fontSize: 7, letterSpacing: '0.28em', color: 'rgba(0,212,255,0.5)', border: '1px solid rgba(0,212,255,0.2)', padding: '2px 10px', textTransform: 'uppercase' }}>Current</div>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PLAN_PERKS[plan].map((p, i) => (
                  <div key={i} style={{ fontSize: 9, color: isUnlocked ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)', padding: '4px 10px', border: `1px solid ${isUnlocked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`, letterSpacing: '0.03em', lineHeight: 1.5 }}>
                    {getPerkIcon(p)} {p}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {currentPlanIndex < ORDER.length - 1 && (
          <button onClick={() => router.push('/dashboard/invest')} style={{ marginTop: 16, background: 'transparent', border: '1px solid rgba(0,212,255,0.2)', color: 'rgba(0,212,255,0.6)', padding: '11px 24px', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.28em', cursor: 'pointer', textTransform: 'uppercase' }}>
            Upgrade Plan to Unlock More →
          </button>
        )}
      </div>
    </div>
  )
}
