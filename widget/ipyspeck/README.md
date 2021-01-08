ipyspeck
===============================

# ipyspeck Stats

<table>
    <tr>
        <td>Latest Release</td>
        <td>
            <a href="https://pypi.org/project/ipyspeck/"/>
            <img src="https://badge.fury.io/py/ipyspeck.svg"/>
        </td>
    </tr>
    <tr>
        <td>PyPI Downloads</td>
        <td>
            <a href="https://pepy.tech/project/ipyspeck"/>
            <img src="https://pepy.tech/badge/ipyspeck/month"/>
        </td>
    </tr>
</table>

# Speck Jupyter Widget

## Speck

Speck is a molecule renderer with the goal of producing figures that are as attractive as they are practical. Express your molecule clearly _and_ with style.

<p align="center">
  <img src="https://raw.githubusercontent.com/wwwtyro/speck/gh-pages/static/screenshots/demo-2.png">
</p>

## ipypeck

Ipyspeck is a Jupyter Widget that allows use speck on a Jupyter notebook

##Installation

To install use pip:

    $ pip install ipyspeck
    $ jupyter nbextension enable --py --sys-prefix ipyspeck

To install for jupyterlab

    $ jupyter labextension install ipyspeck

For a development installation (requires npm),

    $ git clone https://github.com//denphi//speck.git
    $ cd speck/widget/ipyspeck
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --sys-prefix ipyspeck
    $ jupyter nbextension enable --py --sys-prefix ipyspeck
    $ jupyter labextension install js

When actively developing your extension, build Jupyter Lab with the command:

    $ jupyter lab --watch

This takes a minute or so to get started, but then automatically rebuilds JupyterLab when your javascript changes.

Note on first `jupyter lab --watch`, you may need to touch a file to get Jupyter Lab to open.
