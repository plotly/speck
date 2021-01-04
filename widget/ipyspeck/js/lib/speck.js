var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
const speckRenderer = require('../../../../src/renderer.js');
const speckSystem = require('../../../../src/system.js');
const speckView = require('../../../../src/view.js');
const speckInteractions = require('../../../../src/interactions.js');
const speckPresetViews = require('../../../../src/presets.js');
const speckMain = require('../../../../src/main.js');


// See example.py for the kernel counterpart to this file.


// Custom Model. Custom widgets models must at least provide default values
// for model attributes, including
//
//  - `_view_name`
//  - `_view_module`
//  - `_view_module_version`
//
//  - `_model_name`
//  - `_model_module`
//  - `_model_module_version`
//
//  when different from the base class.

// When serialiazing the entire widget state for embedding, only values that
// differ from the defaults will be specified.
var SpeckModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name : 'SpeckModel',
        _view_name : 'SpeckView',
        _model_module : 'ipyspeck',
        _view_module : 'ipyspeck',
        _model_module_version : '0.0.1',
        _view_module_version : '0.0.1',
        data : '',
        bonds : true,
        atomScale : 0.35,
        relativeAtomScale: 1.0,
        bondScale: 0.5,
        brightness: 0.5,
        outline: 0.0,
        spf: 32,
        bondThreshold: 1.2,
        bondShade: 0.5,
        atomShade: 0.5,
        dofStrength: 0.0,
        dofPosition: 0.5
    })
});


