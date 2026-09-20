type ErrorCode = "UI_ERROR" | "REACT_ERROR" | "NETWORK_ERROR";
const recent = new Map<string,{ at:number; result:Promise<string | undefined> }>();
export function resetTelemetryScope() { recent.clear(); }
const release = import.meta.env.VITE_APP_VERSION || "development";
export function telemetryRoute(path: string) {
  const segments=path.split("/");
  if(segments[1]==="auth") return "auth";
  const routes:Record<string,string>={project:"projects",projects:"projects","client-management":"clients",tasks:"tasks","task-management":"tasks","time-tracking":"time",invoice:"billing","payment-links":"billing",settings:"settings"};
  if(["dashboard","clients","viewer","superadmin"].includes(segments[1])) return routes[segments[2]] || "dashboard";
  return "public";
}
/** Strict fields only: never send exception messages, stacks, URLs, cookies or form values. */
export function reportUiError(code: ErrorCode): Promise<string | undefined> {
  const route=telemetryRoute(window.location.pathname);
  const key=[code,route,release].join(":");
  const now=Date.now();
  for(const [k,v] of recent) if(now-v.at>60000) recent.delete(k);
  const existing=recent.get(key);
  if(existing) return existing.result;
  if(recent.size>=10) return Promise.resolve(undefined);
  const base=(import.meta.env.VITE_BACKEND_DOMAIN || "http://localhost:3000").replace(/\/$/,"");
  const result=fetch(base+"/api/observability/events",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({code,route,release}),signal:AbortSignal.timeout(5000)})
    .then(async response=>response.ok ? (await response.json()).correlationId as string : undefined)
    .catch(()=>undefined);
  recent.set(key,{at:now,result});
  return result;
}
export function installErrorReporting() {
  window.addEventListener("error",()=>{void reportUiError("UI_ERROR");});
  window.addEventListener("unhandledrejection",()=>{void reportUiError("UI_ERROR");});
}
