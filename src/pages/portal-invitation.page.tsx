import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { axios, type ErrorWithMessage } from "@/configs/axios.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PortalInvitationPage() {
  const { t } = useTranslation();
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get("token") || "");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search); }, []);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;
    if (password !== confirmation) { setError("mismatch"); return; }
    setPending(true); setError("");
    try {
      await axios.post("/portal-invitations/accept", { token, password });
      setAccepted(true); setPassword(""); setConfirmation("");
    } catch (reason) {
      setError((reason as ErrorWithMessage).response?.data.code === "INVITATION_INVALID" ? "invalid" : "error");
    } finally { setPending(false); }
  };
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-md space-y-8">
        <p className="text-xl font-semibold tracking-tight">Flowlio</p>
        <section className="space-y-6 rounded-xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-semibold">{t(`portalInvite.${accepted ? "accepted" : "welcome"}`)}</h1>
          {accepted ? <><p className="text-muted-foreground">{t("portalInvite.signInHint")}</p><Button asChild><Link to="/auth/signin">{t("portalInvite.signIn")}</Link></Button></>
            : !token ? <p role="alert">{t("portalInvite.invalid")}</p>
              : <form onSubmit={submit} className="space-y-5">
                <p className="text-sm text-muted-foreground">{t("portalInvite.passwordHint")}</p>
                <label className="block space-y-2"><span>{t("portalInvite.password")}</span><Input type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} /></label>
                <label className="block space-y-2"><span>{t("portalInvite.confirmPassword")}</span><Input type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label>
                {error && <p role="alert" className="text-sm text-destructive">{t(`portalInvite.${error}`)}</p>}
                <Button type="submit" disabled={pending} className="w-full">{t("portalInvite.activate")}</Button>
              </form>}
        </section>
      </div>
    </main>
  );
}
