## What is LoadGo?

**LoadGo** is a JQuery plugin that allows you to create a progress bar by using your own images.

- Perfect for logo image animation when user is waiting for something to be loaded (a website, retrieving information, updating status, etc.)

- It creates an overlay above your desire DOM element and simulates a loading process using width calculations.

## How to use LoadGo

#### Production environment (CDN)

**(17-Oct-2015)** **LoadGo** is now hosted on [cdnjs](https://cdnjs.com/), so you can link it directly. Thanks so much to cdnjs team for their quickly response! ([issue#5927](https://github.com/cdnjs/cdnjs/issues/5927))

    // Original version (for use on development environments)
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/LoadGo/1.0.0/loadgo.js"></script>

    // Minified version (for use on production environments)
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/LoadGo/1.0.0/loadgo.min.js"></script>

#### Development environment

1\. Download LoadGo from [this link](https://github.com/franverona/loadgo/archive/master.zip) or [clone it from GitHub](https://github.com/franverona/loadgo)

2\. Uncompress it (if zipped) and copy **LoadGo** folder into your JS scripts.

3\. Insert the following code in your webpage:

    <script type="text/javascript" src="loadgo/loadgo.js"></script>

You can also use the [minified](http://en.wikipedia.org/wiki/Minification_(programming)) version:

    <script type="text/javascript" src="loadgo/loadgo.min.js"></script>


**Important**: **LoadGo** needs images fully loaded in order to read its dimensions correctly. If you are not sure when this is going to happen, you can use this piece of code with each image:

    $("#my-image").load(function() {
      $('#my-image').loadgo();
    }).each(function() {
      if(this.complete) $(this).load();
    });

## Examples

You can check for examples following this link: [http://franverona.com/loadgo/] (http://franverona.com/loadgo/)

## Documentation

### Introduction

**LoadGo** is a plugin which provides you a better way to keep your users update about loading process that take some time to be completed. For example:

*   Users upload a file to your server.
*   System is converting a file to PDF.
*   Current page is loading.
*   Etc.

This plugin won't control asynchronous behaviour for your loading process, so you have to do that by yourself in your app.

In order to do this, **LoadGo** creates an overlay on top of your image, and playing with its width simulates a loading behaviour. This overlay is set by using `position: absolute` CSS property, so your DOM element needs to be inside a `DIV` element or things won't look good.

This piece of code is a minimum example:

    // HTML
    <div>
      <img id="logo" src="logo.png" alt="Logo" />
    </div>

    // Javascript
    $('#logo').loadgo();

### Initialization

**LoadGo** needs to be initialized in a DOM element before use.

    $('#logo').loadgo();

Now, you are capable of set progress and simulate any kind of progression. **LoadGo** have three methods and a couple of options which will help you.

**LoadGo** also applies an empty CSS class to overlay called `loadgo-overlay` in case that you want to implement your own resize function or some other advanced features.

### Options

*   **bgcolor**: background overlay color in hexadecimal or RGB. Default is **#FFFFFF**.
*   **opacity**: overlay transparency. Default is **0.5**
*   **animated**: true if `setprogress` CSS width transitions are enable, false otherwise. Default is **true** (NOTE: Internet Explorer does not support CSS transitions).
*   **image**: image url to bet use if want a background image instead of a simple color. This option disables **bgcolor** option.
*   **class**: CSS class which will be applied to overlay. By using this option you should assure that all looks good because some CSS options for class could invalidate other **LoadGo** plugin CSS options. Default is **none**.
*   **resize**: resize function. **LoadGo** provides a function which automatically resizes **LoadGo** overlay by default, but you can use your own.
*   **direction**: animation direction. Possible values: **'lr'** (left to right), **'rl'** (right to left), **'bt'** (bottom to top), **'tb'** (top to bottom). Default is **'lr'**.
*   **filter**: CSS image filter according to [CSS filter property] (https://developer.mozilla.org/en-US/docs/Web/CSS/filter). Possible values: **'blur'**, **'grayscale'**, **'sepia'**, **'hue-rotate'**, **'invert'**, **'opacity'**.

### Methods

**Set Progress**: set progress number to loading overlay. This number must be between 0 and 100 (percentage).

    $('#logo').loadgo('setprogress', 50);

**Reset progress**: set progress to zero automatically. This is really useful when you are using the same element for multiple loads, and you need to reset all before starting a new one.

    $('#logo').loadgo('resetprogress');

**Get progress**: return current progress. This number will be between 0 and 100 (percentage).

    $('#logo').loadgo('getprogress');

**Loop**: sets overlay to loop indefinitely until stopped. This is useful for situations where you have no way of measuring the progress. This method accepts a duration(ms) parameter to customize animation speed.

    $('#logo').loadgo('loop', 10);

**Stop**: stops the loop and shows the full image. Since loops are indefinite we need to use this method to manually stop it.

    $('#logo').loadgo('stop');

### Real example

In your webpage, you are using a jQuery plugin like [Uploadify](http://www.uploadify.com/) to give your users a way to upload files to you page (for example: update his/her web avatar). Most of these plugins provide events like `onUploadStart`, `onUploadProgress` or `onUploadComplete`. These events have variables which give you a lot of information about your current load progress (file size, current uploaded bytes, etc).

You can use this information with **LoadGo** to update logo overlay like this:

    // Set LoadGo on your Logo
    $('#logo').loadgo();

    // Set Uploadify on your upload input
    $('#uploadinput').uploadify({
       // init options...
       onUploadStart: function (event) {
         // Upload is going to start, so we need to reset loadgo
         $('#logo').loadgo('resetprogress');
       },
       onUploadProgress: function (event) {
        // We receive some bytes on our upload and update loadgo progress,
        // but first, we should calculate total uploaded percentage
        var p = event.bytesLoaded / event.bytesTotal;
        $('#logo').loadgo('setprogress', p);
      },
      onUploadComplete: function (event) {
        // Upload complete
      }
    });

**LoadGo** is under MIT License. Feel free to download, modify and adapt it to your own purposes. If you find any bug, send a pull request or write an issue.
