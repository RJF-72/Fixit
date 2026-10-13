import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, AccessibilityInfo } from "react-native";

// Spec 3/38: TAKE A PICTURE / FIX SOMETHING / ASK FIXIT / QUICK FIX + library + projects
export function HomeScreen({ tab }: { tab: string }) {
  if (tab !== "Home") return <View style={s.body}><Text style={s.h}>{tab} (MVP placeholder — wired in v1)</Text></View>;
  const Btn = ({ e, t, d }: any) => (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={t} style={s.btn}>
      <Text style={s.e}>{e}</Text><Text style={s.t}>{t}</Text><Text style={s.d}>{d}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={s.body}>
      <Btn e={"\uD83D\uDCF7"} t="TAKE A PICTURE" d="Photo the problem, describe it, get steps" />
      <Btn e={"\uD83D\uDD27"} t="FIX SOMETHING" d="Guided troubleshooting by category" />
      <Btn e={"\uD83D\uDCAC"} t="ASK FIXIT" d="What is wrong? What do I need?" />
      <Btn e={"\u26A1"} t="QUICK FIX" d="Leaking? Noisy? Won\u2019t start? Start here" />
      <Btn e={"\uD83D\uDCDA"} t="HOW-TO LIBRARY" d="Searchable offline-first guides" />
      <Btn e={"\uD83D\uDCC1"} t="MY PROJECTS" d="Photos, diagnosis, steps, cost" />
      <Text style={s.price}>FIXIT Lifetime $7.99 — Own It Forever. No subscription.</Text>
    </View>
  );
}
const s = StyleSheet.create({
  body: { flex: 1, padding: 16, gap: 10 },
  h: { color: "#fff", fontSize: 16 },
  btn: { backgroundColor: "#ffb300", borderRadius: 12, padding: 14, alignItems: "center" },
  e: { fontSize: 26 }, t: { fontSize: 18, fontWeight: "800" }, d: { fontSize: 12 },
  price: { color: "#fff", textAlign: "center", marginTop: 8 }
});
