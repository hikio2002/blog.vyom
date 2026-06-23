'use client';
import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, X, RefreshCw } from 'lucide-react';

/**
 * Detects ad blockers by attempting to fetch a file whose URL matches
 * patterns that every major adblocker (uBlock Origin, AdBlock Plus,
 * Brave Shields, etc.) blocks by default. If the fetch fails or is
 * intercepted, we know an adblocker is active.
 *
 * Shows a polite, dismissible banner (not a hard paywall) asking the
 * visitor to whitelist the site. Remembers the dismissal in sessionStorage
 * so it doesn't reappear on every page during the same visit.
 */
export default function AdBlockDetector() {
  const [detected, setDetected] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  const check = useCallback(async () => {
    // Skip if already dismissed this session
    if (typeof window !== 'undefined' && sessionStorage.getItem('adb-dismissed') === '1') {
      return;
    }

    let blocked = false;

    // Method 1: Fetch bait file — adblockers block URLs matching /ads/adsbygoogle*
    try {
      const res = await fetch('/ads/adsbygoogle.js?_=' + Date.now(), {
        method: 'GET',
        cache: 'no-store',
      });
      const text = await res.text();
      if (!res.ok || text.trim() === '') {
        blocked = true;
      }
    } catch {
      // fetch() throws entirely when blocked by uBlock Origin, Brave Shields etc.
      blocked = true;
    }

    // Method 2: DOM bait — insert a fake ad element and check if adblocker
    // CSS injected `display:none` or `visibility:hidden` on it.
    // This catches blockers like AdBlock Plus that allow the network request
    // but hide the resulting element via CSS rules.
    if (!blocked) {
      try {
        const bait = document.createElement('div');
        bait.setAttribute('class', 'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links ad-text adSense adBlock adContent adBanner');
        bait.setAttribute('style', 'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;');
        document.body.appendChild(bait);

        await new Promise(r => setTimeout(r, 100)); // let CSS apply

        const computed = window.getComputedStyle(bait);
        if (
          computed.getPropertyValue('display') === 'none' ||
          computed.getPropertyValue('visibility') === 'hidden' ||
          computed.getPropertyValue('opacity') === '0' ||
          bait.offsetParent === null ||
          bait.offsetHeight === 0
        ) {
          blocked = true;
        }
        document.body.removeChild(bait);
      } catch {
        // DOM method failed — ignore, rely on Method 1 result
      }
    }

    if (blocked) {
      setDetected(true);
      setTimeout(() => setVisible(true), 1500);
    }
  }, []);

  useEffect(() => {
    // Don't show on admin pages — no ads there anyway
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) return;
    // Small delay after mount — adblocker lists need a moment to kick in
    const t = setTimeout(check, 800);
    return () => clearTimeout(t);
  }, [check]);

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem('adb-dismissed', '1');
    setTimeout(() => setDetected(false), 400); // let the fade-out finish
  };

  const refresh = () => window.location.reload();

  if (!detected || dismissed) return null;

  return (
    <>
      {/* Full-page overlay — semi-transparent, not a hard block */}
      <div
        className={`fixed inset-0 z-[9999] transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-modal="true"
        role="dialog"
        aria-labelledby="adb-title"
        aria-describedby="adb-desc"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal card */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-7 border border-gray-200 dark:border-gray-700">

            {/* Dismiss button (soft option) */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-5 mx-auto">
              <ShieldAlert size={28} className="text-red-500" />
            </div>

            <h2
              id="adb-title"
              className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Ad Blocker Detected
            </h2>

            <p
              id="adb-desc"
              className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed mb-6"
            >
              Ads keep <strong className="text-gray-700 dark:text-gray-200">Vyom.quest</strong> free and help us publish more content.
              Please whitelist this site or pause your ad blocker — we don&apos;t use pop-ups, auto-play videos, or intrusive formats.
            </p>

            {/* Steps */}
            <ol className="space-y-3 mb-7 text-sm">
              {[
                'Click your ad blocker icon in the browser toolbar',
                'Select "Pause on this site" or "Whitelist vyom.quest"',
                'Reload the page and enjoy free content',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">{step}</span>
                </li>
              ))}
            </ol>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={refresh}
                className="btn-primary flex-1 gap-2 justify-center"
              >
                <RefreshCw size={15} aria-hidden="true" />
                I&apos;ve disabled it — Reload
              </button>
              <button
                onClick={dismiss}
                className="btn-secondary flex-1 text-sm justify-center"
              >
                Continue anyway
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              We respect your choice — you can still read with the blocker on.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
