// ==UserScript==
// @name         God Laffer Auto
// @namespace    MiMoCode
// @version      1.0.0
// @description  God Laffer with auto-update
// @match        *://*.moomoo.io/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ==================== CONFIG ====================
    // Replace with your hosted URL (GitHub raw, your server, etc.)
    const UPDATE_URL = "https://raw.githubusercontent.com/REPLACE_USER/REPLACE_REPO/main/update.json";
    const MOD_URL_BASE = "https://raw.githubusercontent.com/REPLACE_USER/REPLACE_REPO/main/";
    const STORAGE_KEY = "godLaffer_mod";
    const VERSION_KEY = "godLaffer_version";

    // ==================== VERSION CHECK ====================
    const CURRENT_VERSION = GM_getValue(VERSION_KEY, "0.0.0");

    async function checkForUpdate() {
        try {
            const res = await fetch(UPDATE_URL + "?t=" + Date.now());
            if (!res.ok) return null;
            const manifest = await res.json();
            return manifest;
        } catch (e) {
            return null;
        }
    }

    async function downloadMod(url) {
        try {
            const res = await fetch(url + "?t=" + Date.now());
            if (!res.ok) return null;
            return await res.text();
        } catch (e) {
            return null;
        }
    }

    // ==================== INJECT MOD ====================
    function injectMod(code) {
        const script = document.createElement('script');
        script.textContent = code;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    }

    // ==================== MAIN FLOW ====================
    async function main() {
        // Try to get cached mod
        let modCode = GM_getValue(STORAGE_KEY, null);

        // Check for update
        const manifest = await checkForUpdate();
        if (manifest && manifest.version > CURRENT_VERSION) {
            console.log(`[God Laffer] New version ${manifest.version} available! Downloading...`);
            const newCode = await downloadMod(MOD_URL_BASE + manifest.url.split('/').pop());
            if (newCode) {
                GM_setValue(STORAGE_KEY, newCode);
                GM_setValue(VERSION_KEY, manifest.version);
                modCode = newCode;
                console.log(`[God Laffer] Updated to v${manifest.version}`);
            }
        }

        // Inject mod
        if (modCode) {
            injectMod(modCode);
        } else {
            console.error("[God Laffer] No mod code available. Check UPDATE_URL.");
        }
    }

    // GM_getValue/GM_setValue polyfill for non-Tampermonkey environments
    if (typeof GM_getValue === 'undefined') {
        window.GM_getValue = function(key, defaultVal) {
            try {
                const val = localStorage.getItem('gm_' + key);
                return val !== null ? JSON.parse(val) : defaultVal;
            } catch(e) { return defaultVal; }
        };
        window.GM_setValue = function(key, val) {
            try {
                localStorage.setItem('gm_' + key, JSON.stringify(val));
            } catch(e) {}
        };
    }

    main();
})();
