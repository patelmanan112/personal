import dns from 'dns/promises';

async function getDirectUri() {
  try {
    const srvs = await dns.resolveSrv('_mongodb._tcp.cluster0.gndr5q0.mongodb.net');
    console.log("SRV Records:", srvs);
    const hosts = srvs.map(s => `${s.name}:${s.port}`).join(',');
    const directUri = `mongodb://manan:manan0112@${hosts}/unity_a_live_group?ssl=true&replicaSet=atlas-2w6tfe-shard-0&authSource=admin&retryWrites=true&w=majority`;
    console.log("\nDIRECT SEEDLIST URI:\n", directUri);
  } catch (err) {
    console.error("DNS Error:", err);
  }
}

getDirectUri();
