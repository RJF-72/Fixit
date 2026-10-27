import React from "react";
import { View, Text, StyleSheet } from "react-native";
// Spec 7/8: WHAT IT IS / WHAT IS WRONG / WHAT YOU NEED / STEPS / DIFFICULTY / COST + confidence + call-a-pro
// A response with stub:true is a labeled demo sample, never presented as a
// real analysis of the user's photos.
export function DiagnosisCard({ d }: { d: any }) {
  if (!d) return null;
  return (
    <View style={s.card}>
      {d.stub ? (
        <View style={s.demoBanner}>
          <Text style={s.demoTxt}>DEMO MODE — sample diagnosis, not an analysis of your photo.</Text>
          {d.notice ? <Text style={s.demoSub}>{d.notice}</Text> : null}
        </View>
      ) : null}
      {d.safetyWarning ? <Text style={s.safety}>{d.safetyWarning}</Text> : null}
      <Text style={s.problem}>{d.problem}</Text>
      <Text style={s.meta}>
        {d.difficulty} · ${d.costMin}-${d.costMax} · {d.minutesMin}-{d.minutesMax} min · confidence: {d.confidence}
      </Text>
      {d.causes && d.causes.length ? (
        <>
          <Text style={s.h}>Likely causes</Text>
          {d.causes.map((c: string, i: number) => <Text key={i} style={s.item}>• {c}</Text>)}
        </>
      ) : null}
      {d.tools && d.tools.length ? (
        <>
          <Text style={s.h}>Tools</Text>
          {d.tools.map((t: string, i: number) => <Text key={i} style={s.item}>• {t}</Text>)}
        </>
      ) : null}
      {d.materials && d.materials.length ? (
        <>
          <Text style={s.h}>Materials</Text>
          {d.materials.map((m: string, i: number) => <Text key={i} style={s.item}>• {m}</Text>)}
        </>
      ) : null}
      {d.steps && d.steps.length ? (
        <>
          <Text style={s.h}>Steps</Text>
          {d.steps.map((st: any) => (
            <Text key={st.n} style={s.item}>{st.n}. {st.title} — {st.detail}</Text>
          ))}
        </>
      ) : null}
      {d.test ? <Text style={s.line}><Text style={s.h}>Test it: </Text>{d.test}</Text> : null}
      {d.callPro ? <Text style={s.line}><Text style={s.h}>Call a pro: </Text>{d.callPro}</Text> : null}
      {d.quota ? (
        <Text style={s.quota}>
          {d.quota.tier === "full" ? "Lifetime" : "Free preview"}: {d.quota.remaining} of {d.quota.limit} analyses left this month
        </Text>
      ) : null}
    </View>
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: "#1b1b1b", borderRadius: 12, padding: 14, gap: 4 },
  demoBanner: { backgroundColor: "#ffb300", borderRadius: 8, padding: 10, marginBottom: 8 },
  demoTxt: { color: "#141414", fontWeight: "800" },
  demoSub: { color: "#141414", fontSize: 12 },
  safety: { color: "#ff5252", fontWeight: "800" },
  problem: { color: "#fff", fontSize: 18, fontWeight: "800" },
  meta: { color: "#ffb300", fontSize: 13 },
  h: { color: "#fff", fontWeight: "700", marginTop: 8 },
  item: { color: "#ddd" },
  line: { color: "#ddd", marginTop: 6 },
  quota: { color: "#999", fontSize: 12, marginTop: 8 },
});
