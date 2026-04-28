import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // 🔥 Ẩn luôn tab bar
        tabBarStyle: { display: "none" },
        tabBarButton: HapticTab,
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Login" }} />
      <Tabs.Screen name="manage" options={{ title: "Quản lý" }} />
      <Tabs.Screen name="orders" options={{ title: "Đơn hàng" }} />
      <Tabs.Screen name="dashboard" options={{ title: "Trang doanh thu" }} />
    </Tabs>
  );
}
// import { Tabs } from "expo-router";
// import React from "react";

// import { HapticTab } from "@/components/haptic-tab";
// import { IconSymbol } from "@/components/ui/icon-symbol";
// import { Colors } from "@/constants/theme";
// import { useColorScheme } from "@/hooks/use-color-scheme";

// export default function TabLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
//         headerShown: false,
//         tabBarButton: HapticTab,
//       }}
//     >
//       {/* Trang Login */}
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Login",
//           tabBarIcon: ({ color }: { color: string }) => (
//             <IconSymbol size={28} name="chart.bar.fill" color={color} />
//           ),
//         }}
//       />

//       {/* Quản lý: sản phẩm / danh mục / combo / voucher */}
//       <Tabs.Screen
//         name="manage"
//         options={{
//           title: "Quản lý",
//           tabBarIcon: ({ color }: { color: string }) => (
//             <IconSymbol size={28} name="square.grid.2x2.fill" color={color} />
//           ),
//         }}
//       />

//       {/* Đơn hàng */}
//       <Tabs.Screen
//         name="orders"
//         options={{
//           title: "Đơn hàng",
//           tabBarIcon: ({ color }: { color: string }) => (
//             <IconSymbol size={28} name="doc.text.fill" color={color} />
//           ),
//         }}
//       />

//       {/* Trang doanh thu */}
//       <Tabs.Screen
//         name="dashboard"
//         options={{
//           title: "Trang doanh thu",
//           tabBarIcon: ({ color }: { color: string }) => (
//             <IconSymbol size={28} name="person.crop.circle.fill" color={color} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }
