import 'package:flutter/material.dart';
import '../colors.dart' as ColorTheme;

class RoundedFlatButton extends StatefulWidget {
  final Color backgroundColor;
  final String buttonText;
  final String imagePath;
  final IconData buttonIcon;
  final Function passedFunction;

  const RoundedFlatButton(
      {Key key,
      @required this.backgroundColor,
      @required this.passedFunction,
      this.buttonText,
      this.imagePath,
      this.buttonIcon})
      : super(key: key);

  @override
  RoundedFlatButtonState createState() => RoundedFlatButtonState();
}

class RoundedFlatButtonState extends State<RoundedFlatButton> {
  @override
  Widget build(BuildContext context) {
    return (
      ButtonTheme(
        child: FlatButton(
          textColor: ColorTheme.WHITE,
          splashColor: ColorTheme.PRIMARYLIGHTCOLOR,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18.0),
          ),
          color: widget.backgroundColor,
          child: widget.imagePath != null
            ? Image(
                image: AssetImage(widget.imagePath),
                height: 15,
              )
            : widget.buttonText != null
              ? Text(widget.buttonText)
              : Icon(widget.buttonIcon),
          onPressed: () => widget.passedFunction(context),
        ),
      )
    );
  }
}
