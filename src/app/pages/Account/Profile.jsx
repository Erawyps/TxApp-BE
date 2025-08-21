import { useEffect, useState } from "react";
import { Page } from "components/shared/Page";
import { UserProfile, useAuth, useUser } from "@clerk/clerk-react";

export default function AccountProfile() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const [me, setMe] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadMe() {
    try {
      setLoading(true);
      setSyncResult(null);
      const token = await getToken();
      const res = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      setMe(json);
    } catch (e) {
      setMe({ error: e?.message || String(e) });
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    try {
      setLoading(true);
      const token = await getToken();
      const payload = {
        email: user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress,
        prenom: user?.firstName || "",
        nom: user?.lastName || user?.username || "",
        role: "user",
      };
      const res = await fetch("/api/users/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setSyncResult(json);
    } catch (e) {
      setSyncResult({ error: e?.message || String(e) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isSignedIn) {
      loadMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  return (
    <Page title="Mon compte">
      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-3">Profil & sessions</h2>
          <div className="rounded border border-gray-200 dark:border-gray-700 p-2">
            <UserProfile routing="path" path="/account/profile" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-3">Identité API (Worker)</h2>
          <div className="flex gap-2 mb-3">
            <button onClick={loadMe} className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700">Rafraîchir /api/me</button>
            <button onClick={handleSync} className="px-3 py-1.5 rounded bg-blue-600 text-white">Synchroniser vers la DB</button>
            {loading && <span className="text-sm text-gray-500">Chargement…</span>}
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className="text-sm text-gray-500">Réponse /api/me</p>
              <pre className="text-xs overflow-auto bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 max-h-64">{JSON.stringify(me, null, 2)}</pre>
            </div>
            <div>
              <p className="text-sm text-gray-500">Résultat de synchronisation</p>
              <pre className="text-xs overflow-auto bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 max-h-64">{JSON.stringify(syncResult, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
