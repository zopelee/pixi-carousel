function Circle(options) {
  options = options || {};
  this.radius = options.radius || 5;
  this.position = options.position || {x: 0, y: 0};
  this.color =  options.color || 0x000000;
  this.color_active =  options.color_active || 0x000000;
  this.fillAlpha =  options.fillAlpha || 0.9;
  this.fillAlpha_active =  options.fillAlpha_active || 0.5;
}