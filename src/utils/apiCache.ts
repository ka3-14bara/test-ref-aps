type CacheEntry<T> = {
  data: T[];
  timestamp: number;
  ttl: number; // время жизни в миллисекундах
  pendingPromise?: Promise<T[]>; // для дедупликации одновременных запросов
};

const cache = new Map<string, CacheEntry<any>>();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 минут

/**
 * Получить данные из кеша или выполнить запрос.
 * Гарантирует, что для одного endpoint в любой момент времени выполняется не более одного запроса.
 */
export async function getCachedData<T>(
  endpoint: string,
  fetcher: () => Promise<T[]>,
  ttl: number = DEFAULT_TTL,
): Promise<T[]> {
  const now = Date.now();
  const entry = cache.get(endpoint);

  // Если данные есть и не устарели — возвращаем
  if (entry && now - entry.timestamp < entry.ttl) {
    return entry.data;
  }

  // Если запрос уже выполняется — ждём его результат
  if (entry?.pendingPromise) {
    return entry.pendingPromise;
  }

  // Иначе запускаем новый запрос
  const pendingPromise = fetcher()
    .then((data) => {
      cache.set(endpoint, {
        data,
        timestamp: Date.now(),
        ttl,
      });
      return data;
    })
    .finally(() => {
      // Удаляем ссылку на pendingPromise после завершения
      if (cache.get(endpoint)?.pendingPromise === pendingPromise) {
        cache.get(endpoint)!.pendingPromise = undefined;
      }
    });

  // Сохраняем запись с pendingPromise, чтобы другие вызовы могли подписаться
  cache.set(endpoint, {
    data: entry?.data || [],
    timestamp: entry?.timestamp || 0,
    ttl,
    pendingPromise,
  });

  return pendingPromise;
}

/**
 * Очистить кеш для конкретного endpoint или полностью, если endpoint не указан.
 */
export function clearCache(endpoint?: string) {
  if (endpoint) {
    cache.delete(endpoint);
  } else {
    cache.clear();
  }
}