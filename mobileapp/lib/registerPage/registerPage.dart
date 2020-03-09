import 'package:flutter/material.dart';
import './containers/emailRegisterContainer.dart';
import './containers/goBackButtonContainer.dart';

class RegisterPage extends StatefulWidget {
  @override
  RegisterPageState createState() => RegisterPageState();
}

class RegisterPageState extends State<RegisterPage> {
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
                EmailRegisterContainer(),
                GoBackButtonContainer(),
              ],
            ),
          ),
        )
      )
    );
  }
}
