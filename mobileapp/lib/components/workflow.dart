import 'package:flutter/cupertino.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:area_mobileapp/utils/api/Server.dart';
import 'package:area_mobileapp/utils/systems/Api.dart';
import 'package:area_mobileapp/components/popup.dart';

final noBorder = InputDecoration(
  disabledBorder: UnderlineInputBorder(
    borderSide: BorderSide(
      color: Colors.transparent,
    ),
  ),
  enabledBorder: UnderlineInputBorder(
    borderSide: BorderSide(
      color: Colors.transparent,
    ),
  ),
  errorBorder: UnderlineInputBorder(
    borderSide: BorderSide(
      color: Colors.transparent,
    ),
  ),
  focusedBorder: UnderlineInputBorder(
    borderSide: BorderSide(
      color: Colors.transparent,
    ),
  ),
  border: UnderlineInputBorder(
    borderSide: BorderSide(
      color: Colors.transparent,
    ),
  ),
  focusedErrorBorder: UnderlineInputBorder(
    borderSide: BorderSide(
      color: Colors.transparent,
    ),
  ),
);

class Selector extends StatefulWidget {

  final FormInput formValue;
  Selector({ Key key, this.formValue }) : super(key: key);

  _SelectorState createState() => _SelectorState(
      formValue: formValue
  );
}

class _SelectorState extends State<Selector> {

  final FormInput formValue;

  _SelectorState({ Key key, this.formValue });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        SizedBox(height: 20,),
        Container(alignment: Alignment.centerLeft, child: Text(formValue.name, textAlign: TextAlign.left, style: TextStyle(color: Colors.grey[600]),)),
        DropdownButton<String>(
          value: formValue.value,
          icon: Icon(Icons.arrow_downward),
          iconSize: 24,
          onChanged: (value) {
            setState(() {
              formValue.value = value;
            });
          },
          items: formValue.choices.map((choice) => DropdownMenuItem(
            value: choice.value,
            child: Text(choice.name),
          )).toList(),
        ),
        Text(formValue.description, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
      ],
    );
  }
}

class Toggle extends StatefulWidget {

  final FormInput formValue;
  Toggle({ Key key, this.formValue }) : super(key: key);

  _ToggleState createState() => _ToggleState(
      formValue: formValue
  );
}

class _ToggleState extends State<Toggle> {

  final FormInput formValue;

  _ToggleState({ Key key, this.formValue });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        SizedBox(height: 20,),
        Container(alignment: Alignment.centerLeft, child: Text(formValue.name, textAlign: TextAlign.left, style: TextStyle(color: Colors.grey[600]),)),
        Switch(
          value: formValue.value,
          onChanged: (value) {
            setState(() {
              formValue.value = value;
            });
          },
        ),
        Text(formValue.description, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
      ],
    );
  }
}

