import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { PRODUCT, FULL, checkEntitlement, purchaseLifetime, restorePurchaseState, EntitlementState } from "../services/purchases";

// $7.99 lifetime unlock (spec 25-27): buy via Play Billing / StoreKit
// (RevenueCat), restore, and show the *server-verified* entitlement state.
// When purchases are not configured in this build, the screen says so
// plainly instead of showing a fake paywall.
export function UnlockScreen({ onBack }: { onBack?: () => void }) {
  const [state, setState] = React.useState<EntitlementState | null>(null);
  const [busy, setBusy] = React.useState("");

  React.useEffect(() => {
    checkEntitlement().then(setState).catch(() => setState(null));
  }, []);

  async function run(label: string, fn: () => Promise<EntitlementState>) {
    setBusy(label);
    try { setState(await fn()); } catch (e: any) {
      setState({ configured: true, storeOwns: false, entitled: false, message: (e && e.message) || "Purchase failed — nothing was charged." });
    } finally { setBusy(""); }
  }

  return (
    <View style={s.body}>
      {onBack ? <TouchableOpacity onPress={onBack}><Text style={s.back}>‹ Back</Text></TouchableOpacity> : null}
      <Text style={s.h}>FixIt Lifetime — {PRODUCT.price}</Text>
      <Text style={s.txt}>One-time purchase. No subscription. Own it forever.</Text>
      {FULL.map((f) => <Text key={f} style={s.item}>• {f}</Text>)}
      {state === null ? <ActivityIndicator color="#ffb300" /> : (
        <Text style={state.entitled ? s.ok : s.note}>
          {state.entitled ? "✓ Lifetime unlock is active on this device." : state.message}
        </Text>
      )}
      <TouchableOpacity style={[s.btn, !!busy && s.disabled]} disabled={!!busy} onPress={() => run("buy", purchaseLifetime)}>
        <Text style={s.btnTxt}>{busy === "buy" ? "WORKING…" : "BUY LIFETIME — " + PRODUCT.price}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.restoreBtn, !!busy && s.disabled]} disabled={!!busy} onPress={() => run("restore", restorePurchaseState)}>
        <Text style={s.restoreTxt}>{busy === "restore" ? "WORKING…" : "RESTORE PURCHASE"}</Text>
      </TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  body: { flex: 1, padding: 16, gap: 10 },
  back: { color: "#ffb300", fontSize: 16 },
  h: { color: "#fff", fontSize: 20, fontWeight: "800" },
  txt: { color: "#ddd" },
  item: { color: "#ddd" },
  ok: { color: "#7CFC9A", fontWeight: "700" },
  note: { color: "#ffb300" },
  btn: { backgroundColor: "#ffb300", borderRadius: 12, padding: 14, alignItems: "center", marginTop: 8 },
  btnTxt: { fontWeight: "800", color: "#141414" },
  disabled: { opacity: 0.6 },
  restoreBtn: { borderColor: "#ffb300", borderWidth: 1, borderRadius: 12, padding: 14, alignItems: "center" },
  restoreTxt: { color: "#ffb300", fontWeight: "800" },
});
