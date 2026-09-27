const GITHUB_API = 'https://api.github.com';
const OWNER = 'gpldroid';
const REPO = 'todroid';
const WORKFLOW = 'android-build.yml';
const API_VERSION = '2026-03-10';

const rate = globalThis.__todroidBuildRate || new Map();
globalThis.__todroidBuildRate = rate;

function json(res, status, body) {
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not configured on the server.');
  return {
    Accept: 'application/vnd.github+json',
    Authorization: 'Bearer ' + token,
    'X-GitHub-Api-Version': API_VERSION,
    'Content-Type': 'application/json'
  };
}

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || String(req.headers['x-real-ip'] || 'unknown');
}

function allowRequest(req) {
  const ip = clientIp(req);
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 3;
  const recent = (rate.get(ip) || []).filter((time) => now - time < windowMs);
  if (recent.length >= maxRequests) {
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) };
  }
  recent.push(now);
  rate.set(ip, recent);
  if (rate.size > 1000) {
    for (const [key, times] of rate) {
      if (!times.some((time) => now - time < windowMs)) rate.delete(key);
    }
  }
  return { ok: true };
}

function validString(value, max) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
}

function validate(input) {
  const appName = String(input.app_name || '').trim();
  const appUrl = String(input.app_url || '').trim();
  const packageName = String(input.package_name || '').trim().toLowerCase();
  const versionName = String(input.version_name || '').trim();
  const color = String(input.primary_color || '').trim();

  if (!validString(appName, 80)) return 'Invalid application name.';
  if (!/^https:\/\/[^\s]+$/i.test(appUrl) || appUrl.length > 2048) return 'The target URL must be a valid HTTPS URL.';
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(packageName)) return 'Invalid Android package name.';
  if (!/^[0-9]+(?:\.[0-9]+){0,2}$/.test(versionName) || versionName.length > 32) return 'Invalid version.';
  if (!/^#?[0-9a-f]{6}$/i.test(color)) return 'Invalid primary color.';
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed.' });
  }

  const limit = allowRequest(req);
  if (!limit.ok) {
    res.setHeader('Retry-After', String(limit.retryAfter));
    return json(res, 429, { error: 'Too many build requests. Please wait before starting another build.' });
  }

  try {
    const input = req.body && typeof req.body === 'object' ? req.body : {};
    const validationError = validate(input);
    if (validationError) return json(res, 400, { error: validationError });

    const response = await fetch(
      GITHUB_API + '/repos/' + OWNER + '/' + REPO + '/actions/workflows/' + WORKFLOW + '/dispatches',
      {
        method: 'POST',
        headers: githubHeaders(),
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            app_name: String(input.app_name).trim(),
            app_url: String(input.app_url).trim(),
            package_name: String(input.package_name).trim().toLowerCase(),
            version_name: String(input.version_name).trim(),
            primary_color: String(input.primary_color).trim(),
            camera: String(input.camera === true || input.camera === 'true'),
            location: String(input.location === true || input.location === 'true'),
            publish_release: 'true'
          }
        })
      }
    );

    if (!response.ok) {
      const text = await response.text();
      let message = text.slice(0, 300);
      try { message = JSON.parse(text).message || message; } catch (_) {}
      return json(res, response.status, { error: 'GitHub rejected the build request: ' + message });
    }

    // GitHub's dispatch endpoint returns 204 and does not return the run ID.
    // Find the newly-created run server-side so the browser never needs GitHub credentials.
    const deadline = Date.now() + 20000;
    let run = null;
    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const runsResponse = await fetch(
        GITHUB_API + '/repos/' + OWNER + '/' + REPO + '/actions/workflows/' + WORKFLOW + '/runs?branch=main&event=workflow_dispatch&per_page=10',
        { headers: githubHeaders(), cache: 'no-store' }
      );
      if (!runsResponse.ok) continue;
      const data = await runsResponse.json();
      const now = Date.now();
      run = (data.workflow_runs || []).find((item) => {
        return item.head_branch === 'main' &&
          new Date(item.created_at).getTime() >= now - 30000 &&
          item.status !== 'completed';
      });
      if (run) break;
    }

    if (!run) return json(res, 202, { accepted: true, pending: true, message: 'Build dispatched, but GitHub has not exposed the run ID yet. Please retry shortly.' });

    return json(res, 200, {
      accepted: true,
      run_id: String(run.id),
      run_number: run.run_number
    });
  } catch (error) {
    console.error('build API error:', error);
    return json(res, 500, { error: error.message || 'Unable to start the build.' });
  }
};