Future<bool> openForm(BuildContext context, List<FormInput> formValues, String title) async {
  final oldContext = context;
  bool rep = false;
  await showDialog<void>(
      context: context,
      barrierDismissible: true,
      builder: (context) {
        final _formKey = GlobalKey<FormState>();
        return Opacity(
          opacity: 0.8,
          child: AlertDialog(
            actions: <Widget>[
              FlatButton(
                onPressed: () {
                  rep = false;
                  Navigator.of(context).pop();
                },
                child: Text(
                  'Cancel',
                  style: TextStyle(color: Colors.black),
                ),
              ),
              FlatButton(
                onPressed: () async {
                  if (!_formKey.currentState.validate()) {
                    return;
                  }
                  print("Form result : ");
                  for (final formValue in formValues) {
                    print("\t ${formValue.value} of type ${formValue.value.runtimeType}");
                  }
                  rep = true;
                  Navigator.of(context).pop();
                },
                child: Text(
                  'Add',
                  style: TextStyle(color: Colors.black),
                ),
              ),
            ],
            elevation: 20,
            title: Center(child: Text(title)),
            content: SingleChildScrollView(
              child: Form(
                key: _formKey,
                child: ListBody(
                  children: formValues.map((formValue) {
                    if (formValue.type == null || formValue.type == 'text') {
                      return TextFormField(
                        onChanged: (value) {
                          formValue.value = value;
                        },
                        maxLength: formValue.maxLength,
                        validator: (value) {
                          if (!formValue.optional && (value == null || value == '')) {
                            return "This field is not optional";
                          }
                          final length = value == null ? 0 : value.length;
                          if (formValue.minLength != null && length < formValue.minLength) {
                            return "This field should be at least ${formValue.minLength} characters";
                          }
                          return null;
                        },
                        decoration: InputDecoration(
                            labelText: formValue.name,
                            helperText: formValue.description,
                            helperMaxLines: 3
                        ),
                      );
                    } else if (formValue.type == 'number') {
                      return TextFormField(
                        onChanged: (value) {
                          try {
                            formValue.value = int.parse(value);
                          } catch (_) {}
                        },
                        validator: (value) {
                          if (!formValue.optional && (value == null || value == '')) {
                            return "This field is not optional";
                          }
                          if (double.parse(value, (e) => null) != null) {
                            if (formValue.minValue != null && formValue.value < formValue.minValue) {
                              return "Number should be above ${formValue.minValue}";
                            }
                            if (formValue.maxValue != null && formValue.value > formValue.maxValue) {
                              return "Number should be under ${formValue.maxValue}";
                            }
                            return null;
                          } else {
                            return "Please enter a valid number";
                          }
                        },
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                            labelText: formValue.name,
                            helperText: formValue.description,
                            helperMaxLines: 3
                        ),
                      );
                    } else if (formValue.type == 'select') {
                      formValue.value = formValue.choices[0].value;
                      return Selector(formValue: formValue,);
                    } else if (formValue.type == 'checkbox') {
                      formValue.value = true;
                      return Toggle(formValue: formValue,);
                    } else {
                      return Column(
                        children: <Widget>[
                          SizedBox(height: 20,),
                          Container(alignment: Alignment.centerLeft, child: Text("Error : input of type ${formValue.type} not recognized", textAlign: TextAlign.left, style: TextStyle(color: Colors.grey),)),
                        ],
                      );
                    }
                  }).toList(),
                ),
              ),
            ),
          ),
        );
      }
  );
  return rep;
}

class ServiceImage extends StatelessWidget {

  final String service;
  ServiceImage({ Key key, this.service = "undefined" }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    String finalService = this.service;
    if (this.service != 'twitter' && this.service != 'google' && this.service != 'github' && this.service != 'office365' && this.service != 'facebook' && this.service != 'weather' && this.service != 'time' && this.service != 'minecraft' && this.service != 'cron' && this.service != 'azuread' && this.service != 'facebook' && this.service != 'slack' && this.service != 'discord' && this.service != 'epitech' && this.service != 'free' && this.service != 'stock' && this.service != 'youtube' && this.service != 'microsoft-to-do' && this.service != 'outlook' && this.service != 'ssh' && this.service != 'twilio' && this.service != 'website' && this.service != 'youtube') {
      finalService = 'undefined';
    }
    return Image(image: AssetImage("assets/${finalService}-module.png"), fit: BoxFit.contain,);
  }
}

class MyCarousel extends StatefulWidget {

  final List<Module> children;
  final Workflow workflow;
  MyCarousel({ Key key, this.children, this.workflow }) : super(key: key);

  _MyCarouselState createState() => _MyCarouselState(
    children: children,
    workflow: workflow,
  );
}

class _MyCarouselState extends State<MyCarousel> {

