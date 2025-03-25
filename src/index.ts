// generated here https://chatgpt.com/share/67e2bd6a-dbac-8003-8612-6bd3b64d68c1
// 
// // src/index.ts
export interface Env {}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const cf = (request as any).cf || {};
    const ip = request.headers.get('cf-connecting-ip') || 'Unknown';

    // Build connection info
    const connectionInfo = {
      'Client IP': ip,
      'HTTP Version': request.headers.get('cf-http-version') || cf.httpProtocol || 'Unknown',
      'Client AS Number': cf.asn || 'Unknown',
      'Client AS Name': cf.asOrganization || 'Unknown',
      'Cloudflare Colo': cf.colo || 'Unknown',
      'TLS Version': cf.tlsVersion || 'Unknown',
      'TLS Cipher': cf.tlsCipher || 'Unknown',
    };

    const locationInfo = {
      'Country': cf.country || 'Unknown',
      'Region': cf.region || 'Unknown',
      'City': cf.city || 'Unknown',
      'Zip Code': cf.postalCode || 'Unknown',
      'Coordinates': `${cf.latitude || 'N/A'}, ${cf.longitude || 'N/A'}`,
      'Timezone': cf.timezone || 'Unknown',
    };

    const html = buildHTML(connectionInfo, locationInfo);
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  },
};

function buildHTML(connectionInfo: Record<string, string>, locationInfo: Record<string, string>): string {
  const now = new Date();
  const timestamp = now
    .toLocaleTimeString('en-GB', { hour12: false })
    .replace(/:/g, '_') +
    '_' +
    now.toLocaleDateString('en-GB').replace(/\//g, '_');

  const connectionRows = Object.entries(connectionInfo)
    .map(([k, v]) => `<div class="row"><div class="key">${k}</div><div class="value">${v}</div></div>`)
    .join('');
  const locationRows = Object.entries(locationInfo)
    .map(([k, v]) => {
      if (k === 'Coordinates' && v !== 'N/A, N/A') {
        const [lat, lon] = v.split(', ');
        return `<div class="row"><div class="key">${k}</div><div class="value"><a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}" target="_blank">${v}</a></div></div>`;
      }
      return `<div class="row"><div class="key">${k}</div><div class="value">${v}</div></div>`;
    })
    .join('');

  const randSubdomain = Array.from(crypto.getRandomValues(new Uint8Array(63)))
    .map(n => 'abcdefghijklmnopqrstuvwxyz0123456789'[n % 36])
    .join('');

  return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>IP and DNS information</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, sans-serif;
      background-color: #F5F6F8;
      color: #000;
    }

    header {
      background: #F5F6F8;
      padding: 1rem;
      text-align: center;
      font-size: 2rem;
      font-weight: bold;
      color: #F6821F;
    }

    .tiles {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 960px;
      margin: 0 auto;
      padding: 1rem;
    }

    .tile {
      background: #fff;
      padding: 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .tile h2 {
      font-size: 1.25rem;
      border-bottom: 2px solid #F6821F;
      margin-bottom: 1rem;
      color: #000;
    }

    .row {
      display: grid;
      grid-template-columns: 1fr 2fr;
      margin-bottom: 0.5rem;
    }

    .key {
      font-weight: 600;
      color: #000;
    }

    .value {
      color: #2A2E35;
      word-break: break-word;
    }

    .value a {
      color: #2C7DF5;
      text-decoration: none;
    }

    .value a:hover {
      text-decoration: underline;
    }

    button#shareBtn {
      background: #F6821F;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      cursor: pointer;
      margin: 1rem auto;
      display: block;
      border-radius: 0.25rem;
    }

    @media (min-width: 600px) {
      .tiles {
        flex-direction: row;
        flex-wrap: wrap;
      }

      .tile {
        flex: 1 1 30%;
      }
    }
  </style>
</head>
<body>
  <header>IP and DNS information</header>
  <div class="tiles">
    <div class="tile">
      <h2>Connection Info</h2>
      ${connectionRows}
    </div>
    <div class="tile">
      <h2>IP Location Info</h2>
      ${locationRows}
    </div>
    <div class="tile" id="dns-tile">
      <h2>Your DNS Resolver</h2>
      <div id="dns-content"><em>Loading...</em></div>
    </div>
  </div>

  <button id="shareBtn">Share</button>

  <script>
    async function fetchDNSInfo() {
      const randomSub = '${randSubdomain}';
      try {
        const res = await fetch('https://' + randomSub + '.dns.ipanddns.com', { headers: { accept: 'application/json' } });
        const data = await res.json();
        const info = {
          'Resolver IP Address': data.ip,
          'AS Organization': data.asorg,
          'ASN': data.asnum,
          'City': data.city,
          'Coordinates': data.lat && data.lon ? \`\${data.lat}, \${data.lon}\` : 'Unknown',
          'EDNS0 Info': data.edns
        };

        const html = Object.entries(info).map(([k, v]) => {
          if (k === 'Coordinates' && v !== 'Unknown') {
            const [lat, lon] = v.split(', ');
            return \`<div class="row"><div class="key">\${k}</div><div class="value"><a href="https://www.openstreetmap.org/?mlat=\${lat}&mlon=\${lon}" target="_blank">\${v}</a></div></div>\`;
          } else {
            return \`<div class="row"><div class="key">\${k}</div><div class="value">\${v}</div></div>\`;
          }
        }).join('');
        document.getElementById('dns-content').innerHTML = html;
      } catch (err) {
        document.getElementById('dns-content').innerHTML = '<div class="value">Failed to load DNS info.</div>';
      }
    }

    function exportJSON() {
      const tiles = document.querySelectorAll('.tile');
      const result = {};
      tiles.forEach(tile => {
        const section = tile.querySelector('h2')?.textContent || 'Unknown Section';
        result[section] = {};
        tile.querySelectorAll('.row').forEach(row => {
          const key = row.querySelector('.key')?.textContent || '';
          const val = row.querySelector('.value')?.textContent || '';
          result[section][key] = val;
        });
      });
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'ip-and-dns.com_${timestamp}.json';
      a.click();
    }

    document.getElementById('shareBtn').addEventListener('click', exportJSON);
    fetchDNSInfo();
  </script>
</body>
</html>
`;
}
