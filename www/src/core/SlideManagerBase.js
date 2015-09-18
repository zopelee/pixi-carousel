SlideManagerBase.prototype = Object.create(Director.prototype);

function SlideManagerBase(width, height, options) {
  Director.call(this, width, height, options);
  options = options || {};
  this.SLIDE_DURATION = options.slide_duration || 300;
  this.SLIDE_PERCENT_Y = options.slide_percent_y || 0.5;
  // SLIDE_PERCENT_Y only effect when scale is CROP
  this.CIRCLE_COLOR = options.indicator_color || 0x000000;
  this.CIRCLE_COLOR_ACTIVE = options.indicator_color_active || 0x000000;
  this.CIRCLE_FILLALPHA = options.indicator_fillAlpha || 0.9;
  this.CIRCLE_FILLALPHA_ACTIVE = options.indicator_fillAlpha_active || 0.5;
  this.CIRCLE_RADIUS = options.indicator_radius || 8;
  this.CIRCLE_MARGIN = options.indicator_margin || 25;
  this.CIRCLE_PERCENT_Y = options.indicator_percent_y || 0.9;
  this.BKG_COLOR = options.bkg_color || 0x000000;
  this.scale = options.scale || this.SCALES.FIT;

  this.has_indicators = options.has_indicators || true;
  this.speed = this.WIDTH / this.SLIDE_DURATION;
  this.is_accelerated = options.is_accelerated || false;
  this.initial_speed = this.is_accelerated ? (2 * this.WIDTH / this.SLIDE_DURATION) : this.speed;
  this.acceleration = this.is_accelerated ? (this.initial_speed / this.SLIDE_DURATION) : 0;

  this.is_auto_slide = options.is_auto_slide || false;
  this.interval = options.interval || 1000;

  this.zoom_ratio = options.zoom_ratio || 2;
  this.zoom_interval = options.zoom_interval || 300;

  this.states = {
    still: {duration: null},
    sliding_left: {duration: this.SLIDE_DURATION},
    sliding_right: {duration: this.SLIDE_DURATION},
    zoomming_in: {},
    zoomming_out: {},
    inspecting: {}
  };
  this.state = this.states.still;
  this.state_time = 0;
  this.slides = [];
  this.slide_count = 0;
  this.indicators = [];

  this.is_position_adjusted = false;

  this.onInit = options.onInit || null;
  this.onSlideBegin = options.onSlideBegin || null;
  this.onSlideEnd = options.onSlideEnd || null;
}

SlideManagerBase.prototype.getZoomedLength = function (length_cached, state_time) {
  return 0.37 * length_cached * Math.log(state_time + (1 + Math.sqrt(1 + 4 * this.zoom_interval)) / 2);
};

SlideManagerBase.prototype.zoomIn = function () {
  if (this.state !== this.states.still) {
    return;
  }
  this.state = this.states.zoomming_in;
  this.state_time = 0;
  var slide = this.getActiveSlide();
  if (slide) {
    slide.cache_position();
    slide.saveTempPosition();
    slide.cache_size();
  }
};

SlideManagerBase.prototype.zoomOut = function () {
  if (this.state !== this.states.inspecting) {
    return;
  }
  var slide = this.getActiveSlide();
  if (slide) {
    slide.restoreCachedPosition();
  }
  this.state = this.states.zoomming_out;
  this.state_time = 0;
};

