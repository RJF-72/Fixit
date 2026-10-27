import React from "react";
import { SafeAreaView, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { HomeScreen } from "./src/screens/HomeScreen";
import { TakePictureScreen } from "./src/screens/TakePictureScreen";
import { WalkthroughScreen } from "./src/screens/WalkthroughScreen";
import { UnlockScreen } from "./src/screens/UnlockScreen";

// MVP entry: bottom nav = Home | Library | Projects | Favorites | Settings
// Home flows: TAKE A PICTURE -> camera/describe -> diagnosis (inline) ->
// walkthrough; price line -> unlock/restore (RevenueCat + server verify).
type View_ = "tabs" | "camera" | "walkthrough" | "unlock";
export default function App() {
  const [tab, setTab] = React.useState("Home");
  const [view, setView] = React.useState<View_>("tabs");
  const [diagnosis, setDiagnosis] = React.useState<any>(null);
  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}><Text style={s.logo}>FIXIT</Text><Text style={s.tag}>See It. Ask It. Fix It.</Text></View>
      {view === "camera" ? (
        <>
          <TakePictureScreen onBack={() => setView("tabs")} onDiagnosis={setDiagnosis} />
          {diagnosis ? (
            <TouchableOpacity style={s.walkBtn} onPress={() => setView("walkthrough")}>
              <Text style={s.walkTxt}>WALK THROUGH THE REPAIR</Text>
            </TouchableOpacity>
          ) : null}
        </>
      ) : view === "walkthrough" ? (
        <WalkthroughScreen diagnosis={diagnosis} onBack={() => setView("camera")} onStuck={() => setView("camera")} />
      ) : view === "unlock" ? (
        <UnlockScreen onBack={() => setView("tabs")} />
      ) : (
        <HomeScreen tab={tab} onTakePicture={() => { setDiagnosis(null); setView("camera"); }} onUnlock={() => setView("unlock")} />
      )}
      <View style={s.nav}>{["Home","Library","Projects","Favorites","Settings"].map(t => (
        <TouchableOpacity key={t} onPress={() => { setTab(t); setView("tabs"); }} style={s.navBtn}><Text style={[s.navTxt, tab===t && view==="tabs" && s.navOn]}>{t}</Text></TouchableOpacity>
      ))}</View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#141414" },
  header: { alignItems: "center", padding: 12, backgroundColor: "#1b1b1b" },
  logo: { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: 4 },
  tag: { color: "#ffb300", fontSize: 12 },
  walkBtn: { backgroundColor: "#ffb300", margin: 12, borderRadius: 12, padding: 14, alignItems: "center" },
  walkTxt: { fontWeight: "800", color: "#141414" },
  nav: { flexDirection: "row", justifyContent: "space-around", padding: 10, backgroundColor: "#1b1b1b" },
  navBtn: { padding: 8 }, navTxt: { color: "#999" }, navOn: { color: "#ffb300", fontWeight: "700" }
});
