Template.uploadImage.helpers({
  inputName: function(){
    return this.name || "image";
  },
  image: function() {
    var image;
    var coll = ImageUpload.getImageCollection(this.imageCollection);
    var store = this.imageCollection+"-"+this.size;
    if (this.doc) {
      // Look for image for associated object
      image = coll.findOne({associatedObjectId: this.doc._id});
    } else {
      // No associated object yet, check id of last image of this type in session
      imageId = Session.get("lastImageId-" + store);
      image = coll.findOne({_id: Session.get("lastImageId-" + store)});
    }
    return image;
  }
});

Template.uploadImage.events({
  'change .image-file-picker': function(event, template) {
    var that = this;
    var file = event.target.files[0];
    var coll = ImageUpload.getImageCollection(that.imageCollection);
    var store = that.imageCollection+"-"+that.size;
    if (file) {
      var newFile = new FS.File(file);
      newFile.addedBy = Meteor.userId();
      if (that.doc) {
        newFile.associatedObjectId = that.doc._id;
      }
      console.log(newFile); //TODO Ben to remove
      coll.insert(newFile, function (err, fileObj) {
        if (err) {
          console.log("Error: ", err);
        }
        // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
        if (!that.associatedObjectId) {
          // Save the ID of the newly inserted doc in the session so we can use it
          // until it's associated.
          Session.set("lastImageId-" + that.imageCollection, fileObj._id);
        }
      });
    }
  }
});
