import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:area_mobileapp/components/workflow.dart';
import 'package:area_mobileapp/utils/api/Server.dart';
import 'package:area_mobileapp/utils/systems/Api.dart';
import 'package:liquid_pull_to_refresh/liquid_pull_to_refresh.dart';
import 'package:area_mobileapp/components/popup.dart';
import '../servicesPage/servicesPage.dart';

class HomePage extends StatefulWidget {
  HomePage({Key key}) : super(key: key);

  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {

  Future<List<Module>> availableActionsRequest = null;
  Future<List<Module>> availableReactionsRequest = null;
  List<Module> availableActions = null;
  List<Module> availableReactions = null;
  Future<List<Workflow>> workflowsRequest = null;
  List<Workflow> workflows = null;

  @override
  Widget build(BuildContext context) {
    print("Building HomePage");
    if (this.workflowsRequest == null && this.workflows == null) {
      this.workflowsRequest = API.of(context).instance.getWorkflows();
      this.workflowsRequest.then((workflowsFetched) {
        setState(() {
          this.workflows = workflowsFetched;
        });
      }).catchError((msg) {
        popUp(context, "Error while fetching worflows", msg.toString());
      });
    }
    if (this.availableActionsRequest == null && availableActions == null) {
      this.availableActionsRequest = API.of(context).instance.getActionModules();
      this.availableActionsRequest.then((actions) {
        setState(() {
          this.availableActions = actions;
        });
      }).catchError((msg) {
        popUp(context, "Error while fetching actions", msg.toString());
      });
    }
    if (this.availableReactionsRequest == null && availableReactions == null) {
      this.availableReactionsRequest = API.of(context).instance.getReactionModules();
      this.availableReactionsRequest.then((reactions) {
        setState(() {
          this.availableReactions = reactions;
        });
      }).catchError((msg) {
        popUp(context, "Error while fetching reactions", msg.toString());
      });
    }
    return Scaffold(
      appBar: AppBar(
        title: Text('Area'),
        centerTitle: true,
        elevation: 0,
        actions: <Widget>[
          IconButton(
            icon: DragTarget<Module>(
              onWillAccept: (data) => true,
              builder: (context, candidates, rejects) {
                print(candidates);
                return candidates.length > 0
                    ? Icon(Icons.delete, color: Colors.red,)
                    : Icon(Icons.delete, color: Colors.white);
              },
            ),
          )
        ],
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          API.of(context).instance.createWorkflow("New worflow").then((workflow) {
            setState(() {
              workflows.add(Workflow(
                actions: [],
                reactions: [],
                enabled: true,
                name: "New workflow",
                id: workflow.id,
              ));
            });
          }).catchError((msg) {
            popUp(context, "Error while creating new worflow", msg.toString());
          });
        },
        child: Icon(Icons.add),
      ),
      body: DefaultTabController(
        length: 2,
        child: Scaffold(
          appBar: TabBar(
            tabs: <Widget>[
              Tab(child: Text('Workflows', style: TextStyle(color: Colors.black),),),
              Tab(child: Text('Services', style: TextStyle(color: Colors.black),),),
            ],
          ),
          body: TabBarView(
            children: <Widget>[
              this.workflows == null ? Center(
                  child: SizedBox(height: 75, width: 75, child: CircularProgressIndicator())
              ) : LiquidPullToRefresh(
                showChildOpacityTransition: false,
                height: 60.0,
                onRefresh: () async {
                  setState(() {
                    this.availableReactions = null;
                    this.availableReactionsRequest = null;
                    this.availableActions = null;
                    this.availableActionsRequest = null;
                    this.workflowsRequest = null;
                    this.workflows = null;
                  });
                  await Future.delayed(Duration(seconds: 1));
                },
                child: ListView(
                    padding: EdgeInsets.symmetric(horizontal: 10.0),
                    children: workflows.asMap().map((index, workflow) {
                      print(workflow.name);
                      return MapEntry(
                          index,
                          Stack(
                            key: GlobalKey<_HomePageState>(),
                            children: <Widget>[
                              WorkflowCard(
                                enabled: workflow.enabled,
                                workflow: workflow,
                                reactions: workflow.reactions,
                                actions: workflow.actions,
                                availableActions: this.availableActions != null ? this.availableActions : [],
                                availableReactions: this.availableReactions != null ? this.availableReactions : [],
                              ),
                              Align(
                                alignment: Alignment.topRight,
                                child: IconButton(
                                  icon: Icon(Icons.cancel, color: Colors.red),
                                  onPressed: () {
                                    print("deleting workflow ${workflow.name}");
                                    API.of(context).instance.deleteWorkflow(workflow.id).then((success) {
                                      setState(() {
                                        for (final a in workflows) {
                                          print(a.name);
                                        }
                                        print("removing elem at index $index");
                                        this.workflows.removeAt(index);
                                      });
                                    }).catchError((msg) {
                                      popUp(context, "Error while deleting worflow", msg.toString());
                                    });
                                  },
                                ),
                              )
                            ],
                          ));
                    }).values.toList()
                ),
              ),
              ServicesPage(),
            ],
          ),
        ),
      ),
    );
  }
}