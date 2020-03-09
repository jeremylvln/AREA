import 'package:flutter/material.dart';
import './containers/socialLoginContainer.dart';
import './containers/emailLoginContainer.dart';
import './containers/createAccountButtonContainer.dart';

class LoginPage extends StatefulWidget {
  @override
  LoginPageState createState() => LoginPageState();
}

class LoginPageState extends State<LoginPage> {
  @override
  Widget build(BuildContext context) {
    return (
      Scaffold(
        body: Center(
          child: Container(
            margin: EdgeInsets.only(
              left: 40.0,
              right: 40.0,
            ),
            child: ListView(
              shrinkWrap: true,
              children: <Widget>[
                EmailLoginContainer(),
                SocialLoginContainer(),
                CreateAccountButtonContainer(),
              ],
            ),
          ),
        )
      )
    );
  }
}
