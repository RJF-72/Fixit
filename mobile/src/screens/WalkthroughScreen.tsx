import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// Spec 10/11: Step X of N + [Show Me][Done][I am Stuck] — stuck allows new photo + question
export function nextStep(i: number, total: number) { return Math.min(i + 1, total); }
export const STUCK_ACTIONS = ["take another photo", "ask a question", "describe what happened"];

export function WalkthroughScreen({ diagnosis, onBack, onStuck }: { diagnosis: any; onBack?: () => void; onStuck?: () => void }) {
  const steps: any[] = (diagnosis && diagnosis.steps) || [];
  const [i, setI] = React.useState(0);
  const [stuck, setStuck] = React.useState(false);
  if (!steps.length) {
    return (
      <View style={s.body}>
        {onBack ? <TouchableOpacity onPress={onBack}><Text style={s.back}>‹ Back</Text></TouchableOpacity> : null}
        <Text style={s.h}>Walkthrough</Text>
        <Text style={s.txt}>Run a diagnosis first — its steps appear here one at a time.</Text>
      </View>
    );
  }
  const step = steps[Math.min(i, steps.length - 1)];
  const done = i >= steps.length - 1;
  return (
    <View style={s.body}>
      {onBack ? <TouchableOpacity onPress={onBack}><Text style={s.back}>‹ Back</Text></TouchableOpacity> : null}
      <Text style={s.h}>Step {Math.min(i + 1, steps.length)} of {steps.length}</Text>
      <Text style={s.title}>{step.title}</Text>
      <Text style={s.txt}>{step.detail}</Text>
      {diagnosis.safetyWarning ? <Text style={s.safety}>{diagnosis.safetyWarning}</Text> : null}
      <TouchableOpacity style={s.btn} onPress={() => setI((v) => nextStep(v, steps.length - 1))} disabled={done}>
        <Text style={s.btnTxt}>{done ? "LAST STEP" : "DONE — NEXT STEP"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.stuckBtn} onPress={() => setStuck(true)}>
        <Text style={s.stuckTxt}>I AM STUCK</Text>
      </TouchableOpacity>
      {stuck ? (
        <View style={s.stuckBox}>
          <Text style={s.txt}>Stuck? You can:</Text>
          {STUCK_ACTIONS.map((a) => <Text key={a} style={s.txt}>• {a}</Text>)}
          {onStuck ? (
            <TouchableOpacity style={s.btn} onPress={onStuck}><Text style={s.btnTxt}>TAKE ANOTHER PHOTO</Text></TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
const s = StyleSheet.create({
  body: { flex: 1, padding: 16, gap: 10 },
  back: { color: "#ffb300", fontSize: 16 },
  h: { color: "#ffb300", fontSize: 14, fontWeight: "700" },
  title: { color: "#fff", fontSize: 22, fontWeight: "800" },
  txt: { color: "#ddd", fontSize: 16 },
  safety: { color: "#ff5252", fontWeight: "800" },
  btn: { backgroundColor: "#ffb300", borderRadius: 12, padding: 14, alignItems: "center", marginTop: 8 },
  btnTxt: { fontWeight: "800", color: "#141414" },
  stuckBtn: { borderColor: "#ffb300", borderWidth: 1, borderRadius: 12, padding: 14, alignItems: "center" },
  stuckTxt: { color: "#ffb300", fontWeight: "800" },
  stuckBox: { backgroundColor: "#1b1b1b", borderRadius: 12, padding: 12, gap: 4 },
});
