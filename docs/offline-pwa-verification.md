# Offline PWA verification

Date: 2026-08-17

The primary Noum List page and the `offline.html` fallback were rendered at a 1280×720 viewport. Both maintain the dark-only Noum List visual system, including readable Arabic RTL copy, mint accents, and no white surfaces.

The production build succeeded after adding the service-worker registration, manifest icon, cache shell, and offline fallback. The PWA test suite also verifies that the application shell excludes API requests from the cache strategy.