  final List<Module> children;
  final Workflow workflow;
  _MyCarouselState({ Key key, this.children, this.workflow });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        margin: EdgeInsets.all(10.0),
        child: SizedBox(
          height: 70,
          child: CarouselSlider(
              enableInfiniteScroll: false,
              reverse: false,
              autoPlay: true,
              autoPlayInterval: Duration(seconds: 3),
              autoPlayAnimationDuration: Duration(milliseconds: 800),
              autoPlayCurve: Curves.fastOutSlowIn,
              viewportFraction: 0.4,
              pauseAutoPlayOnTouch: Duration(seconds: 6),
              enlargeCenterPage: true,
              scrollDirection: Axis.horizontal,
              items: this.children.asMap().map((index, reaction) {
                final Widget child = GestureDetector(
                    onTap: () async {
                      List<FormInput> formValues;
                      try {
                        if (reaction.type == 'reaction') {
                          formValues = await API.of(context).instance.getReactionForm(reaction.actionKind);
                        } else if (reaction.type == 'action') {
                          formValues = await API.of(context).instance.getActionForm(reaction.actionKind);
                        } else {
                          throw "Module type ${reaction.type} not recognized";
                        }
                        final rep = await openForm(context, formValues, "Configure you ${reaction.name} ${reaction.type}");
                        if (!rep) {
                          return;
                        }
                      } catch (msg) {
                        popUp(context, "Error while getting ${reaction.type} from", msg.toString());
                        return;
                      }
                      try {
                        if (reaction.type == 'reaction') {
                          await API.of(context).instance.updateReaction(reaction.id, reaction.actionKind, formValues);
                        } else if (reaction.type == 'action') {
                          await API.of(context).instance.updateAction(reaction.id, reaction.actionKind, formValues);
                        } else {
                          throw "Module type ${reaction.type} not recognized";
                        }
                      } catch (msg) {
                        popUp(context, "Error while updating ${reaction.type} ${reaction.actionKind}", msg.toString());
                      }
                    },
                    child: Container(
                      constraints: BoxConstraints(
                        maxHeight: 70,
                      ),
                      margin: EdgeInsets.symmetric(horizontal: 10.0),
                      child: Card(
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10.0)
                        ),
                        child: Stack(
                          children: <Widget>[
                            Container(padding: EdgeInsets.all(5) ,child: Center(child: Opacity(opacity: 0.4, child: ServiceImage(service: reaction.service,)))),
                            Container(
                              child: Center(child: Text(reaction.name, maxLines: 1,),),
                            ),
                          ],
                        ),
                      ),
                    )
                );

                return MapEntry(index,
                    LongPressDraggable<Module>(
                      data: reaction,
                      key: GlobalKey<_MyCarouselState>(),
                      onDragCompleted: () {
                        this.children.removeAt(index);
                        setState(() {});
                        try {
                          if (reaction.type == 'reaction') {
                            API.of(context).instance.deleteReaction(workflow.id, reaction.id, reaction.actionKind).catchError((msg) {
                              popUp(context, "Error while deleting module", msg.toString());
                            });
                          } else if (reaction.type == 'action') {
                            API.of(context).instance.deleteAction(workflow.id, reaction.id, reaction.actionKind).catchError((msg) {
                              popUp(context, "Error while deleting module", msg.toString());
                            });
                          } else {
                            throw "Module type ${reaction.type} not recognized";
                          }
                        } catch (msg) {
                          popUp(context, "Error while deleting module", msg.toString());
                        }
                      },
                      maxSimultaneousDrags: 1,
                      child: child,
                      feedback: Opacity(
                        opacity: 0.7,
                        child: Center(child: child),
                      ),
                      childWhenDragging: Container(),
                    )
                );
              }).values.toList()
          ),
        ),
      ),
    );
  }
}

class WorkflowCard extends StatefulWidget {
  final Workflow workflow;
  final List<Module> actions;
  final List<Module> reactions;
  final List<Module> availableActions;
  final List<Module> availableReactions;
  final bool enabled;
  WorkflowCard({Key key, this.workflow, this.actions, this.reactions, this.availableActions, this.availableReactions, this.enabled }) : super(key: key);

  _WorkflowCardState createState() => _WorkflowCardState(
    workflow: this.workflow,
    actions: this.actions,
    reactions: this.reactions,
    enabled: this.enabled,
  );
}

class _WorkflowCardState extends State<WorkflowCard> {

  TextEditingController controller;

  Workflow workflow;
  bool enabled;
  List<Module> actions;
  List<Module> reactions;
  _WorkflowCardState({ this.workflow, this.enabled = true, this.actions, this.reactions});

  @override
  void initState() {
    super.initState();
    controller = TextEditingController.fromValue(
      TextEditingValue(
        text: this.workflow.name,
      ),
    );
  }

