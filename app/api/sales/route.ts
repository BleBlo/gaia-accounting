import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('sales')
    .insert(body)
    .select(`*, customer:customers(*), service:services(*)`)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  const { id, ...updates } = await request.json()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('sales')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  const admin = createAdminClient()

  const { error } = await admin
    .from('sales')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
