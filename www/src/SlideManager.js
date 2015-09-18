SlideManager.prototype = Object.create(SlideManagerBase.prototype);

function SlideManager(width, height, options) {
  SlideManagerBase.call(this, width, height, options);
  this.textures = [];
  this.sprites = [];
  this.graphics = new PIXI.Graphics();
//  this.stage = new PIXI.Stage(this.BKG_COLOR);   // pixi 2
  this.stage = new PIXI.Container();
//  this.renderer = new PIXI.CanvasRenderer(width, height, {view: options.view}, true);
  this.renderer = PIXI.autoDetectRenderer(width, height, {view: options.view, backgroundColor: this.BKG_COLOR});   // pixi 3

  this.hammertime = new Hammer(options.view);
  this.hammertime.get('swipe').set({direction: Hammer.DIRECTION_HORIZONTAL});
  this.hammertime.get('pan').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 100});
}

SlideManager.prototype.render = function () {
//  SlideManagerBase.prototype.render.call(this);
  if (this.has_indicators) {
    this.renderIndicators();
  }
  for (var i = 0, len = this.slide_count; i < len; i++) {
    var sl = this.slides[i];
    var sp = this.sprites[i];
    sp.width = sl.width;
    sp.height = sl.height;
  }
  this.renderer.render(this.stage);
};

SlideManager.prototype.renderIndicators = function () {
  this.graphics.clear();
  var len = this.indicators.length;
  if (len > 1) {
    for (var i = 0; i < len; i++) {
      var cir = this.indicators[i];
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

    if (this.has_indicators) {
      var cir = this.indicators[i];
      this.graphics.beginFill(0xFFFFFF);
      this.graphics.fillAlpha = cir.fillAlpha;
      this.graphics.drawCircle(cir.position.x, cir.position.y, cir.radius);
      this.graphics.endFill();
    }
    this.stage.addChild(this.graphics);
  }
  //this.graphics.lineStyle(0, 0x000000, 1);
};

SlideManager.prototype.enableSwipe = function () {
  this.hammertime.on('swipeleft panleft', function (ev) {
    this.slideLeft();
  }.bind(this));
  this.hammertime.on('swiperight panright', function (ev) {
    this.slideRight();
  }.bind(this));
}

SlideManager.prototype.enableZoom = function () {
  this.hammertime.on('tap', function (ev) {
    if (this.state === this.states.inspecting) {
      this.hammertime.get('pan').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 100});
      this.zoomOut();
    } else {
      this.hammertime.get('pan').set({direction: Hammer.DIRECTION_ALL, threshold: 1});
      this.zoomIn();
    }
  }.bind(this));
  this.hammertime.on('pan', function (ev) {
    var slide = this.getActiveSlide();
    if (slide) {
      if (this.state !== this.states.inspecting) {
        return;
      }
      ev.preventDefault();
      this.panTo(slide.temp_position.x + ev.deltaX, slide.temp_position.y + ev.deltaY);
    }
  }.bind(this));
  this.hammertime.on('panend', function (ev) {
    var slide = this.getActiveSlide();
    if (slide) {
      slide.saveTempPosition();
    }
  }.bind(this));
};
