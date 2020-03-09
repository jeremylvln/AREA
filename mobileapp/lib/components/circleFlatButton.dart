import 'package:flutter/material.dart';

class CircleFlatButton extends StatefulWidget {
  final Color backgroundColor;
  final String buttonText;
  final String imagePath;
  final IconData buttonIcon;
  final Function passedFunction;

  const CircleFlatButton({
    Key key,
    @required this.backgroundColor,
    @required this.passedFunction,
    this.buttonText,
    this.imagePath,
    this.buttonIcon
    }) : super(key: key);

  @override
  CircleFlatButtonState createState() => CircleFlatButtonState();
}

class CircleFlatButtonState extends State<CircleFlatButton> {
  @override
  Widget build(BuildContext context) {
    return (
      RawMaterialButton(
        shape: CircleBorder(),
        fillColor: widget.backgroundColor,
        padding: EdgeInsets.all(15.0),
        child: widget.imagePath != null
            ? Image(
                image: AssetImage(widget.imagePath),
                height: 20,
              )
            : widget.buttonText != null
              ? Text(widget.buttonText)
              : Icon(widget.buttonIcon),
        onPressed: () => widget.passedFunction(),
      )
    );
  }
}