var LED = function(rt) {


  var led = rt.newClass("Led", []);

  var led_const = function (rt, _this, pin) {
    _this.v.pinNumber = pin.v;
  };
  rt.regFunc(led_const, led, "#constructor", [rt.unsignedcharTypeLiteral], rt.voidTypeLiteral);

  rt.types[rt.getTypeSignature(led)] = {
    "#father": "object",
    "#constructor": led_const
  };
  var led_setupLed = function (rt, _this) {
    pinMode(rt, _this.v.pinNumber, OUTPUT);
  };
  rt.regFunc(led_setupLed, led, "setupLed", [], rt.voidTypeLiteral);

  var led_turnOn = function (rt, _this) {
    digitalWrite(rt, _this.pinNumber.v, HIGH);
  };
  rt.regFunc(led_turnOn, led, "turnOn", [], rt.voidTypeLiteral);

  var led_turnOff = function (rt, _this) {
    digitalWrite(rt, _this.pinNumber.v, LOW);
  };
  rt.regFunc(led_turnOff, led, "turnOff", [], rt.voidTypeLiteral);

  var led_blinkLed = function (rt, _this, onTime, offTime) {
    digitalWrite(rt, _this.pinNumber.v, HIGH);
    delay(rt, onTime);
    digitalWrite(rt, _this.pinNumber.v, LOW);
    delay(rt, offTime);
  };
  rt.regFunc(led_blinkLed, led, "blinkLed", [rt.unsignedintTypeLiteral, rt.unsignedintTypeLiteral], rt.voidTypeLiteral);


};


function addIncludes(config) {
  var includes = config.includes;
  includes["Led.h"] = {load: LED};
}