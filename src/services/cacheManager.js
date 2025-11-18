// Cache detection - checks if a ROM is in browser's HTTP cache

// No-op placeholder (cache detection is automatic now)
export const logCachedROM = async () => {};

// Check if a ROM is in the browser's HTTP cache
// by making a HEAD request to get headers without downloading data
export const isCached = async (romUrl) => {
    try {
        const proxiedUrl = `http://localhost:3001/api/proxy-rom?url=${encodeURIComponent(romUrl)}`;
        
        // Try HEAD first (might not work if server doesn't support it)
        try {
            const response = await fetch(proxiedUrl, { 
                method: 'HEAD'
            });
            
            // If we get a 200 with cache headers, check timing
            if (response.ok && response.headers.get('cache-control')) {
                // This means we got a response with proper headers
                // The browser will have cached it
                return true;
            }
        } catch (err) {
            // HEAD might not be supported, fall back to GET with timing
        }
        
        // Fallback: do a GET request with generous timeout and check timing
        const startTime = performance.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 500); // 500ms for generous margin
        
        try {
            const response = await fetch(proxiedUrl, { 
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) return false;
            
            const elapsed = performance.now() - startTime;
            // Anything under 400ms is likely cache
            // Network requests to external hosts take 500ms+ minimum
            return elapsed < 400;
        } catch (err) {
            clearTimeout(timeoutId);
            return false;
        }
    } catch (err) {
        return false;
    }
};

