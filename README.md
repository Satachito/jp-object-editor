# jp-object-editor

A Web Component that edits a javascript object.

* No external resources.
* Very fast. There is no data conversion inside.
* Ultra small. Easy to understand and modify.


## Install

```
npm install @satachito/jp-object-editor --save
```

## Demo

See
https://satachito.github.io/jp-object-editor/.

## Props

* json - The JSON to be displayed. Expects a valid JSON string.
* open - Open child elements. Default: false.
* depth - The maximum level of the JSON Tree to be expanded. Specify 0 to Infinity.

## Constructor

JPTreeView( data, open = false, depth = 0 )

* data - Data to display.
* open - Open child elements. Default: false.
* depth - The maximum level of the JSON Tree to be expanded. Specify 0 to Infinity.

## Tag name

* jp-object-editor

## Classes

* .jp-object-editor-key
* .jp-object-editor-null
* .jp-object-editor-undefined
* .jp-object-editor-Boolean
* .jp-object-editor-String
* .jp-object-editor-Number
