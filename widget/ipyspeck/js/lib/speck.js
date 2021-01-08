var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
const speckRenderer = require('./renderer.js');
const speckSystem = require('./system.js');
const speckView = require('./src/view.js');
const speckInteractions = require('./src/interactions.js');
const speckPresetViews = require('./src/presets.js');


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
      self.canvas.addEventListener('dblclick', function(){
        self.center();
      });
      self.sidebar = document.createElement('div')
      self.sidebar.style.top = "0px"
      self.sidebar.style.height = "20px"
      self.sidebar.style.right = "0px"
      self.sidebar.style.position = "absolute"
      self.sidebar.style.background = "rgba(255,255,255,0.5)"
      self.sidebar.style.flexDirection = "row";
      self.sidebar.style.alignContent = "flex-end";
      self.sidebar.style.display = "flex";

      self.autoscale = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      self.autoscale.setAttribute('width', "16");
      self.autoscale.setAttribute('height', "16");
      self.autoscale.setAttribute('viewBox', "0 0 16 16");
      self.autoscale.setAttribute('fill', "#AAAAAA");
      self.autoscale.addEventListener('mouseover', function(){
        self.autoscale.setAttribute('fill', "#666666");
      });
      self.autoscale.addEventListener('mouseout', function(){
        self.autoscale.setAttribute('fill', "#AAAAAA");
      });
      self.autoscale.innerHTML = '<g><path d="M 4,0L 1,0 L 0,0 l0,1 l0,3 l 1,0 l0-3 l 3,0 L 4,0z M 15,0l-3,0 l0,1 l 3,0 l0,3 l 1,0 l0-3 l0-1 L 15,0 z M 1,15l0-3 L 0,12 l0,3 l0,1 l 1,0 l 3,0 l0-1 L 1,15 z M 15,12l0,3 l-3,0 l0,1 l 3,0 l 1,0 l0-1 l0-3 L 15,12 z M 13,9l-0.008-0.003L 11.5,10.5l-2.5-2.5l 2.5-2.5l 1.471,1.5L 13,7 l0-4 l-4,0 l0,0.030 l 1.5,1.47l-2.5,2.5l-2.5-2.5l 1.5-1.47l0-0.030 L 3,3 l0,4 l0,0l 1.5-1.5l 2.5,2.5l-2.5,2.5L 3,9l0,0l0,4 l 4,0 l0,0l-1.5-1.5l 2.5-2.5l 2.5,2.5l-1.5,1.5l0,0l 4,0 L 13,9 z"></path></g>';
      self.autoscale.addEventListener('click', function(){
        self.center();
      });
      self.autoscalec = document.createElement("div");
      self.autoscalec.style.padding="2px"
      self.autoscalec.append(self.autoscale)

      self.front = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      self.front.setAttribute('width', "16");
      self.front.setAttribute('height', "16");
      self.front.setAttribute('viewBox', "0 0 16 16");
      self.front.setAttribute('fill', "#AAAAAA");
      self.front.setAttribute('stroke', "#AAAAAA");
      self.front.addEventListener('mouseover', function(){
        self.front.setAttribute('fill', "#666666");
        self.front.setAttribute('stroke', "#666666");
      });
      self.front.addEventListener('mouseout', function(){
        self.front.setAttribute('fill', "#AAAAAA");
        self.front.setAttribute('stroke', "#AAAAAA");
      });
      self.front.innerHTML = '<g><path d="M 0 5 h 10 v 10 h -10 v -10" fill="none"/><path d="M 4 0 h 10 l -4 4 h -10 l -4 4" stroke="none"/><path d="M 11 5 l 4 -4 v 10 l -4 4 v -10" stroke="none"/></g>';
      self.front.addEventListener('click', function(){
        self.frontview();
      });
      self.frontc = document.createElement("div");
      self.frontc.style.padding="2px"
      self.frontc.append(self.front)

      self.top = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      self.top.setAttribute('width', "16");
      self.top.setAttribute('height', "16");
      self.top.setAttribute('viewBox', "0 0 16 16");
      self.top.setAttribute('fill', "#AAAAAA");
      self.top.setAttribute('stroke', "#AAAAAA");
      self.top.addEventListener('mouseover', function(){
        self.top.setAttribute('fill', "#666666");
        self.top.setAttribute('stroke', "#666666");
      });
      self.top.addEventListener('mouseout', function(){
        self.top.setAttribute('fill', "#AAAAAA");
        self.top.setAttribute('stroke', "#AAAAAA");
      });
      self.top.innerHTML = '<g><path d="M 0 5 h 10 v 10 h -10 v -10" stroke="none"/><path d="M 4 0 h 10 l -4 4 h -10 l -4 4" fill="none"/><path d="M 11 5 l 4 -4 v 10 l -4 4 v -10" stroke="none"/></g>';
      self.top.addEventListener('click', function(){
        self.topview();
      });
      self.topc = document.createElement("div");
      self.topc.style.padding="2px"
      self.topc.append(self.top)

      self.right = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      self.right.setAttribute('width', "16");
      self.right.setAttribute('height', "16");
      self.right.setAttribute('viewBox', "0 0 16 16");
      self.right.setAttribute('fill', "#AAAAAA");
      self.right.setAttribute('stroke', "#AAAAAA");
      self.right.addEventListener('mouseover', function(){
        self.right.setAttribute('fill', "#666666");
        self.right.setAttribute('stroke', "#666666");
      });
      self.right.addEventListener('mouseout', function(){
        self.right.setAttribute('fill', "#AAAAAA");
        self.right.setAttribute('stroke', "#AAAAAA");
      });
      self.right.innerHTML = '<g><path d="M 0 5 h 10 v 10 h -10 v -10" stroke="none"/><path d="M 4 0 h 10 l -4 4 h -10 l -4 4" stroke="none"/><path d="M 11 5 l 4 -4 v 10 l -4 4 v -10" fill="none"/></g>';
      self.right.addEventListener('click', function(){
        self.rightview();
      });
      self.rightc = document.createElement("div");
      self.rightc.style.padding="2px"
      self.rightc.append(self.right)

      self.container.append(self.canvas)
      self.sidebar.append(self.frontc)
      self.sidebar.append(self.topc)
      self.sidebar.append(self.rightc)
      self.sidebar.append(self.autoscalec)

      self.el.append(self.sidebar)
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

    topview: function(){
      let self = this;
      if (self.system){
        speckView.rotateX(self.view, Math.PI/2);
        self.center();
      }
    },

    frontview: function(){
      let self = this;
      if (self.system){
        speckView.rotateX(self.view, 0);
        self.center();
      }
    },

    rightview: function(){
      let self = this;
      if (self.system){
        speckView.rotateY(self.view, -Math.PI/2);
        self.center();
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

    handleCustomMessage: function(message) {
      if (message == "frontview"){
        this.frontview();
      } else if (message == "topview"){
          this.topview();
      } else if (message == "rightview"){
          this.rightview();
      }
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
        this.model.on('msg:custom', this.handleCustomMessage, this);
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
           case "topview":
             self.topview();
             break;
           case "frontview":
             self.frontview();
             break;
           case "rightview":
             self.rightview();
             break;
       }
     },
});


module.exports = {
    SpeckModel: SpeckModel,
    SpeckView: SpeckView
};