  void displayOptions(BuildContext context, List<Module> options, bool reactions) {
    showMenu(
      useRootNavigator: true,
      context: context,
      position: RelativeRect.fromLTRB(65.0, 40.0, 0.0, 0.0),
      items: options.length == 0 ? [PopupMenuItem<String>(child: Text("Loading..."))] : options.map((Module option) {
        return PopupMenuItem<Module>(
          child: Container(
            constraints: BoxConstraints(
              maxWidth: 160,
              maxHeight: 50,
            ),
            margin: EdgeInsets.only(bottom: 5.0),
            child: ListTile(
              onTap: () async {


                try {
                  List<FormInput> formValues;
                  if (option.type == 'reaction') {
                    formValues = await API.of(context).instance.getReactionForm(option.actionKind);
                  } else if (option.type == 'action') {
                    formValues = await API.of(context).instance.getActionForm(option.actionKind);
                  } else {
                    throw "Module type ${option.type} not recognized";
                  }
                  if (formValues.length != 0) {
                    final rep = await openForm(context, formValues, "Configure you new ${option.name} ${option.type}");
                    print("Form result : ${rep}");
                    if (!rep) {
                      return;
                    }
                  }

                  if (option.type == 'reaction') {
                    final instanceId = await API.of(context).instance.addReactionToWorkflow(workflow.id, option.actionKind, formValues);
                    option.id = instanceId;
                    setState(() {
                      this.reactions.add(option);
                    });
                  } else if (option.type == 'action') {
                    final instanceId = await API.of(context).instance.addActionToWorkflow(workflow.id, option.actionKind, formValues);
                    option.id = instanceId;
                    setState(() {
                      this.actions.add(option);
                    });
                  } else {
                    throw "Module type ${option.type} not recognized";
                  }

                } catch (msg) {
                  popUp(context, "Error while adding ${option.type}", msg.toString());
                }

              },
              dense: true,
              leading: Container(
                child: ServiceImage(service: option.service,),
                padding: EdgeInsets.symmetric(vertical: 8.0),
              ),
              title: Text(option.name, overflow: TextOverflow.visible, maxLines: 1,),
              subtitle: Text(option.description, overflow: TextOverflow.visible, style: TextStyle(fontSize: 8), maxLines: 3,),
            ),
          ),
          value: option,
        );
      }).toList(),
    );
  }


  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return Column(
      children: <Widget>[
        Card(
          semanticContainer: true,
          elevation: 10,
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10.0)
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(10.0),
            child: Container(
              margin: EdgeInsets.symmetric(vertical: 4.0, horizontal: 10.0),
              child: Column(
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: <Widget>[
                      Switch(
                        value: this.enabled,
                        onChanged: (bool value) {
                          setState(() {
                            this.enabled = value;
                          });
                          API.of(context).instance.enableWorkflow(workflow.id, value).catchError((msg) {
                            popUp(context, "Error while ${value ? "enabling" : "disablign"} worflow", msg.toString());
                            setState(() {
                              this.enabled = !value;
                            });
                          });
                        },
                      ),
                      Expanded(
                        child: Container(
                          margin: EdgeInsets.symmetric(horizontal: 10.0),
                          child: TextFormField(
                            textAlign: TextAlign.left,
                            controller: this.controller,
                            onFieldSubmitted: (String value) {
                              API.of(context).instance.renameWorkflow(workflow.id, value).then((_) {
                                this.workflow.name = value;
                              }).catchError((msg) {
                                popUp(context, "Error while renaming worflow", msg.toString());
                              });
                            },
                            decoration: noBorder,
                          ),
                        ),
                      ),
                    ],
                  ),
                  Divider(indent: 60.0, endIndent: 60.0, color: Colors.black, thickness: 0.0,),
                  Container(child: Text("Actions"), margin: EdgeInsets.all(10.0),),
                  Row(
                    children: <Widget>[
                      FloatingActionButton(
                        mini: true,
                        onPressed: () {
                          this.displayOptions(context, widget.availableActions, false);
                        },
                        heroTag: null,
                        backgroundColor: Colors.blue,
                        child: Icon(Icons.add),
                      ),
                      MyCarousel(children: this.actions, workflow: workflow,)
                    ],
                  ),
                  Divider(indent: 60.0, endIndent: 60.0, color: Colors.black, thickness: 0.0,),
                  Container(child: Text("Reactions"), margin: EdgeInsets.all(10.0),),
                  Row(
                    children: <Widget>[
                      FloatingActionButton(
                        mini: true,
                        onPressed: () {
                          this.displayOptions(context, widget.availableReactions, true);
                        },
                        heroTag: null,
                        backgroundColor: Colors.blue,
                        child: Icon(Icons.add),
                      ),
                      MyCarousel(children: this.reactions, workflow: workflow,)
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
        SizedBox(height: 45,),
      ],
    );
  }
}