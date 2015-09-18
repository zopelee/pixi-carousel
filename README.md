# pixi-carousel
A canvas based image slider (carousel), with simple indicators and ability to zoom in/out.

## Demo
[Here](http://zopelee.github.io/pixi-carousel/www)

## Usage
#### Install
```
bower install pixi-carousel
```
#### Include
```
<script src="bower_components/pixi/bin/pixi.min.js"></script>
<script src="bower_components/hammerjs/hammer.min.js"></script>
<script src="bower_components/pixi-carousel/dist/pixi-carousel.min.js"></script>
```
#### Begin Slide
```
var sliderEl = document.getElementById('slider');
var slideMgr = new SlideManager(500, 500, {// width and height of the manager (not images)
  view: sliderEl, // mandatory, your canvas element
  bkg_color: 0xF2EFE1, // default 0x000000, the background color
  is_accelerated: true, // default false, turn it on to enable the gradual change on sliding speed
  slide_percent_y: 0.5, // default 0.5, vertical position of slide
  has_indicators: true, // default true
  indicator_percent_y: 0.95,
  indicator_color: 0x000000, indicator_color_active: 0x000000,
  indicator_fillAlpha: 0.2, indicator_fillAlpha_active: 0.8,
});
var imgs = [
  'assets/img/drip-871152_640.jpg',
  'assets/img/blur-21653_640.jpg',
  'assets/img/lotus-854919_640.jpg'
];
slideMgr.setSlidesAndStart(imgs, {width: 640, height: 426});   // aspect ratio should be same as image file
slideMgr.startAutoSlide(2000);
slideMgr.enableSwipe();
slideMgr.enableZoom();
```

## Dependencies
pixi.js, Hammer.js