// Custom View. Renders the widget model.
var SpeckView = widgets.DOMWidgetView.extend({

  initialize: function() {
      this.system = speckSystem.new();
      this.view = speckView.new();
      this.view.resolution.x = 200;
      this.view.resolution.y = 200;
      this.view.bonds = this.model.get('bonds');
      this.view.atomScale= this.model.get('atomScale');
      this.view.relativeAtomScale= this.model.get('relativeAtomScale');
      this.view.bondScale= this.model.get('bondScale');
      this.view.brightness= this.model.get('brightness');
      this.view.outline= this.model.get('outline');
      this.view.spf= this.model.get('spf');
      this.view.bondThreshold= this.model.get('bondThreshold');
      this.view.bondShade= this.model.get('bondShade');
      this.view.atomShade= this.model.get('atomShade');
      this.view.dofStrength= this.model.get('dofStrength');
      this.view.dofPosition= this.model.get('dofPosition');

      this.renderer = null;
      this.needReset = false;
      let self = this;
      self.container = document.createElement('div')
      self.canvas = document.createElement('canvas')
      self.container.append(self.canvas)
      self.el.append(self.container)
      self.el.style.width="100%"
      self.el.style.height="100%"

      speckInteractions({
        container : self.container,
        scrollZoom : true,
        getRotation : function (){return self.view.rotation},
        setRotation : function (t){self.view.rotation = t},
        getTranslation : function (){return self.view.translation},
        setTranslation : function ( t ){self.view.translation=t},
        getZoom : function (){return self.view.zoom},
        setZoom : function (t ){self.view.zoom=t},
        refreshView : function(){self.needReset=true;}
      })
    },

    loadStructure: function() {
        let self = this;
        self.system = undefined;
        var data = self.xyz(self.model.get('data'))[0]
        if (data){
          self.system = speckSystem.new();
          for (var i = 0; i < data.length; i++) {
              var a = data[i];
              var x = a.position[0];
              var y = a.position[1];
              var z = a.position[2];
              speckSystem.addAtom(self.system, a.symbol, x,y,z);
          }
          self.center();
        }
    },

    center: function(){
      let self = this;
      if (self.system){
        speckSystem.center(self.system);
        speckSystem.calculateBonds(self.system);
        this.renderer.setSystem(self.system, self.view);
        speckView.center(self.view, self.system);
        self.needReset = true;
      }
    },

    xyz: function(data) {
      var lines = data.split('\n');
      var natoms = parseInt(lines[0]);
      var nframes = Math.floor(lines.length/(natoms+2));
      var trajectory = []
      for(var i = 0; i < nframes; i++) {
          var atoms = [];
          for(var j = 0; j < natoms; j++) {
              var line = lines[i*(natoms+2)+j+2].split(/\s+/);
              var atom = {};
              var k = 0;
              while (line[k] == "") k++;
              atom.symbol = line[k++];
              atom.position = [parseFloat(line[k++]), parseFloat(line[k++]), parseFloat(line[k++])];
              atoms.push(atom);
          }
          trajectory.push(atoms);
      }
      return trajectory;
    },

    reflow: function() {
      let self = this;
      var ww = self.container.parentElement.clientWidth;
      var wh = self.container.parentElement.clientHeight;
      if (ww == 0)
        ww = self.view.resolution.x;
      if (wh == 0)
        wh = self.view.resolution.y;
      if (self.view.resolution.x == ww && self.view.resolution.y == wh)
        return;
      self.container.style.height = wh + "px";
      self.container.style.width = ww + "px";
      self.container.style.left = 0 + "px";
      self.container.style.top = 0 + "px";
      self.view.resolution.x=ww;
      self.view.resolution.y=wh;
      self.renderer = new speckRenderer(self.canvas, self.view.resolution, self.view.aoRes);
    },

    loop: function() {
       let self = this;
       if (self.needReset) {
            self.renderer.reset();
            self.needReset = false;
        }
        self.renderer.render(self.view);
        requestAnimationFrame(function(){self.loop()});
    },

    render: function() {
        let self = this;
        this.model.on('change:data', this.loadStructure, this);
        this.model.on('change:bonds', function(){this.view.bonds = this.model.get('bonds');this.needReset = true;}, this);
        this.model.on('change:atomScale', function(){this.view.atomScale = this.model.get('atomScale');this.needReset = true;}, this);
        this.model.on('change:relativeAtomScale', function(){this.view.relativeAtomScale = this.model.get('relativeAtomScale');this.needReset = true;}, this);
        this.model.on('change:bondScale', function(){this.view.bondScale = this.model.get('bondScale');this.needReset = true;}, this);
        this.model.on('change:brightness', function(){this.view.brightness = this.model.get('brightness');this.needReset = true;}, this);
        this.model.on('change:outline', function(){this.view.outline = this.model.get('outline');this.needReset = true;}, this);
        this.model.on('change:spf', function(){this.view.spf = this.model.get('spf');this.needReset = true;}, this);
        this.model.on('change:bondThreshold', function(){this.view.bondThreshold = this.model.get('bondThreshold');this.loadStructure();}, this);
        this.model.on('change:bondShade', function(){this.view.bondShade = this.model.get('bondShade');this.needReset = true;}, this);
        this.model.on('change:atomShade', function(){this.view.atomShade = this.model.get('atomShade');this.needReset = true;}, this);
        this.model.on('change:dofStrength', function(){this.view.dofStrength = this.model.get('dofStrength');this.needReset = true;}, this);
        this.model.on('change:dofPosition', function(){this.view.dofPosition = this.model.get('dofPosition');this.needReset = true;}, this);
    },

    /**
      * Respond to phosphorjs events
      */
     processPhosphorMessage: function (msg) {
       SpeckView.__super__.processPhosphorMessage.apply(this, arguments);
       let self = this;
       switch (msg.type) {
         case "before-attach":
           window.addEventListener("resize", function () {
              self.reflow();
              self.loadStructure();
           });
           break;
           case "after-attach":
             // Rendering actual figure in the after-attach event allows
             // Plotly.js to size the figure to fill the available element
             self.reflow()
             self.loop();
             self.loadStructure();
             break;
           case "resize":
             self.reflow();
             self.center();
             break;
       }
     },
});


module.exports = {
    SpeckModel: SpeckModel,
    SpeckView: SpeckView
};
