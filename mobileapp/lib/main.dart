import 'package:area_mobileapp/utils/systems/Api.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import './loginPage/loginPage.dart';
import './registerPage/registerPage.dart';
import './serverPage/serverPage.dart';
import './homePage/HomePage.dart';
import 'package:flutter_webview_plugin/flutter_webview_plugin.dart';
import 'utils/api/Server.dart';

void main() {
 runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return API(
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'AREA',
        theme: ThemeData(
          primarySwatch: Colors.blue,
        ),
        initialRoute: '/',
        routes: {
          '/': (context) => ServerPage(),
          '/login': (context) => LoginPage(),
          '/register': (context) => RegisterPage(),
          '/home': (context) => HomePage(),
          '/office-login' : (_) => WebviewScaffold(
            url: "https://www.office.com/",
            hidden: true,
            appBar: AppBar(
              title: Text("Connect to Office"),
            ),
          ),
          '/github-login' : (_) => WebviewScaffold(
            url: "https://www./github.com/",
            hidden: true,
            appBar: AppBar(
              title: Text("Connect to GitHub"),
            ),
          ),
          '/google-login' : (_) => WebviewScaffold(
            url: "https://www.google.com/",
            hidden: true,
            appBar: AppBar(
              title: Text("Connect to Google"),
            ),
          ),
          '/facebook-login' : (_) => WebviewScaffold(
            url: "https://www.facebook.com",
            hidden: true,
            appBar: AppBar(
              title: Text("Connect to Facebook"),
            ),
          ),
        },
      ),
    );
  }
}

class Choice {
  const Choice({this.title, this.icon});

  final String title;
  final IconData icon;
}

const List<Choice> choices = const <Choice>[
  const Choice(title: 'Option 1', icon: Icons.directions_car),
  const Choice(title: 'Option 2', icon: Icons.directions_bike),
  const Choice(title: 'Option 3', icon: Icons.directions_boat),
  const Choice(title: 'Option 4', icon: Icons.directions_bus),
  const Choice(title: 'Option 5', icon: Icons.directions_railway),
  const Choice(title: 'Option 6', icon: Icons.directions_walk),
];

class ChoiceCard extends StatelessWidget {
  const ChoiceCard({Key key, this.choice}) : super(key: key);

  final Choice choice;

  @override
  Widget build(BuildContext context) {
    final TextStyle textStyle = Theme.of(context).textTheme.display1;
    return Card(
      color: Colors.white,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            Icon(choice.icon, size: 128.0, color: textStyle.color),
            Text(choice.title, style: textStyle),
          ],
        ),
      ),
    );
  }
}