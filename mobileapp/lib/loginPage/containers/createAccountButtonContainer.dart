import 'package:flutter/material.dart';
import '../../components/backlessButton.dart';
import 'package:flutter/foundation.dart';

class CreateAccountButtonContainer extends StatelessWidget {
  const CreateAccountButtonContainer({
    Key key,
  }) : super(key: key);

  void createAccount() {
    debugPrint('Create account');
  }

  @override
  Widget build(BuildContext context) {
    return (
      Container(
          margin: EdgeInsets.only(top: 15.0),
          child: BacklessButton(
            buttonText: 'Create account',
            buttonIcon: Icons.arrow_right,
            iconPosition: 'right',
            passedFunction: () {
              createAccount();
              Navigator.pushNamed(context, '/register');
            },
          ),
        )
    );
  }
}
