import * as React from 'react';
// import fetch from 'isomorphic-fetch';
import { NextPageContext } from 'next';
import { StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Router from 'next/router';
import { t } from 'i18n-js';
import FormContainer from '../components/FormContainer';
import PageContainer from '../components/PageContainer';
import EmailInput from '../components/TextInput/Email';
import PasswordInput from '../components/TextInput/Password';
import SubmitButton from '../components/SubmitButton';
import { AuthStatus } from '../data-types';
import { ReduxRoot, isAuthDisabled } from '../reducers';
import { Dispatch, Action } from '../actions';
import * as SigninActions from '../actions/auth/signin';
import AuthUtils from '../util/AuthUtils';
import { Colors, Margins } from '../styles';
import FlexLoader from '../components/FlexLoader';

const logoSource = require('../assets/logo.png');

const styles = StyleSheet.create({
  logo: {
    height: 160,
    width: 160,
  },
  formContainer: {
    width: '100%',
    marginTop: Margins.MAX_Y,
  },
  forgotPasswordButton: {
    marginTop: Margins.MAX_Y,
    color: Colors.INACTIVE_TEXT.toString(),
    fontSize: 16,
  },
  signupButton: {
    marginTop: 3 * Margins.Y,
    color: Colors.BLUE.toString(),
    fontSize: 16,
  },
});

const mapStateToProps = (state: ReduxRoot) => ({
  authDisabled: isAuthDisabled(state.auth),
  progress: state.auth.signin.progress,
  authStatus: state.auth.status,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) =>
  bindActionCreators(
    {
      signinUser: SigninActions.signinUser,
      clearProgress: () => (d: Dispatch) => d(SigninActions.clearSigninProgress()),
    },
    dispatch
  );

interface Props extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {}

function LoginPage({ authDisabled, signinUser, progress, clearProgress, authStatus }: Props) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  React.useEffect(
    () => () => {
      clearProgress();
    },
    [clearProgress]
  );

  React.useEffect(() => {
    if (authStatus === AuthStatus.SignedIn) {
      Router.push('/map');
    }
  }, [authStatus]);

  const submitDisabled =
    authDisabled || !AuthUtils.isValidEmail(email) || !AuthUtils.isValidPassword(password);

  const onLinkPress = (path: string) => () => {
    Router.push(path);
  };

  if (authStatus === AuthStatus.SignedIn) {
    return <FlexLoader />;
  }

  return (
    <PageContainer>
      <Image style={styles.logo} source={logoSource} />
      <FormContainer showErrorsOnly progress={progress} style={styles.formContainer}>
        <EmailInput
          value={email}
          onChangeText={text => {
            if (progress.status) clearProgress();
            setEmail(text);
          }}
        />
        <PasswordInput
          value={password}
          onChangeText={text => {
            if (progress.status) clearProgress();
            setPassword(text);
          }}
        />
      </FormContainer>
      <SubmitButton
        label={t('buttons.signin')}
        progress={progress}
        disabled={submitDisabled}
        onPress={() => signinUser(email, password)}
      />
      <TouchableOpacity onPress={onLinkPress('/reset-password')}>
        <Text style={styles.forgotPasswordButton}>{t('buttons.forgotPassword')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onLinkPress('/signup')}>
        <Text style={styles.signupButton}> {t('buttons.signup')}</Text>
      </TouchableOpacity>
    </PageContainer>
  );
}

LoginPage.getInitialProps = async (ctx: NextPageContext) => {
  // do async stuff here to load data
  // ctx.query is the ?params
  // eg:
  // let url = getApiUrl(urlWithQuery('/libraries', ctx.query), ctx);
  // let response = await fetch(url);
  // let result = await response.json();

  return {
    // data: result,
    // query: ctx.query,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
