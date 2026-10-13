import React from "react";
import { View, Text } from "react-native";
// Spec 7/8: WHAT IT IS / WHAT IS WRONG / WHAT YOU NEED / STEPS / DIFFICULTY / COST + confidence + call-a-pro
export function DiagnosisCard({ d }: { d: any }) {
  return (<View><Text>{d.problem}</Text><Text>{d.difficulty} · ${d.costMin}-${d.costMax}</Text></View>);
}
