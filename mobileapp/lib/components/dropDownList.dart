import 'package:flutter/material.dart';
import '../colors.dart' as ColorTheme;

class DropDownList extends StatefulWidget {
  final List<String> list;
  final String firstElemList;

  const DropDownList({Key key, this.list, this.firstElemList})
      : super(key: key);

  @override
  DropDownListState createState() => DropDownListState();
}

class DropDownListState extends State<DropDownList> {
  String dropDownValue;

  @override
  Widget build(BuildContext context) {
    return (
      DropdownButton<String>(
        value: dropDownValue,
        hint: Text('Please select a server'),
        icon: Icon(Icons.arrow_drop_down),
        elevation: 6,
        underline: Container(
          height: 2,
          color: ColorTheme.PRIMARYCOLOR,
        ),
        onChanged: (String newValue) {
          setState(() => dropDownValue = newValue);
        },
        items: widget.list.map<DropdownMenuItem<String>>((String value) {
          return DropdownMenuItem<String>(
            child: Text(value),
            value: value,
          );
        }).toList(),
      )
    );
  }
}
