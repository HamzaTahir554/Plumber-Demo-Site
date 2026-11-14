import { useEffect, useState } from 'react';
import { requestApi } from '../lib/requestApi.js';

export default function useRequestConfig() {
  const [config, setConfig] = useState({ loading: true, enabled: false });
  useEffect(() => {
    const controller = new AbortController();
    requestApi('/config', { signal: controller.signal }).then(value => { if (!controller.signal.aborted) setConfig({ ...value, loading: false }); }).catch(() => { if (!controller.signal.aborted) setConfig({ loading: false, enabled: false }); });
    return () => controller.abort();
  }, []);
  return config;
}
