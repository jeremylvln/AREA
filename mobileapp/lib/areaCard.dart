import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class AreaCard extends StatefulWidget {
  AreaCard({Key key}) : super(key: key);

  @override
  _AreaCardState createState() => _AreaCardState();
}

class _AreaCardState extends State<AreaCard> {
  bool isSwitched = true;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 100,
      margin: EdgeInsets.only(left: 10, right: 10, top: 10),
      padding: EdgeInsets.only(left: 10, right: 10),
      decoration: new BoxDecoration(
        borderRadius: BorderRadius.all(Radius.circular(8)),
        color: Colors.white,
        boxShadow: [
          new BoxShadow(
            color: Colors.grey,
            blurRadius: 15.0,
          ),
        ],
      ),
      child: Column(
        children: <Widget>[
          Row(
            children: <Widget>[
              Flexible(
                flex: 5,
                child: Row(
                  children: <Widget>[
                    for (int i = 0; i < 5; ++i)
                      Icon(Icons.ac_unit),
                  ],
                ),
              ),
              Flexible(
                flex: 1,
                child: Switch(
                  value: isSwitched,
                  onChanged: (value) {
                    setState(() {
                      isSwitched = value;
                    });
                  },
                  activeTrackColor: Colors.lightGreenAccent, 
                  activeColor: Colors.green,
                ),
              )
            ],
          ),
          Align(
            alignment: Alignment.topLeft,
            child: Text("Description"),
          )
        ],
      ),
    );
  }
}