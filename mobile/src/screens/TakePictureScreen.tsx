import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { BackendAIProvider } from "../services/aiProvider";
import { DiagnosisCard } from "../components/DiagnosisCard";

// Mirrors shared/constants.ts CATEGORIES (kept local: Metro bundles mobile/).
const CATEGORIES = ["Home", "Automotive", "Technology", "Yard & Garden", "Kitchen", "Workshop"];

// Spec 4: photo, upload, multi-photo (<=6), retake/delete + description prompt.
// Photos picked here are base64-encoded by BackendAIProvider before they are
// POSTed to the backend /api/diagnose (the vision provider cannot fetch
// local device files).
export const TakePictureSpec = { maxPhotos: 6, actions: ["take", "upload", "multi", "flash", "crop", "rotate", "retake", "delete", "describe"] };

export function TakePictureScreen({ onDiagnosis, onBack }: { onDiagnosis?: (d: any) => void; onBack?: () => void }) {
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState<string>(CATEGORIES[0]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [diagnosis, setDiagnosis] = React.useState<any>(null);

  async function addFromLibrary() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { setError("Photo access was not granted."); return; }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsMultipleSelection: true, selectionLimit: TakePictureSpec.maxPhotos, quality: 0.7 });
    if (!r.canceled) setPhotos((p) => [...p, ...r.assets.map((a) => a.uri)].slice(0, TakePictureSpec.maxPhotos));
  }

  async function addFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { setError("Camera access was not granted."); return; }
    const r = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!r.canceled) setPhotos((p) => [...p, r.assets[0].uri].slice(0, TakePictureSpec.maxPhotos));
  }

  async function analyze() {
    setError("");
    if (description.trim().length < 3) { setError("Describe the problem in a few words first."); return; }
    setBusy(true);
    try {
      const d = await new BackendAIProvider().diagnose({ photoUris: photos, description: description.trim(), category });
      setDiagnosis(d);
      if (onDiagnosis) onDiagnosis(d);
    } catch (e: any) {
      setError((e && e.message) || "Diagnosis failed. The offline How-To Library still works.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={s.body} contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
      {onBack ? <TouchableOpacity onPress={onBack}><Text style={s.back}>‹ Back</Text></TouchableOpacity> : null}
      <Text style={s.h}>Take a Picture</Text>
      <View style={s.row}>
        <TouchableOpacity style={s.smallBtn} onPress={addFromCamera}><Text style={s.smallTxt}>📷 Camera</Text></TouchableOpacity>
        <TouchableOpacity style={s.smallBtn} onPress={addFromLibrary}><Text style={s.smallTxt}>🖼 Photos</Text></TouchableOpacity>
        <Text style={s.count}>{photos.length}/{TakePictureSpec.maxPhotos}</Text>
      </View>
      <View style={s.thumbs}>
        {photos.map((uri, i) => (
          <TouchableOpacity key={i} onPress={() => setPhotos((p) => p.filter((_, j) => j !== i))}>
            <Image source={{ uri }} style={s.thumb} />
            <Text style={s.remove}>tap to remove</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={s.input}
        placeholder="What is happening? (e.g. faucet drips all night)"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <View style={s.row}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[s.chip, category === c && s.chipOn]}>
            <Text style={category === c ? s.chipTxtOn : s.chipTxt}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={[s.analyze, busy && s.disabled]} onPress={analyze} disabled={busy}>
        {busy ? <ActivityIndicator color="#141414" /> : <Text style={s.analyzeTxt}>ANALYZE</Text>}
      </TouchableOpacity>
      {error ? <Text style={s.error}>{error}</Text> : null}
      {diagnosis ? <DiagnosisCard d={diagnosis} /> : null}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  body: { flex: 1, padding: 16 },
  back: { color: "#ffb300", fontSize: 16 },
  h: { color: "#fff", fontSize: 20, fontWeight: "800" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  smallBtn: { backgroundColor: "#ffb300", borderRadius: 8, padding: 10 },
  smallTxt: { fontWeight: "700", color: "#141414" },
  count: { color: "#999" },
  thumbs: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  thumb: { width: 84, height: 84, borderRadius: 8 },
  remove: { color: "#999", fontSize: 10, textAlign: "center" },
  input: { backgroundColor: "#1b1b1b", color: "#fff", borderRadius: 8, padding: 12, minHeight: 64, textAlignVertical: "top" },
  chip: { borderColor: "#ffb300", borderWidth: 1, borderRadius: 16, paddingVertical: 6, paddingHorizontal: 10 },
  chipOn: { backgroundColor: "#ffb300" },
  chipTxt: { color: "#ffb300" },
  chipTxtOn: { color: "#141414", fontWeight: "700" },
  analyze: { backgroundColor: "#ffb300", borderRadius: 12, padding: 14, alignItems: "center" },
  disabled: { opacity: 0.6 },
  analyzeTxt: { fontWeight: "800", fontSize: 16, color: "#141414" },
  error: { color: "#ff5252" },
});
