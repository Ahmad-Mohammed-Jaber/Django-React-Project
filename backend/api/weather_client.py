from dotenv import load_dotenv
from django_redis import get_redis_connection
from django.core.cache import cache

import datetime
import requests
import os

load_dotenv()

CACHE_TTL = 300            # cache entry lives 300s
LOCK_TIMEOUT = 300         # lock auto-expires after 300s
BLOCKING_TIMEOUT = 300     # contenders wait up to 300s for the lock


def fetch_weather(city):
    key = f'weather:{city.strip().lower()}'
    
    cached = cache.get(key)
    if cached is not None:
        return cached
    
    con = get_redis_connection('default')
    
    lock = con.lock(f'lock:{key}', timeout = LOCK_TIMEOUT, blocking_timeout = BLOCKING_TIMEOUT)
    
    with lock:
        cached = cache.get(key)
        if cached is not None:
            return cached
    
    import time
    time.sleep(5)
    
    api_key = os.getenv("WEATHER_API_KEY")
    if not api_key:
        raise RuntimeError('Missing API KEY in Enivorment Variables')
    
    
    res = requests.get(f'https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric', timeout=6)
    res.raise_for_status()
    data = res.json()
    
    value = data['main']['temp']
    cache.set(key, value, timeout=CACHE_TTL)
    return value