import 'dart:ui';
import 'dart:developer';
import 'package:flutter/material.dart';
import '../utils/systems/Api.dart';
import '../utils/api/Server.dart';
import '../oauthServicePage/oauthServicePage.dart';
import '../components/workflow.dart';
import '../components/popup.dart';

class ServicesPage extends StatefulWidget {
  @override
  ServicesPageState createState() => ServicesPageState();
}

class ServicesPageState extends State<ServicesPage> {
  Map<String, Color> services = {
    "Azuread": Color.fromRGBO(0, 114, 198, 1),
    "Discord": Color.fromRGBO(116, 137, 218, 1),
    "Epitech": Color.fromRGBO(44, 170, 225, 1),
    "Facebook": Color.fromRGBO(60, 90, 153, 1),
    "Github": Color.fromRGBO(21, 25, 30, 1),
    "Google": Color.fromRGBO(234, 67, 53, 1),
    "Slack": Color.fromRGBO(224, 30, 90, 1),
    "Twitter": Color.fromRGBO(29, 161, 242, 1),
  };

  Color getColorOf(String service) {
    // log(service);
    if (services[service] == null)
      return Colors.grey;
    return services[service];
  }

  @override
  Widget build(BuildContext context) {
    return(
      FutureBuilder<List<Service>>(
        future: API.of(context).instance.getAvailableModuleServices(),
        builder: (BuildContext context, AsyncSnapshot<List<Service>> snapshot) {
          if (snapshot.hasData) {
            return Container(
              child: ListView(
                shrinkWrap: true,
                children: <Widget>[
                  for (int i = 0; i < snapshot.data.length; ++i)
                    GestureDetector(
                      onTap: () async {
                        if (snapshot.data[i].kind == "external") {
                          Navigator.of(context).push(MaterialPageRoute(builder: (context) => OAuthServicePage(service: snapshot.data[i], parent: this)));
                        } else if (snapshot.data[i].kind == "form") {
                          try {
                            bool response = await openForm(context, snapshot.data[i].inputs, snapshot.data[i].id);
                            if (response == true) {
                              API.of(context).instance.subcribeFormService(snapshot.data[i], snapshot.data[i].inputs).then((value) {
                              }).catchError((error) {
                                popUp(context, "Error while connecting to ${snapshot.data[i].id}", error.toString());
                              });
                            }
                          } catch(error) {
                            popUp(context, "Error while connecting to ${snapshot.data[i].id}", error.toString());
                          }
                        }
                      },
                      child: Card(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10.0),
                        ),
                        margin: EdgeInsets.only(top: 16.0, left: 16.0, right: 16.0),
                        elevation: 8,
                        child: Container(
                          height: 80,
                          decoration: BoxDecoration(
                            borderRadius: new BorderRadius.all(Radius.circular(10)),
                            color: getColorOf(snapshot.data[i].id[0].toUpperCase() + snapshot.data[i].id.substring(1))
                          ),
                          child: Row(
                            children: <Widget>[
                              Expanded(
                                flex: 3,
                                child: Image(image: AssetImage('assets/${snapshot.data[i].id[0].toUpperCase() + snapshot.data[i].id.substring(1)}.png'))
                              ),
                              Expanded(
                                flex: 3,
                                child: Text(snapshot.data[i].id[0].toUpperCase() + snapshot.data[i].id.substring(1), style: TextStyle(color: Colors.white))
                              ),
                              Expanded(
                                flex: 1,
                                child: Icon(snapshot.data[i].connected ? Icons.check : Icons.close, color: snapshot.data[i].connected ? Colors.white : Colors.transparent)
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  Padding(padding: EdgeInsets.only(bottom: 48.0))
                ],
              ),
            );
          } else if (snapshot.hasError) {
            return (Text(snapshot.error.toString()));
          } else {
            return Center(
              child: SizedBox(
                width: 50,
                height: 50,
                child: CircularProgressIndicator(),
              ),
            );
          }
        }
      )
    );
  }
}
