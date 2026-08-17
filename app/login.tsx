import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { login } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleLogin() {
    setError("");

    if (!email.trim() || !password) {
      setError(
        "Please enter your email and password.",
      );
      return;
    }

    try {
      setLoading(true);

      await login(
        email.trim().toLowerCase(),
        password,
      );

      router.replace("/(tabs)");
    } catch (error) {
      console.error(
        "Login error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to log in.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      keyboardVerticalOffset={
        Platform.OS === "ios"
          ? insets.top
          : 0
      }
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop:
              insets.top + 20,
            paddingBottom:
              insets.bottom + 30,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text
            style={[
              styles.brand,
              {
                color: colors.text,
              },
            ]}
          >
            ProStore
          </Text>

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Welcome back
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Sign in to continue shopping.
          </Text>

          {error ? (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor:
                    colors.errorBackground,
                  borderColor:
                    colors.errorBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.errorText,
                  {
                    color:
                      colors.danger,
                  },
                ]}
              >
                {error}
              </Text>
            </View>
          ) : null}

          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor:
                  colors.border,
                backgroundColor:
                  colors.inputBackground,
              },
            ]}
            placeholder="Email address"
            placeholderTextColor={
              colors.placeholder
            }
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <View
            style={[
              styles.passwordContainer,
              {
                borderColor:
                  colors.border,
                backgroundColor:
                  colors.inputBackground,
              },
            ]}
          >
            <TextInput
              style={[
                styles.passwordInput,
                {
                  color: colors.text,
                },
              ]}
              placeholder="Password"
              placeholderTextColor={
                colors.placeholder
              }
              value={password}
              onChangeText={setPassword}
              secureTextEntry={
                !showPassword
              }
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={
                handleLogin
              }
            />

            <Pressable
              onPress={() =>
                setShowPassword(
                  (current) =>
                    !current,
                )
              }
              style={styles.eyeButton}
            >
              <Ionicons
                name={
                  showPassword
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                size={22}
                color={
                  colors.secondaryText
                }
              />
            </Pressable>
          </View>

          <Pressable
            style={[
              styles.loginButton,
              {
                backgroundColor:
                  colors.primary,
              },
              loading &&
                styles.disabledButton,
            ]}
            disabled={loading}
            onPress={handleLogin}
          >
            {loading ? (
              <ActivityIndicator
                color={
                  colors.primaryText
                }
              />
            ) : (
              <Text
                style={[
                  styles.loginButtonText,
                  {
                    color:
                      colors.primaryText,
                  },
                ]}
              >
                Sign In
              </Text>
            )}
          </Pressable>

          <View
            style={styles.registerRow}
          >
            <Text
              style={[
                styles.registerText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Don't have an account?
            </Text>

            <Pressable
              onPress={() =>
                router.push("/register")
              }
            >
              <Text
                style={[
                  styles.registerLink,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Create Account
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.guestButton}
            onPress={() =>
              router.replace("/(tabs)")
            }
          >
            <Text
              style={[
                styles.guestButtonText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Continue as guest
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: 24,
  },

  brand: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 22,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 15,
    marginTop: 6,
    marginBottom: 24,
  },

  errorBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },

  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 12,
  },

  passwordContainer: {
    height: 52,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 14,
    fontSize: 15,
  },

  eyeButton: {
    width: 48,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  loginButton: {
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  loginButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.6,
  },

  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    gap: 5,
  },

  registerText: {
    fontSize: 14,
  },

  registerLink: {
    fontSize: 14,
    fontWeight: "700",
  },

  guestButton: {
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 8,
  },

  guestButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});