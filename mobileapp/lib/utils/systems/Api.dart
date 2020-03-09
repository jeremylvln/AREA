import 'package:area_mobileapp/utils/api/Server.dart';
import 'package:flutter/material.dart';

class _API extends InheritedWidget {
  const _API({
    @required Widget child,
    @required this.data,
    Key key,
  }) : super(key: key, child: child);

  final APIState data;

  @override
  bool updateShouldNotify(_API oldWidget) => true;
}

class API extends StatefulWidget {
  const API({
    Key key,
    this.child,
  }) : super(key: key);

  final Widget child;

  @override
  APIState createState() => APIState();

  static APIState of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_API>().data;
}

class APIState extends State<API> {
  final instance = Server();

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) => _API(
        data: this,
        child: widget.child,
      );
}
