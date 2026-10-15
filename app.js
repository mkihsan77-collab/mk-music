const storageKey = "to4to-links-v1";
const supportedHosts = [
  "spotify.com",
  "youtube.com",
  "youtu.be",
  "music.apple.com",
  "soundcloud.com",
  "bandcamp.com",
];

const form = document.querySelector("#shorten-form");
const urlInput = document.querySelector("#music-url");
const message = document.querySelector("#form-message");
const result = document.querySelector("#result");
const shortLink = document.querySelector("#short-link");
const copyButton = document.querySelector("#copy-button");
const linksList = document.querySelector("#links-list");
const emptyState = document.querySelector("#empty-state");
const clearButton = document.querySelector("#clear-links");

function readLinks() {
  try {
    const links = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(links) ? links : [];
  } catch {
    return [];
  }
}

function saveLinks(links) {
  localStorage.setItem(storageKey, JSON.stringify(links));
}

function isSupportedMusicUrl(value) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return url.protocol === "https:" && supportedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function makeCode() {
  return Math.random().toString(36).slice(2, 8);
}

function shortUrl(code) {
  return `${window.location.origin}${window.location.pathname}#/s/${code}`;
}

function setMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function renderLinks() {
  const links = readLinks();
  linksList.replaceChildren();
  emptyState.hidden = links.length > 0;
  clearButton.hidden = links.length === 0;

  for (const link of links) {
    const row = document.createElement("div");
    row.className = "link-item";

    const original = document.createElement("a");
    original.className = "link-original";
    original.href = link.destination;
    original.target = "_blank";
    original.rel = "noreferrer";
    original.textContent = link.destination;

    const shortened = document.createElement("a");
    shortened.className = "link-short";
    shortened.href = shortUrl(encodeURIComponent(link.code));
    shortened.textContent = shortUrl(link.code);

    const copy = document.createElement("button");
    copy.className = "link-copy";
    copy.type = "button";
    copy.textContent = "Copy";
    copy.addEventListener("click", () => copyText(shortUrl(link.code), copy));

    row.append(original, shortened, copy);
    linksList.append(row);
  }
}

async function copyText(value, button) {
  try {
    await navigator.clipboard.writeText(value);
    const originalText = button.textContent;
    button.textContent = "Copied";
    window.setTimeout(() => { button.textContent = originalText; }, 1400);
  } catch {
    setMessage("Clipboard access was blocked. Select and copy the link instead.", true);
  }
}

function resolveShortLink() {
  const match = window.location.pathname.match(/^\/(?:mk-music-url|s)\/([a-z0-9]+)\/?$/i)
    ?? window.location.hash.match(/^#\/(?:mk-music-url|s)\/([a-z0-9]+)\/?$/i);
  if (!match) return false;

  const link = readLinks().find((item) => item.code === match[1]);
  document.body.replaceChildren();
  document.body.className = "redirect-page";

  if (!link) {
    document.body.innerHTML = '<main><p class="eyebrow">MK MUSIC URL / LINK NOT FOUND</p><h1>This link is not in this browser.</h1><a href="/">Make a new music link →</a></main>';
    return true;
  }

  document.body.innerHTML = '<main><p class="eyebrow">MK MUSIC URL / NOW PLAYING</p><h1>Taking you to your music...</h1><a id="continue-link">Continue to track →</a></main>';
  document.querySelector("#continue-link").href = link.destination;
  window.location.replace(link.destination);
  return true;
}

if (!resolveShortLink()) {
  renderLinks();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const destination = urlInput.value.trim();

    if (!isSupportedMusicUrl(destination)) {
      setMessage("Enter a valid HTTPS link from one of the supported music platforms.", true);
      urlInput.focus();
      return;
    }

    const links = readLinks();
    let code = makeCode();
    while (links.some((link) => link.code === code)) code = makeCode();
    links.unshift({ code, destination });
    saveLinks(links.slice(0, 12));

    const generatedUrl = shortUrl(code);
    shortLink.href = generatedUrl;
    shortLink.textContent = generatedUrl;
    result.hidden = false;
    urlInput.value = "";
    setMessage("Invite link ready. Open it here to test the redirect.");
    renderLinks();
  });

  copyButton.addEventListener("click", () => copyText(shortLink.href, copyButton));
  clearButton.addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    result.hidden = true;
    renderLinks();
  });
}