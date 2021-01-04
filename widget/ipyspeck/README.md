ipyspeck
===============================

Speck Jupyter Widget

Installation
------------

To install use pip:

    $ pip install ipyspeck
    $ jupyter nbextension enable --py --sys-prefix ipyspeck

To install for jupyterlab

    $ jupyter labextension install ipyspeck

For a development installation (requires npm),

    $ git clone https://github.com//ipyspeck.git
    $ cd ipyspeck
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --sys-prefix ipyspeck
    $ jupyter nbextension enable --py --sys-prefix ipyspeck
    $ jupyter labextension install js

When actively developing your extension, build Jupyter Lab with the command:

    $ jupyter lab --watch

This takes a minute or so to get started, but then automatically rebuilds JupyterLab when your javascript changes.

Note on first `jupyter lab --watch`, you may need to touch a file to get Jupyter Lab to open.

