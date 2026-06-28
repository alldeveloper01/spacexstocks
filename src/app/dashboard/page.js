'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

function RadarSweep({ size = 80 }) {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current; if (!cv) return
    const ctx = cv.getContext('2d')
    let angle = 0, frame
    function draw() {
      ctx.clearRect(0, 0, size, size)
      const cx = size/2, cy = size/2, r = size/2 - 4
      ctx.strokeStyle = 'rgba(0,212,255,0.12)'; ctx.lineWidth = 0.5
      ;[r*0.33,r*0.66,r].forEach(rad=>{ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.stroke()})
      ctx.beginPath();ctx.moveTo(cx-r,cy);ctx.lineTo(cx+r,cy);ctx.stroke()
      ctx.beginPath();ctx.moveTo(cx,cy-r);ctx.lineTo(cx,cy+r);ctx.stroke()
      ctx.save();ctx.translate(cx,cy);ctx.rotate(angle)
      const g=ctx.createLinearGradient(0,0,r,0)
      g.addColorStop(0,'rgba(0,212,255,0.5)');g.addColorStop(1,'rgba(0,212,255,0)')
      ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r,-0.3,0);ctx.closePath()
      ctx.fillStyle=g;ctx.fill();ctx.restore()
      angle+=0.03;frame=requestAnimationFrame(draw)
    }
    draw()
    return ()=>cancelAnimationFrame(frame)
  },[])
  return <canvas ref={ref} width={size} height={size} style={{display:'block'}}/>
}

