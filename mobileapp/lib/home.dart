import 'package:flutter/material.dart';

import 'areaCard.dart';

class Home extends StatefulWidget{
  Home({Key key}) : super(key: key);

  @override
  _HomeState createState() => _HomeState();
}

class _HomeState extends State<Home> with AutomaticKeepAliveClientMixin {
  List <Widget> items = [
    AreaCard(),
    AreaCard(),
    AreaCard(),
  ];

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    return Container(
      child: ListView.builder(
        itemCount: items.length,
        itemBuilder: (context, i) {
          return GestureDetector(
            child: items[i],
            onLongPress: () {
              showDialog(
                context: context,
                builder: (context) {
                  return AlertDialog(
                    title: Text("Deleting card"),
                    content: Text("Would you really want to delete this card ?"),
                    actions: <Widget>[
                      FlatButton(
                        child: Text("Yes"),
                        onPressed: () {
                          Navigator.of(context).pop();
                          setState(() {
                            items.removeAt(i);
                          });
                        },
                      ),
                      FlatButton(
                        child: Text("No"),
                        onPressed: () {
                          Navigator.of(context).pop();
                        },
                      )
                    ],
                  );
                }
              );
            },
          );
        },
      )
      // child: ListView(
      //   children: <Widget>[
      //     GestureDetector(
      //       child: AreaCard(),
      //       onLongPress: () {
      //         showDialog(
      //           context: context,
      //           builder: (context) {
      //             return AlertDialog(
      //               title: Text("Deleting card"),
      //               content: Text("Would you really want to delete this card ?"),
      //               actions: <Widget>[
      //                 FlatButton(
      //                   child: Text("Yes"),
      //                   onPressed: () {
      //                     Navigator.of(context).pop();
      //                   },
      //                 ),
      //                 FlatButton(
      //                   child: Text("No"),
      //                   onPressed: () {
      //                     Navigator.of(context).pop();
      //                   },
      //                 )
      //               ],
      //             );
      //           }
      //         );
      //       },
      //     ),
      //     // AreaCard(),
      //     // AreaCard(),
      //     // AreaCard(),
      //     // AreaCard(),
      //     // AreaCard(),
      //     // AreaCard(),
      //     // AreaCard(),
      //     // AreaCard(),
      //     Padding(padding: EdgeInsets.only(bottom: 10))
      //   ],
      // )
    );
  }
}