import { createClient } from "@supabase/supabase-js";

const supabaseUrl = " https://pdlewqksussydcfwsuei.supabase.co";
const supabaseKey = "sb_publishable_u7xM0dPJqN-S_lxekvqIAg_7-Z3DDhG";

export const supabase = createClient(supabaseUrl, supabaseKey);