import 'package:flutter/material.dart';
import '../../components/inputText.dart';
import '../../components/roundedFlatButton.dart';
import '../../colors.dart' as ColorTheme;
import 'package:area_mobileapp/utils/api/Server.dart';
import 'package:area_mobileapp/utils/systems/Api.dart';
import 'package:area_mobileapp/components/popup.dart';

class EmailLoginContainer extends StatefulWidget {
  @override
  EmailLoginContainerState createState() => EmailLoginContainerState();
}

class EmailLoginContainerState extends State<EmailLoginContainer> {
  String _email = '';
  String _password = '';
  String error_msg = null;

  void _getEmail(String email) {
    setState(() {
      _email = email;
    });
  }

  void _getPassword(String password) {
    setState(() {
      _password = password;
    });
  }

  void emailLogin(BuildContext context) {
    API.of(context).instance.login({
      "email": this._email,
      "password": this._password,
    }).then((success) {
      print("Logged in! :D");
      Navigator.of(context).pushNamedAndRemoveUntil(
          "/home", (Route<dynamic> route) => false);
    }).catchError((msg) {
      popUp(context, 'Error while logging in', msg.toString());
    });
  }

  @override
  Widget build(BuildContext context) {
    return (
      ListView(
        shrinkWrap: true,
        children: <Widget>[
          Container(
            child: Input(
              inputName: 'email',
              inputIcon: Icons.mail,
              inputHintText: 'john.doe@mail.com',
              inputType: TextInputType.emailAddress,
              inputHidden: false,
              getInputValue: _getEmail,
            ),
          ),
          Container(
            margin: EdgeInsets.only(top: 20.0),
            child: Input(
              inputName: 'password',
              inputIcon: Icons.lock,
              inputHintText: '•••••••',
              inputType: TextInputType.text,
              inputHidden: true,
              getInputValue: _getPassword,
              errorText: this.error_msg,
            )
          ),
          Container(
            margin: EdgeInsets.only(top: 20.0),
            child: RoundedFlatButton(
              backgroundColor: ColorTheme.PRIMARYCOLOR,
              buttonText: 'Login',
              passedFunction: emailLogin,
            ),
          ),
        ]
      )
    );
  }
}
