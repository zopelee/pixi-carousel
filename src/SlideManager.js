SlideManager.prototype = Object.create(SlideManagerBase.prototype);

function SlideManager(width, height, options) {
  SlideManagerBase.call(this, width, height, options);
  this.textures = [];
  this.sprites = [];
  this.graphics = new PIXI.Graphics();
//  this.stage = new PIXI.Stage(this.BKG_COLOR);   // pixi 2
  this.stage = new PIXI.Container();
//  this.renderer = new PIXI.CanvasRenderer(width, height, {view: options.view}, true);
  this.renderer = new PIXI.CanvasRenderer(width, height, {view: options.view, backgroundColor: this.BKG_COLOR}, true);   // pixi 3
}

SlideManager.prototype.render = function() {
//  SlideManagerBase.prototype.render.call(this);
  if (this.has_circles) {
    this.renderCircles();
  }
  for (var i = 0, len = this.slide_count; i < len; i++) {
    var sl = this.slides[i];
    var sp = this.sprites[i];
    sp.width = sl.width;
    sp.height = sl.height;
  }
  this.renderer.render(this.stage);
};

SlideManager.prototype.renderCircles = function() {
  this.graphics.clear();
  var len = this.circles.length;
  if (len > 1) {
    for (var i = 0; i < len; i++) {
      var cir = this.circles[i];
      this.graphics.beginFill(cir.color);
      this.graphics.fillAlpha = cir.fillAlpha;
      this.graphics.drawCircle(cir.position.x, cir.position.y, cir.radius);
      this.graphics.endFill();
    }
  }
};

SlideManager.prototype.init = function () {
  SlideManagerBase.prototype.init.call(this);
  for (var i = 0, len = this.slide_count; i < len; i++) {
    var sl = this.slides[i];
    if (sl.img) {
      var basetex = new PIXI.BaseTexture(sl.img);
      var tex = new PIXI.Texture(basetex);
    } else {
      var tex = PIXI.Texture.fromImage(sl.img_src);
    }
    this.textures.push(tex);
    var sp = new PIXI.Sprite(tex);
    sp.width = sl.width;
    sp.height = sl.height;
    sp.anchor = sl.anchor;
    sp.position = sl.position;
    this.sprites.push(sp);
    this.stage.addChild(sp);
    
    if (this.has_circles) {
      var cir = this.circles[i];
      this.graphics.beginFill(0xFFFFFF);
      this.graphics.fillAlpha = cir.fillAlpha;
      this.graphics.drawCircle(cir.position.x, cir.position.y, cir.radius);
      this.graphics.endFill();
    }
    this.stage.addChild(this.graphics);
  }
  //this.graphics.lineStyle(0, 0x000000, 1);
};
