/**
 * Supabase клиент для облачной синхронизации данных
 * Настройка: https://supabase.com/docs/guides/getting-started
 */

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Получение конфигурации из переменных окружения
const getSupabaseConfig = (): SupabaseConfig | null => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn('Supabase: URL или ANON_KEY не настроены. Облачная синхронизация отключена.');
    return null;
  }

  return { url, anonKey };
};

const config = getSupabaseConfig();

/**
 * Инициализация Supabase клиента (ленивая загрузка)
 */
let supabaseClient: any = null;

export const initSupabase = async () => {
  if (!config) {
    return null;
  }

  if (supabaseClient) {
    return supabaseClient;
  }

  try {
    // Динамический импорт для уменьшения bundle size
    const { createClient } = await import('@supabase/supabase-js');
    supabaseClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return supabaseClient;
  } catch (error) {
    console.error('Ошибка инициализации Supabase:', error);
    return null;
  }
};

/**
 * Синхронизация данных пользователя с облаком
 */
export const syncUserDataToCloud = async (userData: any, userId: string) => {
  const client = await initSupabase();
  if (!client) {
    return { success: false, error: 'Supabase не инициализирован' };
  }

  try {
    const { data, error } = await client
      .from('user_data')
      .upsert({
        user_id: userId,
        data: userData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Ошибка синхронизации с облаком:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Получение данных пользователя из облака
 */
export const getUserDataFromCloud = async (userId: string) => {
  const client = await initSupabase();
  if (!client) {
    return { success: false, error: 'Supabase не инициализирован', data: null };
  }

  try {
    const { data, error } = await client
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    return { success: true, data: data?.data || null };
  } catch (error: any) {
    console.error('Ошибка получения данных из облака:', error);
    return { success: false, error: error.message, data: null };
  }
};

/**
 * Проверка доступности Supabase
 */
export const isSupabaseAvailable = () => {
  return config !== null;
};

