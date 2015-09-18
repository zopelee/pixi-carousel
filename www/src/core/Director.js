function Director(width, height, options) {
  this.now;
  this.dt;
  this.then = Date.now();
  
  options = options || {};
  this.WIDTH = width || 640;
  this.HEIGHT = height || 480;
}

Director.prototype.animate = function() {
  // don't override!
  this.now = Date.now();
  this.dt = this.now - this.then;

  requestAnimationFrame(this.animate.bind(this));
  this.updateAndRender(this.dt);
  
  this.then = this.now;
};

Director.prototype.updateAndRender = function(dt) {
  // must override!
  this.update(dt);
  this.render();
};

Director.prototype.update = function(dt) {
  // must override!
};

Director.prototype.render = function() {
  // must override!
};

