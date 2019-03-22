var bannedVars = ["Serial", "LOW", "HIGH", "INPUT", "OUTPUT", "RISING", "FALLING", "CHANGE",
                  "pinMode", "digitalWrite", "analogWrite", "digitalRead", "millis",
                  "analogRead", "delay", "main", "attachInterrupt", "detachInterrupt"];
var Range = ace.require('ace/range').Range;


function Debugger(editor) {

  //Breakpoints
  this.breakpoints = [];
  this.toggleBreakpoint = function(line) {
    if (this.breakpoints.includes(line)) {
      editor.session.clearBreakpoint(line);
      this.breakpoints.remove(line);
    } else {
      editor.session.setBreakpoint(line);
      this.breakpoints.push(line);
    }
    this.sendUpdatedBreakpoints();
  };
  this.sendUpdatedBreakpoints = function() {
    try {
      var breakpointsCopy = this.breakpoints.slice();
      var fixedBreakpoints = breakpointsCopy.map((x) => aceToJSCPP(x));
      jscpp.postMessage({type: "breakpoints", breakpoints: fixedBreakpoints});
    } catch (e) {

    }
  };

  this.stopDebuggingSession = function() {
    jscpp.postMessage({type: "debugger", action: "enabled", state: false});
    this.doContinue();
  };

  //Enabled
  this.isEnabled = function() {
    return document.getElementById("debugging-enabled").checked && this.breakpoints.length !== 0;
  };
  this.sendUpdateEnabled = function () {
    try {
      jscpp.postMessage({type: "debugger", action: "enabled", state: this.isEnabled()});
    } catch (e) {
      console.log(e);
    }
  };

  this.isLineValid = function(line) {
    return !(line < 0 || line >= editor.getSession().getLength());
  };

  this.handleMessage = function(message) {
    var sLine = JSCPPToAce(message.node.sLine);
    var eLine = JSCPPToAce(message.node.eLine);
    if (!this.isLineValid(sLine) || !this.isLineValid(eLine)) {
      this.doStepLine();
      return;
    }
    console.log(message.node);
    this.markedLine = editor.getSession().addMarker(
      new Range(sLine, message.node.sColumn - 1, eLine, message.node.eColumn - 1),
      "current-line",
      false);
    this.showVariables(message.variables);
    var fm = makeFrameManager(message.frameManager);
    this.renderState(fm);
  };

  //Marker
  this.markedLine = null;
  this.removeMarker = function() {
    if (this.markedLine !== null) {
      editor.getSession().removeMarker(this.markedLine);
    }
  };

  //Stepping
  this.doContinue = function() {
    if(running) {
      try {
        jscpp.postMessage({type: "debugger", action: "continue"});
        this.cleanup();
      } catch (e) {

      }
    } else {
      runCode();
    }
  };
  this.doStepLine = function() {
    try {
      jscpp.postMessage({type: "debugger", action: "stepLine"});
      this.cleanup();
    } catch (e) {

    }
  };
  this.doStepExpression = function() {
    try {
      jscpp.postMessage({type: "debugger", action: "stepExpression"});
      this.cleanup();
    } catch (e) {

    }
  };
  this.cleanup = function() {
    this.removeMarker();
    hideCanvas();
  };

  //Render
  this.showVariables = function(vars) {
    $("#control-tabs a[href=\"#debug\"]").tab("show");
    var tbody = $("#variables-table-body");
    tbody.html("");
    vars.forEach(function(v) {
      if (bannedVars.includes(v.name)) {
        return;
      }
      var tr = $("<tr>");
      var type = $("<td>");
      var name = $("<td>");
      var value = $("<td>");

      type.text(v.type);
      name.text(v.name);
      value.text(v.value);

      tr.append(type);
      tr.append(name);
      tr.append(value);

      tbody.append(tr);
    });
  };
  this.renderState = function(frameManager) {

    var date = new Date();
    var dateString = date.toDateString();
    var timeString = date.toLocaleTimeString();

    var name = nameField.value;
    var exerciseNumber = exerciseField.value;
    currentBoard.setContext({
      isCorrect: undefined,
      dateString: dateString,
      timeString: timeString,
      exerciseNumber: exerciseNumber,
      name: name
    });

    canvas.height = currentBoard.canvasHeight;
    canvas.width = currentBoard.canvasWidth;

    for (var i = 0; i < frameManager.frames.length; i++) {
      currentBoard.advance(frameManager.frames[i], i, frameManager);
    }

    currentBoard.draw(canvas.getContext("2d"));

    setStatus("Current State:", "");

    showCanvas(true);
  };

  //Editor
  editor.on("gutterclick", function(e) {
    debug.toggleBreakpoint(e.getDocumentPosition().row);
    e.stop();
  });
  editor.on("guttermousedown", function(e) {
    e.stop();
  });
}
