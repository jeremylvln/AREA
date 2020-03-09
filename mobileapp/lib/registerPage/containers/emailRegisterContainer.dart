import 'package:flutter/material.dart';
import '../../colors.dart' as ColorTheme;
import '../../components/inputText.dart';
import '../../components/roundedFlatButton.dart';
import 'package:area_mobileapp/utils/api/Server.dart';
import 'package:area_mobileapp/utils/systems/Api.dart';
import 'package:area_mobileapp/components/popup.dart';

class EmailRegisterContainer extends StatefulWidget {
  @override
  EmailRegisterContainerState createState() => EmailRegisterContainerState();
}

class EmailRegisterContainerState extends State<EmailRegisterContainer> {
  String _email = "";
  String _password = "";
  String _surname = "";
  String _lastName = "";
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

  void _getSurname(String surname) {
    setState(() {
      _surname = surname;
    });
  }

  void _getLastName(String lastName) {
    setState(() {
      _lastName = lastName;
    });
  }

  void register(BuildContext context) {
    API.of(context).instance.register({
      "email": this._email,
      "password": this._password,
      "firstname": "",
      "lastname": "",
    }).then((success) {
      print("Logged in! :D");
      Navigator.of(context).pushNamedAndRemoveUntil(
          "/login", (Route<dynamic> route) => false);
    }).catchError((msg) {
      popUp(context, 'Error while registering', msg.toString());
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
              errorText: error_msg,
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
            )
          ),
          Container(
            margin: EdgeInsets.only(top: 20.0),
            child: Input(
              inputName: 'surname',
              inputIcon: Icons.person,
              inputHintText: 'John',
              inputType: TextInputType.text,
              inputHidden: false,
              getInputValue: _getSurname,
            ),
          ),
          Container(
            margin: EdgeInsets.only(top: 20.0),
            child: Input(
              inputName: 'lastname',
              inputIcon: Icons.person,
              inputHintText: 'Doe',
              inputType: TextInputType.text,
              inputHidden: false,
              getInputValue: _getLastName,
            ),
          ),
          Container(
            margin: EdgeInsets.only(top: 20.0),
            child: RoundedFlatButton(
              backgroundColor: ColorTheme.PRIMARYCOLOR,
              buttonText: 'Sign up',
              passedFunction: register,
            ),
          )
        ]
      )
    );
  }
}