function MiniChart({ prices }) {
  if (!prices||prices.length<2) return null
  const W=200,H=48,min=Math.min(...prices),max=Math.max(...prices),range=max-min||1
  const pts=prices.map((p,i)=>`${(i/(prices.length-1))*W},${H-((p-min)/range)*(H-8)-4}`).join(' ')
  const area=`M0,${H} L${pts.split(' ').join(' L')} L${W},${H} Z`
  return (
    <svg width={W} height={H} style={{display:'block',overflow:'visible'}}>
      <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00D4FF" stopOpacity="0.3"/><stop offset="100%" stopColor="#00D4FF" stopOpacity="0"/></linearGradient></defs>
      <path d={area} fill="url(#cg)"/>
      <polyline points={pts} fill="none" stroke="#00D4FF" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

function ProgressArc({ pct, size=56 }) {
  const r=size/2-5,circ=2*Math.PI*r,dash=(pct/100)*circ
  return (
    <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#00D4FF" strokeWidth="3" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{transition:'stroke-dasharray 1s ease'}}/>
    </svg>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [investments, setInvestments] = useState([])
  const [spce, setSpce] = useState(160.00)
  const [priceHistory, setPriceHistory] = useState([160])
  const [loading, setLoading] = useState(true)
  const [scanLine, setScanLine] = useState(0)
  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    const params = new URLSearchParams(window.location.search)
    if (params.get('deposit')==='success') window.history.replaceState({},'','/dashboard')
    fetch('/api/auth',{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()).then(d=>{if(d.error)router.push('/login');else setUser(d)})
    fetch('/api/plans',{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()).then(d=>{setInvestments(d.investments||[]);setLoading(false)})
    const iv=setInterval(()=>{setSpce(p=>{const n=Math.max(150,p+(Math.random()-0.48)*0.5);setPriceHistory(h=>[...h.slice(-49),n]);return n})},2000)
    const sl=setInterval(()=>setScanLine(l=>(l+1)%100),30)
    return ()=>{clearInterval(iv);clearInterval(sl)}
  },[])

  const activeInv=investments.filter(i=>i.status==='active')
  const totalInvested=activeInv.reduce((s,i)=>s+i.amount,0)
  const weeklyReturn=activeInv.reduce((s,i)=>s+i.weekly_return,0)
  const prcUp=priceHistory.length>1&&spce>=priceHistory[priceHistory.length-2]
  const daysLeft=inv=>!inv.end_date?0:Math.max(0,Math.ceil((new Date(inv.end_date)-new Date())/86400000))
  const planProgress=inv=>{
    if(!inv.end_date||!inv.created_at)return 0
    return Math.min(100,Math.round((Date.now()-new Date(inv.created_at))/(new Date(inv.end_date)-new Date(inv.created_at))*100))
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}>
      <div style={{textAlign:'center'}}>
        <RadarSweep size={80}/>
        <div style={{fontSize:9,letterSpacing:'0.4em',color:'rgba(0,212,255,0.5)',marginTop:16,textTransform:'uppercase'}}>Initializing...</div>
      </div>
    </div>
  )

  return (
    <div>
      {/* Top bar */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28,flexWrap:'wrap',gap:16}}>
        <div>
          <div style={{fontSize:'clamp(20px,3vw,28px)',fontWeight:400,letterSpacing:'-0.01em'}}>Hello, {user?.full_name?.split(' ')[0]}.</div>
          <div style={{fontSize:8,letterSpacing:'0.4em',color:'rgba(255,255,255,0.25)',textTransform:'uppercase',marginTop:4}}>Mission Control · Your Portfolio</div>
        </div>
        <div style={{background:'rgba(0,212,255,0.05)',border:'1px solid rgba(0,212,255,0.15)',padding:'12px 20px',minWidth:220}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:20}}>
            <div>
              <div style={{fontSize:7,letterSpacing:'0.35em',color:'rgba(0,212,255,0.6)',textTransform:'uppercase',marginBottom:4}}>SPCE · Live</div>
              <div style={{fontSize:22,letterSpacing:'-0.02em'}}>${spce.toFixed(2)}</div>
              <div style={{fontSize:9,color:prcUp?'#00D4FF':'rgba(255,80,80,0.7)',marginTop:2}}>{prcUp?'▲':'▼'} {((spce-120)/120*100).toFixed(2)}% since IPO</div>
            </div>
            <MiniChart prices={priceHistory}/>
          </div>
        </div>
      </div>

      {/* Balance cards with scan line */}
      <div style={{position:'relative',marginBottom:20}}>
        <div style={{position:'absolute',top:`${scanLine}%`,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(0,212,255,0.12),transparent)',zIndex:5,pointerEvents:'none'}}/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:1,background:'rgba(0,212,255,0.04)'}}>
          {[
            {label:'Available Balance',val:`$${(user?.balance||0).toLocaleString()}`,sub:'Ready to invest',color:'#00D4FF'},
            {label:'Withdrawal Balance',val:`$${(user?.withdrawal_balance||0).toLocaleString()}`,sub:'Ready to withdraw',color:'#fff'},
            {label:'Total Invested',val:`$${totalInvested.toLocaleString()}`,sub:`${activeInv.length} active plan${activeInv.length!==1?'s':''}`,color:'rgba(0,212,255,0.7)'},
            {label:'Weekly Return',val:`$${weeklyReturn.toLocaleString()}`,sub:'Paid every 7 days',color:'#fff'},
            {label:'Total Earned',val:`$${(user?.total_profit||0).toLocaleString()}`,sub:'All time profits',color:'rgba(0,212,255,0.7)'},
          ].map((c,i)=>(
            <div key={i} style={{background:'#000',padding:'20px 16px',border:'1px solid rgba(255,255,255,0.04)',borderTop:`2px solid ${c.color}`,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:`radial-gradient(ellipse at top left,${c.color}08,transparent 70%)`,pointerEvents:'none'}}/>
              <div style={{fontSize:7,letterSpacing:'0.35em',color:'rgba(255,255,255,0.2)',textTransform:'uppercase',marginBottom:8}}>{c.label}</div>
              <div style={{fontSize:'clamp(16px,2.5vw,24px)',letterSpacing:'-0.02em',color:c.color}}>{c.val}</div>
              <div style={{fontSize:8,color:'rgba(255,255,255,0.2)',marginTop:4}}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:10,marginBottom:28}}>
        {[
          {label:'Invest Now',icon:'◈',action:()=>router.push('/dashboard/invest'),primary:true},
          {label:'Withdraw',icon:'↓',action:()=>router.push('/dashboard/withdraw')},
          {label:'My Perks',icon:'★',action:()=>router.push('/dashboard/perks')},
          {label:'Profile',icon:'◉',action:()=>router.push('/dashboard/profile')},
        ].map((a,i)=>(
          <button key={i} onClick={a.action} style={{padding:'16px 12px',background:a.primary?'rgba(0,212,255,0.1)':'rgba(255,255,255,0.02)',border:a.primary?'1px solid rgba(0,212,255,0.3)':'1px solid rgba(255,255,255,0.06)',color:a.primary?'#00D4FF':'rgba(255,255,255,0.5)',fontFamily:"'Courier New',monospace",cursor:'pointer',textAlign:'center',transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
            <span style={{fontSize:18}}>{a.icon}</span>
            <span style={{fontSize:8,letterSpacing:'0.25em',textTransform:'uppercase'}}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Active investments */}
      <div style={{marginBottom:28}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div style={{fontSize:8,letterSpacing:'0.42em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase'}}>Active Missions</div>
          <button onClick={()=>router.push('/dashboard/invest')} style={{fontSize:8,letterSpacing:'0.25em',color:'rgba(0,212,255,0.5)',background:'none',border:'none',cursor:'pointer',textTransform:'uppercase',fontFamily:'inherit'}}>+ New Investment</button>
        </div>
        {activeInv.length===0?(
          <div style={{border:'1px solid rgba(255,255,255,0.04)',padding:'40px 20px',textAlign:'center'}}>
            <div style={{fontSize:32,marginBottom:12,opacity:0.3}}>🚀</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.2)',letterSpacing:'0.08em',marginBottom:20,lineHeight:1.9}}>No active missions. Start your first investment to begin earning weekly returns.</div>
            <button onClick={()=>router.push('/dashboard/invest')} style={{background:'#fff',color:'#000',border:'none',padding:'10px 24px',fontFamily:"'Courier New',monospace",fontSize:9,letterSpacing:'0.3em',cursor:'pointer',fontWeight:700,textTransform:'uppercase'}}>View Plans →</button>
          </div>
        ):activeInv.map(inv=>(
          <div key={inv.id} style={{background:'rgba(0,212,255,0.02)',border:'1px solid rgba(0,212,255,0.1)',padding:'16px 18px',marginBottom:8,display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
            <ProgressArc pct={planProgress(inv)} size={52}/>
            <div style={{flex:1,minWidth:120}}>
              <div style={{fontSize:13,marginBottom:4}}>{inv.investment_plans?.name} <span style={{fontSize:8,color:'rgba(0,212,255,0.5)',letterSpacing:'0.2em',textTransform:'uppercase'}}>· Active</span></div>
              <div style={{fontSize:8,color:'rgba(255,255,255,0.25)',letterSpacing:'0.08em'}}>${inv.amount.toLocaleString()} · {daysLeft(inv)} days remaining</div>
              <div style={{marginTop:8,height:2,background:'rgba(255,255,255,0.05)',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${planProgress(inv)}%`,background:'linear-gradient(90deg,rgba(0,212,255,0.4),#00D4FF)',transition:'width 1s ease'}}/>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:7,letterSpacing:'0.3em',color:'rgba(255,255,255,0.2)',textTransform:'uppercase',marginBottom:4}}>Weekly</div>
              <div style={{fontSize:18,color:'#00D4FF'}}>${inv.weekly_return.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Mission feed */}
      <div style={{border:'1px solid rgba(255,255,255,0.04)',padding:'18px 18px'}}>
        <div style={{fontSize:8,letterSpacing:'0.42em',color:'rgba(255,255,255,0.25)',textTransform:'uppercase',marginBottom:16}}>Mission Feed</div>
        {[
          {icon:'🚀',text:'Falcon 9 · Starlink Group 15-4 · Launch Successful',time:'2h ago',color:'rgba(0,212,255,0.6)'},
          {icon:'📡',text:`SPCE live at $${spce.toFixed(2)} — +${((spce-120)/120*100).toFixed(2)}% since IPO`,time:'Now',color:'rgba(255,255,255,0.5)'},
          {icon:'🛸',text:'Starship Flight 9 · Orbital Test · Scheduled',time:'2d away',color:'rgba(255,200,0,0.5)'},
          {icon:'💰',text:'Weekly returns processed for all active plans',time:'3d ago',color:'rgba(0,212,255,0.4)'},
        ].map((f,i)=>(
          <div key={i} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'10px 0',borderBottom:i<3?'1px solid rgba(255,255,255,0.03)':'none'}}>
            <span style={{fontSize:14,flexShrink:0}}>{f.icon}</span>
            <div style={{flex:1,fontSize:10,color:f.color,letterSpacing:'0.04em',lineHeight:1.7}}>{f.text}</div>
            <div style={{fontSize:7,letterSpacing:'0.15em',color:'rgba(255,255,255,0.2)',whiteSpace:'nowrap'}}>{f.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
