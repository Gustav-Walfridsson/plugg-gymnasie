/**
 * DEPRECATED: Use supabase from lib/supabase-client.ts instead
 * This file is kept for compatibility but should not be used for new code
 */

import { supabase } from '../supabase-client'

export function createClient() {
  console.warn('⚠️ DEPRECATED: Use supabase from lib/supabase-client.ts instead of createClient()')
  return supabase
}
