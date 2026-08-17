import { useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/components/providers/auth-provider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/components/providers/theme-provider";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { user, logout } = useAuth();
  const { colors } = useTheme();

  async function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();

            router.replace("/(tabs)");
          } catch (error) {
            console.error("Logout error:", error);

            Alert.alert("Unable to sign out", "Please try again.");
          }
        },
      },
    ]);
  }

  if (!user) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <View
          style={[
            styles.profileIcon,
            {
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Text style={styles.profileIconText}>?</Text>
        </View>

        <Text
          style={[
            styles.signInTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Sign in required
        </Text>

        <Text
          style={[
            styles.signInMessage,
            {
              color: colors.secondaryText,
            },
          ]}
        >
          Sign in to access your profile, orders and saved information.
        </Text>

        <Pressable
          style={[
            styles.signInButton,
            {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={() => router.push("/login")}
        >
          <Text
            style={[
              styles.signInButtonText,
              {
                color: colors.primaryText,
              },
            ]}
          >
            Sign In
          </Text>
        </Pressable>
      </View>
    );
  }

  const initials =
    user.name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name.charAt(0).toUpperCase())
      .join("") || "?";

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 30,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Profile
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.secondaryText,
            },
          ]}
        >
          Manage your account
        </Text>
      </View>

      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: colors.surface,
          },
        ]}
      >
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.avatarText,
              {
                color: colors.primaryText,
              },
            ]}
          >
            {initials}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text
            style={[
              styles.name,
              {
                color: colors.text,
              },
            ]}
            numberOfLines={1}
          >
            {user.name || "ProStore Customer"}
          </Text>

          <Text
            style={[
              styles.email,
              {
                color: colors.secondaryText,
              },
            ]}
            numberOfLines={1}
          >
            {user.email}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.secondaryText,
            },
          ]}
        >
          ACCOUNT
        </Text>

        <View
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.surface,
            },
          ]}
        >
          <MenuItem
            title="My Orders"
            subtitle="View your purchases and order status"
            icon="📦"
            colors={colors}
            onPress={() => router.push("/orders")}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <MenuItem
            title="Saved Address"
            subtitle="Manage your delivery information"
            icon="📍"
            colors={colors}
            onPress={() => router.push("/checkout")}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <MenuItem
            title="Wishlist"
            subtitle="View products you've saved"
            icon="♡"
            colors={colors}
            onPress={() => router.push("/wishlist")}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.secondaryText,
            },
          ]}
        >
          ACCOUNT DETAILS
        </Text>

        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor: colors.surface,
            },
          ]}
        >
          <DetailRow
            label="Name"
            value={user.name || "Not provided"}
            colors={colors}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <DetailRow label="Email" value={user.email} colors={colors} />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <DetailRow
            label="Account type"
            value={user.role === "ADMIN" ? "Administrator" : "Customer"}
            colors={colors}
          />
        </View>
      </View>

      <Pressable
        style={[
          styles.logoutButton,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
        onPress={handleLogout}
      >
        <Text
          style={[
            styles.logoutIcon,
            {
              color: colors.danger,
            },
          ]}
        >
          ↪
        </Text>

        <Text
          style={[
            styles.logoutText,
            {
              color: colors.danger,
            },
          ]}
        >
          Sign Out
        </Text>
      </Pressable>

      <Text
        style={[
          styles.version,
          {
            color: colors.mutedText,
          },
        ]}
      >
        ProStore
      </Text>
    </ScrollView>
  );
}

type MenuItemProps = {
  title: string;
  subtitle: string;
  icon: string;
  colors: {
    text: string;
    secondaryText: string;
    surfaceSecondary: string;
  };
  onPress: () => void;
};

function MenuItem({ title, subtitle, icon, colors, onPress }: MenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.menuIcon,
          {
            backgroundColor: colors.surfaceSecondary,
          },
        ]}
      >
        <Text
          style={[
            styles.menuIconText,
            {
              color: colors.text,
            },
          ]}
        >
          {icon}
        </Text>
      </View>

      <View style={styles.menuContent}>
        <Text
          style={[
            styles.menuTitle,
            {
              color: colors.text,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.menuSubtitle,
            {
              color: colors.secondaryText,
            },
          ]}
        >
          {subtitle}
        </Text>
      </View>

      <Text
        style={[
          styles.menuArrow,
          {
            color: colors.secondaryText,
          },
        ]}
      >
        ›
      </Text>
    </Pressable>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
  colors: {
    text: string;
    secondaryText: string;
  };
};

function DetailRow({ label, value, colors }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text
        style={[
          styles.detailLabel,
          {
            color: colors.secondaryText,
          },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.detailValue,
          {
            color: colors.text,
          },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "800",
  },

  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  profileIconText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },

  userInfo: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontSize: 18,
    fontWeight: "800",
  },

  email: {
    marginTop: 4,
    fontSize: 13,
  },

  section: {
    marginTop: 28,
  },

  sectionTitle: {
    marginBottom: 10,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
  },

  menuCard: {
    borderRadius: 14,
    overflow: "hidden",
  },

  menuItem: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  menuItemPressed: {
    opacity: 0.6,
  },

  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  menuIconText: {
    fontSize: 20,
  },

  menuContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
  },

  menuSubtitle: {
    marginTop: 3,
    fontSize: 11,
  },

  menuArrow: {
    fontSize: 24,
  },

  divider: {
    height: 1,
    marginHorizontal: 14,
  },

  detailsCard: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },

  detailRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  detailLabel: {
    fontSize: 13,
  },

  detailValue: {
    maxWidth: "60%",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
  },

  logoutButton: {
    height: 52,
    marginTop: 30,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutIcon: {
    marginRight: 8,
    fontSize: 19,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: "700",
  },

  version: {
    marginTop: 20,
    fontSize: 11,
    textAlign: "center",
  },

  signInTitle: {
    marginTop: 18,
    fontSize: 24,
    fontWeight: "800",
  },

  signInMessage: {
    marginTop: 8,
    maxWidth: 300,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  signInButton: {
    marginTop: 24,
    height: 50,
    paddingHorizontal: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  signInButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
