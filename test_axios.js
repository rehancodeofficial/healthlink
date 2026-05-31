// test_axios.js
async function main() {
  const axios = (await import('axios')).default;
  const api = axios.create({ baseURL: "https://curevirtual-2-production-ee33.up.railway.app/api" });
  console.log('GET /api/doctor/list ->', api.getUri({ url: "/api/doctor/list" }));
  console.log('GET /schedule/slots ->', api.getUri({ url: "/schedule/slots" }));
}
main();
