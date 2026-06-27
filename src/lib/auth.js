import jwt from 'jsonwebtoken'
import { supabaseAdmin } from './supabase'

const JWT_SECRET = process.env.JWT_SECRET

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function getUserFromRequest(request) {
  const auth = request.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) return null
  const token = auth.replace('Bearer ', '')
  const decoded = verifyToken(token)
  if (!decoded) return null
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', decoded.id)
    .single()
  return user || null
}

export async function getAdminFromRequest(request) {
  const user = await getUserFromRequest(request)
  if (!user || user.role !== 'admin') return null
  return user
}
