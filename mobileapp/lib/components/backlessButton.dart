import 'package:flutter/material.dart';
import '../colors.dart' as ColorTheme;

class BacklessButton extends StatefulWidget {
  final String buttonText;
  final IconData buttonIcon;
  final String iconPosition;
  final Function passedFunction;

  const BacklessButton(
      {Key key,
        this.buttonText,
        this.buttonIcon,
        this.iconPosition,
        this.passedFunction})
      : super(key: key);

  @override
  BacklessButtonState createState() => BacklessButtonState();
}

class BacklessButtonState extends State<BacklessButton> {
  @override
  Widget build(BuildContext context) {
    return(
        FlatButton(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              if (widget.iconPosition == 'left') Icon(
                widget.buttonIcon,
                color: ColorTheme.PRIMARYCOLOR,
              ),
              Text(widget.buttonText),
              if (widget.iconPosition == 'right') Icon(
                widget.buttonIcon,
                color: ColorTheme.PRIMARYCOLOR,
              )
            ],
          ),
          onPressed: () {
            widget.passedFunction();
          },
      )
    );
  }
}