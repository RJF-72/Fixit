import React from "react";
import { SafeAreaView, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { HomeScreen } from "./src/screens/HomeScreen";

// MVP entry: bottom nav = Home | Library | Projects | Favorites | Settings
export default function App() {
  const [tab, setTab] = React.useState("Home");
  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}><Text style={s.logo}>FIXIT</Text><Text style={s.tag}>See It. Ask It. Fix It.</Text></View>
      <HomeScreen tab={tab} />
      <View style={s.nav}>{["Home","Library","Projects","Favorites","Settings"].map(t => (
        <TouchableOpacity key={t} onPress={() => setTab(t)} style={s.navBtn}><Text style={[s.navTxt, tab===t && s.navOn]}>{t}</Text></TouchableOpacity>
      ))}</View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#141414" },
  header: { alignItems: "center", padding: 12, backgroundColor: "#1b1b1b" },
  logo: { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: 4 },
  tag: { color: "#ffb300", fontSize: 12 },
  nav: { flexDirection: "row", justifyContent: "space-around", padding: 10, backgroundColor: "#1b1b1b" },
  navBtn: { padding: 8 }, navTxt: { color: "#999" }, navOn: { color: "#ffb300", fontWeight: "700" }
});
