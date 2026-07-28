# Google Maps Default Language

A Tampermonkey userscript that manages the default language of Google Maps on desktop.

## Features

- On the first run:
  - If Google Maps is already using a Chinese locale (`zh-*`), the current locale is preserved.
  - If Google Maps is using a non-Chinese locale, the script switches it to Traditional Chinese by adding `hl=zh-TW` to the URL.
- On subsequent visits, the script automatically applies the remembered language.
- When you manually select another language from the Google Maps language menu, that language becomes the new default.
- The Tampermonkey menu includes commands to:
  - Set the default language to Traditional Chinese.
  - Clear the remembered language.

Google's official desktop workflow is **Google Maps → Menu → Language → select a language**. The script detects the resulting `hl` URL parameter and page-language changes.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Open the Tampermonkey dashboard and create a new userscript.
3. Copy the entire contents of [`google-maps-default-language.user.js`](./google-maps-default-language.user.js) into the editor.
4. Save the userscript.
5. Reopen [Google Maps](https://www.google.com/maps).

## How It Works

- The preferred language is stored with Tampermonkey's `GM_setValue` API.
- The script does not change the global language setting of your Google Account.
- Automatic language switching uses `location.replace()`, so it does not add an extra entry to the browser history.
- Both regular page loads and Google Maps SPA URL or `<html lang>` changes are monitored.
- User interactions are tracked briefly to distinguish a manual language change from the script's own automatic redirect.

## Supported Pages

The userscript runs on:

- `https://www.google.com/maps*`
- `https://maps.google.com/*`
- Google Maps pages on regional Google domains, such as `google.com.tw` or `google.co.jp`

## Resetting the Language

Open the Tampermonkey extension menu while viewing Google Maps, then select either:

- **Set default language to Traditional Chinese**
- **Clear remembered language**

The actual command labels are displayed in Traditional Chinese by the userscript.
