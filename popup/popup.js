const statusEl = document.getElementById('status');

document.getElementById('loginBtn').addEventListener('click', () => {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    if (chrome.runtime.lastError || !token) {
      statusEl.textContent = '認証失敗: ' + (chrome.runtime.lastError?.message ?? '不明なエラー');
      statusEl.className = 'error';
      return;
    }
    fetchNextEvent(token);
  });
});

document.getElementById('testBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'testFish' });
  window.close();
});

// 起動時にトークンがあれば次の予定を表示
chrome.identity.getAuthToken({ interactive: false }, (token) => {
  if (chrome.runtime.lastError || !token) {
    statusEl.textContent = '未ログイン';
    return;
  }
  fetchNextEvent(token);
});

async function fetchNextEvent(token) {
  const now = new Date();
  const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '1',
  });

  let res;
  try {
    res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch {
    statusEl.textContent = 'ネットワークエラー';
    statusEl.className = 'error';
    return;
  }

  if (!res.ok) {
    statusEl.textContent = `APIエラー (${res.status})`;
    statusEl.className = 'error';
    return;
  }

  const data = await res.json();
  const event = data.items?.[0];

  if (!event) {
    statusEl.textContent = '本日の予定なし';
    statusEl.className = '';
    return;
  }

  const start = new Date(event.start.dateTime ?? event.start.date);
  const time = start.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  statusEl.textContent = `次: ${event.summary} (${time})`;
  statusEl.className = '';
}
