import 'package:http/http.dart' as http;
import 'dart:convert';

class Server {
  Server({ this.url });

  String url;
  Map<String, String> headers = {
    "Content-Type": "application/json"
  };

  void changeUrl(newUrl) {
    url = newUrl;
  }

  Future<http.Response> getRequest(String route) async {
    print("GET - $route");
    final response = await http.get(url + route, headers: headers);
    print("Response payload : ${response.body}");
    updateCookie(response);
    return response;
  }

  Future<http.Response> postRequest(String route, dynamic data) async {
    print("POST - $route");
    print("Payload : $data");
    final response = await http.post(url + route, headers: headers, body: json.encode(data));
    print("Response payload : ${response.body}");
    updateCookie(response);
    return response;
  }

  Future<http.Response> putRequest(String route, { dynamic data = const {} }) async {
    print("PUT - $route");
    print("Payload : $data");
    final response = await http.put(url + route, headers: headers, body: json.encode(data));
    print("Response payload : ${response.body}");
    updateCookie(response);
    return response;
  }

  Future<http.Response> deleteRequest(String route, { dynamic data = const {} }) async {
    print("DELETE - $route");
    print("Payload : $data");
    final response = await http.delete(url + route, headers: headers);
    updateCookie(response);
    return response;
  }

  void updateCookie(http.Response response) {
    print(response.headers);
    String rawCookie = response.headers['set-cookie'];

    if (rawCookie == null) return;
    int index = rawCookie.indexOf(';');
    headers['cookie'] =
        (index == -1) ? rawCookie : rawCookie.substring(0, index);
  }

