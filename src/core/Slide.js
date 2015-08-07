function Slide(width, height, img_src, img) {
  this.width = width || 640;
  this.height = height || 480;
  this.width_cached = this.width;
  this.height_cached = this.height;
  this.height = height;
  this.img_src = img_src;
  this.img = img || null;

  this.anchor = {x: 0.5, y: 0.5};
  this.position = {x: 0, y: 0};
  this.cached_position = {x: 0, y: 0};
  this.temp_position = {x: 0, y: 0};
}

Slide.prototype.cache_position = function() {
  this.cached_position.x = this.position.x;
  this.cached_position.y = this.position.y;
};

Slide.prototype.restoreCachedPosition = function() {
  this.position.x = this.cached_position.x;
  this.position.y = this.cached_position.y;
};

Slide.prototype.saveTempPosition = function() {
  this.temp_position.x = this.position.x;
  this.temp_position.y = this.position.y;
};

Slide.prototype.cache_size = function() {
  this.width_cached = this.width;
  this.height_cached = this.height;
};