SlideManagerBase.prototype.update = function (dt) {
  Director.prototype.update.call(this, dt);
  if (this.slide_count < 2) {
    return;
  }

  this.state_time += dt;
  switch (this.state) {
    case this.states.still:
      if (this.is_auto_slide === true && this.state_time > this.interval) {
        this.slideLeft();
      }
      break;
    case this.states.zoomming_in:
      if (this.state_time > this.zoom_interval) {
        this.state = this.states.inspecting;
        this.state_time = 0;
      } else {
        var slide = this.getActiveSlide();
        slide.width = this.getZoomedLength(slide.width_cached, this.state_time);
        slide.height = this.getZoomedLength(slide.height_cached, this.state_time);
      }
      break;
    case this.states.zoomming_out:
      var slide = this.getActiveSlide();
      if (this.state_time > this.zoom_interval) {
        this.state = this.states.still;
        this.state_time = 0;
        slide.width = slide.width_cached;
        slide.height = slide.height_cached;
      } else {
        slide.width = 3 * slide.width_cached - this.getZoomedLength(slide.width_cached, this.state_time);
        slide.height = 3 * slide.height_cached - this.getZoomedLength(slide.height_cached, this.state_time);
      }
      break;
    case this.states.inspecting:
    default:
      // sliding
      if (this.state_time > this.state.duration) {
//      this.is_position_adjusted = false;
//      this.adjustPosition();
        // sliding finished
        if (this.onSlideEnd) {
          this.onSlideEnd();
        }
        var active_slide = this.getActiveSlide();
        var offset = this.WIDTH / 2 - active_slide.position.x;
        for (var i = 0; i < this.slide_count; i++) {
          this.slides[i].position.x += offset;
        }
        this.state = this.states.still;
        this.state_time = this.state_time - this.state.duration;
        this.adjustCircles();
      } else {
        // sliding not finished
        switch (this.state) {
          case this.states.sliding_left:
            this.updateSliding();
            break;
          case this.states.sliding_right:
            this.updateSliding();
            break;
          default:
            break;
        }
        this.adjustPosition();
      }
      break;
  }
};

SlideManagerBase.prototype.updateSliding = function () {
  var sign = this.state === this.states.sliding_left ? -1 : 1;
  for (var i = 0; i < this.slide_count; i++) {
    var delta_s = this.initial_speed * this.state_time - 0.5 * this.acceleration * Math.pow(this.state_time, 2);
    this.slides[i].position.x = this.slides[i].cached_position.x + sign * delta_s;
  }
};

SlideManagerBase.prototype.getSpeed = function () {
  if (this.state === this.states.still) {
    return 0;
  }

  if (this.is_accelerated) {
    return this.initial_speed - this.acceleration * this.state_time;
  } else {
    return this.initial_speed;
  }
};

SlideManagerBase.prototype.getActiveSlide = function () {
  // the nearest slide
  if (!this.slides.length) {
    return false;
  }
  var slide = this.slides.reduce(function (s1, s2) {
    return Math.abs(s1.position.x - this.WIDTH / 2) < Math.abs(s2.position.x - this.WIDTH / 2) ? s1 : s2;
  }.bind(this));
  return slide;
};

SlideManagerBase.prototype.getActiveIndex = function () {
  if (!this.slides.length) {
    return false;
  }
  // the nearest slide
  return this.slides.indexOf(this.getActiveSlide());
};

SlideManagerBase.prototype.adjustCircles = function () {
  var active_index = this.slides.indexOf(this.getActiveSlide());
  for (var i = 0, len = this.indicators.length; i < len; i++) {
    this.indicators[i].color = this.CIRCLE_COLOR;
    this.indicators[i].fillAlpha = this.CIRCLE_FILLALPHA;
  }
  this.indicators[active_index].color = this.CIRCLE_COLOR_ACTIVE;
  this.indicators[active_index].fillAlpha = this.CIRCLE_FILLALPHA_ACTIVE;
};

SlideManagerBase.prototype.adjustPosition = function () {
  if (this.is_position_adjusted) {
    return;
  }
  var left_slide = this.slides.reduce(function (s1, s2) {
    return s1.position.x < s2.position.x ? s1 : s2;
  }.bind(this));
  var right_slide = this.slides.reduce(function (s1, s2) {
    return s1.position.x > s2.position.x ? s1 : s2;
  }.bind(this));
  if (this.state === this.states.sliding_left && left_slide.position.x < this.WIDTH / 2 && left_slide !== this.getActiveSlide()) {
    left_slide.position.x = right_slide.position.x + this.WIDTH;
    left_slide.cached_position.x = right_slide.cached_position.x + this.WIDTH;
  } else if (this.state === this.states.sliding_right && right_slide.position.x > this.WIDTH / 2 && right_slide !== this.getActiveSlide()) {
    right_slide.position.x = left_slide.position.x - this.WIDTH;
    right_slide.cached_position.x = left_slide.cached_position.x - this.WIDTH;
  }
  this.is_position_adjusted = true;
};

