import 'dart:developer';
import 'package:area_mobileapp/servicesPage/servicesPage.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_webview_plugin/flutter_webview_plugin.dart';
import '../utils/api/Server.dart';
import '../utils/systems/Api.dart';
import '../loginPage/containers/socialLoginContainer.dart';

class OAuthPage extends StatefulWidget {
  OAuthPage({Key key, this.service, this.parent}) : super(key: key);
  final LoginService service;
  final SocialLoginContainerState parent;

  @override
  _OAuthPageState createState() => _OAuthPageState();
}

class _OAuthPageState extends State<OAuthPage> {
  final flutterWebviewPlugin = new FlutterWebviewPlugin();
  Future<User> f;

  String token;


  @override
  void initState() {
    super.initState();

    flutterWebviewPlugin.onUrlChanged.listen((String url) async {
      if (mounted) {
        if (url.startsWith("http://localhost:8080")) {
//          final user = await f;
          try {
            print("I m doing a get request");
            flutterWebviewPlugin.getCookies().then((muffin) {
              print(muffin);
            }).catchError((error) {
              print(error.toString());
            });
            // flutterWebviewPlugin.evalJavascript("document.cookie").then((muffin) {
            //   print(muffin);
            // }).catchError((err) {
            //   print(err.toString());
            // });
            final response = await API.of(context).instance.getRequest(url.substring(21));
            print(response.body);
//            final cookies = await flutterWebviewPlugin.getCookies();
//            cookies.forEach((key, value) => {
//              API.of(context).instance.headers[key] = value
//            });
            Navigator.of(context).pushNamedAndRemoveUntil("/home", (Route<dynamic> route) => false);
          } catch (e) {
            print("HOLA JPP DE CE DEBUG DE MERDE");
            print(e);
          }
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return WebviewScaffold(
      url: API.of(context).instance.url + widget.service.url,
      
      withJavascript: true,
      appCacheEnabled: true,
      clearCache: false,
      clearCookies: false,
      debuggingEnabled: true,
      appBar: new AppBar(
        title: new Text("Login to ${widget.service.name}..."),
      )
    );
  }
}