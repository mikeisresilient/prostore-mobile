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
import { API_BASE_URL } from "@/lib/api";

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { login } = useAuth();
  const { colors } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleRegister() {
    setError("");

    const trimmedName = name.trim();

    const trimmedEmail =
      email.trim().toLowerCase();

    if (
      !trimmedName ||
      !trimmedEmail ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "Please complete all fields.",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match.",
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/mobile/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            password,
          }),
        },
      );

      const responseText =
        await response.text();

      console.log(
        "REGISTER STATUS:",
        response.status,
      );

      console.log(
        "REGISTER RESPONSE:",
        responseText,
      );

      let data;

      try {
        data = JSON.parse(
          responseText,
        );
      } catch {
        throw new Error(
          "Registration returned an invalid response.",
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create your account.",
        );
      }

      await login(
        trimmedEmail,
        password,
      );

      router.replace("/(tabs)");
    } catch (error) {
      console.error(
        "Registration error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account.",
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
              insets.top + 16,
            paddingBottom:
              insets.bottom + 30,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text
              style={[
                styles.backText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              ‹ Back
            </Text>
          </Pressable>

          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                },
              ]}
            >
              Create Account
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
              Join ProStore and start
              shopping.
            </Text>
          </View>

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

          <View style={styles.form}>
            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              FULL NAME
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  borderColor:
                    colors.border,
                  backgroundColor:
                    colors.inputBackground,
                  color: colors.text,
                },
              ]}
              placeholder="Michael Uchechukwu"
              placeholderTextColor={
                colors.placeholder
              }
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              EMAIL
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  borderColor:
                    colors.border,
                  backgroundColor:
                    colors.inputBackground,
                  color: colors.text,
                },
              ]}
              placeholder="you@example.com"
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

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              PASSWORD
            </Text>

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
                    color:
                      colors.text,
                  },
                ]}
                placeholder="At least 8 characters"
                placeholderTextColor={
                  colors.placeholder
                }
                value={password}
                onChangeText={setPassword}
                secureTextEntry={
                  !showPassword
                }
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
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

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              CONFIRM PASSWORD
            </Text>

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
                    color:
                      colors.text,
                  },
                ]}
                placeholder="Re-enter your password"
                placeholderTextColor={
                  colors.placeholder
                }
                value={confirmPassword}
                onChangeText={
                  setConfirmPassword
                }
                secureTextEntry={
                  !showConfirmPassword
                }
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={
                  handleRegister
                }
              />

              <Pressable
                onPress={() =>
                  setShowConfirmPassword(
                    (current) =>
                      !current,
                  )
                }
                style={styles.eyeButton}
              >
                <Ionicons
                  name={
                    showConfirmPassword
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
                styles.button,
                {
                  backgroundColor:
                    colors.primary,
                },
                loading &&
                  styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
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
                    styles.buttonText,
                    {
                      color:
                        colors.primaryText,
                    },
                  ]}
                >
                  Create Account
                </Text>
              )}
            </Pressable>
          </View>

          <View style={styles.loginRow}>
            <Text
              style={[
                styles.loginText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Already have an account?
            </Text>

            <Pressable
              onPress={() =>
                router.push("/login")
              }
            >
              <Text
                style={[
                  styles.loginLink,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Sign In
              </Text>
            </Pressable>
          </View>
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

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },

  backText: {
    fontSize: 15,
    fontWeight: "600",
  },

  header: {
    marginTop: 18,
    marginBottom: 22,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 7,
    fontSize: 14,
  },

  errorBox: {
    padding: 14,
    marginBottom: 14,
    borderRadius: 10,
    borderWidth: 1,
  },

  errorText: {
    fontSize: 13,
    lineHeight: 19,
  },

  form: {
    width: "100%",
  },

  label: {
    marginTop: 12,
    marginBottom: 7,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  input: {
    height: 52,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 15,
  },

  passwordContainer: {
    height: 52,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    fontSize: 15,
  },

  eyeButton: {
    width: 48,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  button: {
    height: 52,
    marginTop: 24,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },

  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 22,
  },

  loginText: {
    fontSize: 13,
  },

  loginLink: {
    fontSize: 13,
    fontWeight: "700",
  },
});