SlideManagerBase.prototype.slideLeft = function () {
  if (this.state !== this.states.still) {
    return;
  }
  if (this.onSlideBegin) {
    this.onSlideBegin();
  }
  this.is_position_adjusted = false;
  this.cache_slide_positions();
  this.state = this.states.sliding_left;
  this.state_time = 0;
};

SlideManagerBase.prototype.slideRight = function () {
  if (this.state !== this.states.still) {
    return;
  }
  if (this.onSlideBegin) {
    this.onSlideBegin();
  }
  this.is_position_adjusted = false;
  this.cache_slide_positions();
  this.state = this.states.sliding_right;
  this.state_time = 0;
};

SlideManagerBase.prototype.panTo = function (x, y) {
  if (this.state !== this.states.inspecting) {
    return;
  }
  var slide = this.getActiveSlide();
  if (slide) {
    if (x - 0.5 * slide.width >= 0 || x + 0.5 * slide.width <= this.WIDTH) {
    } else {
      slide.position.x = x;
    }
    if (y - 0.5 * slide.height >= 0 || y + 0.5 * slide.height <= this.HEIGHT) {
    } else {
      slide.position.y = y;
    }
  }
};

SlideManagerBase.prototype.startAutoSlide = function (interval) {
  this.interval = interval || this.interval;
  this.is_auto_slide = true;
};

SlideManagerBase.prototype.stopAutoSlide = function () {
  this.is_auto_slide = false;
};

SlideManagerBase.prototype.cache_slide_positions = function () {
  for (var i = 0; i < this.slide_count; i++) {
    this.slides[i].cache_position();
  }
};

SlideManagerBase.prototype.setSlidesAndStart = function (img_srcs, options) {
  this.setSlides(img_srcs, options);
  this.init();
  this.animate();
};

SlideManagerBase.prototype.setSlides = function (img_srcs, options) {
  options = options || {};
  var width = options.width || this.WIDTH;
  var height = options.height || this.HEIGHT;
  this.slide_count = img_srcs.length;
  for (var i = 0; i < this.slide_count; i++) {
    if (typeof (img_srcs[i]) === 'string') {
      this.slides.push(new Slide(width, height, img_srcs[i], null));
    } else {
      this.slides.push(new Slide(width, height, null, img_srcs[i]));
    }
  }
};

SlideManagerBase.prototype.init = function () {
  // position slides and indicators
  var len = this.slide_count;
  var left_indicator_x = this.WIDTH / 2 - (len - 1) * this.CIRCLE_MARGIN / 2;
  for (var i = 0; i < len; i++) {
    var slide = this.slides[i];

//    slide.width = this.WIDTH;
//    slide.height = this.HEIGHT;
    slide.anchor.x = 0.5;
    slide.anchor.y = 0.5;
    slide.position.x = this.WIDTH / 2 + i * this.WIDTH;
    slide.position.y = this.HEIGHT * this.SLIDE_PERCENT_Y;

    switch (this.scale) {
      case this.SCALES.STRETCH:
        slide.width = this.WIDTH;
        slide.height = this.HEIGHT;
        slide.position.y = this.HEIGHT * 0.5;
      case this.SCALES.FIT:
        var aspRatio = slide.width / slide.height;
        if (aspRatio > this.WIDTH / this.HEIGHT) {
          slide.width = this.WIDTH;
          slide.height = slide.width / aspRatio;
        } else {
          slide.height = this.HEIGHT;
          slide.width = slide.height * aspRatio;
        }
      case this.SCALES.CROP:
      default:
    }

    var indicator = new Circle({
      radius: this.CIRCLE_RADIUS,
      position: {x: left_indicator_x + this.CIRCLE_MARGIN * i, y: this.HEIGHT * this.CIRCLE_PERCENT_Y},
      color: i === 0 ? this.CIRCLE_COLOR_ACTIVE : this.CIRCLE_COLOR,
      fillAlpha: i === 0 ? this.CIRCLE_FILLALPHA_ACTIVE : this.CIRCLE_FILLALPHA,
    });
    this.indicators.push(indicator);
  }
  if (this.onInit) {
    this.onInit();
  }
};

SlideManagerBase.prototype.SCALES = {
  CROP: {},
  STRETCH: {},
  FIT: {}
};