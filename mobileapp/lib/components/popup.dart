import 'package:flutter/material.dart';
import 'package:flutter/painting.dart';
import 'package:flutter/widgets.dart';

void popUp(BuildContext context, String title, String error, {double opacity = 0.9}) {
  showDialog(
      context: context,
      builder: (context) {
        return Opacity(
          opacity: opacity,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(10.0),
            child: AlertDialog(
                title: Text(title),
                content: Text(error),
                actions: [
                  FlatButton(
                      child: Text("Ok"),
                      onPressed: () {
                        Navigator.of(context).pop();
                      }
                  )
                ]
            ),
          ),
        );
      }
  );
}
