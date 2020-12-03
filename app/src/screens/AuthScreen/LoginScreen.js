import React, { memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import Background from "../../components/Background";
import Logo from "../../components/Logo";
import Header from "../../components/Header";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";
import BackButton from "../../components/BackButton";
import { authenticate } from "../../../redux/actions/authActions";
import { emailValidator, passwordValidator } from "../../utils/common";

// import { signIn } from "../../store/actions/user_actions";
// import { emailValidator, passwordValidator } from '../core/utils';

const LoginScreen = ({ navigation, ...props }) => {
  const dispatch = useDispatch();
  const {authLoading} = useSelector(state => state.authentication)

  const [email, setEmail] = useState({ value: "Tek@gmail.com", error: "" });
  const [password, setPassword] = useState({ value: "helloworld1", error: "" });

  const _onLoginPressed = () => {
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);

    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return;
    }

    // navigation.navigate('Dashboard');
    // props.signIn("fdf");
    dispatch(authenticate({email: email.value, password: password.value}));
  };

  return (
    <Background>
      <BackButton goBack={() => navigation.goBack()} />

      <Logo />

      <Header>Welcome back.</Header>

      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: "" })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />

      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: "" })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />

      <View style={styles.forgotPassword}>
        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.label}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>

      <Button mode="contained" onPress={_onLoginPressed} loading={authLoading} disabled={authLoading}>
        Login
      </Button>

      <View style={styles.row}>
        <Text style={styles.label}>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  forgotPassword: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    marginTop: 4,
  },
  label: {
    color: "orange",
  },
  link: {
    fontWeight: "bold",
    color: "red",
  },
});

export default LoginScreen;