  Future<bool> login(dynamic data) async {
    final response = await postRequest('/auth/login', data);
    if (response.statusCode >= 300) {
      print(response.body.toString());
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    updateCookie(response);
    return true;
  }

  Future<bool> register(dynamic data) async {
    final response = await postRequest('/auth/register', data);
    if (response.statusCode >= 300) {
      print(response.body.toString());
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    return true;
  }

  Future<User> me() async {
    final response = await getRequest('/auth/me');
    if (response.statusCode != 200) {
      final msg = json.decode(response.body.toString())['error']['more'];
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    return User.fromJson(json.decode(response.body));
  }

  Future<Workflow> createWorkflow(String name) async {
    final response = await postRequest('/workflows', { "name": name });
    if (response.statusCode >= 300) {
      print(response.body.toString());
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    return Workflow.fromJson(json.decode(response.body));
  }

  Future<Workflow> renameWorkflow(String id, String newName) async {
    final response = await putRequest('/workflows/$id', data: { "name": newName });
    if (response.statusCode >= 300) {
      print(response.body.toString());
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    return Workflow.fromJson(json.decode(response.body));
  }

  Future<void> enableWorkflow(String id, bool enable) async {
    final response = await postRequest('/workflows/$id/enable', { "enabled": enable.toString() });
    if (response.statusCode >= 300) {
      print(response.body.toString());
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
  }

  Future<bool> deleteWorkflow(String id) async {
    final response = await deleteRequest('/workflows/$id');
    if (response.statusCode >= 300) {
      print(response.body.toString());
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    return true;
  }

  Future<String> addActionToWorkflow(String workflowId, String actionId, List<FormInput> inputs) async {
    Map<String, dynamic> data = {};

    for (final input in inputs) {
      data[input.formId] = input.value;
    }
    final responseInstance = await postRequest('/modules/actions/$actionId', data);
    if (responseInstance.statusCode >= 300) {
      print(responseInstance.body.toString());
      final error = json.decode(responseInstance.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    final instance = json.decode(responseInstance.body);
    final instanceId = instance['instanceId'];
    final response = await postRequest('/workflows/$workflowId/actions', { "kind": actionId, "id": instanceId });
    if (response.statusCode >= 300) {
      print(response.body.toString());
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    return (instanceId);
  }

  Future<bool> updateAction(String instanceId, String id, List<FormInput> inputs) async {
      Map<String, dynamic> data = {};

      for (final input in inputs) {
        print(input.value);
        data[input.formId] = input.value;
      }
      final response = await putRequest(
          '/modules/actions/$id/$instanceId', data: data);
      if (response.statusCode >= 300) {
        print(response.body.toString());
        final error = json.decode(response.body.toString())['error'];
        dynamic msg;
        if (error["more"] != null) {
          msg = error["more"];
        } else if (error["message"] != null) {
          msg = error["message"];
        } else {
          msg = "Unknown error";
        }
        try {
          return Future.error(msg['error']);
        } catch (_) {
          return Future.error(msg);
        }
      }
      return true;
  }

  Future<bool> deleteAction(String workflowId, String instanceId, String id) async {
    var response = await deleteRequest('/workflows/$workflowId/actions/$id/$instanceId');
    response = await deleteRequest('/modules/actions/$id/$instanceId');
    if (response.statusCode >= 300) {
      print(response.body.toString());
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    return true;
  }

  Future<String> addReactionToWorkflow(String workflowId, String reactionId, List<FormInput> inputs) async {
    Map<String, dynamic> data = {};

    for (final input in inputs) {
      data[input.formId] = input.value;
    }
    final responseInstance = await postRequest('/modules/reactions/$reactionId', data);
    if (responseInstance.statusCode >= 300) {
      print(responseInstance.body.toString());
      final error = json.decode(responseInstance.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    final instance = json.decode(responseInstance.body);
    final instanceId = instance['instanceId'];
    final response = await postRequest('/workflows/$workflowId/reactions', { "kind": reactionId, "id": instanceId });
    if (response.statusCode >= 300) {
      print(response.body.toString());
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    return (instanceId);
  }

  Future<bool> updateReaction(String instanceId, String id, List<FormInput> inputs) async {
    Map<String, dynamic> data = {};

    for (final input in inputs) {
      if (input.value != null) {
        data[input.formId] = input.value;
      }
    }
    final response = await putRequest('/modules/reactions/$id/$instanceId', data: data);
    if (response.statusCode >= 300) {
      print(response.body.toString());
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    return true;
  }

  Future<bool> deleteReaction(String workflowId, String instanceId, String id) async {
    var response = await deleteRequest('/workflows/$workflowId/reactions/$id/$instanceId');
    response = await deleteRequest('/modules/reactions/$id/$instanceId');
    if (response.statusCode >= 300) {
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    return true;
  }

  Future<bool> subcribeFormService(Service service, List<FormInput> inputs) async {
    Map<String, dynamic> data = {};

    for (final input in inputs) {
      if (input.value != null) {
        data[input.formId] = input.value;
      }
    }
    final response = await postRequest(service.url, data);
    if (response.statusCode >= 300) {
      print(response.body.toString());
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    return true;
  }

  Future<List<LoginService>> getAvailableLoginServices() async {
    final response = await getRequest('/auth/');
    if (response.statusCode >= 300) {
      print(response.body.toString());
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    final jsonData = json.decode(response.body);
    List<LoginService> services = [];

    for (final service in jsonData['methods']) {
      services.add(LoginService.fromJson(service));
    }
    return services;
  }

  Future<List<Service>> getAvailableModuleServices() async {
    final response = await getRequest('/auth/linkstate');
    if (response.statusCode != 200)
      return Future.error('something goes wrong :(');
    final jsonData = json.decode(response.body);
    List<Service> services = [];

    for (final service in jsonData['services']) {
      services.add(Service.fromJson(service));
    }
    return services;
  }

  Future<List<FormInput>> getActionForm(String id) async {
    final response = await getRequest('/modules/actions/$id/form');
    print(response.statusCode);
    print(response.body);
    if (response.statusCode >= 300) {
      print(response.body.toString());
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    final jsonData = json.decode(response.body);

    return FormInput.fromJson(jsonData);
  }

  Future<List<Module>> getActionModules() async {
    final response = await getRequest('/modules/actions');
    if (response.statusCode >= 300) {
      print(response.body.toString());
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    final jsonData = json.decode(response.body);
    List<Module> modules = [];

    for (final module in jsonData) {
      modules.add(Module.fromJson(module, type: 'action'));
    }
    return modules;
  }

  Future<List<FormInput>> getReactionForm(String id) async {
    final response = await getRequest('/modules/reactions/$id/form');
    if (response.statusCode >= 300) {
      print(response.body.toString());
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    final jsonData = json.decode(response.body);

    return FormInput.fromJson(jsonData);
  }

  Future<List<Module>> getReactionModules() async {
    final response = await getRequest('/modules/reactions');
    if (response.statusCode >= 300) {
      print(response.body.toString());
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    final jsonData = json.decode(response.body);
    List<Module> modules = [];

    for (final module in jsonData) {
      modules.add(Module.fromJson(module, type: 'reaction'));
    }
    return modules;
  }

  Future<List<Workflow>> getWorkflows() async {
    final response = await getRequest('/workflows');
    if (response.statusCode >= 300) {
      print(response.body.toString());
      final error = json.decode(response.body.toString())['error'];
      dynamic msg;
      if (error["more"] != null) {
        msg = error["more"];
      } else if (error["message"] != null) {
        msg = error["message"];
      } else {
        msg = "Unknown error";
      }
      try {
        return Future.error(msg['error']);
      } catch (_) {
        return Future.error(msg);
      }
    }
    final jsonData = json.decode(response.body);
    List<Workflow> workflows = jsonData.map<Workflow>((workflow) => Workflow.fromJson(workflow)).toList();
    return workflows;
  }



}

class User {
  User({
    this.id,
    this.email
  });

  String id;
  String email;

  static User fromJson(dynamic json) {
    return User(
      id: json['id'],
      email: json['email']
    );
  }
}

class Service {
  Service({
    this.kind,
    this.id,
    this.name,
    this.url,
    this.connected,
    this.inputs
  });

  String kind;
  String id;
  String name;
  String url;
  bool connected;
  List<FormInput> inputs;

  static Service fromJson(dynamic json) {
    return Service(
      kind: json['kind'],
      id: json['id'],
      name: json['name'],
      url: json['url'],
      connected: json['connected'],
      inputs: FormInput.fromJson(json),
    );
  }
}

class LoginService {
  LoginService({
    this.name,
    this.url,
    this.id
  });

  String name;
  String url;
  String id;

  static LoginService fromJson(dynamic json) {
    return LoginService(name: json['name'], url: json['url'], id: json['id']);
  }
}

class Workflow {
  String id;
  String name;
  bool enabled;
  List<Module> actions;
  List<Module> reactions;

  Workflow({
    this.id,
    this.name,
    this.enabled,
    this.actions = const [],
    this.reactions = const [],
  });

  static Workflow fromJson(dynamic json) {
    return Workflow(
      id: json['id'],
      name: json['name'],
      enabled: json['enabled'],
      actions: json['actions'].map<Module>((action) => Module.fromJson(action, type: 'action')).toList(),
      reactions: json['reactions'].map<Module>((reaction) => Module.fromJson(reaction, type: 'reaction')).toList(),
    );
  }
}

class Module {
  Module({
    this.type,
    this.id,
    this.service,
    this.name,
    this.description,
    this.inputs,
    this.actionKind,
  });

  String type;
  String id;
  String service;
  String name;
  String description;
  String actionKind;
  List<FormInput> inputs;

  static Module fromJson(dynamic json, { String type = "module" }) {

    return Module(
      type: type,
      id: json['actionId'] != null ? json['actionId'] : json['reactionId'],
      service: json['service'],
      name: json['name'],
      actionKind: (json['actionKind'] != null || json['reactionKind'] != null) ? (json['actionKind'] != null ? json['actionKind'] : json['reactionKind']) : json['id'],
      description: json['description'] != null ? json['description'] : null,
      inputs: json['form'] != null ? FormInput.fromJson(json['form']) : null,
    );
  }
}

class FormInput {
  FormInput({
    this.type,
    this.formId,
    this.name,
    this.description,
    this.value,
    this.choices,
    this.minValue,
    this.maxValue,
    this.minLength,
    this.maxLength,
    this.optional,
  });

  String type;
  String formId;
  String name;
  String description;
  dynamic value;
  List<Choice> choices;
  int minValue;
  int maxValue;
  int minLength;
  int maxLength;

  bool optional;

  static List<FormInput> fromJson(dynamic json) {
    List<FormInput> inputs = [];

    if (json['inputs'] == null) return null;
    for (final input in json['inputs']) {
      inputs.add(FormInput(
        type: input['kind'],
        formId: input['formId'],
        name: input['name'],
        description: input['description'],
        choices: Choice.fromJson(input),
        minValue: input['minValue'],
        maxValue: input['maxValue'],
        minLength: input['minLength'],
        maxLength: input['maxLength'],
        optional: input['optional'] != null ? true : false,
      ));
    }
    return inputs;
  }
}

class Choice {
  Choice({
    this.name,
    this.value
  });

  String name;
  String value;

  static List<Choice> fromJson(dynamic json) {
    List<Choice> choices = [];

    if (json['choices'] == null) return null;
    for (final choice in json['choices']) {
      choices.add(Choice(
        name: choice['name'],
        value: choice['value'],
      ));
    }
    return choices;
  }
}