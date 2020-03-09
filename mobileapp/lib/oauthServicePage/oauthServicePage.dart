import 'dart:developer';
import 'package:area_mobileapp/servicesPage/servicesPage.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_webview_plugin/flutter_webview_plugin.dart';
import '../utils/api/Server.dart';
import '../utils/systems/Api.dart';

class OAuthServicePage extends StatefulWidget {
  OAuthServicePage({Key key, this.service, this.parent}) : super(key: key);
  final Service service;
  final ServicesPageState parent;

  @override
  _OAuthServicePageState createState() => _OAuthServicePageState();
}

class _OAuthServicePageState extends State<OAuthServicePage> {
  final flutterWebviewPlugin = new FlutterWebviewPlugin();
  Future<User> f;

  String token;


  @override
  void initState() {
    super.initState();

    flutterWebviewPlugin.onUrlChanged.listen((String url) async {
      if (mounted) {
        if (url.startsWith("http://localhost:8080")) {
          final user = await f;
          try {
            final response = await API.of(context).instance.getRequest(url.substring(21) + "&forUser=" + user.id);
          } catch (e) {
            print(e);
          }
          Navigator.of(context).pop();
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    f = API.of(context).instance.me();
    return FutureBuilder<User>(
      future: f,
      builder: (BuildContext context, AsyncSnapshot<User> data) {
        if (data.hasData) {
          return WebviewScaffold(
            url: API.of(context).instance.url + widget.service.url + "&forUser=" + data.data.id,
            appCacheEnabled: true,
            clearCache: false,
            clearCookies: false,
            appBar: new AppBar(
              title: new Text("Login to ${widget.service.name}..."),
            )
          );
        } else {
          return Center(child: SizedBox(width: 60, height: 60, child: CircularProgressIndicator()));
        }
      },
    );
  }
}