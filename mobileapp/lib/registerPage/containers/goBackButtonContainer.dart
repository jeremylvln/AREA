import 'package:flutter/material.dart';
import '../../components/backlessButton.dart';
import 'package:flutter/foundation.dart';

class GoBackButtonContainer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return (
      Container(
          margin: EdgeInsets.only(top: 15.0),
          child: BacklessButton(
            buttonText: 'Go back',
            buttonIcon: Icons.arrow_left,
            iconPosition: 'left',
            passedFunction: () {
              Navigator.pop(context);
            },
          ),
        )
    );
  }
}
