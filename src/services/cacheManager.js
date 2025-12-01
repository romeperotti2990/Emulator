// Cache detection - checks if a ROM is in browser's HTTP cache

// No-op placeholder (cache detection is automatic now)
export const logCachedROM = async () => {};

// Check if a ROM is fully cached in the browser's HTTP cache
// by comparing the content-length header with the actual response size
export const isCached = async (romUrl) => {
    try {
        const proxiedUrl = `http://localhost:3001/api/proxy-rom?url=${encodeURIComponent(romUrl)}`;
        
        // Get headers to check content-length
        let contentLength = null;
        try {
            const headResponse = await fetch(proxiedUrl, { 
                method: 'HEAD'
            });
            
            if (headResponse.ok) {
                contentLength = headResponse.headers.get('content-length');
            }
        } catch (err) {
            // HEAD might not be supported, we'll check with GET
        }
        
        // Do a GET request with timing and size check
        const startTime = performance.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);
        
        try {
            const response = await fetch(proxiedUrl, { 
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) return false;
            
            // Get the actual content length from response headers
            const responseContentLength = response.headers.get('content-length');
            
            // Clone the response to get the actual body size
            const clone = response.clone();
            const arrayBuffer = await clone.arrayBuffer();
            const actualSize = arrayBuffer.byteLength;
            
            const elapsed = performance.now() - startTime;
            
            // Check if this was a cache hit by looking at response headers
            // Cached responses typically have "age" header or very fast response times
            const age = response.headers.get('age');
            const cacheControl = response.headers.get('cache-control');
            const expires = response.headers.get('expires');
            
            // If we have cache headers indicating it's cached, trust those first
            if (age !== null || (cacheControl && !cacheControl.includes('no-cache'))) {
                // Verify the file is actually complete
                if (responseContentLength && actualSize >= parseInt(responseContentLength) * 0.95) {
                    return true;
                }
            }
            
            // Fallback: check if response was very fast (likely cache) AND file is complete
            if (elapsed < 300) {
                // Very fast response, likely from cache
                // Verify file is actually complete (allow 5% margin for headers/encoding)
                if (responseContentLength) {
                    return actualSize >= parseInt(responseContentLength) * 0.95;
                }
                return true; // Can't verify size, but very fast so likely cached
            }
            
            return false;
        } catch (err) {
            clearTimeout(timeoutId);
            return false;
        }
    } catch (err) {
        return false;
    }
};

