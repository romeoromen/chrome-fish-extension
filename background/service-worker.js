const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const POLL_ALARM = 'poll';
const FISH_PREFIX = 'fish-';

// 拡張インストール時にポーリングアラームをセット
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(POLL_ALARM, { periodInMinutes: 1 });
  pollCalendar();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === POLL_ALARM) {
    await pollCalendar();
  } else if (alarm.name.startsWith(FISH_PREFIX)) {
    await sendFishToActiveTab();
  }
});

// popup から手動テスト用（return true でWorkerを非同期処理完了まで維持）
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'testFish') {
    sendFishToActiveTab().then(() => sendResponse({}));
    return true;
  }
});

async function getToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(new Error(chrome.runtime.lastError?.message ?? 'no token'));
      } else {
        resolve(token);
      }
    });
  });
}

async function pollCalendar() {
  let token;
  try {
    token = await getToken();
  } catch {
    return; // 未ログイン。次のポーリングまで待つ
  }

  const now = new Date();
  const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
  });

  let res;
  try {
    res = await fetch(`${CALENDAR_API}/calendars/primary/events?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return; // ネットワークエラー。次のポーリングまで待つ
  }

  if (!res.ok) return;

  const data = await res.json();
  const events = data.items ?? [];

  // 既存アラーム名を取得して重複セットを防ぐ
  const existing = await chrome.alarms.getAll();
  const existingNames = new Set(existing.map((a) => a.name));

  for (const event of events) {
    if (!event.start.dateTime) continue; // 全日イベントはスキップ
    const startStr = event.start.dateTime;

    const start = new Date(startStr);
    const { minutesBefore = 5 } = await chrome.storage.local.get('minutesBefore');
    const fishTime = new Date(start.getTime() - minutesBefore * 60 * 1000);
    const alarmName = `${FISH_PREFIX}${event.id}`;

    if (fishTime > now && !existingNames.has(alarmName)) {
      chrome.alarms.create(alarmName, { when: fishTime.getTime() });
    }
  }
}

async function sendFishToActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id) return;

  chrome.tabs.sendMessage(tab.id, { action: 'showFish' }).catch(() => {
    // content script が未注入のタブ（chrome:// など）は無視
  });
}
