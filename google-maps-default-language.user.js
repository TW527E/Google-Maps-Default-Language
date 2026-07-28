// ==UserScript==
// @name         Google Maps 預設語言
// @namespace    https://github.com/local/Google-Maps-Default-Language
// @version      1.0.0
// @description  首次使用時將非中文的 Google Maps 切換成繁體中文，之後記住使用者在 Google Maps 內手動選擇的語言。
// @author       Codex
// @match        https://www.google.com/maps*
// @match        https://maps.google.com/*
// @include      /^https:\/\/www\.google\.[^/]+\/maps(?:\/|\?|$)/
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';

    const FALLBACK_LANGUAGE = 'zh-TW';
    const PREFERENCE_KEY = 'google-maps-preferred-language';
    const REDIRECT_KEY = 'google-maps-language-auto-redirect';
    const INTERACTION_KEY = 'google-maps-language-user-interaction';
    const RECENT_INTERACTION_MS = 15_000;
    const REDIRECT_MARKER_MS = 30_000;

    let observedUrlLanguage = getUrlLanguage(location.href);
    let observedDocumentLanguage = getDocumentLanguage();

    installUserInteractionTracking();
    registerMenuCommands();
    applyPreferredLanguage();
    observeLanguageChanges();

    /**
     * 決定這次應採用的語言：
     * 1. 已有偏好時，一律套用偏好。
     * 2. 第一次執行且目前是中文時，保留目前的中文語系。
     * 3. 第一次執行且目前不是中文時，改用繁體中文。
     */
    function applyPreferredLanguage() {
        let preferred = normalizeLanguage(GM_getValue(PREFERENCE_KEY, ''));
        const urlLanguage = getUrlLanguage(location.href);
        const documentLanguage = getDocumentLanguage();

        // document-start 執行時 <html lang> 可能尚未出現；第一次執行必須
        // 等它可用，否則會把原本的中文頁面誤判成非中文。
        if (
            !preferred &&
            !urlLanguage &&
            !documentLanguage &&
            document.readyState === 'loading'
        ) {
            document.addEventListener('DOMContentLoaded', applyPreferredLanguage, {
                once: true,
            });
            return;
        }

        if (preferred) {
            // 若語言選單沒有把 hl 放進網址，等新頁面的 <html lang>
            // 出現後再判斷，避免在它出現前立刻切回舊偏好。
            if (
                !urlLanguage &&
                hasRecentUserInteraction() &&
                !documentLanguage &&
                document.readyState === 'loading'
            ) {
                document.addEventListener('DOMContentLoaded', applyPreferredLanguage, {
                    once: true,
                });
                return;
            }

            if (
                !urlLanguage &&
                hasRecentUserInteraction() &&
                documentLanguage &&
                !sameLanguage(documentLanguage, preferred)
            ) {
                savePreference(documentLanguage);
                clearUserInteraction();
                ensureLanguage(documentLanguage);
                return;
            }

            const wasAutomaticRedirect = consumeAutomaticRedirectMarker(urlLanguage);

            // 某些 Google Maps 語言選單會先重新載入頁面，無法在舊頁面
            // 直接取得選擇結果；用近期的真實操作來辨識這次語言變更。
            if (
                urlLanguage &&
                !sameLanguage(urlLanguage, preferred) &&
                !wasAutomaticRedirect &&
                hasRecentUserInteraction()
            ) {
                savePreference(urlLanguage);
                clearUserInteraction();
                return;
            }

            clearUserInteraction();
            ensureLanguage(preferred);
            return;
        }

        const currentLanguage = urlLanguage || documentLanguage;
        preferred = isChinese(currentLanguage)
            ? currentLanguage
            : FALLBACK_LANGUAGE;

        savePreference(preferred);
        clearUserInteraction();
        ensureLanguage(preferred);
    }

    /** 為目前網址加入 hl；replace() 不會在瀏覽記錄中多留一頁。 */
    function ensureLanguage(language) {
        const urlLanguage = getUrlLanguage(location.href);

        if (urlLanguage && sameLanguage(urlLanguage, language)) {
            return;
        }

        const target = new URL(location.href);
        target.searchParams.set('hl', language);
        markAutomaticRedirect(language, target.href);
        location.replace(target.href);
    }

    /**
     * 在使用者按下 Google Maps 的語言連結時，於頁面離開前保存選擇。
     * 另記錄所有真實點擊，以涵蓋由 JavaScript 控制、沒有 href 的選單。
     */
    function installUserInteractionTracking() {
        document.addEventListener('click', (event) => {
            if (!event.isTrusted) return;

            markUserInteraction();

            const destination = getMapsDestinationFromEvent(event);
            const selectedLanguage = destination
                ? getUrlLanguage(destination.href)
                : null;

            if (selectedLanguage) {
                savePreference(selectedLanguage);
                clearUserInteraction();
            }
        }, true);

        document.addEventListener('submit', (event) => {
            if (!event.isTrusted || !(event.target instanceof HTMLFormElement)) {
                return;
            }

            const formData = new FormData(event.target);
            const selectedLanguage = normalizeLanguage(formData.get('hl'));
            if (selectedLanguage) {
                savePreference(selectedLanguage);
                clearUserInteraction();
            } else {
                markUserInteraction();
            }
        }, true);

        document.addEventListener('change', (event) => {
            if (!event.isTrusted || !(event.target instanceof HTMLSelectElement)) {
                return;
            }

            if (event.target.name === 'hl') {
                const selectedLanguage = normalizeLanguage(event.target.value);
                if (selectedLanguage) savePreference(selectedLanguage);
            }
        }, true);
    }

    /** 監看 Maps 的 SPA 網址變化與 <html lang> 變化。 */
    function observeLanguageChanges() {
        const check = () => {
            const urlLanguage = getUrlLanguage(location.href);
            const documentLanguage = getDocumentLanguage();
            const recentInteraction = hasRecentUserInteraction();

            if (
                recentInteraction &&
                urlLanguage &&
                !sameLanguage(urlLanguage, observedUrlLanguage)
            ) {
                savePreference(urlLanguage);
                clearUserInteraction();
            } else if (
                recentInteraction &&
                documentLanguage &&
                !sameLanguage(documentLanguage, observedDocumentLanguage)
            ) {
                savePreference(documentLanguage);
                clearUserInteraction();
            }

            observedUrlLanguage = urlLanguage;
            observedDocumentLanguage = documentLanguage;
        };

        window.addEventListener('popstate', check, true);
        window.addEventListener('hashchange', check, true);

        const startObserver = () => {
            if (!document.documentElement) return;
            new MutationObserver(check).observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['lang'],
            });
        };

        if (document.documentElement) {
            startObserver();
        } else {
            document.addEventListener('DOMContentLoaded', startObserver, { once: true });
        }

        // pushState/replaceState 不會觸發 popstate，因此以低頻率補查。
        window.setInterval(check, 1_000);
    }

    function getMapsDestinationFromEvent(event) {
        for (const node of event.composedPath()) {
            if (!(node instanceof Element)) continue;

            const href = node.getAttribute('href');
            if (!href) continue;

            try {
                const destination = new URL(href, location.href);
                if (isGoogleMapsUrl(destination)) return destination;
            } catch {
                // 忽略不是有效網址的 href。
            }
        }
        return null;
    }

    function isGoogleMapsUrl(url) {
        const googleHost = /^(?:www|maps)\.google\.[a-z.]+$/i.test(url.hostname);
        return googleHost && (url.hostname.startsWith('maps.') || url.pathname.startsWith('/maps'));
    }

    function getUrlLanguage(urlValue) {
        try {
            return normalizeLanguage(new URL(urlValue, location.href).searchParams.get('hl'));
        } catch {
            return null;
        }
    }

    function getDocumentLanguage() {
        return normalizeLanguage(document.documentElement?.lang);
    }

    function normalizeLanguage(value) {
        if (typeof value !== 'string') return null;

        const cleaned = value.trim().replaceAll('_', '-');
        if (!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(cleaned)) return null;

        return cleaned
            .split('-')
            .map((part, index) => {
                if (index === 0) return part.toLowerCase();
                if (/^[a-z]{4}$/i.test(part)) {
                    return part[0].toUpperCase() + part.slice(1).toLowerCase();
                }
                if (/^[a-z]{2}$/i.test(part)) return part.toUpperCase();
                return part.toLowerCase();
            })
            .join('-');
    }

    function sameLanguage(left, right) {
        const normalizedLeft = normalizeLanguage(left);
        const normalizedRight = normalizeLanguage(right);
        return Boolean(
            normalizedLeft &&
            normalizedRight &&
            normalizedLeft.toLowerCase() === normalizedRight.toLowerCase()
        );
    }

    function isChinese(language) {
        const normalized = normalizeLanguage(language);
        return Boolean(normalized && normalized.toLowerCase().startsWith('zh'));
    }

    function savePreference(language) {
        const normalized = normalizeLanguage(language);
        if (normalized) GM_setValue(PREFERENCE_KEY, normalized);
    }

    function markAutomaticRedirect(language, href) {
        sessionStorage.setItem(REDIRECT_KEY, JSON.stringify({
            language,
            href,
            timestamp: Date.now(),
        }));
    }

    function consumeAutomaticRedirectMarker(currentLanguage) {
        const marker = readSessionValue(REDIRECT_KEY);
        sessionStorage.removeItem(REDIRECT_KEY);

        return Boolean(
            marker &&
            Date.now() - marker.timestamp <= REDIRECT_MARKER_MS &&
            sameLanguage(marker.language, currentLanguage) &&
            marker.href === location.href
        );
    }

    function markUserInteraction() {
        sessionStorage.setItem(INTERACTION_KEY, JSON.stringify({
            timestamp: Date.now(),
        }));
    }

    function hasRecentUserInteraction() {
        const marker = readSessionValue(INTERACTION_KEY);
        return Boolean(
            marker && Date.now() - marker.timestamp <= RECENT_INTERACTION_MS
        );
    }

    function clearUserInteraction() {
        sessionStorage.removeItem(INTERACTION_KEY);
    }

    function readSessionValue(key) {
        try {
            return JSON.parse(sessionStorage.getItem(key) || 'null');
        } catch {
            sessionStorage.removeItem(key);
            return null;
        }
    }

    function registerMenuCommands() {
        GM_registerMenuCommand('將預設語言設為繁體中文', () => {
            savePreference(FALLBACK_LANGUAGE);
            ensureLanguage(FALLBACK_LANGUAGE);
        });

        GM_registerMenuCommand('清除已記住的語言', () => {
            GM_deleteValue(PREFERENCE_KEY);
            location.reload();
        });
    }
})();
