import ipywidgets as widgets
from traitlets import Unicode, Bool, Float

# See js/lib/example.js for the frontend counterpart to this file.

@widgets.register
class Speck(widgets.DOMWidget):
    """An example widget."""

    # Name of the widget view class in front-end
    _view_name = Unicode('SpeckView').tag(sync=True)

    # Name of the widget model class in front-end
    _model_name = Unicode('SpeckModel').tag(sync=True)

    # Name of the front-end module containing widget view
    _view_module = Unicode('ipyspeck').tag(sync=True)

    # Name of the front-end module containing widget model
    _model_module = Unicode('ipyspeck').tag(sync=True)

    # Version of the front-end module containing widget view
    _view_module_version = Unicode('^0.6.0').tag(sync=True)
    # Version of the front-end module containing widget model
    _model_module_version = Unicode('^0.6.0').tag(sync=True)

    # Widget specific property.
    # Widget properties are defined as traitlets. Any property tagged with `sync=True`
    # is automatically synced to the frontend *any* time it changes in Python.
    # It is synced back to Python from the frontend *any* time the model is touched.

    data = Unicode('').tag(sync=True)
    bonds = Bool(True).tag(sync=True)
    atomScale = Float(0.24).tag(sync=True)
    relativeAtomScale = Float(0.64).tag(sync=True)
    bondScale = Float(0.5).tag(sync=True)
    brightness = Float(0.5).tag(sync=True)
    outline = Float(0.0).tag(sync=True)
    spf = Float(32).tag(sync=True)
    bondThreshold = Float(1.2).tag(sync=True)
    bondShade = Float(0.5).tag(sync=True)
    atomShade = Float(0.5).tag(sync=True)
    dofStrength = Float(0.0).tag(sync=True)
    dofPosition = Float(0.5).tag(sync=True)

    def frontview(self):
        self.send({"do":"frontView"})

    def topview(self):
        self.send({"do":"topView"})

    def rightview(self):
        self.send({"do":"rightView"})

    def setAtomColor(self, atom, color):
        self.setAtomsColor({ atom : color})

    def setAtomsColor(self, atoms):
        self.send({"do":"changeAtomsColor","atoms":atoms})

    def setColorSchema(self, schema):
        self.send({"do":"changeColorSchema","schema":schema})

    def switchColorSchema(self):
        self.send({"do":"changeColorSchema"})
