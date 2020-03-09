import 'package:area_mobileapp/utils/api/Server.dart';
import 'package:flutter/material.dart';
import 'dart:async';
import 'package:flutter_webview_plugin/flutter_webview_plugin.dart';
import '../../components/circleFlatButton.dart';
import '../../colors.dart' as ColorTheme;
import '../../utils/systems/Api.dart';
import '../../oauthPage/oauthPage.dart';

class SocialLoginContainer extends StatefulWidget {
  @override
  SocialLoginContainerState createState() => SocialLoginContainerState();
}

class SocialLoginContainerState extends State<SocialLoginContainer> {
  final flutterWebviewPlugin = FlutterWebviewPlugin();

  StreamSubscription _onDestroy;
  StreamSubscription<String> _onUrlChanged;
  // StreamSubscription<WebViewStateChanged> _onStateChanged;

  String _token;

  @override
  void dispose() {
    // Every listener should be canceled, the same should be done with this stream.
    _onDestroy.cancel();
    _onUrlChanged.cancel();
    flutterWebviewPlugin.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();

    flutterWebviewPlugin.close();

    // Add a listener when WebView is destroyed
    _onDestroy = flutterWebviewPlugin.onDestroy.listen((_) {
      print("destroy");
    });

    // Add a listener to on url changed
    _onUrlChanged = flutterWebviewPlugin.onUrlChanged.listen((String url) {
      if (mounted) {
        setState(() {
          print("URL changed: $url");

          // if (url.startsWith('https://login.microsoftonline.com/login.srf?')) {
          //   Navigator.of(context).pushNamedAndRemoveUntil(
          //       "/home", (Route<dynamic> route) => false);
          //   flutterWebviewPlugin.close();
          // }
        });
      }
    });
  }



  void officeLogin() {
    debugPrint('Office 365 login');
    Navigator.pushNamed(context, '/office-login');
  }

  void githubLogin() {
    debugPrint('GitHub login');
    Navigator.pushNamed(context, '/github-login');
  }

  void gmailLogin() {
    debugPrint('Gmail login');
    Navigator.pushNamed(context, '/google-login');
  }

  void facebookLogin() {
    debugPrint('Facebook login');
    Navigator.pushNamed(context, '/facebook-login');
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<LoginService>>(
      future: API.of(context).instance.getAvailableLoginServices(),
      builder: (BuildContext context, AsyncSnapshot<List<LoginService>> snapshot) {
        if (snapshot.hasData) {
          return Container(
            child: Row(
              children: <Widget>[
              for (int i = 0; i < snapshot.data.length; ++i)
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(MaterialPageRoute(builder: (context) => OAuthPage(service: snapshot.data[i], parent: this)));
                    },
                    child: Image(
                      image: AssetImage('assets/${snapshot.data[i].id}.png')
                    ),
                  ),
                ),
              ],
            )
          );
        } else if (snapshot.hasError) {
          return (Text(snapshot.error.toString()));
        } else {
          return Center(
            child: SizedBox(
              width: 50,
              height: 50,
              child: CircularProgressIndicator(),
            ),
          );
        }
      }
    );
      // Container(
      //   margin: EdgeInsets.only(top: 15.0),
      //   child: Row(
      //     children:<Widget>[
      //       Expanded(
      //         child: CircleFlatButton(
      //           backgroundColor: ColorTheme.OFFICERED,
      //           imagePath: 'assets/office_365_small.png',
      //           passedFunction: officeLogin,
      //         ),
      //       ),
      //       Expanded(
      //         child: CircleFlatButton(
      //           backgroundColor: ColorTheme.GITHUBBLACK,
      //           imagePath: 'assets/github_small.png',
      //           passedFunction: githubLogin,
      //         ),
      //       ),
      //       Expanded(
      //         child: CircleFlatButton(
      //           backgroundColor: ColorTheme.WHITE,
      //           imagePath: 'assets/google_small.png',
      //           passedFunction: gmailLogin,
      //         ),
      //       ),
      //       Expanded(
      //         child: CircleFlatButton(
      //           backgroundColor: ColorTheme.FACEBOOKBLUE,
      //           imagePath: 'assets/facebook_small.png',
      //           passedFunction: facebookLogin,
      //         ),
      //       )
      //     ]
      //   ),
      // )
  }
}
