const GITHUB_API = 'https://api.github.com';
const OWNER = 'gpldroid';
const REPO = 'todroid';
const WORKFLOW = 'android-build.yml';
const API_VERSION = '2026-03-10';

function json(res, status, body) {
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not configured on the server.');
  return {
    Accept: 'application/vnd.github+json',
    Authorization: 'Bearer ' + token,
    'X-GitHub-Api-Version': API_VERSION
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'Method not allowed.' });
  }

  const runId = String(req.query.run_id || '').trim();
  if (!/^\d+$/.test(runId)) return json(res, 400, { error: 'Invalid workflow run ID.' });

  try {
    const runResponse = await fetch(
      GITHUB_API + '/repos/' + OWNER + '/' + REPO + '/actions/runs/' + encodeURIComponent(runId),
      { headers: githubHeaders(), cache: 'no-store' }
    );

    if (!runResponse.ok) {
      const text = await runResponse.text();
      let message = text.slice(0, 250);
      try { message = JSON.parse(text).message || message; } catch (_) {}
      return json(res, runResponse.status, { error: 'Unable to read GitHub build status: ' + message });
    }

    const run = await runResponse.json();
    const result = {
      run_id: String(run.id),
      run_number: run.run_number,
      status: run.status,
      conclusion: run.conclusion || null
    };

    if (run.status !== 'completed') return json(res, 200, result);

    if (run.conclusion !== 'success') {
      result.error = 'GitHub build finished with status: ' + String(run.conclusion || 'unknown') + '.';
      return json(res, 200, result);
    }

    const tag = 'v' + encodeURIComponent(String(run.name ? '' : ''));
    // The workflow creates the release as v<version>-build-<run_number>.
    // Read the run's generated release assets without exposing the GitHub token.
    const releasesResponse = await fetch(
      GITHUB_API + '/repos/' + OWNER + '/' + REPO + '/releases?per_page=20',
      { headers: githubHeaders(), cache: 'no-store' }
    );
    if (!releasesResponse.ok) {
      return json(res, 200, Object.assign(result, { error: 'Build succeeded, but the release is still being published.' }));
    }

    const releases = await releasesResponse.json();
    const release = (releases || []).find((item) => /-build-\d+$/.test(item.tag_name || '') && item.tag_name.endsWith('-build-' + String(run.run_number)));
    if (!release) {
      return json(res, 200, Object.assign(result, { error: 'Build succeeded, but the GitHub Release is still being published.' }));
    }

    const apk = (release.assets || []).find((asset) => /\.apk$/i.test(asset.name || ''));
    if (!apk || !apk.browser_download_url) {
      return json(res, 200, Object.assign(result, { error: 'Build succeeded, but no APK release asset was found yet.' }));
    }

    return json(res, 200, Object.assign(result, {
      release_url: release.html_url,
      asset_name: apk.name,
      download_url: apk.browser_download_url
    }));
  } catch (error) {
    console.error('build-status API error:', error);
    return json(res, 500, { error: error.message || 'Unable to read the build status.' });
  }
};
