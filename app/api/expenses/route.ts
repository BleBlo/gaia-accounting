import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('expenses')
    .insert(body)
    .select(`*, category:expense_categories(id, name_en, name_tr), supplier:suppliers(id, name)`)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  const { id, ...updates } = await request.json()
  const admin = createAdminClient()

  const { error } = await admin
    .from('expenses')
    .update(updates)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  const admin = createAdminClient()

  const { error } = await admin
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
