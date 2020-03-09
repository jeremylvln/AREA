import 'package:flutter/material.dart';
import '../components/roundedFlatButton.dart';
import '../components/inputText.dart';
import '../colors.dart' as ColorTheme;
import 'package:area_mobileapp/utils/systems/Api.dart';
import 'package:flutter/foundation.dart';

class ServerPage extends StatefulWidget {
  @override
  ServerPageState createState() => ServerPageState();
}

class ServerPageState extends State<ServerPage> {
  String _newServer = '';

  void _getNewServer(String server) {
    setState(() {
      _newServer = server;
    });
  }

  void _connectServer(BuildContext context) {
    API.of(context).instance.changeUrl("http://"+this._newServer+":8080");
    Navigator.pushNamed(context, '/login');
  }

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
                Input(
                  inputName: 'newserver',
                  inputIcon: Icons.dns,
                  inputHintText: '0.0.0.0',
                  inputType: TextInputType.text,
                  inputHidden: false,
                  getInputValue: _getNewServer,
                ),
                Container(
                  margin: EdgeInsets.only(top: 15.0),
                  child: RoundedFlatButton(
                    buttonText: 'Connect to server',
                    backgroundColor: ColorTheme.PRIMARYCOLOR,
                    passedFunction: _connectServer,
                    buttonIcon: Icons.access_alarm,
                  ),
                ),
              ]
            ),
          )
        )
      )
    );
  }
}