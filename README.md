# Image Upload for Meteor

DISCLAIMER - ***This is not production ready yet***, expect API changes. Image Upload is under active development. If you'd like to help out, drop us a message at hello@okgrow.com or send a PR.

### Demo

[Demo app on Heroku](https://ok-image-upload-demo.herokuapp.com/) ([source](https://github.com/okgrow/meteor-image-upload-demo))

## One-time Setup

### Prerequisites

1. [AWS S3](http://aws.amazon.com/s3/) account for cloud file storage.

2. [GraphicsMagick](http://www.graphicsmagick.org/) or [ImageMagick](http://www.imagemagick.org/) on your local machine *and* deployment server for image manipulation.

	-	**OS X:** `brew install imagemagick` or `brew install graphicsmagick`

	-	**\*.Meteor.com:** supports ImageMagick no setup needed

	-	**Modulus.io:** supports ImageMagick no setup needed

	-	**Heroku, DigitalOcean, AWS EC2:** requires manual ImageMagick/GraphicsMagick installation.

There are a lot of steps to set this up. We're working on cutting this down
considerably. Any help is welcome.


### Install & Configure

Install from your terminal `meteor add okgrow:image-upload`.

Configure in common code (*server* and *client* ).

API: ` ImageUpload.configure( options ) `

Example
```javascript
ImageUpload.configure({
  accessKeyId: YOUR_ACCESS_KEY_ID,
  secretAccessKey: YOUR_SECRET_ACCESS_KEY,
  bucketName: YOUR_BUCKET_NAME,
  publicRead: true,
  bucketUrl: "https://your_bucket_name.s3.amazonaws.com/"
});
```

You can omit `publicRead` and `bucketUrl` if you don't want to serve images
directly from S3.

Check out how to securely store your S3 credentials in this [section](#correctly-specify-keys) below.

### Creating Image Collections

The images you upload will be stored in separate *Image Upload* collections. You will probably have more than one Image Upload collection. The Image Upload collections are created differently from Meteor collections, we show you how to make these special collections below. 

Each Image Upload collection will reference and index it's documents to one of your app's data collections as specified, only one app data collection can be referenced per each Image Upload collection. We show you how to query by reference ids in [templating](#display-image)
below.

API: `ImageUpload.createCollection( name, reference, { sizeName: [x,y] } )`

Examples
```javascript
UserImages = ImageUpload.createCollection("userImages", Meteor.users, {
  normal: [500,500],
  thumbnail: [200, 200]
  // add more sizes as needed
});

PostImages = ImageUpload.createCollection("postImages", Posts, {
  banner: [250,900],
  thumbnail: [250, 250]
  // add more sizes as needed
});
```


### Allow/Deny Security Rules

By default every Image Upload collection inherits from the insecure package or the permissions of the reference Meteor Collection. You can keep it that way or add further `allow` or `deny` rules for your Image Upload collections. Since the image collection is based on `CollectionFS`, we use their `allow`
and `deny` system. You can view their documentation here:

https://github.com/CollectionFS/Meteor-CollectionFS#security


## Client-side Templating

### Upload Image Template

You want a nice upload button with everything wired up for you? We got ya covered.

API: `{{> uploadImage imageCollection=collectionName [option=option] }}`

Examples:
```html
{{> uploadImage imageCollection=userImages size="thumbnail" doc=currentUser classImage="tiny-img round"}}

{{> uploadImage imageCollection=postImages name="post-image" size="banner" }}
```

Attributes:

| Name | Optional | Description |
| --- | :---: | --- |
| **imageCollection** | required | Specify the Image Upload collection images go to. |
| **doc** | optional | When adding a new image to an existing document you can pass the existing document's data and we will make the reference for you. We pull the reference `_id` from the supplied object. |
| **size** | optional | Specify the image size you want displayed when upload completes. By default this partial template displays the original uploaded image once complete. *hint: You made these sizes when creating your Image Upload collection.* |
| **name** | optional | Specify a custom input element name. This overwrites the default input name attribute, `image` |
| **classInput** | optional | Specify custom class(es) for the input element. Included class is `image-file-picker` |
| **classImage** | optional | Specify custom class(es) for the image when it displays after upload completes. Included class is`uploaded-image` |


### Display Image

To display a stored image, you can

```html
<template name="yourTempalte">
  <img src="{{image}}"/>
</template>
```

Which uses a helper which loads a document from the image collection:

```javascript
Template.yourTemplate.helpers({
  image: function() {
  	var doc = Template.parentData(1);
    var image = yourImageCollection.findOne({associatedObjectId: doc._id});
    if (image) {
      return image.url({store: "userImages-thumbnail"});
    }
  }
});
```



## Roadmap / TODO

In order of fuzzy priority:

- Less configuration to setup
- Better error handling
- Default upload progress bar
- In-browser image cropping/resizing with darkroom.js
- Upload files from a URL
- Reference multiple images to a document

### Direct Uploads to S3?

At this point we don't have plans to support uploading files directly from
the browser's client to AWS's S3. We may add this in the future, but there we
will probably wait until CollectionFS supports this (they have it in the
works). Pull requests welcome.

=========

## Correctly Specify Keys

### Using Environment Variables (recommended)

Use `dotenv` package:

`meteor add pauldowman:dotenv`

Add a file named `.env` in your project directory:

```shell
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
S3_BUCKET_NAME=your_s3_bucket_name
```

On the **server**:

```javascript
var accessKeyId = process.env.AWS_ACCESS_KEY_ID
var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
var bucketName = process.env.S3_BUCKET_NAME;
```

### Using Meteor `settings.json`

```javascript
var accessKeyId = Meteor.settings.AWS_ACCESS_KEY_ID
var secretAccessKey = Meteor.settings.AWS_SECRET_ACCESS_KEY
var bucketName = Meteor.settings.S3_BUCKET_NAME;
```

Create a file named `settings.json` in your project directory. It should look
something like this:

```json
{
  "AWS_ACCESS_KEY_ID": "your_aws_access_key_id",
  "AWS_SECRET_ACCESS_KEY": "your_aws_secret_access_key",
  "S3_BUCKET_NAME": "your_s3_bucket_name"
}
```

If you use `settings.json`, you will need to start your app using `meteor --settings settings.json`


Enjoy!

![OK Grow Logo](http://www.okgrow.com/images/mark-text-dark.png)
